// Screenshot gallery: every theme variant x page on isolated synthetic data (never the real profile).
// Usage: node scripts/gallery.cjs [outDir=.local/gallery-<time>] [pages=todo,study,calendar,life,tools,settings] [width=1440] [height=900]
// COMBOS=theme:variant:appearance,... narrows the variants. Run `npm.cmd run build` first.
const path = require('node:path')
const { mkdirSync } = require('node:fs')
const repo = path.resolve(__dirname, '..')
const { _electron: electron } = require('playwright')

const out = path.resolve(process.argv[2] || path.join(repo, '.local', `gallery-${Date.now()}`))
const pages = (process.argv[3] || 'todo,study,calendar,life,tools,settings').split(',')
const width = Number(process.argv[4] || 1440), height = Number(process.argv[5] || 900)
const combos = (process.env.COMBOS || 'windows::light,windows::dark,catppuccin:latte:,catppuccin:frappe:,catppuccin:macchiato:,catppuccin:mocha:,retro:classic:,cyber:acid:').split(',')

function iso(days, time) {
  const d = new Date(Date.UTC(2026, 8, 30 + days))
  const date = d.toISOString().slice(0, 10)
  return time ? `${date}T${time}:00+10:00` : date
}

function demo() {
  const sem = { id: 's1', name: '2026 第二学期', start: '2026-07-20', end: '2026-11-30', timezone: 'Australia/Sydney', archived: false, weekStart: '2026-07-20', holidays: '' }
  const courses = [
    ['c1', '交互设计研究', 'DESN2003', '#0f7b6c'], ['c2', '应用数学 II', 'MAST2006', '#c2410c'],
    ['c3', '数据库系统', 'COMP3010', '#4f46e5'], ['c4', '学术写作', 'ACAD1002', '#be185d']
  ].map(([id, name, code, color]) => ({ id, semesterId: 's1', name, code, color, url: '', notes: '', archived: false }))
  const base = { status: 'todo', priority: 'normal', notes: '', reminders: true, archived: false, opens: '', starts: '', ends: '', weight: null, score: null, maxScore: null, result: '', location: '', url: '' }
  const assessments = [
    ['a1', 'c1', '用户访谈报告', 'Assignment', iso(0, '23:00'), 25],
    ['a2', 'c2', '第 8 周习题集', 'Assignment', iso(1, '17:00'), 5],
    ['a3', 'c3', 'SQL 实验 4', 'Lab', iso(3, '12:00'), 10],
    ['a4', 'c4', '文献综述初稿', 'Essay', iso(5), 20],
    ['a5', 'c2', '期中测验', 'Quiz', iso(9, '10:00'), 15],
    ['a6', 'c3', '小组项目：需求文档', 'Project', iso(14, '23:59'), 30],
    ['a7', 'c1', '原型评审', 'Presentation', '', 20],
    ['a8', 'c4', '期末论文', 'Essay', '', 40],
    ['a9', 'c2', '第 6 周习题集', 'Assignment', iso(-8, '17:00'), 5, 'done', 4.5, 5]
  ].map(([id, courseId, title, category, due, weight, status, score, maxScore]) => ({ ...base, id, courseId, title, category, due, weight, status: status || 'todo', score: score ?? null, maxScore: maxScore ?? null }))
  const tasks = [
    ['t1', '续签图书馆借书', iso(0, '18:00'), 'high'], ['t2', '交房租', iso(2), 'normal'],
    ['t3', '整理本周笔记', '', 'normal'], ['t4', '每天背 30 个单词', '', 'low'], ['t5', '预约牙医', iso(6, '09:30'), 'normal']
  ].map(([id, title, due, priority]) => ({ id, title, due, priority, status: 'todo', notes: '', reminders: true, archived: false }))
  const events = []
  const slots = [['c1', 1, '09:00', '11:00', 'Arts West 101'], ['c2', 1, '13:00', '14:00', 'Peter Hall G06'], ['c3', 2, '10:00', '12:00', 'Doug McDonell 4.05'], ['c4', 3, '14:00', '16:00', 'Online'], ['c2', 4, '11:00', '12:00', 'Peter Hall G06'], ['c3', 4, '11:00', '13:00', 'Lab 2'], ['c1', 5, '15:00', '17:00', 'Studio 3']]
  slots.forEach(([courseId, dow, s, e, location], i) => {
    const day = dow - 3 // 2026-09-28 is Monday
    events.push({ id: `e${i}`, sourceId: '', uid: `e${i}`, courseId, title: courses.find(c => c.id === courseId).name, start: iso(day, s), end: iso(day, e), allDay: false, location })
  })
  return { semesters: [sem], courses, assessments, tasks, events, hurdles: [{ id: 'h1', courseId: 'c2', text: '期末考试需达到 40%', scope: 'course', assessmentIds: [], status: 'pending' }] }
}

async function go(page, id) {
  if (id === 'settings') {
    const direct = page.locator('.sidebar-bottom button')
    if (await direct.count()) return direct.first().click()
  }
  const labels = { todo: /^TODO/, study: /^学习/, calendar: /^周课表/, life: /^生活/, tools: /^工具/, settings: /^设置/ }
  await page.getByRole('navigation').getByRole('button', { name: labels[id] }).first().click()
}

async function main() {
  mkdirSync(out, { recursive: true })
  const data = path.join(out, 'data')
  mkdirSync(data, { recursive: true })
  const app = await electron.launch({ cwd: repo, args: ['.', '--hidden'], env: { ...process.env, WORKSTATION_TEST_DATA: data }, timeout: 30000 })
  try {
    const page = await app.firstWindow()
    await app.evaluate(({ BrowserWindow }) => { for (const w of BrowserWindow.getAllWindows()) w.webContents.setBackgroundThrottling(false) })
    page.setDefaultTimeout(15000)
    const errors = []
    page.on('pageerror', e => errors.push(e.message))
    await page.setViewportSize({ width, height })
    await page.locator('#root > .root-theme').waitFor()
    // Hidden windows never advance CSS transitions, which would freeze colors mid-change in the captures.
    await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' })
    for (const id of ['catppuccin', 'retro', 'cyber']) await page.evaluate(x => window.workstation.installExampleTheme(x), id)
    await page.evaluate(async d => { const ws = await window.workstation.load(); await window.workstation.save({ ...ws, ...d }) }, demo())
    for (const combo of combos) {
      const [theme, variant, appearance] = combo.split(':')
      await page.evaluate(async ([theme, variant, appearance]) => { const ws = await window.workstation.load(); ws.settings.theme = theme; ws.settings.variant = variant || ''; ws.settings.appearance = appearance || 'system'; await window.workstation.save(ws) }, [theme, variant, appearance])
      await page.locator(`.theme-${theme}`).first().waitFor()
      for (const p of pages) {
        await go(page, p)
        await page.waitForTimeout(350)
        await page.screenshot({ path: path.join(out, `${theme}-${variant || appearance}-${p}.png`) })
      }
    }
    if (errors.length) console.log('PAGE_ERRORS', errors)
    console.log('GALLERY_OK', out)
  } catch (e) { const w = await app.firstWindow(); await w.screenshot({ path: path.join(out, 'failure.png') }).catch(() => {}); console.log((await w.locator('body').innerText().catch(() => '')).slice(0, 800)); throw e } finally { await app.close() }
}
main().catch(e => { console.error(e); process.exit(1) })
