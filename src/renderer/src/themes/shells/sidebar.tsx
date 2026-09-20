import type { ReactNode } from 'react'
import { Button } from '@fluentui/react-components'
import { CheckboxChecked24Regular, HatGraduation24Regular, Mail24Regular, Settings24Regular, CalendarLtr24Regular, PanelLeft24Regular } from '@fluentui/react-icons'
import { DateTime } from 'luxon'
import { useModel } from '../../model'
import { useNav } from './nav'

const icons: Record<string, ReactNode> = { todo: <CheckboxChecked24Regular />, study: <HatGraduation24Regular />, calendar: <CalendarLtr24Regular />, life: <Mail24Regular /> }

export function SidebarShell({ children }: { children: ReactNode }) {
  const { page, setPage, state, messages, t } = useModel()
  const { items, titles, open } = useNav()
  const semester = state.semesters.filter(s => !s.archived).at(-1)
  const today = DateTime.now().setZone(state.settings.timezone).setLocale(messages.meta.locale).toFormat(messages.time.weekdayDate)
  return <div className="app-layout shell-sidebar">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><PanelLeft24Regular /></div><div><strong>Workstation</strong><span>{t('shell.tagline')}</span></div></div>
      <div className="nav-caption">{t('nav.caption')}</div>
      <nav aria-label={t('nav.mainAria')}>{items.map(item => <button key={item.id} aria-current={page === item.id ? 'page' : undefined} className={`${page === item.id ? 'active' : ''} ${item.id === 'calendar' ? 'nav-child' : ''}`} onClick={() => setPage(item.id)}>{icons[item.id]}<span>{item.title}</span>{item.id === 'todo' && !!open && <small>{open}</small>}</button>)}</nav>
      {semester && <div className="sidebar-semester"><span>{t('shell.currentSemester')}</span><strong>{semester.name}</strong><small>{t('shell.courseCount', { count: state.courses.filter(c => c.semesterId === semester.id && !c.archived).length })}</small></div>}
      <div className="sidebar-bottom">
        <Button appearance={page === 'settings' ? 'secondary' : 'subtle'} icon={<Settings24Regular />} onClick={() => setPage('settings')}>{t('nav.settings')}</Button>
        <div className="local-status"><span />{t('shell.local')}</div>
      </div>
    </aside>
    <div className="main-column">
      <header className="app-topbar"><span>{t('shell.myWorkspace')} <i>/</i> {titles[page] ?? page}</span><span className="topbar-status">{today}</span></header>
      <main className="main-content">{children}</main>
    </div>
  </div>
}
