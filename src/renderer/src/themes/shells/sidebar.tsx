import type { ReactNode } from 'react'
import { Button } from '@fluentui/react-components'
import { CheckboxChecked24Regular, HatGraduation24Regular, Mail24Regular, Settings24Regular, CalendarLtr24Regular, PanelLeft24Regular } from '@fluentui/react-icons'
import { DateTime } from 'luxon'
import { useModel } from '../../model'

export function SidebarShell({ children }: { children: ReactNode }) {
  const { page, setPage, state } = useModel()
  const nav = [{ id: 'todo', title: 'TODO', icon: <CheckboxChecked24Regular /> }, { id: 'study', title: '学习', icon: <HatGraduation24Regular /> }, { id: 'calendar', title: '周课表', icon: <CalendarLtr24Regular />, child: true }, { id: 'life', title: '生活', icon: <Mail24Regular /> }]
  const titles: Record<string, string> = { todo: 'TODO', study: '学习', calendar: '周课表', life: '生活', settings: '设置' }
  const semester = state.semesters.filter(s => !s.archived).at(-1)
  const open = state.tasks.filter(t => t.status !== 'done' && !t.archived).length
  const today = DateTime.now().setZone(state.settings.timezone).setLocale('zh-CN').toFormat('M月d日 · cccc')
  return <div className="app-layout shell-sidebar">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><PanelLeft24Regular /></div><div><strong>Workstation</strong><span>个人工作台</span></div></div>
      <div className="nav-caption">工作空间</div>
      <nav aria-label="主导航">{nav.map(item => <button key={item.id} aria-current={page === item.id ? 'page' : undefined} className={`${page === item.id ? 'active' : ''} ${item.child ? 'nav-child' : ''}`} onClick={() => setPage(item.id)}>{item.icon}<span>{item.title}</span>{item.id === 'todo' && !!open && <small>{open}</small>}</button>)}</nav>
      {semester && <div className="sidebar-semester"><span>当前学期</span><strong>{semester.name}</strong><small>{state.courses.filter(c => c.semesterId === semester.id && !c.archived).length} 门课程</small></div>}
      <div className="sidebar-bottom">
        <Button appearance={page === 'settings' ? 'secondary' : 'subtle'} icon={<Settings24Regular />} onClick={() => setPage('settings')}>设置</Button>
        <div className="local-status"><span />本地个人版</div>
      </div>
    </aside>
    <div className="main-column">
      <header className="app-topbar"><span>我的工作台 <i>/</i> {titles[page] ?? page}</span><span className="topbar-status">{today}</span></header>
      <main className="main-content">{children}</main>
    </div>
  </div>
}
