import { app, BrowserWindow, nativeTheme } from 'electron'
import { join } from 'node:path'
import type { Store } from './store'
import type { ThemeService } from './themes'

function backgroundColor(store: Store): string {
  const appearance = store.load().settings.appearance
  const dark = appearance === 'system' ? nativeTheme.shouldUseDarkColors : appearance === 'dark'
  return dark ? '#1b1c1f' : '#f3f3f3'
}

export function createAppWindow(deps: { store: Store; themeService: ThemeService; isQuitting(): boolean }): BrowserWindow {
  const window = new BrowserWindow({ width: 1440, height: 940, minWidth: 960, minHeight: 640, title: 'Workstation', icon: join(__dirname, '../../resources/icon.png'), backgroundColor: backgroundColor(deps.store), autoHideMenuBar: true, show: false, webPreferences: { preload: join(__dirname, '../preload/index.js'), sandbox: true, contextIsolation: true, nodeIntegration: false } })
  deps.themeService.applyMaterial()
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  window.webContents.on('will-navigate', event => event.preventDefault())
  window.webContents.session.setPermissionRequestHandler((_wc, _permission, callback) => callback(false))
  window.on('close', event => { if (!deps.isQuitting() && deps.store.load().settings.closeToTray) { event.preventDefault(); window.hide() } })
  window.once('ready-to-show', () => { if (!process.argv.includes('--hidden')) { window.show(); window.focus() } })
  if (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) window.loadURL(process.env.ELECTRON_RENDERER_URL)
  else window.loadFile(join(__dirname, '../renderer/index.html'))
  return window
}
