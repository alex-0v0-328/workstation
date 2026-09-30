import { app, BrowserWindow, dialog, nativeTheme, systemPreferences } from 'electron'
import { join } from 'node:path'
import { readdir, readFile, mkdir, stat } from 'node:fs/promises'
import { copyContent, removeFile, writeReplacing } from './files'
import { readFileSync, readdirSync } from 'node:fs'
import { release } from 'node:os'
import { validateThemePackage, BUILTIN_THEME, pickVariant, type ThemeManifest } from '../shared/theme-manifest'
import { MessageError } from '../shared/i18n'
import { mt } from './i18n'
import type { ThemeState } from '../shared/types'
import type { Store } from './store'

export interface ThemeService {
  list(): Promise<ThemeState>
  applyMaterial(): void
  install(): Promise<ThemeState | null>
  installExample(id: string): Promise<ThemeState>
  installManifest(input: unknown): Promise<void>
  installed(): Promise<ThemeManifest[]>
  remove(id: string): Promise<ThemeState>
}

const slugRe = /^[a-z0-9][a-z0-9-]{0,49}$/
const maxInstallBytes = 2_000_000

function resourcesDir(): string {
  return app.isPackaged ? join(process.resourcesPath, 'themes') : join(app.getAppPath(), 'themes', 'dist')
}

function parseWinBuild(r: string): number {
  const major = parseInt(r.split('.')[0] ?? '0', 10)
  if (major !== 10 && major !== 11) return 0
  const build = parseInt(r.split('.')[2] ?? '0', 10)
  return Number.isNaN(build) ? 0 : build
}

function listWsthemeFiles(dir: string): string[] {
  try { return readdirSync(dir).filter(n => n.endsWith('.wstheme.json')) } catch { return [] }
}

// Test mode pins material and accent for stable captures; WORKSTATION_TEST_MATERIAL=1 opts back into the live desktop values.
const liveDesktop = () => !process.env.WORKSTATION_TEST_DATA || process.env.WORKSTATION_TEST_MATERIAL === '1'

// Windows reports the personalization accent as RRGGBBAA.
export function systemAccent(): string {
  if (!liveDesktop() || process.platform !== 'win32') return '#005fb8'
  try { const value = systemPreferences.getAccentColor(); return /^[0-9a-f]{6}/i.test(value) ? `#${value.slice(0, 6).toLowerCase()}` : '#005fb8' } catch { return '#005fb8' }
}

const newer = (a: string, b: string) => { const x = a.split('.').map(Number), y = b.split('.').map(Number); for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i]; return false }

function readManifestSync(path: string): ThemeManifest | null {
  try { return validateThemePackage(JSON.parse(readFileSync(path, 'utf8'))) } catch { return null }
}

export function createThemeService(deps: { store: Store; getWindow: () => BrowserWindow | null; changed: () => void }): ThemeService {
  const themesDir = join(app.getPath('userData'), 'themes')
  let ensured = false, upgraded = false

  async function ensureDir(): Promise<void> {
    if (ensured) return
    await mkdir(themesDir, { recursive: true })
    ensured = true
  }

  // An installed copy of a bundled example pack is replaced once per session when the bundled version is newer.
  async function upgradeExamples(): Promise<void> {
    if (upgraded) return
    upgraded = true
    for (const name of listWsthemeFiles(resourcesDir())) {
      const bundled = readManifestSync(join(resourcesDir(), name)), installed = readManifestSync(join(themesDir, name))
      // A failed upgrade keeps the installed copy; it must never break the theme list.
      if (bundled && installed && bundled.id === installed.id && newer(bundled.version, installed.version)) await copyContent(join(resourcesDir(), name), join(themesDir, name)).catch(() => undefined)
    }
  }

  async function readInstalled(): Promise<ThemeManifest[]> {
    await ensureDir()
    await upgradeExamples()
    const manifests: ThemeManifest[] = []
    for (const name of listWsthemeFiles(themesDir)) {
      const manifest = readManifestSync(join(themesDir, name))
      if (manifest) manifests.push(manifest)
    }
    return manifests
  }

  async function readExamples(): Promise<{ id: string; name: string; description: string }[]> {
    const dir = resourcesDir()
    const installed = new Set((await readInstalled()).map(m => m.id))
    const examples: { id: string; name: string; description: string }[] = []
    for (const name of listWsthemeFiles(dir)) {
      const id = name.slice(0, -'.wstheme.json'.length)
      if (installed.has(id)) continue
      const manifest = readManifestSync(join(dir, name))
      if (manifest) examples.push({ id: manifest.id, name: manifest.name, description: manifest.description })
    }
    return examples
  }

  function effectiveMaterial(): 'mica' | 'acrylic' | 'none' {
    if (!liveDesktop()) return 'none'
    if (process.platform !== 'win32') return 'none'
    if (parseWinBuild(release()) < 22621) return 'none'
    const themeId = deps.store.load().settings.theme
    if (themeId === BUILTIN_THEME) return 'mica'
    const manifest = readManifestSync(join(themesDir, `${themeId}.wstheme.json`))
    return manifest?.material ?? 'none'
  }

  return {
    async list(): Promise<ThemeState> {
      const settings = deps.store.load().settings
      const themes = await readInstalled()
      const examples = await readExamples()
      return {
        themes,
        examples,
        active: { id: settings.theme, variant: settings.variant, material: effectiveMaterial() },
        systemAccent: systemAccent()
      }
    },

    // Mica and the title bar follow nativeTheme, so it must mirror the app's own light/dark choice, not the OS one.
    applyMaterial(): void {
      try {
        const settings = deps.store.load().settings
        const manifest = settings.theme === BUILTIN_THEME ? null : readManifestSync(join(themesDir, `${settings.theme}.wstheme.json`))
        const variant = manifest && settings.variant ? pickVariant(manifest, settings.variant, false) : null
        nativeTheme.themeSource = variant ? (variant.dark ? 'dark' : 'light') : settings.appearance
        const material = effectiveMaterial()
        deps.getWindow()?.setBackgroundMaterial(material)
      } catch { /* ignore platforms without material support */ }
    },

    async install(): Promise<ThemeState | null> {
      const win = deps.getWindow()
      if (!win) throw new MessageError('remote.windowNotReady')
      const result = await dialog.showOpenDialog(win, {
        filters: [{ name: mt('remote.themeFilter'), extensions: ['json'] }],
        properties: ['openFile']
      })
      if (result.canceled || result.filePaths.length === 0) return null
      const filePath = result.filePaths[0]
      if ((await stat(filePath)).size > maxInstallBytes) throw new MessageError('remote.themeTooBig')
      await this.installManifest(JSON.parse(await readFile(filePath, 'utf8')))
      deps.changed()
      return this.list()
    },

    async installManifest(input: unknown): Promise<void> {
      const manifest = validateThemePackage(input)
      await ensureDir()
      await writeReplacing(join(themesDir, `${manifest.id}.wstheme.json`), JSON.stringify(manifest, null, 2))
    },

    async installed(): Promise<ThemeManifest[]> {
      return readInstalled()
    },

    async installExample(id: string): Promise<ThemeState> {
      if (!slugRe.test(id)) throw new MessageError('remote.themeIdInvalid')
      const source = join(resourcesDir(), `${id}.wstheme.json`)
      try { await stat(source) } catch { throw new MessageError('remote.exampleMissing') }
      await ensureDir()
      await copyContent(source, join(themesDir, `${id}.wstheme.json`))
      deps.changed()
      return this.list()
    },

    async remove(id: string): Promise<ThemeState> {
      if (!slugRe.test(id)) throw new MessageError('remote.themeIdInvalid')
      if (id === BUILTIN_THEME) throw new MessageError('remote.builtinLocked')
      const filePath = join(themesDir, `${id}.wstheme.json`)
      try { await removeFile(filePath) } catch { throw new MessageError('remote.themeMissing') }
      const current = deps.store.load()
      if (current.settings.theme === id) {
        current.settings.theme = BUILTIN_THEME
        current.settings.variant = ''
        deps.store.save(current)
      }
      deps.changed()
      return this.list()
    }
  }
}
