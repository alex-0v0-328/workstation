const { _electron: electron } = require('playwright')
const { mkdirSync } = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')

async function main() {
  const folder = path.resolve('.local', `packaged-${Date.now()}`)
  mkdirSync(folder, { recursive: true })
  const launch = { executablePath: path.resolve('release/win-unpacked/Workstation.exe'), args: ['--hidden'], env: { ...process.env, WORKSTATION_TEST_DATA: folder }, timeout: 30000 }
  const app = await electron.launch(launch)
  try {
    const page = await app.firstWindow()
    await page.getByRole('heading', { name: '今天，专注重要的事' }).waitFor()
    const runtime = await app.evaluate(({ app, BrowserWindow }) => ({ packaged: app.isPackaged, preferences: BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences() }))
    assert.equal(runtime.packaged, true)
    assert.equal(runtime.preferences.contextIsolation, true)
    assert.equal(runtime.preferences.sandbox, true)
    assert.equal(runtime.preferences.nodeIntegration, false)
    await page.evaluate(async () => {
      const state = await window.workstation.load()
      state.tasks.push({ id: 'packaged-check', title: 'Packaged persistence check', status: 'todo', priority: 'normal', due: '', notes: '', reminders: false })
      await window.workstation.save(state)
    })
    assert.equal((await page.evaluate(() => window.workstation.load())).tasks.length, 1)
    assert.equal(await page.evaluate(() => typeof window.require), 'undefined')
    console.log('PACKAGED_RUNTIME_OK')
  } finally { await app.close() }
  const again = await electron.launch(launch)
  try {
    const page = await again.firstWindow()
    await page.getByRole('heading', { name: '今天，专注重要的事' }).waitFor()
    const state = await page.evaluate(() => window.workstation.load())
    assert.equal(state.tasks[0].title, 'Packaged persistence check')
    console.log('PACKAGED_PERSISTENCE_OK', folder)
  } finally { await again.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
