import { useEffect, useState, type ReactNode } from 'react'
import { DateTime } from 'luxon'
import { useModel } from '../../model'
import { Transport, useSemesterNow } from '../../StepRow'
import { useNav } from './nav'

// Classic desktop-application shell: the step row as a toolbar band, pages as property-sheet tabs,
// and a sunken-pane status bar. It lives inside the native window; it never draws window chrome.
export function ClassicShell({ children }: { children: ReactNode }) {
  const { page, setPage, state, messages, t } = useModel()
  const { items, titles, open } = useNav()
  const { semester, current, today } = useSemesterNow()
  const [now, setNow] = useState(() => DateTime.now())
  useEffect(() => { const timer = setInterval(() => setNow(DateTime.now()), 30000); return () => clearInterval(timer) }, [])
  const tabs = [...items, { id: 'settings', title: titles.settings }]
  return <div className="classic-app shell-classic">
    <Transport />
    <div className="classic-sheet">
      <nav className="classic-tabs" aria-label={t('nav.mainAria')}>{tabs.map(item => <button key={item.id} aria-current={page === item.id ? 'page' : undefined} onClick={() => setPage(item.id)}><span>{item.title}</span>{item.id === 'todo' && !!open && <small>{open}</small>}</button>)}</nav>
      <main className="classic-page">{children}</main>
    </div>
    <footer className="classic-status">
      <span><i className="led ok" aria-hidden="true" />{t('shell.local')}</span>
      <span>{current ? t('shell.weekStatus', { n: current.index }) : semester?.name ?? t('steps.noSemesterShort')}</span>
      <span>{today.toFormat(messages.time.fullDate)}</span>
      <span>{now.setZone(state.settings.timezone).toFormat('HH:mm')}</span>
    </footer>
  </div>
}
