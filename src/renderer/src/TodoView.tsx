import { useState } from 'react'
import { Button, Badge } from '@fluentui/react-components'
import { Add20Regular, CheckmarkCircle32Regular, ArrowRight20Regular, Search20Regular, CalendarLtr20Regular } from '@fluentui/react-icons'
import { DateTime } from 'luxon'
import { aggregateTodos, toDate } from '../../shared/domain'
import { useModel, formatDate, taskDefaults } from './model'
import { Empty, Panel, SectionTitle, TextField, SaveButton, readForm, str } from './components'
import type { TodoItem } from '../../shared/types'

export function TodoView() {
  const { state, mutate, editTask, setPage, messages, t } = useModel()
  const [category, setCategory] = useState<'due' | 'nodue'>('due')
  const [filter, setFilter] = useState('today'), [query, setQuery] = useState(''), [course, setCourse] = useState(''), [status, setStatus] = useState(''), [priority, setPriority] = useState('')
  const [adding, setAdding] = useState(false)
  const now = DateTime.now().setZone(state.settings.timezone)
  const all = aggregateTodos(state, true)
  const scoped = all.filter(t => category === 'due' ? t.due : !t.due)
  const active = scoped.filter(t => !t.archived && t.status !== 'done')
  const overdue = active.filter(t => t.due && toDate(t.due, t.timezone!, true) < now)
  const upcoming = active.filter(t => t.due && toDate(t.due, t.timezone!) <= now.plus({ days: 7 }).endOf('day'))
  const rows = scoped.filter(t => {
    if (filter === 'archived' ? !t.archived : t.archived) return false
    if (filter !== 'archived' && (filter === 'done' ? t.status !== 'done' : t.status === 'done')) return false
    if (filter === 'today' && (!t.due || toDate(t.due, t.timezone!) > now.endOf('day'))) return false
    if (filter === 'week' && (!t.due || toDate(t.due, t.timezone!) > now.plus({ days: 7 }).endOf('day'))) return false
    return (!query || `${t.title} ${t.courseName || ''}`.toLowerCase().includes(query.toLowerCase())) && (!course || t.courseId === course) && (!status || t.status === status) && (!priority || t.priority === priority)
  }).sort((a, b) => (a.due ? toDate(a.due, a.timezone!).toMillis() : Infinity) - (b.due ? toDate(b.due, b.timezone!).toMillis() : Infinity) || a.title.localeCompare(b.title))
  const toggle = (item: TodoItem) => mutate(s => { const t = (item.source === 'assessment' ? s.assessments : s.tasks).find(x => x.id === item.id); if (t) t.status = t.status === 'done' ? 'todo' : 'done' })
  const editing = (item: TodoItem) => editTask((item.source === 'assessment' ? state.assessments : state.tasks).find(x => x.id === item.id))
  const tabLabels = { today: messages.todo.tabs[0], week: messages.todo.tabs[1], all: messages.todo.tabs[2], done: messages.todo.tabs[3], archived: messages.todo.tabs[4] }
  const visibleTabIds: Array<keyof typeof tabLabels> = category === 'due' ? ['today', 'week', 'all', 'done', 'archived'] : ['all', 'done', 'archived']
  const categories = [['due', t('todo.catDue')], ['nodue', t('todo.catNoDue')]] as const
  const showCourseFilter = scoped.some(t => t.courseId)
  const switchCategory = (next: 'due' | 'nodue') => {
    const visible = next === 'due' ? ['today', 'week', 'all', 'done', 'archived'] : ['all', 'done', 'archived']
    if (!visible.includes(filter)) setFilter('all')
    setCategory(next)
  }
  const startAdd = () => category === 'due' ? editTask() : setAdding(true)
  return <>
    <SectionTitle title={t('todo.heading')} subtitle={now.setLocale(messages.meta.locale).toFormat(messages.time.fullDate)} actions={<Button appearance="primary" icon={<Add20Regular />} onClick={startAdd}>{t('todo.add')}</Button>} />
    <div className="overview-strip"><div><span>{t('todo.statsOpen')}</span><strong>{active.length}<small>{t('todo.statsUnit', { count: active.length })}</small></strong></div><div><span>{t('todo.statsWeek')}</span><strong>{upcoming.length}<small>{t('todo.statsUnit', { count: upcoming.length })}</small></strong></div><div><span>{t('todo.statsOverdue')}</span><strong className={overdue.length ? 'warning-text' : ''}>{overdue.length}<small>{t('todo.statsUnit', { count: overdue.length })}</small></strong></div><div className="overview-link"><Button appearance="subtle" icon={<ArrowRight20Regular />} iconPosition="after" onClick={() => setPage('study')}>{t('todo.viewSemester')}</Button></div></div>
    <div className="workspace-columns"><section className="surface task-surface">
      <div className="tabs category-tabs" role="tablist" aria-label={t('todo.categoryAria')}>{categories.map(([id, title]) => <button role="tab" aria-selected={category === id} key={id} onClick={() => switchCategory(id)}>{title}</button>)}</div>
      <div className="tabs" role="tablist" aria-label={t('todo.tabsAria')}>{visibleTabIds.map(id => <button role="tab" aria-selected={filter === id} key={id} onClick={() => setFilter(id)}>{tabLabels[id]}</button>)}</div>
      <div className="filters"><div className="search"><Search20Regular /><input aria-label={t('todo.searchAria')} placeholder={t('todo.searchPlaceholder')} value={query} onChange={e => setQuery(e.target.value)} /></div>{showCourseFilter && <select aria-label={t('todo.courseFilterAria')} value={course} onChange={e => setCourse(e.target.value)}><option value="">{t('todo.allCourses')}</option>{state.courses.filter(c => !c.archived).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}<select aria-label={t('todo.statusFilterAria')} value={status} onChange={e => setStatus(e.target.value)}><option value="">{t('todo.allStatus')}</option>{Object.entries(messages.status).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select><select aria-label={t('todo.priorityFilterAria')} value={priority} onChange={e => setPriority(e.target.value)}><option value="">{t('todo.allPriorities')}</option>{Object.entries(messages.priority).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></div>
      <div className="list-caption"><span>{tabLabels[filter as keyof typeof tabLabels]}</span><span>{t('todo.rowCount', { count: rows.length })}</span></div>
      {rows.length === 0 ? <Empty icon={<CheckmarkCircle32Regular />} title={all.length ? t('todo.emptyFiltered') : t('todo.emptyAll')} action={startAdd} actionLabel={t('todo.add')}>{t('todo.emptyBody')}</Empty> : <div className="task-list">{rows.map(item => {
        const meta = []
        if (item.source === 'assessment') meta.push(<span key="academic" className="academic-tag">{t('todo.academicTag')}</span>)
        if (item.courseName) meta.push(<span key="course"><i style={{ background: item.color }} />{item.courseName} · {item.category}</span>)
        else if (item.category) meta.push(<span key="category">{item.category}</span>)
        if (item.opens && toDate(item.opens, item.timezone!) > now) meta.push(<span key="notOpen">{t('todo.notOpen')}</span>)
        return <div className={`task-row ${item.status === 'done' ? 'completed' : ''}`} key={`${item.source}:${item.id}`}><input type="checkbox" aria-label={t('todo.completeAria', { title: item.title })} checked={item.status === 'done'} onChange={() => void toggle(item)} /><button className="task-main" onClick={() => editing(item)}><span className="task-title">{item.title}{item.priority === 'high' && <span className="priority-mark">{t('todo.highPriority')}</span>}</span>{meta.length > 0 && <span className="task-meta">{meta}</span>}</button><div className="task-end"><Badge appearance="tint" color={item.status === 'doing' ? 'brand' : 'subtle'}>{messages.status[item.status]}</Badge><span className={item.due && toDate(item.due, item.timezone!, true) < now && item.status !== 'done' ? 'warning-text' : ''}>{formatDate(messages, item.due, item.timezone)}</span></div></div>
      })}</div>}
    </section><aside className="day-aside"><div className="aside-title"><CalendarLtr20Regular /><h3>{t('todo.agendaTitle')}</h3></div>{state.events.filter(e => DateTime.fromISO(e.start, { zone: state.settings.timezone }).setZone(state.settings.timezone).hasSame(now, 'day')).sort((a, b) => a.start.localeCompare(b.start)).map(event => <div className="agenda-item" key={event.id}><span>{event.allDay ? t('time.allDay') : DateTime.fromISO(event.start).setZone(state.settings.timezone).toFormat('HH:mm')}</span><strong>{event.title}</strong><small>{event.location || t('time.locationTbd')}</small></div>)}{!state.events.some(e => DateTime.fromISO(e.start, { zone: state.settings.timezone }).setZone(state.settings.timezone).hasSame(now, 'day')) && <p className="muted">{t('todo.agendaEmpty1')}<br />{t('todo.agendaEmpty2')}</p>}<Button appearance="subtle" icon={<ArrowRight20Regular />} iconPosition="after" onClick={() => setPage('calendar')}>{t('todo.openCalendar')}</Button></aside></div>
    {adding && <Panel title={t('todo.add')} close={() => setAdding(false)}>
      <form onSubmit={async e => { const data = readForm(e); const title = str(data, 'title'); if (!title) return; const ok = await mutate(s => { s.tasks.push({ ...taskDefaults(), title }) }); if (ok) setAdding(false) }}>
        <TextField label={t('editor.fieldName')} name="title" required placeholder={t('editor.namePhTask')} />
        <div className="form-actions"><Button onClick={() => setAdding(false)}>{t('common.cancel')}</Button><SaveButton /></div>
      </form>
    </Panel>}
  </>
}
