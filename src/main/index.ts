import { app, BrowserWindow, ipcMain, dialog, shell, Tray, Notification, powerMonitor } from 'electron'
import { join } from 'node:path'
import { readFile, writeFile, stat, mkdir } from 'node:fs/promises'
import { DateTime } from 'luxon'
import { z } from 'zod'
import { Store } from './store'
import { Providers } from './providers'
import { createThemeService, type ThemeService } from './themes'
import { createAppWindow } from './window'
import { createTray } from './tray'
import { createScheduler } from './scheduler'
import { validateWorkspace, workspaceSchema } from '../shared/domain'
import { parseCalendar, mergeCalendarMappings } from '../shared/calendar'
import { validateThemePackage } from '../shared/theme-manifest'
import { localizeError, MessageError } from '../shared/i18n'
import { mainT, mt, setMainLanguage } from './i18n'
import type { Workspace } from '../shared/types'

if (process.env.WORKSTATION_TEST_DATA) app.setPath('userData', process.env.WORKSTATION_TEST_DATA)
app.setAppUserModelId('io.github.alex0v0328.workstation')
let window: BrowserWindow | null = null, tray: Tray | null = null, store: Store, providers: Providers, themeService: ThemeService
let quitting = false, syncing = false
const changed = () => window?.webContents.send('workspace:changed')
const idSchema = z.string().min(1).max(200)
const ipc = (channel: string, action: (value: any) => unknown) => ipcMain.handle(channel, async (event, value) => {
  if (!window || event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame) throw new MessageError('remote.untrusted')
  try { return await action(value) } catch (e) {
    if (e instanceof z.ZodError) throw new Error(e.issues.slice(0, 4).map(i => `${i.path.join('.')}: ${mainT().has(i.message) ? mainT().text(i.message) : i.message}`).join('\n'))
    if (e instanceof MessageError) throw new Error(mt(e.id, e.params))
    throw new Error(e instanceof Error ? e.message : mt('app.opFailed'))
  }
})
function show() { window?.show(); window?.focus() }
function notify(title: string, body: string) {
  if (!Notification.isSupported()) return
  const notification = new Notification({ title, body })
  notification.on('click', show); notification.show()
}
async function calendarText(url: string): Promise<string> {
  let next = url.replace(/^webcal:/i, 'https:')
  for (let redirects = 0; redirects < 5; redirects++) {
    const parsed = new URL(next)
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new MessageError('remote.httpsRequired')
    const response = await fetch(next, { signal: AbortSignal.timeout(30000), redirect: 'manual' })
    if (response.status >= 300 && response.status < 400 && response.headers.get('location')) { next = new URL(response.headers.get('location')!, next).href; continue }
    if (!response.ok) throw new MessageError('remote.downloadFailed', { status: response.status })
    const reader = response.body!.getReader(); const parts: Uint8Array[] = []; let size = 0
    while (true) { const { value, done } = await reader.read(); if (done) break; size += value.length; if (size > 5_000_000) { await reader.cancel(); throw new MessageError('remote.icsTooBig') }; parts.push(value) }
    return Buffer.concat(parts).toString('utf8')
  }
  throw new MessageError('remote.redirects')
}
async function syncCalendars(): Promise<Workspace> {
  if (syncing) return store.load()
  syncing = true
  try {
    for (const original of store.load().sources.filter(x => x.url)) {
      try {
        const text = await calendarText(original.url)
        const current = store.load()
        const source = current.sources.find(x => x.id === original.id && x.url === original.url)
        if (!source) continue
        const semester = current.semesters.find(s => s.id === source.semesterId)!
        const result = parseCalendar(text, source.id, semester.start, semester.end, semester.timezone, { untitled: mt('remote.untitled') })
        const previous = current.events.filter(e => e.sourceId === source.id)
        current.events = [...current.events.filter(e => e.sourceId !== source.id), ...mergeCalendarMappings(previous, result.events)]
        source.lastSync = new Date().toISOString(); source.error = ''; store.save(current)
      } catch (e) {
        const current = store.load(); const source = current.sources.find(s => s.id === original.id)
        if (source) { source.error = e instanceof Error ? e.message : 'remote.syncFailed'; store.save(current) }
      }
    }
    changed(); return store.load()
  } finally { syncing = false }
}
async function readJsonFile(): Promise<unknown | null> {
  const result = await dialog.showOpenDialog(window!, { properties: ['openFile'], filters: [{ name: mt('remote.jsonFilter'), extensions: ['json'] }] })
  if (result.canceled) return null
  if ((await stat(result.filePaths[0])).size > 20_000_000) throw new MessageError('remote.fileTooBig')
  return JSON.parse(await readFile(result.filePaths[0], 'utf8'))
}
function registerIpc() {
  ipc('workspace:load', () => store.load())
  ipc('workspace:save', value => {
    const next = validateWorkspace(value), previous = store.load()
    if (next.settings.digestEnabled && !previous.settings.digestEnabled) {
      if (!providers.status().hasKey || !providers.status().email) throw new MessageError('remote.digestNeedsSetup')
      next.settings.digestSince = previous.settings.digestSince || new Date().toISOString()
    }
    const saved = store.save(next)
    if (previous.settings.startAtLogin !== saved.settings.startAtLogin && app.isPackaged) app.setLoginItemSettings({ openAtLogin: saved.settings.startAtLogin, args: ['--hidden'] })
    if (previous.settings.theme !== saved.settings.theme || previous.settings.variant !== saved.settings.variant) themeService.applyMaterial()
    if (previous.settings.language !== saved.settings.language) { setMainLanguage(saved.settings.language); rebuildTray() }
    changed(); return saved
  })
  ipc('backup:export', async () => {
    const result = await dialog.showSaveDialog(window!, { defaultPath: `workstation-${DateTime.now().toISODate()}.json`, filters: [{ name: mt('remote.backupFilter'), extensions: ['json'] }] })
    if (result.canceled || !result.filePath) return null
    const workspace = store.load(); workspace.settings.digestSince = ''; workspace.settings.digestEnabled = false; workspace.settings.startAtLogin = false
    const profile = { version: 2, exportedAt: new Date().toISOString(), workspace, themes: await themeService.installed() }
    await writeFile(result.filePath, JSON.stringify(profile, null, 2)); return result.filePath
  })
  ipc('backup:restore', async () => {
    if (providers.isBusy()) throw new MessageError('remote.restoreBusyAuth')
    const input = await readJsonFile(); if (input === null) return null
    const envelope = input as { version?: unknown; workspace?: unknown; themes?: unknown }
    const value = validateWorkspace(envelope.version === 2 && envelope.workspace ? envelope.workspace : input)
    const themeInputs = envelope.version === 2 && Array.isArray(envelope.themes) ? envelope.themes : []
    const validThemes: unknown[] = [], skippedThemes: string[] = []
    for (const theme of themeInputs) {
      try { validateThemePackage(theme); validThemes.push(theme) }
      catch { skippedThemes.push(theme && typeof theme === 'object' && 'id' in theme ? String((theme as { id: unknown }).id) : '?') }
    }
    let detail = mt('remote.restoreDetail')
    if (validThemes.length) detail += ' ' + mt('remote.restoreConfirmThemes', { count: validThemes.length })
    if (skippedThemes.length) detail += ' ' + mt('remote.themeInvalidInProfile', { id: skippedThemes.join(', ') })
    const result = await dialog.showMessageBox(window!, { type: 'warning', buttons: [mt('common.cancel'), mt('remote.restoreButton')], defaultId: 0, cancelId: 0, message: mt('remote.restoreConfirm', { semesters: value.semesters.length, courses: value.courses.length, tasks: value.tasks.length + value.assessments.length }), detail })
    if (result.response !== 1) return null
    if (providers.isBusy()) throw new MessageError('remote.restoreBusy')
    await writeFile(join(app.getPath('userData'), `before-restore-${Date.now()}.json`), JSON.stringify(store.load(), null, 2))
    for (const theme of validThemes) await themeService.installManifest(theme)
    value.settings.digestEnabled = false; value.settings.digestSince = ''; value.settings.startAtLogin = false
    const saved = store.save(value, true); store.clearPrefix('reminder:'); store.clearPrefix('digest:')
    if (app.isPackaged) app.setLoginItemSettings({ openAtLogin: false })
    setMainLanguage(saved.settings.language); rebuildTray()
    changed(); return saved
  })
  ipc('academic:import', async () => {
    const input = await readJsonFile(); if (input === null) return null
    const value = validateWorkspace(input)
    const result = await dialog.showMessageBox(window!, { buttons: [mt('common.cancel'), mt('remote.importButton')], defaultId: 0, cancelId: 0, message: mt('remote.importPreview', { names: value.semesters.map(s => s.name).join('、') || mt('remote.noSemesters') }), detail: mt('remote.importDetail', { courses: value.courses.length, assessments: value.assessments.length, events: value.events.length }) })
    if (result.response !== 1) return null
    const current = store.load()
    const prefix = crypto.randomUUID() + ':'
    current.semesters.push(...value.semesters.map(s => ({ ...s, id: prefix + s.id })))
    current.courses.push(...value.courses.map(c => ({ ...c, id: prefix + c.id, semesterId: prefix + c.semesterId })))
    current.assessments.push(...value.assessments.map(a => ({ ...a, id: prefix + a.id, courseId: prefix + a.courseId })))
    current.hurdles.push(...value.hurdles.map(h => ({ ...h, id: prefix + h.id, courseId: prefix + h.courseId, assessmentIds: h.assessmentIds.map(i => prefix + i) })))
    current.sources.push(...value.sources.map(s => ({ ...s, id: prefix + s.id, semesterId: prefix + s.semesterId })))
    current.events.push(...value.events.map(e => ({ ...e, id: prefix + e.id, sourceId: e.sourceId ? prefix + e.sourceId : '', courseId: e.courseId ? prefix + e.courseId : '' })))
    const saved = store.save(current); changed(); return saved
  })
  ipc('calendar:preview', async input => {
    const value = z.object({ url: z.string().max(4000).optional(), semesterId: idSchema, sourceId: idSchema, semester: workspaceSchema.shape.semesters.element.optional() }).parse(input)
    const semester = value.semester || store.load().semesters.find(s => s.id === value.semesterId)
    if (!semester) throw new MessageError('remote.pickSemester')
    let text: string
    if (value.url) text = await calendarText(value.url)
    else {
      const result = await dialog.showOpenDialog(window!, { properties: ['openFile'], filters: [{ name: 'iCalendar', extensions: ['ics'] }] })
      if (result.canceled) return null
      if ((await stat(result.filePaths[0])).size > 5_000_000) throw new MessageError('remote.icsTooBig')
      text = await readFile(result.filePaths[0], 'utf8')
    }
    return parseCalendar(text, value.sourceId, semester.start, semester.end, semester.timezone, { untitled: mt('remote.untitled') })
  })
  ipc('calendar:sync', syncCalendars)
  ipc('connection:get', () => providers.status())
  ipc('connection:save', value => providers.configure(value))
  ipc('connection:connect', () => providers.connect())
  ipc('connection:disconnect', () => providers.disconnect())
  ipc('mail:list', input => providers.list(z.object({ query: z.string().max(1000), pageToken: z.string().max(2000).optional(), cachedOnly: z.boolean().optional() }).parse(input)))
  ipc('mail:read', input => providers.read(idSchema.parse(input)))
  ipc('mail:translate', input => providers.translate(idSchema.parse(input)))
  ipc('ai:test', () => providers.testAI())
  ipc('digest:list', () => providers.digests())
  ipc('digest:run', input => providers.summarize(z.enum(['manual', 'auto']).optional().parse(input) ?? 'manual'))
  ipc('external:open', async input => {
    const url = new URL(z.string().max(10000).parse(input))
    if (!['https:', 'http:', 'mailto:'].includes(url.protocol) || url.username || url.password) throw new MessageError('remote.unsupportedLink')
    await shell.openExternal(url.toString())
  })
  ipc('themes:list', () => themeService.list())
  ipc('themes:install', () => themeService.install())
  ipc('themes:install-example', input => themeService.installExample(z.string().regex(/^[a-z0-9][a-z0-9-]{0,49}$/).parse(input)))
  ipc('themes:remove', input => themeService.remove(z.string().regex(/^[a-z0-9][a-z0-9-]{0,49}$/).parse(input)))
}
function rebuildTray() {
  tray?.destroy()
  tray = createTray({ show, sync: () => { void syncCalendars() }, quit: () => { quitting = true; app.quit() } })
}
if (!app.requestSingleInstanceLock()) app.quit()
else {
  app.on('second-instance', show)
  app.whenReady().then(async () => {
    try {
      await mkdir(app.getPath('userData'), { recursive: true })
      store = new Store(join(app.getPath('userData'), 'workspace.db'))
      setMainLanguage(store.load().settings.language)
      if (app.isPackaged) app.setLoginItemSettings({ openAtLogin: store.load().settings.startAtLogin, args: ['--hidden'] })
      providers = new Providers(store, join(app.getPath('userData'), 'secrets.bin'), changed)
      themeService = createThemeService({ store, getWindow: () => window, changed })
      registerIpc()
      window = createAppWindow({ store, themeService, isQuitting: () => quitting })
      rebuildTray()
      if (!process.env.WORKSTATION_TEST_DATA) {
        const tick = createScheduler({ store, providers, syncCalendars, changed, notify })
        setInterval(() => { void tick() }, 60000).unref()
        powerMonitor.on('resume', () => { void tick() })
        void tick()
      }
    } catch (e) { dialog.showErrorBox(mt('remote.startupTitle'), localizeError(e, mainT())); quitting = true; app.quit() }
  })
  app.on('before-quit', () => { quitting = true })
  app.on('will-quit', () => { store?.close(); tray?.destroy() })
}
