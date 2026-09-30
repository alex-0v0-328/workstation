import { useEffect, useState, type CSSProperties } from 'react'
import { DateTime, Info } from 'luxon'
import { Button } from '@fluentui/react-components'
import { Add20Regular, ArrowSync20Regular, ArrowUpload20Regular, ChevronLeft20Regular, ChevronRight20Regular } from '@fluentui/react-icons'
import { useModel, uid } from './model'
import { SectionTitle, Panel, Field, TextField, SaveButton, readForm, str } from './components'
import { expandManual, layoutDayEvents, startOfWeek, weekTimeRange } from '../../shared/calendar'
import { visibleCalendarEvents } from '../../shared/domain'
import type { CalendarEvent, IcsPreview, Semester } from '../../shared/types'

export function CalendarView() {
  const { state, run, reload, mutate, messages, t, focusWeek, setFocusWeek } = useModel()
  const [semesterId, setSemesterId] = useState(''), [importing, setImporting] = useState(false), [manual, setManual] = useState(false), [selected, setSelected] = useState<CalendarEvent | null>(null)
  const semester = state.semesters.find(s => s.id === semesterId) || state.semesters.filter(s => !s.archived).at(-1)
  const zone = semester?.timezone || state.settings.timezone
  const currentWeek = () => startOfWeek(DateTime.now().setZone(zone))
  const [week, setWeek] = useState(() => focusWeek ? startOfWeek(DateTime.fromISO(focusWeek, { zone })) : currentWeek())
  // A step-row key sets focusWeek; consume it so pressing the same key again still jumps.
  useEffect(() => { if (!focusWeek) return; setWeek(startOfWeek(DateTime.fromISO(focusWeek, { zone }))); setFocusWeek('') }, [focusWeek])
  const courses = state.courses.filter(c => c.semesterId === semester?.id)
  const sources = state.sources.filter(s => s.semesterId === semester?.id)
  const days = Array.from({ length: 7 }, (_, i) => startOfWeek(week).plus({ days: i }))
  const events = visibleCalendarEvents(state.events, courses, sources, state.semesters)
  const nowInZone = DateTime.now().setZone(zone)
  const { open, close } = weekTimeRange(events, days, zone)
  const span = close - open
  const bodyHeight = (span / 60) * 48
  const hourMarks = Array.from({ length: span / 60 + 1 }, (_, i) => open + i * 60)
  const allDayOn = (day: DateTime) => events.filter(e => {
    if (!e.allDay) return false
    const start = DateTime.fromISO(e.start, { zone }).setZone(zone)
    const end = DateTime.fromISO(e.end, { zone }).setZone(zone)
    return start.startOf('day') <= day.startOf('day') && end > day.startOf('day')
  })
  const hasAllDay = days.some(day => allDayOn(day).length > 0)
  return <>
    <SectionTitle title={t('calendar.heading')} actions={<><Button icon={<ArrowSync20Regular />} onClick={() => void run(async () => { await window.workstation.syncCalendars(); await reload() }, t('calendar.refreshDone'))}>{t('calendar.refresh')}</Button><Button icon={<ArrowUpload20Regular />} disabled={!semester} onClick={() => setImporting(true)}>{t('calendar.importIcs')}</Button><Button appearance="primary" icon={<Add20Regular />} disabled={!courses.length} onClick={() => setManual(true)}>{t('calendar.manual')}</Button></>} />
    <div className="calendar-toolbar"><select aria-label={t('calendar.semesterAria')} value={semester?.id || ''} onChange={e => setSemesterId(e.target.value)}>{!state.semesters.length && <option value="">{t('calendar.noSemester')}</option>}{state.semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select><Button aria-label={t('calendar.prevWeek')} icon={<ChevronLeft20Regular />} onClick={() => setWeek(w => w.minus({ weeks: 1 }))} /><Button onClick={() => setWeek(currentWeek())}>{t('calendar.thisWeek')}</Button><Button aria-label={t('calendar.nextWeek')} icon={<ChevronRight20Regular />} onClick={() => setWeek(w => w.plus({ weeks: 1 }))} /><strong>{week.setLocale(messages.meta.locale).toFormat(messages.time.weekStart)} — {week.plus({ days: 6 }).setLocale(messages.meta.locale).toFormat(messages.time.weekEnd)}</strong><span className="muted">{zone}</span></div>
    <section className="week-board surface">
      <div className="week-row week-head">
        <div className="week-gutter" />
        {days.map(day => { const date = day.toISODate(); const isToday = date === nowInZone.toISODate(); return <div className={`week-day-heading ${isToday ? 'today' : ''}`} key={date}><span>{day.setLocale(messages.meta.locale).toFormat('ccc')}</span><strong>{day.day}</strong></div> })}
      </div>
      {hasAllDay && <div className="week-row week-allday">
        <div className="week-gutter"><span>{t('time.allDay')}</span></div>
        {days.map(day => <div className="week-allday-cell" key={day.toISODate()}>{allDayOn(day).map(event => { const course = courses.find(c => c.id === event.courseId); return <button key={event.id} className="calendar-event allday" style={{ '--channel': course?.color || '#8a8886' } as CSSProperties} onClick={() => setSelected(event)}><strong>{event.title}</strong></button> })}</div>)}
      </div>}
      <div className="week-row week-body">
        <div className="week-gutter week-axis" style={{ height: bodyHeight }}>
          {hourMarks.slice(0, -1).map(min => <span key={min} style={{ top: ((min - open) / span) * bodyHeight }}>{String(Math.floor(min / 60)).padStart(2, '0')}:00</span>)}
        </div>
        {days.map(day => {
          const date = day.toISODate()!
          const isToday = date === nowInZone.toISODate()
          const nowMinutes = nowInZone.hour * 60 + nowInZone.minute
          return <div className={`week-lane ${isToday ? 'today' : ''}`} key={date} style={{ height: bodyHeight }}>
            {hourMarks.map(min => <i key={min} className="week-hour-line" style={{ top: ((min - open) / span) * bodyHeight }} />)}
            {hourMarks.slice(0, -1).map(min => <i key={`h${min}`} className="week-half-line" style={{ top: ((min + 30 - open) / span) * bodyHeight }} />)}
            {isToday && nowMinutes > open && nowMinutes < close && <i className="week-now-line" style={{ top: ((nowMinutes - open) / span) * bodyHeight }} />}
            {layoutDayEvents(events, day, zone, open, close).map(slot => {
              const event = slot.event
              const course = courses.find(c => c.id === event.courseId)
              const height = Math.max(18, slot.height * bodyHeight)
              // Split lanes are narrow: drop code/location lines and clamp the title to the lines that fit, never clip mid-glyph.
              const tier = height >= 58 && slot.lanes === 1 ? '' : height >= 34 ? ' compact' : ' compact tiny'
              const lines = Math.max(1, Math.floor((height - 8 - (tier.includes('tiny') ? 0 : 15)) / 16))
              return <button key={event.id} className={`calendar-event timed${tier}`} style={{ top: slot.top * bodyHeight, height, left: `calc(${(slot.lane / slot.lanes) * 100}% + 2px)`, width: `calc(${100 / slot.lanes}% - 4px)`, '--channel': course?.color || '#8a8886', '--lines': lines } as CSSProperties} onClick={() => setSelected(event)}><span>{slot.lanes > 1 ? DateTime.fromISO(event.start).setZone(zone).toFormat('HH:mm') : `${DateTime.fromISO(event.start).setZone(zone).toFormat('HH:mm')}–${DateTime.fromISO(event.end).setZone(zone).toFormat('HH:mm')}`}</span><strong>{event.title}</strong><small>{course?.code || course?.name || t('calendar.unlinked')}</small>{event.location && <small>{event.location}</small>}</button>
            })}
          </div>
        })}
      </div>
    </section>
    <section className="calendar-sources"><div className="section-header"><h3>{t('calendar.sourcesHeading')}</h3><span className="muted">{t('calendar.sourcesNote')}</span></div>{sources.length ? sources.map(s => <div className="source-row surface" key={s.id}><div><strong>{s.name}</strong><small>{s.url ? t('calendar.kindSubscription') : t('calendar.kindLocal')} · {s.lastSync ? t('calendar.lastSync', { time: DateTime.fromISO(s.lastSync).setZone(zone).setLocale(messages.meta.locale).toFormat(messages.time.syncTime) }) : t('calendar.neverSynced')}</small>{s.error && <small className="warning-text">{t.has(s.error) ? t.text(s.error) : s.error}</small>}</div><Button onClick={() => setImporting(true)}>{t('calendar.reimport')}</Button>{s.url && <Button onClick={() => void mutate(w => { w.sources.find(x => x.id === s.id)!.url = '' })}>{t('calendar.disableSubscription')}</Button>}</div>) : <p className="muted">{t('calendar.sourcesEmpty')}</p>}</section>
    {importing && semester && <IcsImport semesterId={semester.id} close={() => setImporting(false)} />}
    {manual && semester && <ManualSchedule semesterId={semester.id} close={() => setManual(false)} />}
    {selected && <Panel title={t('calendar.eventPanel')} close={() => setSelected(null)}><form onSubmit={async e => { const f = readForm(e); if (await mutate(s => { const target = s.events.find(x => x.id === selected.id); if (!target) throw new Error(t('calendar.replacedError')); target.courseId = str(f, 'course'); if (!target.sourceId) { target.title = str(f, 'title'); target.start = DateTime.fromISO(str(f, 'start'), { zone }).toISO()!; target.end = DateTime.fromISO(str(f, 'end'), { zone }).toISO()!; target.location = str(f, 'location') } })) setSelected(null) }}><Field label={t('calendar.linkedCourse')}><select name="course" defaultValue={selected.courseId}>{selected.sourceId && <option value="">{t('calendar.notLinked')}</option>}{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>{selected.sourceId ? <><h3>{selected.title}</h3><p>{selected.start} — {selected.end}</p><p>{selected.location}</p><p className="info-note">{t('calendar.importedNote')}</p></> : <><TextField label={t('calendar.fieldTitle')} name="title" value={selected.title} required /><TextField label={t('calendar.fieldStart')} name="start" type="datetime-local" value={DateTime.fromISO(selected.start).setZone(zone).toFormat("yyyy-MM-dd'T'HH:mm")} required /><TextField label={t('calendar.fieldEnd')} name="end" type="datetime-local" value={DateTime.fromISO(selected.end).setZone(zone).toFormat("yyyy-MM-dd'T'HH:mm")} required /><TextField label={t('calendar.fieldLocation')} name="location" value={selected.location} /></>}<div className="form-actions">{!selected.sourceId && <Button onClick={async () => { if (await mutate(s => { s.events = s.events.filter(x => x.id !== selected.id) })) setSelected(null) }}>{t('calendar.deleteEvent')}</Button>}<SaveButton /></div></form></Panel>}
  </>
}
export function IcsImport({ semesterId, close, draftSemester }: { semesterId: string; close(): void; draftSemester?: Semester }) {
  const { state, run, mutate, busy, t } = useModel()
  const [sourceId, setSourceId] = useState(uid()), [sourceName, setName] = useState(() => t('calendar.sourceDefault')), [url, setUrl] = useState(''), [preview, setPreview] = useState<IcsPreview | null>(null), [mapping, setMapping] = useState<Record<string, string>>({})
  const sources = state.sources.filter(s => s.semesterId === semesterId), courses = state.courses.filter(c => c.semesterId === semesterId)
  return <Panel title={t('calendar.icsTitle')} close={close} wide><Field label={t('calendar.icsSource')}><select value={sources.some(s => s.id === sourceId) ? sourceId : 'new'} onChange={e => { const source = sources.find(s => s.id === e.target.value); setSourceId(source?.id || uid()); setName(source?.name || t('calendar.sourceDefault')); setUrl(source?.url || ''); setPreview(null) }}><option value="new">{t('calendar.icsNewSource')}</option>{sources.map(s => <option key={s.id} value={s.id}>{t('calendar.icsUpdateSource', { name: s.name })}</option>)}</select></Field><Field label={t('calendar.sourceName')}><input value={sourceName} onChange={e => setName(e.target.value)} /></Field><Field label={t('calendar.urlLabel')}><input value={url} placeholder="https://…/calendar.ics" onChange={e => { setUrl(e.target.value); setPreview(null) }} /></Field><Button disabled={busy} onClick={() => void run(async () => { const result = await window.workstation.previewIcs({ url: url || undefined, semesterId, sourceId, semester: draftSemester }); if (result) { setPreview(result); const next: Record<string, string> = {}; for (const event of result.events) next[event.uid] = state.events.find(e => e.sourceId === sourceId && e.uid === event.uid)?.courseId || ''; setMapping(next) } })}>{busy ? t('calendar.parsing') : url ? t('calendar.fetchPreview') : t('calendar.pickPreview')}</Button>
    {preview && <><div className="section-header"><h3>{t('calendar.previewHeading', { count: preview.events.length })}</h3></div>{preview.warnings.map(w => <p className="info-note" key={w}>{t.has(w) ? t.text(w) : w}</p>)}<div className="import-preview">{[...new Map(preview.events.map(e => [e.uid, e])).values()].map(e => <Field key={e.uid} label={t('calendar.occurrenceLabel', { title: e.title, count: preview.events.filter(x => x.uid === e.uid).length })}><select value={mapping[e.uid] || ''} onChange={event => setMapping(m => ({ ...m, [e.uid]: event.target.value }))}><option value="">{t('calendar.linkLater')}</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>)}</div><p className="muted">{t('calendar.confirmNote')}</p></>}
    <div className="form-actions"><Button onClick={close}>{t('common.cancel')}</Button><Button appearance="primary" disabled={!preview || !sourceName.trim() || busy} onClick={async () => { if (preview && await mutate(s => { const source = { id: sourceId, name: sourceName.trim(), url: url.replace(/^webcal:/, 'https:'), semesterId, lastSync: new Date().toISOString(), error: '' }; s.sources = [...s.sources.filter(x => x.id !== sourceId), source]; s.events = [...s.events.filter(e => e.sourceId !== sourceId), ...preview.events.map(e => ({ ...e, courseId: mapping[e.uid] || '' }))] })) close() }}>{t('calendar.confirmImport')}</Button></div>
  </Panel>
}

export function ManualSchedule({ semesterId, close }: { semesterId: string; close(): void }) {
  const { state, run, mutate, messages, t } = useModel()
  const semester = state.semesters.find(s => s.id === semesterId)!
  const zone = semester.timezone
  const courses = state.courses.filter(c => c.semesterId === semesterId)
  const weekdays = Info.weekdays('long', { locale: messages.meta.locale })
  return <Panel title={t('calendar.manualTitle')} close={() => close()} wide><form onSubmit={async e => { const f = readForm(e); const result = await run(async () => expandManual({ courseId: str(f, 'course'), title: str(f, 'title'), from: str(f, 'from'), to: str(f, 'to'), weekday: Number(str(f, 'weekday')), time: str(f, 'time'), endTime: str(f, 'endTime'), weeks: str(f, 'weeks'), specific: str(f, 'specific'), exceptions: str(f, 'exceptions'), timezone: zone, weekStart: semester.weekStart || semester.start, location: str(f, 'location') })); if (result && result.length && await mutate(s => { s.events.push(...result) })) close() }}><Field label={t('calendar.fieldCourse')}><select name="course">{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field><TextField label={t('calendar.titleType')} name="title" required placeholder={t('calendar.titleTypePh')} /><div className="form-grid"><Field label={t('calendar.weekday')}><select name="weekday">{weekdays.map((d, i) => <option key={d} value={i + 1}>{d}</option>)}</select></Field><Field label={t('calendar.repeat')}><select name="weeks"><option value="every">{t('calendar.repeatEvery')}</option><option value="odd">{t('calendar.repeatOdd')}</option><option value="even">{t('calendar.repeatEven')}</option><option value="specific">{t('calendar.repeatSpecific')}</option></select></Field><TextField label={t('calendar.startTime')} name="time" type="time" value="09:00" required /><TextField label={t('calendar.endTime')} name="endTime" type="time" value="10:00" required /><TextField label={t('calendar.from')} name="from" type="date" value={semester.start} required /><TextField label={t('calendar.to')} name="to" type="date" value={semester.end} required /></div><TextField label={t('calendar.specificWeeks')} name="specific" placeholder={t('calendar.specificPh')} /><TextField label={t('calendar.exceptions')} name="exceptions" placeholder={t('calendar.exceptionsPh')} /><TextField label={t('calendar.locationLink')} name="location" /><p className="muted">{t('calendar.manualNote', { holidays: semester.holidays || t('calendar.noHolidays') })}</p><div className="form-actions"><SaveButton label={t('calendar.generate')} /></div></form></Panel>
}
