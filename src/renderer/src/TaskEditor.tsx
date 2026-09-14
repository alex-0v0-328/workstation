import type { Task, Assessment } from '../../shared/types'
import { Button } from '@fluentui/react-components'
import { Panel, Field, TextField, DateField, SaveButton, readForm, str, num } from './components'
import { useModel, taskDefaults, assessmentDefaults } from './model'
import { useState } from 'react'
export function TaskEditor({ item, courseId, close }: { item?: Task | Assessment; courseId?: string; close(): void }) {
  const { state, mutate } = useModel()
  const [draft] = useState(() => item || (courseId ? assessmentDefaults(courseId) : taskDefaults()))
  const assessment = 'courseId' in draft ? draft as Assessment : null
  const [gradeType, setGradeType] = useState(assessment?.result ? 'result' : 'numeric')
  const course = assessment && state.courses.find(c => c.id === assessment.courseId)
  const timezone = course ? state.semesters.find(s => s.id === course.semesterId)!.timezone : state.settings.timezone
  return <Panel title={item ? '编辑事项' : assessment ? '添加考核' : '添加事项'} close={close} wide>
    <form onSubmit={async e => {
      const data = readForm(e)
      const next: Task = { ...draft, title: str(data, 'title'), due: str(data, 'due'), status: str(data, 'status') as Task['status'], priority: str(data, 'priority') as Task['priority'], notes: str(data, 'notes'), reminders: data.has('reminders'), reminderOffsets: str(data, 'offsets') ? str(data, 'offsets').split(/[,，]/).map(Number) : undefined }
      const a: Assessment | null = assessment ? { ...assessment, ...next, category: str(data, 'category'), opens: str(data, 'opens'), starts: str(data, 'starts'), ends: str(data, 'ends'), weight: num(data, 'weight'), score: gradeType === 'numeric' ? num(data, 'score') : null, maxScore: gradeType === 'numeric' ? num(data, 'maxScore') : null, result: gradeType === 'result' ? str(data, 'result') as Assessment['result'] : '', location: str(data, 'location'), url: str(data, 'url') } : null
      const ok = await mutate(s => { if (a) { const index = s.assessments.findIndex(x => x.id === a.id); if (index < 0) s.assessments.push(a); else s.assessments[index] = a } else { const index = s.tasks.findIndex(x => x.id === next.id); if (index < 0) s.tasks.push(next); else s.tasks[index] = next } })
      if (ok) close()
    }}>
      {course && <div className="info-note">{course.code} {course.name} · 与学习板块共享同一条考核记录</div>}
      <TextField label="名称" name="title" value={draft.title} required placeholder={assessment ? '例如：Assignment 1 / MST / Final Exam' : '想完成什么？'} />
      <div className="form-grid">
        {assessment && <Field label="考核类别"><input name="category" defaultValue={assessment.category} list="categories" required /><datalist id="categories">{['Assignment', 'Exam', 'Quiz', 'Project', 'Presentation'].map(x => <option key={x}>{x}</option>)}</datalist><small>可直接输入自定义类别。</small></Field>}
        <Field label="进度"><select name="status" defaultValue={draft.status}><option value="todo">未开始</option><option value="doing">进行中</option><option value="done">已完成</option></select></Field>
        <Field label="优先级"><select name="priority" defaultValue={draft.priority}><option value="normal">普通</option><option value="high">高</option><option value="low">低</option></select></Field>
        <DateField timezone={timezone} label="截止日期" name="due" value={draft.due} />
        {assessment && <><DateField timezone={timezone} label="开放日期" name="opens" value={assessment.opens} /><DateField timezone={timezone} label="考试开始" name="starts" value={assessment.starts} /><DateField timezone={timezone} label="考试结束" name="ends" value={assessment.ends} /><TextField label="占总评权重 %" name="weight" value={assessment.weight} type="number" min={0} max={100} /><TextField label="地点" name="location" value={assessment.location} /><TextField label="提交 / 参考链接" name="url" value={assessment.url} type="url" /></>}
      </div>
      {assessment && <fieldset><legend>成绩记录 · 可稍后填写</legend><div className="form-grid"><Field label="成绩类型"><select value={gradeType} onChange={e => setGradeType(e.target.value)}><option value="numeric">数值成绩 / 未出分</option><option value="result">Pass / Fail</option></select></Field>{gradeType === 'numeric' ? <><TextField label="得分" name="score" value={assessment.score} type="number" min={0} /><TextField label="满分" name="maxScore" value={assessment.maxScore} type="number" min={0.01} /></> : <Field label="结果"><select name="result" defaultValue={assessment.result || 'pass'}><option value="pass">Pass</option><option value="fail">Fail</option></select></Field>}</div><small>完成进度、成绩和 hurdle 状态分别管理。</small></fieldset>}
      <Field label="备注"><textarea name="notes" defaultValue={draft.notes} rows={3} /></Field>
      <label className="check-label"><input type="checkbox" name="reminders" defaultChecked={draft.reminders} />启用事项提醒</label>
      <TextField label="提前提醒（分钟，可选）" name="offsets" value={draft.reminderOffsets?.join(',')} placeholder="留空使用默认值，例如 1440,60" hint="仅日期默认提前一天及当天 09:00；精确时间默认提前一天及一小时。" />
      <div className="form-actions">{item && <Button appearance="subtle" onClick={async () => { if (await mutate(s => { const rows = assessment ? s.assessments : s.tasks; const target = rows.find(x => x.id === draft.id); if (target) target.archived = !target.archived })) close() }}>{draft.archived ? '取消归档' : '归档事项'}</Button>}<Button onClick={close}>取消</Button><SaveButton /></div>
    </form>
  </Panel>
}
