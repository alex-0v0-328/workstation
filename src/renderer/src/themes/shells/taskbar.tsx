import { useEffect, useState, type ReactNode } from 'react'
import { CheckboxChecked20Regular, HatGraduation20Regular, Mail20Regular, Settings20Regular, CalendarLtr20Regular } from '@fluentui/react-icons'
import { DateTime } from 'luxon'
import { useModel } from '../../model'
import { useNav } from './nav'

const icons: Record<string, ReactNode> = { todo: <CheckboxChecked20Regular />, study: <HatGraduation20Regular />, calendar: <CalendarLtr20Regular />, life: <Mail20Regular /> }

export function TaskbarShell({ children }: { children: ReactNode }) {
  const { page, setPage, state, messages, t } = useModel()
  const { items, titles, open } = useNav()
  const [menu, setMenu] = useState(false)
  const [now, setNow] = useState(() => DateTime.now())
  useEffect(() => { const timer = setInterval(() => setNow(DateTime.now()), 30000); return () => clearInterval(timer) }, [])
  const go = (id: string) => { setPage(id); setMenu(false) }
  return <div className="taskbar-desktop shell-taskbar">
    <div className="taskbar-window">
      <div className="taskbar-titlebar">
        <span className="taskbar-title">Workstation — {titles[page] ?? page}</span>
        <span className="taskbar-title-buttons" aria-hidden="true"><i /><i /><i /></span>
      </div>
      <main className="taskbar-content">{children}</main>
    </div>
    <nav className="taskbar-bar" aria-label={t('nav.mainAria')}>
      <button className="taskbar-start" aria-expanded={menu} onClick={() => setMenu(m => !m)}>{t('shell.start')}</button>
      <div className="taskbar-tasks">{items.map(item => <button key={item.id} aria-current={page === item.id ? 'page' : undefined} className={page === item.id ? 'active' : ''} onClick={() => go(item.id)}>{icons[item.id]}<span>{item.title}</span>{item.id === 'todo' && !!open && <small>{open}</small>}</button>)}</div>
      <span className="taskbar-clock">{now.setZone(state.settings.timezone).toFormat('HH:mm')}</span>
    </nav>
    {menu && <div className="taskbar-start-menu">
      <div className="taskbar-start-brand">Workstation {t('shell.tagline')}</div>
      {items.map(item => <button key={item.id} aria-label={t('nav.open', { title: item.title })} onClick={() => go(item.id)}>{icons[item.id]}<span>{item.title}</span></button>)}
      <button aria-label={t('shell.openSettings')} onClick={() => go('settings')}><Settings20Regular /><span>{t('nav.settings')}</span></button>
      <div className="taskbar-start-status"><span />{t('shell.local')} · {now.setZone(state.settings.timezone).setLocale(messages.meta.locale).toFormat(messages.time.dateShort)}</div>
    </div>}
  </div>
}
