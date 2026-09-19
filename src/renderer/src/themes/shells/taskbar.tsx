import { useEffect, useState, type ReactNode } from 'react'
import { CheckboxChecked20Regular, HatGraduation20Regular, Mail20Regular, Settings20Regular, CalendarLtr20Regular } from '@fluentui/react-icons'
import { DateTime } from 'luxon'
import { useModel } from '../../model'

export function TaskbarShell({ children }: { children: ReactNode }) {
  const { page, setPage, state } = useModel()
  const [menu, setMenu] = useState(false)
  const [now, setNow] = useState(() => DateTime.now())
  useEffect(() => { const timer = setInterval(() => setNow(DateTime.now()), 30000); return () => clearInterval(timer) }, [])
  const nav = [{ id: 'todo', title: 'TODO', icon: <CheckboxChecked20Regular /> }, { id: 'study', title: '学习', icon: <HatGraduation20Regular /> }, { id: 'calendar', title: '周课表', icon: <CalendarLtr20Regular /> }, { id: 'life', title: '生活', icon: <Mail20Regular /> }]
  const titles: Record<string, string> = { todo: 'TODO', study: '学习', calendar: '周课表', life: '生活', settings: '设置' }
  const open = state.tasks.filter(t => t.status !== 'done' && !t.archived).length
  const go = (id: string) => { setPage(id); setMenu(false) }
  return <div className="taskbar-desktop shell-taskbar">
    <div className="taskbar-window">
      <div className="taskbar-titlebar">
        <span className="taskbar-title">Workstation — {titles[page] ?? page}</span>
        <span className="taskbar-title-buttons" aria-hidden="true"><i /><i /><i /></span>
      </div>
      <main className="taskbar-content">{children}</main>
    </div>
    <nav className="taskbar-bar" aria-label="主导航">
      <button className="taskbar-start" aria-expanded={menu} onClick={() => setMenu(m => !m)}>开始</button>
      <div className="taskbar-tasks">{nav.map(item => <button key={item.id} aria-current={page === item.id ? 'page' : undefined} className={page === item.id ? 'active' : ''} onClick={() => go(item.id)}>{item.icon}<span>{item.title}</span>{item.id === 'todo' && !!open && <small>{open}</small>}</button>)}</div>
      <span className="taskbar-clock">{now.setZone(state.settings.timezone).toFormat('HH:mm')}</span>
    </nav>
    {menu && <div className="taskbar-start-menu">
      <div className="taskbar-start-brand">Workstation 个人工作台</div>
      {nav.map(item => <button key={item.id} aria-label={`打开${item.title}`} onClick={() => go(item.id)}>{item.icon}<span>{item.title}</span></button>)}
      <button aria-label="打开设置" onClick={() => go('settings')}><Settings20Regular /><span>设置</span></button>
      <div className="taskbar-start-status"><span />本地个人版 · {now.setZone(state.settings.timezone).toFormat('M月d日')}</div>
    </div>}
  </div>
}
