import type { Task, Assessment } from '../../shared/types'
import { Button } from '@fluentui/react-components'
import { Panel, Field, TextField, DateField, SaveButton, readForm, str, num } from './components'
import { useModel, taskDefaults, assessmentDefaults } from './model'
import { useState } from 'react'
export function TaskEditor({ item, courseId, close }: { item?: Task | Assessment; courseId?: string; close(): void }) {
  const { state, mutate, messages, t } = useModel()
  const [draft] = useState(() => item || (courseId ? assessmentDefaults(courseId) : taskDefaults()))
  const assessment = 'courseId' in draft ? draft as Assessment : null
  const [gradeType, setGradeType] = useState(assessment?.result ? 'result' : 'numeric')
  const course = assessment && state.courses.find(c => c.id === assessment.courseId)
  const timezone = course ? state.semesters.find(s => s.id === course.semesterId)!.timezone : state.settings.timezone
  return <Panel title={item ? t('editor.editTask') : assessment ? t('editor.addAssessment') : t('editor.addTask')} close={close} wide>
    <form onSubmit={async e => {
      const data = readForm(e)
      const next: Task = { ...draft, title: str(data, 'title'), due: str(data, 'due'), status: str(data, 'status') as Task['status'], priority: str(data, 'priority') as Task['priority'], notes: str(data, 'notes'), reminders: data.has('reminders'), reminderOffsets: str(data, 'offsets') ? str(data, 'offsets').split(/[,，]/).map(Number) : undefined }
      const a: Assessment | null = assessment ? { ...assessment, ...next, category: str(data, 'category'), opens: str(data, 'opens'), starts: str(data, 'starts'), ends: str(data, 'ends'), weight: num(data, 'weight'), score: gradeType === 'numeric' ? num(data, 'score') : null, maxScore: gradeType === 'numeric' ? num(data, 'maxScore') : null, result: gradeType === 'result' ? str(data, 'result') as Assessment['result'] : '', location: str(data, 'location'), url: str(data, 'url') } : null
      const ok = await mutate(s => { if (a) { const index = s.assessments.findIndex(x => x.id === a.id); if (index < 0) s.assessments.push(a); else s.assessments[index] = a } else { const index = s.tasks.findIndex(x => x.id === next.id); if (index < 0) s.tasks.push(next); else s.tasks[index] = next } })
      if (ok) close()
    }}>
      {course && <div className="info-note">{t('editor.sharedNote', { code: course.code, name: course.name })}</div>}
      <TextField label={t('editor.fieldName')} name="title" value={draft.title} required placeholder={assessment ? t('editor.namePhAssessment') : t('editor.namePhTask')} />
      <div className="form-grid">
        {assessment && <Field label={t('editor.category')}><input name="category" defaultValue={assessment.category} list="categories" required /><datalist id="categories">{['Assignment', 'Exam', 'Quiz', 'Project', 'Presentation'].map(x => <option key={x}>{x}</option>)}</datalist></Field>}
        <Field label={t('editor.statusField')}><select name="status" defaultValue={draft.status}>{Object.entries(messages.status).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></Field>
        <Field label={t('editor.priorityField')}><select name="priority" defaultValue={draft.priority}><option value="normal">{messages.priority.normal}</option><option value="high">{messages.priority.high}</option><option value="low">{messages.priority.low}</option></select></Field>
        <DateField timezone={timezone} label={t('editor.due')} name="due" value={draft.due} />
        {assessment && <><DateField timezone={timezone} label={t('editor.opens')} name="opens" value={assessment.opens} /><DateField timezone={timezone} label={t('editor.starts')} name="starts" value={assessment.starts} /><DateField timezone={timezone} label={t('editor.ends')} name="ends" value={assessment.ends} /><TextField label={t('editor.weight')} name="weight" value={assessment.weight} type="number" min={0} max={100} /><TextField label={t('editor.location')} name="location" value={assessment.location} /><TextField label={t('editor.url')} name="url" value={assessment.url} type="url" /></>}
      </div>
      {assessment && <fieldset><legend>{t('editor.gradeFieldset')}</legend><div className="form-grid"><Field label={t('editor.gradeType')}><select value={gradeType} onChange={e => setGradeType(e.target.value)}><option value="numeric">{t('editor.gradeNumeric')}</option><option value="result">{t('editor.gradePassFail')}</option></select></Field>{gradeType === 'numeric' ? <><TextField label={t('editor.score')} name="score" value={assessment.score} type="number" min={0} /><TextField label={t('editor.maxScore')} name="maxScore" value={assessment.maxScore} type="number" min={0.01} /></> : <Field label={t('editor.result')}><select name="result" defaultValue={assessment.result || 'pass'}><option value="pass">Pass</option><option value="fail">Fail</option></select></Field>}</div></fieldset>}
      <Field label={t('editor.notes')}><textarea name="notes" defaultValue={draft.notes} rows={3} /></Field>
      <label className="check-label"><input type="checkbox" name="reminders" defaultChecked={draft.reminders} />{t('editor.reminders')}</label>
      <TextField label={t('editor.offsets')} name="offsets" value={draft.reminderOffsets?.join(',')} placeholder={t('editor.offsetsPh')} />
      <div className="form-actions">{item && <Button appearance="subtle" onClick={async () => { if (await mutate(s => { const rows = assessment ? s.assessments : s.tasks; const target = rows.find(x => x.id === draft.id); if (target) target.archived = !target.archived })) close() }}>{draft.archived ? t('common.unarchive') : t('editor.archiveTask')}</Button>}<Button onClick={close}>{t('common.cancel')}</Button><SaveButton /></div>
    </form>
  </Panel>
}
