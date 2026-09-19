import { app, BrowserWindow, dialog } from 'electron'
import { join } from 'node:path'
import { readdir, readFile, writeFile, copyFile, unlink, mkdir, stat } from 'node:fs/promises'
import { readFileSync, readdirSync } from 'node:fs'
import { release } from 'node:os'
import { validateThemePackage, BUILTIN_THEME, type ThemeManifest } from '../shared/theme-manifest'
import type { ThemeState } from '../shared/types'
import type { Store } from './store'

export interface ThemeService {
  list(): Promise<ThemeState>
  applyMaterial(): void
  install(): Promise<ThemeState | null>
  installExample(id: string): Promise<ThemeState>
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

function readManifestSync(path: string): ThemeManifest | null {
  try { return validateThemePackage(JSON.parse(readFileSync(path, 'utf8'))) } catch { return null }
}

export function createThemeService(deps: { store: Store; getWindow: () => BrowserWindow | null; changed: () => void }): ThemeService {
  const themesDir = join(app.getPath('userData'), 'themes')
  let ensured = false

  async function ensureDir(): Promise<void> {
    if (ensured) return
    await mkdir(themesDir, { recursive: true })
    ensured = true
  }

  async function readInstalled(): Promise<ThemeManifest[]> {
    await ensureDir()
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
    if (process.env.WORKSTATION_TEST_DATA) return 'none'
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
        active: { id: settings.theme, variant: settings.variant, material: effectiveMaterial() }
      }
    },

    applyMaterial(): void {
      try {
        const material = effectiveMaterial()
        deps.getWindow()?.setBackgroundMaterial(material)
      } catch { /* ignore platforms without material support */ }
    },

    async install(): Promise<ThemeState | null> {
      const win = deps.getWindow()
      if (!win) throw new Error('窗口未就绪')
      const result = await dialog.showOpenDialog(win, {
        filters: [{ name: 'Workstation 主题', extensions: ['json'] }],
        properties: ['openFile']
      })
      if (result.canceled || result.filePaths.length === 0) return null
      const filePath = result.filePaths[0]
      if ((await stat(filePath)).size > maxInstallBytes) throw new Error('主题包超过 2MB')
      const manifest = validateThemePackage(JSON.parse(await readFile(filePath, 'utf8')))
      await ensureDir()
      await writeFile(join(themesDir, `${manifest.id}.wstheme.json`), JSON.stringify(manifest, null, 2))
      deps.changed()
      return this.list()
    },

    async installExample(id: string): Promise<ThemeState> {
      if (!slugRe.test(id)) throw new Error('主题 ID 不合法')
      const source = join(resourcesDir(), `${id}.wstheme.json`)
      try { await stat(source) } catch { throw new Error('示例主题不存在') }
      await ensureDir()
      await copyFile(source, join(themesDir, `${id}.wstheme.json`))
      deps.changed()
      return this.list()
    },

    async remove(id: string): Promise<ThemeState> {
      if (!slugRe.test(id)) throw new Error('主题 ID 不合法')
      if (id === BUILTIN_THEME) throw new Error('内置主题不可移除')
      const filePath = join(themesDir, `${id}.wstheme.json`)
      try { await unlink(filePath) } catch { throw new Error('主题不存在') }
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
