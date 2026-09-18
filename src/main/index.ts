import { app, BrowserWindow, ipcMain, dialog, shell, Tray, Menu, nativeImage, Notification, powerMonitor } from 'electron'
import { join } from 'node:path'
import { readFile, writeFile, stat, mkdir } from 'node:fs/promises'
import { DateTime } from 'luxon'
import { z } from 'zod'
import { Store } from './store'
import { Providers } from './providers'
import { aggregateTodos, reminderCandidates, validateWorkspace, workspaceSchema, dueDigestSlot } from '../shared/domain'
import { parseCalendar, mergeCalendarMappings } from '../shared/calendar'
import type { Workspace, CalendarSource } from '../shared/types'

if (process.env.WORKSTATION_TEST_DATA) app.setPath('userData', process.env.WORKSTATION_TEST_DATA)
app.setAppUserModelId('io.github.alex0v0328.workstation')
let window: BrowserWindow | null = null, tray: Tray | null = null, store: Store, providers: Providers
let quitting = false, ticking = false, syncing = false
const changed = () => window?.webContents.send('workspace:changed')
const idSchema = z.string().min(1).max(200)
const ipc = (channel: string, action: (value: any) => unknown) => ipcMain.handle(channel, async (event, value) => {
  if (!window || event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame) throw new Error('不受信任的调用来源')
  try { return await action(value) } catch (e) {
    if (e instanceof z.ZodError) throw new Error(e.issues.slice(0, 4).map(i => `${i.path.join('.')}: ${i.message}`).join('\n'))
    throw new Error(e instanceof Error ? e.message : '操作失败')
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
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('课表订阅需要 HTTPS 链接')
    const response = await fetch(next, { signal: AbortSignal.timeout(30000), redirect: 'manual' })
    if (response.status >= 300 && response.status < 400 && response.headers.get('location')) { next = new URL(response.headers.get('location')!, next).href; continue }
    if (!response.ok) throw new Error(`课表下载失败（${response.status}）`)
    const reader = response.body!.getReader(); const parts: Uint8Array[] = []; let size = 0
    while (true) { const { value, done } = await reader.read(); if (done) break; size += value.length; if (size > 5_000_000) { await reader.cancel(); throw new Error('课表超过 5 MB') }; parts.push(value) }
    return Buffer.concat(parts).toString('utf8')
  }
  throw new Error('课表链接重定向过多')
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
        const result = parseCalendar(text, source.id, semester.start, semester.end, semester.timezone)
        const previous = current.events.filter(e => e.sourceId === source.id)
        current.events = [...current.events.filter(e => e.sourceId !== source.id), ...mergeCalendarMappings(previous, result.events)]
        source.lastSync = new Date().toISOString(); source.error = ''; store.save(current)
      } catch (e) {
        const current = store.load(); const source = current.sources.find(s => s.id === original.id)
        if (source) { source.error = e instanceof Error ? e.message : '同步失败'; store.save(current) }
      }
    }
    changed(); return store.load()
  } finally { syncing = false }
}
async function readJsonFile(): Promise<unknown | null> {
  const result = await dialog.showOpenDialog(window!, { properties: ['openFile'], filters: [{ name: 'Workstation JSON', extensions: ['json'] }] })
  if (result.canceled) return null
  if ((await stat(result.filePaths[0])).size > 20_000_000) throw new Error('文件超过 20 MB')
  return JSON.parse(await readFile(result.filePaths[0], 'utf8'))
}
function registerIpc() {
  ipc('workspace:load', () => store.load())
  ipc('workspace:save', value => {
    const next = validateWorkspace(value), previous = store.load()
    if (next.settings.digestEnabled && !previous.settings.digestEnabled) {
      if (!providers.status().hasKey || !providers.status().email) throw new Error('启用自动总结前请连接 Gmail 并配置 DeepSeek')
      next.settings.digestSince = previous.settings.digestSince || new Date().toISOString()
    }
    const saved = store.save(next)
    if (previous.settings.startAtLogin !== saved.settings.startAtLogin && app.isPackaged) app.setLoginItemSettings({ openAtLogin: saved.settings.startAtLogin, args: ['--hidden'] })
    changed(); return saved
  })
  ipc('backup:export', async () => {
    const result = await dialog.showSaveDialog(window!, { defaultPath: `workstation-${DateTime.now().toISODate()}.json`, filters: [{ name: 'Workstation backup', extensions: ['json'] }] })
    if (result.canceled || !result.filePath) return null
    const backup = store.load(); backup.settings.digestSince = ''; backup.settings.digestEnabled = false; backup.settings.startAtLogin = false
    await writeFile(result.filePath, JSON.stringify(backup, null, 2)); return result.filePath
  })
  ipc('backup:restore', async () => {
    if (providers.isBusy()) throw new Error('请等待邮件授权或总结结束后恢复备份')
    const input = await readJsonFile(); if (input === null) return null
    const value = validateWorkspace(input)
    const result = await dialog.showMessageBox(window!, { type: 'warning', buttons: ['取消', '恢复备份'], defaultId: 0, cancelId: 0, message: `将恢复 ${value.semesters.length} 个学期、${value.courses.length} 门课程和 ${value.tasks.length + value.assessments.length} 个事项。`, detail: '当前数据将自动保存到本机恢复前备份。此操作替换当前学业与 TODO 数据。账号凭据不受影响。' })
    if (result.response !== 1) return null
    if (providers.isBusy()) throw new Error('邮件任务正在运行，请稍后恢复备份')
    await writeFile(join(app.getPath('userData'), `before-restore-${Date.now()}.json`), JSON.stringify(store.load(), null, 2))
    value.settings.digestEnabled = false; value.settings.digestSince = ''; value.settings.startAtLogin = false
    const saved = store.save(value, true); store.clearPrefix('reminder:'); store.clearPrefix('digest:')
    if (app.isPackaged) app.setLoginItemSettings({ openAtLogin: false })
    changed(); return saved
  })
  ipc('academic:import', async () => {
    const input = await readJsonFile(); if (input === null) return null
    const value = validateWorkspace(input)
    const result = await dialog.showMessageBox(window!, { buttons: ['取消', '导入为新学期'], defaultId: 0, cancelId: 0, message: `预览：${value.semesters.map(s => s.name).join('、') || '无学期'}`, detail: `${value.courses.length} 门课程、${value.assessments.length} 个考核、${value.events.length} 个课表安排。保留当前数据，导入学业内容；不导入手动 TODO、账号或设置。` })
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
    if (!semester) throw new Error('请先选择学期')
    let text: string
    if (value.url) text = await calendarText(value.url)
    else {
      const result = await dialog.showOpenDialog(window!, { properties: ['openFile'], filters: [{ name: 'iCalendar', extensions: ['ics'] }] })
      if (result.canceled) return null
      if ((await stat(result.filePaths[0])).size > 5_000_000) throw new Error('课表超过 5 MB')
      text = await readFile(result.filePaths[0], 'utf8')
    }
    return parseCalendar(text, value.sourceId, semester.start, semester.end, semester.timezone)
  })
  ipc('calendar:sync', syncCalendars)
  ipc('connection:get', () => providers.status())
  ipc('connection:save', value => providers.configure(value))
  ipc('connection:connect', () => providers.connect())
  ipc('connection:disconnect', () => providers.disconnect())
  ipc('mail:list', input => providers.list(z.object({ query: z.string().max(1000), pageToken: z.string().max(2000).optional() }).parse(input)))
  ipc('mail:read', input => providers.read(idSchema.parse(input)))
  ipc('mail:translate', input => providers.translate(idSchema.parse(input)))
  ipc('ai:test', () => providers.testAI())
  ipc('digest:list', () => providers.digests())
  ipc('digest:run', () => providers.summarize())
  ipc('external:open', async input => {
    const url = new URL(z.string().max(10000).parse(input))
    if (!['https:', 'http:', 'mailto:'].includes(url.protocol) || url.username || url.password) throw new Error('不支持的链接')
    await shell.openExternal(url.toString())
  })
}
async function tick() {
  if (ticking) return
  ticking = true
  try {
    try { providers.pruneCaches() } catch (e) { providers.lastError = e instanceof Error ? e.message : '缓存清理失败' }
    const state = store.load(), now = DateTime.now().setZone(state.settings.timezone)
    if (state.settings.notifications) {
      const sent = store.get<Record<string, boolean>>('reminder:sent', {})
      const reminders = reminderCandidates(aggregateTodos(state), now.toJSDate(), state.settings.timezone, sent)
      if (reminders.length && Notification.isSupported()) {
        notify('待办提醒', reminders.slice(0, 4).map(r => r.item.title).join('、') + (reminders.length > 4 ? ` 等 ${reminders.length} 项` : ''))
        for (const r of reminders) for (const key of r.keys) sent[key] = true
        store.set('reminder:sent', sent)
      }
    }
    if (Date.now() - store.get<number>('calendar:checked', 0) > 3600000) { await syncCalendars(); store.set('calendar:checked', Date.now()) }
    const lastDate = store.get<string>('digest:lastDate', '')
    const slot = dueDigestSlot(now, state.settings.digestTime, state.settings.digestSince, lastDate)
    if (state.settings.digestEnabled && slot && Date.now() - store.get<number>('digest:lastAttempt', 0) > 900000) {
      store.set('digest:lastAttempt', Date.now())
      const digest = await providers.summarize()
      if (digest.state === 'done') {
        const completedSlot = dueDigestSlot(DateTime.fromISO(digest.until).setZone(state.settings.timezone), state.settings.digestTime, state.settings.digestSince, '')
        if (completedSlot && completedSlot > lastDate) store.set('digest:lastDate', completedSlot)
      }
      if (state.settings.notifications) notify(digest.state === 'done' ? '每日邮件总结已完成' : '邮件总结需要重试', `${digest.entries.length} 封邮件，可在生活板块查看。`)
    }
  } catch (e) { providers.lastError = e instanceof Error ? e.message : '后台任务失败'; changed() }
  finally { ticking = false }
}
function createWindow() {
  window = new BrowserWindow({ width: 1440, height: 940, minWidth: 960, minHeight: 640, title: 'Workstation', icon: join(__dirname, '../../resources/icon.png'), backgroundColor: '#f3f3f3', autoHideMenuBar: true, show: false, webPreferences: { preload: join(__dirname, '../preload/index.js'), sandbox: true, contextIsolation: true, nodeIntegration: false } })
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  window.webContents.on('will-navigate', event => event.preventDefault())
  window.webContents.session.setPermissionRequestHandler((_wc, _permission, callback) => callback(false))
  window.on('close', event => { if (!quitting) { event.preventDefault(); window?.hide() } })
  window.once('ready-to-show', () => { if (!process.argv.includes('--hidden')) show() })
  if (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) window.loadURL(process.env.ELECTRON_RENDERER_URL)
  else window.loadFile(join(__dirname, '../renderer/index.html'))
  const bytes = Buffer.alloc(32 * 32 * 4)
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
    const i = (y * 32 + x) * 4, line = (x >= 8 && x <= 11 && y >= 8 && y <= 24) || (x >= 14 && x <= 17 && y >= 15 && y <= 24) || (x >= 20 && x <= 23 && y >= 8 && y <= 24)
    bytes[i] = line ? 255 : 190; bytes[i + 1] = line ? 255 : 92; bytes[i + 2] = line ? 255 : 15; bytes[i + 3] = 255
  }
  tray = new Tray(nativeImage.createFromBitmap(bytes, { width: 32, height: 32 }))
  tray.setToolTip('Workstation · 个人工作台')
  tray.setContextMenu(Menu.buildFromTemplate([{ label: '打开工作台', click: show }, { label: '立即同步课表', click: () => { void syncCalendars() } }, { type: 'separator' }, { label: '退出', click: () => { quitting = true; app.quit() } }]))
  tray.on('double-click', show)
}
if (!app.requestSingleInstanceLock()) app.quit()
else {
  app.on('second-instance', show)
  app.whenReady().then(async () => {
    try {
      await mkdir(app.getPath('userData'), { recursive: true })
      store = new Store(join(app.getPath('userData'), 'workspace.db'))
      providers = new Providers(store, join(app.getPath('userData'), 'secrets.bin'), changed)
      registerIpc(); createWindow()
      if (!process.env.WORKSTATION_TEST_DATA) {
        setInterval(() => { void tick() }, 60000).unref()
        powerMonitor.on('resume', () => { void tick() })
        void tick()
      }
    } catch (e) { dialog.showErrorBox('Workstation 无法启动', e instanceof Error ? e.message : '初始化失败'); quitting = true; app.quit() }
  })
  app.on('before-quit', () => { quitting = true })
  app.on('will-quit', () => { store?.close(); tray?.destroy() })
}
