import { useEffect, useState } from 'react'
import { Button } from '@fluentui/react-components'
import { Add20Regular } from '@fluentui/react-icons'
import { DateTime } from 'luxon'
import type { Assessment, Hurdle, Task, Workspace } from '../../shared/types'
import { emptyWorkspace, validateWorkspace } from '../../shared/domain'
import { localizeError } from '../../shared/i18n'
import { Model, useModel, uid } from './model'
import { Panel, Field } from './components'
import { TaskEditor } from './TaskEditor'
import { HurdleEditor } from './StudyView'
import { IcsImport, ManualSchedule } from './CalendarView'

interface Draft { step: number; count: number; data: Workspace }
const key = 'semester-draft-v2'
export function SemesterWizard({ close, finish }: { close(): void; finish(id: string): void }) {
  const parent = useModel()
  const { t } = parent
  const [draft, setDraft] = useState<Draft>(() => {
    try { const saved = JSON.parse(localStorage.getItem(key) || 'null'); if (saved?.data?.version === 1 && saved.data.semesters?.length === 1 && saved.step >= 0 && saved.step <= 4) return saved } catch {}
    const data = emptyWorkspace(); data.settings = { ...parent.state.settings, digestEnabled: false }
    data.semesters.push({ id: uid(), name: '', start: '', end: '', timezone: parent.state.settings.timezone, archived: false, weekStart: '', holidays: '' })
    return { step: 0, count: 4, data }
  })
  const [error, setError] = useState(''), [editor, setEditor] = useState<{ item?: Task | Assessment; courseId?: string } | null>(null), [hurdle, setHurdle] = useState<{ courseId: string; item?: Hurdle } | null>(null), [importing, setImporting] = useState(false), [manual, setManual] = useState(false)
  useEffect(() => { localStorage.setItem(key, JSON.stringify(draft)) }, [draft])
  const semester = draft.data.semesters[0]
  const update = (fn: (data: Workspace) => void) => setDraft(previous => { const data = structuredClone(previous.data); fn(data); return { ...previous, data } })
  const editSemester = (field: string, value: string) => update(data => { Object.assign(data.semesters[0], { [field]: value }) })
  const next = () => {
    setError('')
    if (draft.step === 0) {
      if (!semester.name.trim() || !semester.start || !semester.end || semester.end < semester.start || !DateTime.now().setZone(semester.timezone).isValid || !Number.isInteger(draft.count) || draft.count < 1 || draft.count > 100) { setError(t('wizard.step0Error')); return }
      const colors = ['#0078d4', '#0f7b6c', '#8764b8', '#ca5010', '#c239b3']
      update(data => {
        while (data.courses.length < draft.count) data.courses.push({ id: uid(), semesterId: semester.id, name: '', code: '', color: colors[data.courses.length % colors.length], url: '', notes: '', archived: false })
        // Course removal is explicit on the next step, so going back cannot delete entered assessments.
      })
    }
    if (draft.step > 0) { try { validateWorkspace(draft.data) } catch (e) { setError(localizeError(e, t) || t('wizard.checkInput')); return } }
    setDraft(d => ({ ...d, step: d.step + 1 }))
  }
  const localModel = {
    ...parent, state: draft.data, feedback: error || parent.feedback,
    mutate: async (fn: (data: Workspace) => void) => { try { const data = structuredClone(draft.data); fn(data); validateWorkspace(data); setDraft(d => ({ ...d, data })); return true } catch (e) { setError(localizeError(e, t) || t('wizard.checkInput')); return false } },
    editTask: (item?: Task | Assessment, courseId?: string) => setEditor({ item, courseId })
  }
  return <Model.Provider value={localModel}><Panel title={t('wizard.title')} close={close} wide>
    <div className="wizard-steps">{parent.messages.wizard.steps.map((title, i) => <span key={title} className={draft.step === i ? 'active' : ''}>{i + 1} {title}</span>)}</div>
    <p className="muted">{t('wizard.draftNote')}</p>
    {error && <p className="error-note" role="alert">{error}</p>}
    {draft.step === 0 && <><Field label={t('wizard.semesterName')}><input value={semester.name} onChange={e => editSemester('name', e.target.value)} placeholder={t('wizard.semesterNamePh')} /></Field><div className="form-grid"><Field label={t('wizard.startDate')}><input type="date" value={semester.start} onChange={e => editSemester('start', e.target.value)} /></Field><Field label={t('wizard.endDate')}><input type="date" value={semester.end} onChange={e => editSemester('end', e.target.value)} /></Field><Field label={t('wizard.timezone')}><input value={semester.timezone} onChange={e => editSemester('timezone', e.target.value)} /></Field><Field label={t('wizard.courseCount')}><input type="number" min="1" max="100" value={draft.count} onChange={e => setDraft(d => ({ ...d, count: Number(e.target.value) }))} /></Field><Field label={t('wizard.weekStartOpt')}><input type="date" value={semester.weekStart} onChange={e => editSemester('weekStart', e.target.value)} /></Field><Field label={t('wizard.holidaysOpt')}><input value={semester.holidays} onChange={e => editSemester('holidays', e.target.value)} /></Field></div></>}
    {draft.step === 1 && <div className="wizard-courses">{draft.data.courses.map((course, index) => <fieldset key={course.id}><legend>{t('wizard.courseLegend', { n: index + 1 })}</legend><div className="form-grid">{([['name', t('wizard.courseNameLabel', { n: index + 1 })], ['code', t('wizard.courseCodeOpt')], ['url', t('wizard.courseUrlOpt')], ['color', t('wizard.courseColor')]] as [string, string][]).map(([field, label]) => <Field key={field} label={label}><input type={field === 'color' ? 'color' : field === 'url' ? 'url' : 'text'} value={course[field as 'name' | 'code' | 'url' | 'color']} onChange={e => update(data => { Object.assign(data.courses[index], { [field]: e.target.value }) })} /></Field>)}</div><Field label={t('wizard.notes')}><textarea value={course.notes} onChange={e => update(data => { data.courses[index].notes = e.target.value })} /></Field>{!draft.data.assessments.some(a => a.courseId === course.id) && !draft.data.hurdles.some(h => h.courseId === course.id) && !draft.data.events.some(x => x.courseId === course.id) && <Button size="small" appearance="subtle" onClick={() => update(data => { data.courses = data.courses.filter(c => c.id !== course.id) })}>{t('wizard.removeCourse')}</Button>}</fieldset>)}<Button icon={<Add20Regular />} onClick={() => update(data => { data.courses.push({ id: uid(), semesterId: semester.id, name: '', code: '', color: '#0078d4', url: '', notes: '', archived: false }) })}>{t('wizard.addAnotherCourse')}</Button></div>}
    {draft.step === 2 && draft.data.courses.map(course => <fieldset key={course.id}><legend>{course.code} {course.name}</legend><div className="actions"><Button icon={<Add20Regular />} onClick={() => setEditor({ courseId: course.id })}>{t('wizard.addAssessment')}</Button><Button onClick={() => setHurdle({ courseId: course.id })}>{t('wizard.addHurdle')}</Button></div><ul className="preview-list">{draft.data.assessments.filter(a => a.courseId === course.id && !a.archived).map(a => <li key={a.id}><Button appearance="subtle" onClick={() => setEditor({ item: a })}>{a.title} · {a.category} · {a.due || a.starts || t('time.dateTbd')}</Button></li>)}{draft.data.hurdles.filter(h => h.courseId === course.id).map(h => <li key={h.id}><Button appearance="subtle" onClick={() => setHurdle({ courseId: course.id, item: h })}>{t('wizard.hurdlePrefix', { text: h.text })}</Button></li>)}</ul></fieldset>)}
    {draft.step === 3 && <><div className="actions wizard-schedule-actions"><Button onClick={() => setImporting(true)}>{t('wizard.importIcs')}</Button><Button disabled={!draft.data.courses.length} onClick={() => setManual(true)}>{t('wizard.manualSchedule')}</Button></div><p>{t('wizard.scheduleStats', { events: draft.data.events.length, sources: draft.data.sources.length })}</p>{draft.data.sources.map(source => <p className="info-note" key={source.id}>{source.name} · {source.url ? t('wizard.sourceKindSub') : t('wizard.sourceKindFile')}</p>)}</>}
    {draft.step === 4 && <><h3>{semester.name}</h3><p>{semester.start} — {semester.end} · {semester.timezone}</p><ul className="preview-list">{draft.data.courses.map(c => <li key={c.id}>{c.code} {c.name} · {t('wizard.courseAssessments', { count: draft.data.assessments.filter(a => a.courseId === c.id && !a.archived).length })}</li>)}</ul><div className="info-note">{t('wizard.reviewSummary', { courses: draft.data.courses.length, assessments: draft.data.assessments.filter(a => !a.archived).length, hurdles: draft.data.hurdles.length, events: draft.data.events.length })}</div></>}
    <div className="form-actions"><Button onClick={() => { localStorage.removeItem(key); close() }}>{t('wizard.discard')}</Button>{draft.step > 0 && <Button onClick={() => setDraft(d => ({ ...d, step: d.step - 1 }))}>{t('wizard.back')}</Button>}{draft.step < 4 ? <Button appearance="primary" onClick={next}>{t('wizard.next')}</Button> : <Button appearance="primary" disabled={parent.busy} onClick={async () => { if (await parent.mutate(data => { const checked = validateWorkspace(draft.data); data.semesters.push(...checked.semesters); data.courses.push(...checked.courses); data.assessments.push(...checked.assessments); data.hurdles.push(...checked.hurdles); data.sources.push(...checked.sources); data.events.push(...checked.events) })) { localStorage.removeItem(key); finish(semester.id); close() } }}>{t('wizard.confirm')}</Button>}</div>
  </Panel>{editor && <TaskEditor {...editor} close={() => setEditor(null)} />}{hurdle && <HurdleEditor {...hurdle} close={() => setHurdle(null)} />}{importing && <IcsImport semesterId={semester.id} draftSemester={semester} close={() => setImporting(false)} />}{manual && <ManualSchedule semesterId={semester.id} close={() => setManual(false)} />}</Model.Provider>
}
