import { useState } from 'react'
import { Button, Badge } from '@fluentui/react-components'
import { Add20Regular, CheckmarkCircle32Regular, ArrowRight20Regular, Search20Regular, CalendarLtr20Regular } from '@fluentui/react-icons'
import { DateTime } from 'luxon'
import { aggregateTodos, toDate } from '../../shared/domain'
import { useModel, formatDate, statusLabel } from './model'
import { Empty, SectionTitle } from './components'
import type { TodoItem } from '../../shared/types'

export function TodoView() {
  const { state, mutate, editTask, setPage } = useModel()
  const [filter, setFilter] = useState('today'), [query, setQuery] = useState(''), [course, setCourse] = useState(''), [source, setSource] = useState(''), [status, setStatus] = useState(''), [priority, setPriority] = useState('')
  const now = DateTime.now().setZone(state.settings.timezone)
  const all = aggregateTodos(state, true)
  const active = all.filter(t => !t.archived && t.status !== 'done')
  const overdue = active.filter(t => t.due && toDate(t.due, t.timezone!, true) < now)
  const upcoming = active.filter(t => t.due && toDate(t.due, t.timezone!) <= now.plus({ days: 7 }).endOf('day'))
  const rows = all.filter(t => {
    if (filter === 'archived' ? !t.archived : t.archived) return false
    if (filter !== 'archived' && (filter === 'done' ? t.status !== 'done' : t.status === 'done')) return false
    if (filter === 'today' && (!t.due || toDate(t.due, t.timezone!) > now.endOf('day'))) return false
    if (filter === 'week' && (!t.due || toDate(t.due, t.timezone!) > now.plus({ days: 7 }).endOf('day'))) return false
    if (filter === 'unscheduled' && t.due) return false
    return (!query || `${t.title} ${t.courseName || ''}`.toLowerCase().includes(query.toLowerCase())) && (!course || t.courseId === course) && (!source || t.source === source) && (!status || t.status === status) && (!priority || t.priority === priority)
  }).sort((a, b) => (a.due ? toDate(a.due, a.timezone!).toMillis() : Infinity) - (b.due ? toDate(b.due, b.timezone!).toMillis() : Infinity) || a.title.localeCompare(b.title))
  const toggle = (item: TodoItem) => mutate(s => { const t = (item.source === 'assessment' ? s.assessments : s.tasks).find(x => x.id === item.id); if (t) t.status = t.status === 'done' ? 'todo' : 'done' })
  const editing = (item: TodoItem) => editTask((item.source === 'assessment' ? state.assessments : state.tasks).find(x => x.id === item.id))
  const tabs = [['today', '今天'], ['week', '未来七天'], ['all', '全部'], ['unscheduled', '未安排'], ['done', '已完成'], ['archived', '已归档']]
  return <>
    <SectionTitle title="今天，专注重要的事" subtitle={now.setLocale('zh-CN').toFormat('yyyy年M月d日 · cccc')} actions={<Button appearance="primary" icon={<Add20Regular />} onClick={() => editTask()}>添加事项</Button>} />
    <div className="overview-strip"><div><span>待完成</span><strong>{active.length}<small>项</small></strong></div><div><span>未来七天到期</span><strong>{upcoming.length}<small>项</small></strong></div><div><span>已逾期</span><strong className={overdue.length ? 'warning-text' : ''}>{overdue.length}<small>项</small></strong></div><div className="overview-link"><span>学习与生活，在这里汇合</span><Button appearance="subtle" icon={<ArrowRight20Regular />} iconPosition="after" onClick={() => setPage('study')}>查看本学期</Button></div></div>
    <div className="workspace-columns"><section className="surface task-surface"><div className="tabs" role="tablist" aria-label="事项时间范围">{tabs.map(([id, title]) => <button role="tab" aria-selected={filter === id} key={id} onClick={() => setFilter(id)}>{title}</button>)}</div>
      <div className="filters"><div className="search"><Search20Regular /><input aria-label="搜索事项" placeholder="搜索事项或课程" value={query} onChange={e => setQuery(e.target.value)} /></div><select aria-label="课程筛选" value={course} onChange={e => setCourse(e.target.value)}><option value="">所有课程</option>{state.courses.filter(c => !c.archived).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><select aria-label="来源筛选" value={source} onChange={e => setSource(e.target.value)}><option value="">所有来源</option><option value="assessment">学习考核</option><option value="task">手动事项</option></select><select aria-label="状态筛选" value={status} onChange={e => setStatus(e.target.value)}><option value="">所有状态</option>{Object.entries(statusLabel).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select><select aria-label="优先级筛选" value={priority} onChange={e => setPriority(e.target.value)}><option value="">所有优先级</option><option value="high">高</option><option value="normal">普通</option><option value="low">低</option></select></div>
      <div className="list-caption"><span>{tabs.find(t => t[0] === filter)?.[1]}</span><span>{rows.length} 个事项</span></div>
      {rows.length === 0 ? <Empty icon={<CheckmarkCircle32Regular />} title={all.length ? '这个列表暂时没有事项' : '从第一件小事开始'} action={() => editTask()} actionLabel="添加事项">手动事项和课程考核会汇集于此，让你清楚下一步要做什么。</Empty> : <div className="task-list">{rows.map(item => <div className={`task-row ${item.status === 'done' ? 'completed' : ''}`} key={`${item.source}:${item.id}`}><input type="checkbox" aria-label={`完成 ${item.title}`} checked={item.status === 'done'} onChange={() => void toggle(item)} /><button className="task-main" onClick={() => editing(item)}><span className="task-title">{item.title}{item.priority === 'high' && <span className="priority-mark">高优先级</span>}</span><span className="task-meta">{item.courseName ? <><i style={{ background: item.color }} />{item.courseName} · {item.category}</> : '个人事项'}{item.opens && toDate(item.opens, item.timezone!) > now ? ' · 未开放' : ''}</span></button><div className="task-end"><Badge appearance="tint" color={item.status === 'doing' ? 'brand' : 'subtle'}>{statusLabel[item.status]}</Badge><span className={item.due && toDate(item.due, item.timezone!, true) < now && item.status !== 'done' ? 'warning-text' : ''}>{formatDate(item.due, item.timezone)}</span></div></div>)}</div>}
    </section><aside className="day-aside"><div className="aside-title"><CalendarLtr20Regular /><h3>今日课表</h3></div>{state.events.filter(e => DateTime.fromISO(e.start, { zone: state.settings.timezone }).setZone(state.settings.timezone).hasSame(now, 'day')).sort((a, b) => a.start.localeCompare(b.start)).map(event => <div className="agenda-item" key={event.id}><span>{event.allDay ? '全天' : DateTime.fromISO(event.start).setZone(state.settings.timezone).toFormat('HH:mm')}</span><strong>{event.title}</strong><small>{event.location || '地点待定'}</small></div>)}{!state.events.some(e => DateTime.fromISO(e.start, { zone: state.settings.timezone }).setZone(state.settings.timezone).hasSame(now, 'day')) && <p className="muted">今天没有课程安排。<br />为自己留一点从容。</p>}<Button appearance="subtle" icon={<ArrowRight20Regular />} iconPosition="after" onClick={() => setPage('calendar')}>打开周课表</Button><div className="aside-note"><span>本地保存</span><p>学业与待办保存在这台电脑。定期导出备份，带走你的安排。</p><Button appearance="subtle" onClick={() => setPage('settings')}>管理备份</Button></div></aside></div>
  </>
}
