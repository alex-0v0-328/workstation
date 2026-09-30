import { useState, type CSSProperties } from 'react'
import { Button } from '@fluentui/react-components'
import { Add20Regular, CheckmarkCircle32Regular, ArrowRight20Regular, Search20Regular } from '@fluentui/react-icons'
import { DateTime } from 'luxon'
import { aggregateTodos, archiveDoneTodos, doneArchiveKept, toDate, todoBucket } from '../../shared/domain'
import { useModel, formatDate, taskDefaults } from './model'
import { Empty, Field, Panel, SectionTitle, TextField, DateField, SaveButton, readForm, str } from './components'
import type { TodoItem } from '../../shared/types'

type TabId = 'today' | 'due' | 'daily' | 'done' | 'archived'
type RangeId = 'today' | 'week' | 'all'

export function TodoView() {
  const { state, mutate, editTask, setPage, messages, t } = useModel()
  const [tab, setTab] = useState<TabId>('today')
  const [range, setRange] = useState<RangeId>('all')
  const [query, setQuery] = useState(''), [course, setCourse] = useState(''), [status, setStatus] = useState(''), [priority, setPriority] = useState('')
  const [adding, setAdding] = useState(false)
  const [addType, setAddType] = useState<'daily' | 'due'>('daily')
  const now = DateTime.now().setZone(state.settings.timezone)
  const all = aggregateTodos(state, true)
  const active = all.filter(item => !item.archived && item.status !== 'done')
  const overdue = active.filter(item => item.due && toDate(item.due, item.timezone!, true) < now)
  const upcoming = active.filter(item => item.due && toDate(item.due, item.timezone!) <= now.plus({ days: 7 }).endOf('day'))
  const visible = all.filter(item => {
    const bucket = todoBucket(item)
    if (tab === 'archived') return !!item.archived
    if (item.archived) return false
    if (tab === 'done') return item.status === 'done'
    if (item.status === 'done') return false
    if (tab === 'daily') return bucket === 'standing'
    if (tab === 'due') {
      if (bucket === 'standing') return false
      if (bucket === 'unscheduled') return true
      if (range === 'today') return toDate(item.due, item.timezone!) <= now.endOf('day')
      if (range === 'week') return toDate(item.due, item.timezone!) <= now.plus({ days: 7 }).endOf('day')
      return true
    }
    return bucket === 'standing' || toDate(item.due, item.timezone!) <= now.endOf('day')
  }).filter(item => (!query || `${item.title} ${item.courseName || ''}`.toLowerCase().includes(query.toLowerCase())) && (!course || item.courseId === course) && (!status || item.status === status) && (!priority || item.priority === priority))
  const byDue = (a: TodoItem, b: TodoItem) => (a.due ? toDate(a.due, a.timezone!).toMillis() : Infinity) - (b.due ? toDate(b.due, b.timezone!).toMillis() : Infinity) || a.title.localeCompare(b.title)
  const academic = visible.filter(item => item.source === 'assessment')
  const life = visible.filter(item => item.source === 'task')
  const archivableDone = tab === 'done' ? all.filter(item => !item.archived && item.status === 'done' && !doneArchiveKept(item)).length : 0
  const sections: { key: string; title: string; rows: TodoItem[] }[] = []
  if (tab === 'today') {
    const academicDue = academic.filter(item => todoBucket(item) === 'scheduled').sort(byDue)
    const lifeDue = life.filter(item => todoBucket(item) === 'scheduled').sort(byDue)
    const daily = life.filter(item => todoBucket(item) === 'standing').sort(byDue)
    if (academicDue.length) sections.push({ key: 'academic', title: t('todo.groupAcademic'), rows: academicDue })
    if (lifeDue.length) sections.push({ key: 'life', title: t('todo.groupLife'), rows: lifeDue })
    if (daily.length) sections.push({ key: 'daily', title: t('todo.tabDaily'), rows: daily })
  } else if (tab === 'due') {
    const scheduled = academic.filter(item => todoBucket(item) === 'scheduled').sort(byDue)
    const pending = academic.filter(item => todoBucket(item) === 'unscheduled').sort(byDue)
    if (scheduled.length) sections.push({ key: 'academic', title: t('todo.groupAcademic'), rows: scheduled })
    if (pending.length) sections.push({ key: 'pending', title: t('todo.groupPending'), rows: pending })
    if (life.length) sections.push({ key: 'life', title: t('todo.groupLife'), rows: life.sort(byDue) })
  } else {
    if (academic.length) sections.push({ key: 'academic', title: t('todo.groupAcademic'), rows: academic.sort(byDue) })
    if (life.length) sections.push({ key: 'life', title: t('todo.groupLife'), rows: life.sort(byDue) })
  }
  const tabLabels: Record<TabId, string> = { today: t('todo.tabToday'), due: t('todo.tabDue'), daily: t('todo.tabDaily'), done: t('todo.tabDone'), archived: t('todo.tabArchived') }
  const rangeLabels: Record<RangeId, string> = { today: t('todo.rangeToday'), week: t('todo.rangeWeek'), all: t('todo.rangeAll') }
  const showCourseFilter = all.some(item => item.courseId)
  const toggle = (item: TodoItem) => mutate(s => { const target = (item.source === 'assessment' ? s.assessments : s.tasks).find(x => x.id === item.id); if (target) target.status = target.status === 'done' ? 'todo' : 'done' })
  const editing = (item: TodoItem) => editTask((item.source === 'assessment' ? state.assessments : state.tasks).find(x => x.id === item.id))
  const rowCount = sections.reduce((sum, section) => sum + section.rows.length, 0)
  const renderRow = (item: TodoItem) => {
    const meta = []
    const code = item.courseId ? state.courses.find(c => c.id === item.courseId)?.code : ''
    if (item.courseName) meta.push(<span key="course" className="channel" style={{ '--channel': item.color } as CSSProperties}>{code || item.courseName}</span>, <span key="name">{code ? `${item.courseName} · ${item.category}` : item.category}</span>)
    else if (item.category) meta.push(<span key="category">{item.category}</span>)
    if (item.opens && toDate(item.opens, item.timezone!) > now) meta.push(<span key="notOpen">{t('todo.notOpen')}</span>)
    const late = !!item.due && toDate(item.due, item.timezone!, true) < now && item.status !== 'done'
    return <div className={`task-row ${item.status === 'done' ? 'completed' : ''}`} key={`${item.source}:${item.id}`}><input type="checkbox" aria-label={t('todo.completeAria', { title: item.title })} checked={item.status === 'done'} onChange={() => void toggle(item)} /><button className="task-main" onClick={() => editing(item)}><span className="task-title">{item.title}{item.priority === 'high' && <span className="flag"><i className="led warn" />{t('todo.highPriority')}</span>}{item.status === 'doing' && <span className="flag state"><i className="led on" />{messages.status.doing}</span>}</span>{meta.length > 0 && <span className="task-meta">{meta}</span>}</button><div className={`task-end ${late ? 'overdue' : ''}`}>{late && <i className="led warn" aria-hidden="true" />}<span>{formatDate(messages, item.due, item.timezone)}</span></div></div>
  }
  const agenda = state.events.filter(e => DateTime.fromISO(e.start, { zone: state.settings.timezone }).setZone(state.settings.timezone).hasSame(now, 'day')).sort((a, b) => a.start.localeCompare(b.start))
  return <>
    <SectionTitle title={t('todo.heading')} />
    <div className="readouts"><div className="readout"><span className="label">{t('todo.statsOpen')}</span><strong className="readout-value">{active.length}<small>{t('todo.statsUnit', { count: active.length })}</small></strong></div><div className="readout"><span className="label">{t('todo.statsWeek')}</span><strong className="readout-value">{upcoming.length}<small>{t('todo.statsUnit', { count: upcoming.length })}</small></strong></div><div className={`readout ${overdue.length ? 'alert' : ''}`}><span className="label">{overdue.length > 0 && <i className="led warn" aria-hidden="true" />} {t('todo.statsOverdue')}</span><strong className="readout-value">{overdue.length}<small>{t('todo.statsUnit', { count: overdue.length })}</small></strong></div></div>
    <div className="workspace-columns"><section className="surface task-surface">
      <div className="panel-bar"><div className="tabs category-tabs" role="tablist" aria-label={t('todo.tabsAria')}>{(Object.keys(tabLabels) as TabId[]).map(id => <button role="tab" aria-selected={tab === id} key={id} onClick={() => setTab(id)}>{tabLabels[id]}</button>)}</div><Button appearance="primary" icon={<Add20Regular />} onClick={() => setAdding(true)}>{t('todo.add')}</Button></div>
      {tab === 'due' && <div className="tabs subtabs" role="tablist" aria-label={t('todo.rangeAria')}>{(Object.keys(rangeLabels) as RangeId[]).map(id => <button role="tab" aria-selected={range === id} key={id} onClick={() => setRange(id)}>{rangeLabels[id]}</button>)}</div>}
      <div className="filters"><div className="search"><Search20Regular /><input aria-label={t('todo.searchAria')} placeholder={t('todo.searchPlaceholder')} value={query} onChange={e => setQuery(e.target.value)} /></div>{showCourseFilter && <select aria-label={t('todo.courseFilterAria')} value={course} onChange={e => setCourse(e.target.value)}><option value="">{t('todo.allCourses')}</option>{state.courses.filter(c => !c.archived).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}<select aria-label={t('todo.statusFilterAria')} value={status} onChange={e => setStatus(e.target.value)}><option value="">{t('todo.allStatus')}</option>{Object.entries(messages.status).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select><select aria-label={t('todo.priorityFilterAria')} value={priority} onChange={e => setPriority(e.target.value)}><option value="">{t('todo.allPriorities')}</option>{Object.entries(messages.priority).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></div>
      <div className="list-caption"><span className="label">{tabLabels[tab]}</span><span className="caption-actions"><span className="label">{t('todo.rowCount', { count: rowCount })}</span>{tab === 'done' && archivableDone > 0 && <Button size="small" appearance="subtle" onClick={() => void mutate(s => { archiveDoneTodos(s) })}>{t('todo.archiveDone', { count: archivableDone })}</Button>}</span></div>
      {rowCount === 0 ? <Empty icon={<CheckmarkCircle32Regular />} title={all.length ? t('todo.emptyFiltered') : t('todo.emptyAll')} action={() => setAdding(true)} actionLabel={t('todo.add')}>{t('todo.emptyBody')}</Empty> : sections.map(section => <div key={section.key}>
        {sections.length > 1 && <div className="group-header label">{section.title}</div>}
        <div className="task-list">{section.rows.map(renderRow)}</div>
      </div>)}
    </section><aside className="day-aside"><section className="surface"><div className="panel-head"><span className="label">{t('todo.agendaTitle')}</span><span className="label">{t('todo.agendaCount', { count: agenda.length })}</span></div>{agenda.length ? <div className="agenda">{agenda.map(event => <div className="agenda-item" key={event.id}><time>{event.allDay ? t('time.allDay') : DateTime.fromISO(event.start).setZone(state.settings.timezone).toFormat('HH:mm')}</time><strong>{event.title}</strong><small>{event.location || t('time.locationTbd')}</small></div>)}</div> : <p className="agenda-empty">{t('todo.agendaEmpty1')}<br />{t('todo.agendaEmpty2')}</p>}<div className="aside-foot"><Button appearance="subtle" icon={<ArrowRight20Regular />} iconPosition="after" onClick={() => setPage('calendar')}>{t('todo.openCalendar')}</Button></div></section></aside></div>
    {adding && <Panel title={t('todo.add')} close={() => setAdding(false)}>
      <form onSubmit={async e => { const data = readForm(e); const title = str(data, 'title'); if (!title) return; const due = addType === 'due' ? str(data, 'due') : ''; const ok = await mutate(s => { s.tasks.push({ ...taskDefaults(), title, due }) }); if (ok) { setAdding(false); setAddType('daily') } }}>
        <Field label={t('todo.addType')}>
          <div className="add-mode-grid" role="radiogroup" aria-label={t('todo.addType')}>
            <button type="button" role="radio" aria-checked={addType === 'daily'} className={`add-mode-card ${addType === 'daily' ? 'selected' : ''}`} onClick={() => setAddType('daily')}><strong>{t('todo.typeDaily')}</strong><small>{t('todo.typeDailyHint')}</small></button>
            <button type="button" role="radio" aria-checked={addType === 'due'} className={`add-mode-card ${addType === 'due' ? 'selected' : ''}`} onClick={() => setAddType('due')}><strong>{t('todo.typeDue')}</strong><small>{t('todo.typeDueHint')}</small></button>
          </div>
        </Field>
        <TextField label={t('editor.fieldName')} name="title" required placeholder={t('editor.namePhTask')} />
        {addType === 'due' && <DateField timezone={state.settings.timezone} label={t('editor.due')} name="due" />}
        <div className="form-actions"><Button onClick={() => setAdding(false)}>{t('common.cancel')}</Button><SaveButton /></div>
      </form>
    </Panel>}
  </>
}
