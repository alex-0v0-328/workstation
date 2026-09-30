import type { ReactNode } from 'react'
import { CheckboxChecked20Regular, HatGraduation20Regular, Mail20Regular, Settings20Regular, CalendarLtr20Regular, Toolbox20Regular } from '@fluentui/react-icons'
import { useModel } from '../../model'
import { Transport } from '../../StepRow'
import { useNav } from './nav'

const icons: Record<string, ReactNode> = { todo: <CheckboxChecked20Regular />, study: <HatGraduation20Regular />, calendar: <CalendarLtr20Regular />, life: <Mail20Regular />, tools: <Toolbox20Regular /> }

export function SidebarShell({ children }: { children: ReactNode }) {
  const { page, setPage, t } = useModel()
  const { items, titles, open } = useNav()
  return <div className="app-layout shell-sidebar">
    <aside className="sidebar">
      <div className="brand"><strong>Workstation</strong></div>
      <div className="nav-caption label">{t('nav.caption')}</div>
      <nav aria-label={t('nav.mainAria')}>{items.map(item => <button key={item.id} aria-current={page === item.id ? 'page' : undefined} onClick={() => setPage(item.id)}>{icons[item.id]}<span>{item.title}</span>{item.id === 'todo' && !!open && <small>{open}</small>}</button>)}</nav>
      <div className="sidebar-bottom">
        <button className="nav-settings" aria-current={page === 'settings' ? 'page' : undefined} onClick={() => setPage('settings')}><Settings20Regular /><span>{titles.settings}</span></button>
        <div className="local-status label"><span className="led ok" />{t('shell.local')}</div>
      </div>
    </aside>
    <div className="main-column">
      <Transport />
      <main className="main-content">{children}</main>
    </div>
  </div>
}
