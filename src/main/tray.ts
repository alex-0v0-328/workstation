import { Tray, Menu, nativeImage } from 'electron'
import { mt } from './i18n'

export function createTray(deps: { show(): void; sync(): void; quit(): void }): Tray {
  const bytes = Buffer.alloc(32 * 32 * 4)
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
    const i = (y * 32 + x) * 4, line = (x >= 8 && x <= 11 && y >= 8 && y <= 24) || (x >= 14 && x <= 17 && y >= 15 && y <= 24) || (x >= 20 && x <= 23 && y >= 8 && y <= 24)
    bytes[i] = line ? 255 : 190; bytes[i + 1] = line ? 255 : 92; bytes[i + 2] = line ? 255 : 15; bytes[i + 3] = 255
  }
  const tray = new Tray(nativeImage.createFromBitmap(bytes, { width: 32, height: 32 }))
  tray.setToolTip(mt('remote.trayTooltip'))
  tray.setContextMenu(Menu.buildFromTemplate([{ label: mt('remote.trayOpen'), click: deps.show }, { label: mt('remote.traySync'), click: deps.sync }, { type: 'separator' }, { label: mt('remote.trayQuit'), click: deps.quit }]))
  tray.on('double-click', deps.show)
  return tray
}
