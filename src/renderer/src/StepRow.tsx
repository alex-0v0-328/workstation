import type { ReactNode } from 'react'
import { Tooltip } from '@fluentui/react-components'
import { DateTime } from 'luxon'
import { semesterWeeks, type SemesterWeek } from '../../shared/calendar'
import { useModel } from './model'

const keyClass = (w: SemesterWeek, current?: SemesterWeek) => `step-key level-${w.level} bank-${w.bank}${w.now ? ' now' : ''}${w.items.length && !w.open ? ' cleared' : ''}${current && w.index < current.index ? ' past' : ''}`

// The semester's weeks as a step row: armed by assessments, brighter with weight, the current week chased.
// With onPick the keys are interactive and grouped into four banks (semester quarters) under bracket labels.
export function StepKeys({ weeks, onPick }: { weeks: SemesterWeek[]; onPick?(week: SemesterWeek): void }) {
  const { messages, t } = useModel()
  const current = weeks.find(w => w.now)
  if (!onPick) return <div className="step-row" aria-hidden="true">{weeks.map(w => <span key={w.index} className={keyClass(w, current)}><i className="step-face" /></span>)}</div>
  const key = (w: SemesterWeek): ReactNode => {
    const date = DateTime.fromISO(w.start).setLocale(messages.meta.locale).toFormat(messages.time.dateShort)
    const tip = <div style={{ display: 'grid', gap: 4, minWidth: 180, maxWidth: 280 }}><strong style={{ fontSize: 12 }}>{t('steps.weekTitle', { n: w.index, date })}</strong>{w.items.length ? w.items.map(i => <span key={i.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 12, textDecoration: i.status === 'done' ? 'line-through' : undefined }}>{i.title}<b style={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{i.weight === null ? t('study.weightTbd') : `${i.weight}%`}</b></span>) : <span style={{ fontSize: 12 }}>{t('steps.weekEmpty')}</span>}</div>
    return <Tooltip key={w.index} content={tip} relationship="description" positioning="below" withArrow><button className={keyClass(w, current)} aria-current={w.now ? 'date' : undefined} aria-label={t('steps.keyAria', { n: w.index, count: w.items.length, open: w.open })} onClick={() => onPick(w)}><span className="step-num">{w.index}</span><i className="step-face"><i className="led" /></i></button></Tooltip>
  }
  const banks = [0, 1, 2, 3].map(b => weeks.filter(w => w.bank === b)).filter(group => group.length)
  return <div className="step-row banked" role="group" aria-label={t('steps.rowAria')}>{banks.map(group => <div className="step-bank" key={group[0].index} style={{ flexGrow: group.length }}><div className="step-bank-keys">{group.map(key)}</div><span className="step-bracket"><span>{t('steps.bank', { from: group[0].index, to: group.at(-1)!.index, open: group.reduce((n, w) => n + w.open, 0) })}</span></span></div>)}</div>
}

// The active semester's weeks and today's position, shared by the transport strip and the classic status bar.
export function useSemesterNow() {
  const { state, messages } = useModel()
  const semester = state.semesters.filter(s => !s.archived).at(-1)
  const now = DateTime.now()
  const today = now.setZone(state.settings.timezone).setLocale(messages.meta.locale)
  const courseIds = new Set(state.courses.filter(c => c.semesterId === semester?.id && !c.archived).map(c => c.id))
  const weeks = semester ? semesterWeeks(semester, state.assessments.filter(a => courseIds.has(a.courseId)), now) : []
  return { semester, weeks, current: weeks.find(w => w.now), today }
}

export function Transport() {
  const { messages, t, setPage, setFocusWeek } = useModel()
  const { semester, weeks, current, today } = useSemesterNow()
  return <header className="transport">
    {semester && weeks.length ? <div className="transport-semester"><div className="transport-title"><span className="label">{t('steps.semester')}</span><strong>{semester.name}</strong></div><StepKeys weeks={weeks} onPick={w => { setFocusWeek(w.start); setPage('calendar') }} /></div> : <div className="transport-semester transport-empty"><span className="led" />{t('steps.noSemester')}</div>}
    <div className="transport-now"><div className="readout"><span className="label">{t('steps.weekLabel')}</span><strong className="readout-value">{current ? String(current.index).padStart(2, '0') : '--'}</strong></div><div className="readout"><span className="label">{today.toFormat(messages.time.weekday)}</span><strong className="readout-value">{today.toFormat(messages.time.readoutDate)}</strong></div></div>
  </header>
}
