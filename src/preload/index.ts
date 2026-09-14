import { contextBridge, ipcRenderer } from 'electron'
import type { Bridge } from '../shared/types'
const bridge: Bridge = {
  load: () => ipcRenderer.invoke('workspace:load'), save: value => ipcRenderer.invoke('workspace:save', value),
  exportBackup: () => ipcRenderer.invoke('backup:export'), restoreBackup: () => ipcRenderer.invoke('backup:restore'), importAcademic: () => ipcRenderer.invoke('academic:import'),
  previewIcs: value => ipcRenderer.invoke('calendar:preview', value), syncCalendars: () => ipcRenderer.invoke('calendar:sync'),
  connection: () => ipcRenderer.invoke('connection:get'), saveSecrets: value => ipcRenderer.invoke('connection:save', value), connectGmail: () => ipcRenderer.invoke('connection:connect'), disconnectGmail: () => ipcRenderer.invoke('connection:disconnect'),
  listMail: value => ipcRenderer.invoke('mail:list', value), readMail: id => ipcRenderer.invoke('mail:read', id), translateMail: id => ipcRenderer.invoke('mail:translate', id),
  testAI: () => ipcRenderer.invoke('ai:test'), digests: () => ipcRenderer.invoke('digest:list'), summarize: () => ipcRenderer.invoke('digest:run'), openExternal: url => ipcRenderer.invoke('external:open', url),
  onChanged: callback => { const listener = () => callback(); ipcRenderer.on('workspace:changed', listener); return () => { ipcRenderer.removeListener('workspace:changed', listener) } }
}
contextBridge.exposeInMainWorld('workstation', bridge)
