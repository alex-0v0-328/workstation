import { useEffect, useState } from 'react'
import { Button } from '@fluentui/react-components'
import { Add20Regular } from '@fluentui/react-icons'
import { DateTime } from 'luxon'
import type { Assessment, Hurdle, Task, Workspace } from '../../shared/types'
import { emptyWorkspace, validateWorkspace } from '../../shared/domain'
import { Model, useModel, uid } from './model'
import { Panel, Field } from './components'
import { TaskEditor } from './TaskEditor'
import { HurdleEditor } from './StudyView'
import { IcsImport, ManualSchedule } from './CalendarView'

interface Draft { step: number; count: number; data: Workspace }
const key = 'semester-draft-v2'
export function SemesterWizard({ close, finish }: { close(): void; finish(id: string): void }) {
  const parent = useModel()
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
      if (!semester.name.trim() || !semester.start || !semester.end || semester.end < semester.start || !DateTime.now().setZone(semester.timezone).isValid || !Number.isInteger(draft.count) || draft.count < 1 || draft.count > 100) { setError('请填写学期名称、有效日期和时区，课程数量为 1–100。之后仍可继续添加课程。'); return }
      const colors = ['#0078d4', '#0f7b6c', '#8764b8', '#ca5010', '#c239b3']
      update(data => {
        while (data.courses.length < draft.count) data.courses.push({ id: uid(), semesterId: semester.id, name: '', code: '', color: colors[data.courses.length % colors.length], url: '', notes: '', archived: false })
        // Course removal is explicit on the next step, so going back cannot delete entered assessments.
      })
    }
    if (draft.step > 0) { try { validateWorkspace(draft.data) } catch (e) { setError(e instanceof Error ? e.message : '请检查输入'); return } }
    setDraft(d => ({ ...d, step: d.step + 1 }))
  }
  const localModel = {
    ...parent, state: draft.data, feedback: error || parent.feedback,
    mutate: async (fn: (data: Workspace) => void) => { try { const data = structuredClone(draft.data); fn(data); validateWorkspace(data); setDraft(d => ({ ...d, data })); return true } catch (e) { setError(e instanceof Error ? e.message : '请检查输入'); return false } },
    editTask: (item?: Task | Assessment, courseId?: string) => setEditor({ item, courseId })
  }
  return <Model.Provider value={localModel}><Panel title="建立新学期" close={close} wide>
    <div className="wizard-steps">{['学期信息', '课程详情', '考核与要求', '课表安排', '预览确认'].map((title, i) => <span key={title} className={draft.step === i ? 'active' : ''}>{i + 1} {title}</span>)}</div>
    <p className="muted">草稿自动保存在本机，关闭后可继续。未知考核和课表可以稍后补充。</p>
    {error && <p className="error-note" role="alert">{error}</p>}
    {draft.step === 0 && <><Field label="学期名称"><input value={semester.name} onChange={e => editSemester('name', e.target.value)} placeholder="例如 2026 Semester 2" /></Field><div className="form-grid"><Field label="开始日期"><input type="date" value={semester.start} onChange={e => editSemester('start', e.target.value)} /></Field><Field label="结束日期"><input type="date" value={semester.end} onChange={e => editSemester('end', e.target.value)} /></Field><Field label="时区"><input value={semester.timezone} onChange={e => editSemester('timezone', e.target.value)} /></Field><Field label="本学期课程数量"><input type="number" min="1" max="100" value={draft.count} onChange={e => setDraft(d => ({ ...d, count: Number(e.target.value) }))} /></Field><Field label="教学第一周起点（可选）"><input type="date" value={semester.weekStart} onChange={e => editSemester('weekStart', e.target.value)} /></Field><Field label="假期 / 停课说明（可选）"><input value={semester.holidays} onChange={e => editSemester('holidays', e.target.value)} /></Field></div></>}
    {draft.step === 1 && <div className="wizard-courses">{draft.data.courses.map((course, index) => <fieldset key={course.id}><legend>课程 {index + 1}</legend><div className="form-grid">{[['name', `课程 ${index + 1} 名称`], ['code', '课程代码（可选）'], ['url', '课程主页 / LMS 链接（可选）'], ['color', '显示颜色']].map(([field, label]) => <Field key={field} label={label}><input type={field === 'color' ? 'color' : field === 'url' ? 'url' : 'text'} value={course[field as 'name' | 'code' | 'url' | 'color']} onChange={e => update(data => { Object.assign(data.courses[index], { [field]: e.target.value }) })} /></Field>)}</div><Field label="备注"><textarea value={course.notes} onChange={e => update(data => { data.courses[index].notes = e.target.value })} /></Field>{!draft.data.assessments.some(a => a.courseId === course.id) && !draft.data.hurdles.some(h => h.courseId === course.id) && !draft.data.events.some(x => x.courseId === course.id) && <Button size="small" appearance="subtle" onClick={() => update(data => { data.courses = data.courses.filter(c => c.id !== course.id) })}>移除此课程</Button>}</fieldset>)}<Button icon={<Add20Regular />} onClick={() => update(data => { data.courses.push({ id: uid(), semesterId: semester.id, name: '', code: '', color: '#0078d4', url: '', notes: '', archived: false }) })}>再添加一门课程</Button></div>}
    {draft.step === 2 && draft.data.courses.map(course => <fieldset key={course.id}><legend>{course.code} {course.name}</legend><div className="actions"><Button icon={<Add20Regular />} onClick={() => setEditor({ courseId: course.id })}>添加考核</Button><Button onClick={() => setHurdle({ courseId: course.id })}>添加 hurdle</Button></div><ul className="preview-list">{draft.data.assessments.filter(a => a.courseId === course.id && !a.archived).map(a => <li key={a.id}><Button appearance="subtle" onClick={() => setEditor({ item: a })}>{a.title} · {a.category} · {a.due || a.starts || '日期待定'}</Button></li>)}{draft.data.hurdles.filter(h => h.courseId === course.id).map(h => <li key={h.id}><Button appearance="subtle" onClick={() => setHurdle({ courseId: course.id, item: h })}>Hurdle：{h.text}</Button></li>)}</ul><small className="muted">类别与次数不限。没有 hurdle 则无需添加。</small></fieldset>)}
    {draft.step === 3 && <><div className="actions" style={{ margin: '20px 0' }}><Button onClick={() => setImporting(true)}>导入 ICS / 日历订阅</Button><Button disabled={!draft.data.courses.length} onClick={() => setManual(true)}>手动安排课表</Button></div><p>{draft.data.events.length} 个安排 · {draft.data.sources.length} 个来源</p>{draft.data.sources.map(source => <p className="info-note" key={source.id}>{source.name} · {source.url ? '订阅' : '文件'}</p>)}<p className="muted">普通学校网页入口填在课程主页。导入预览中可关联课程，手动安排支持指定周次和停课日期。</p></>}
    {draft.step === 4 && <><h3>{semester.name}</h3><p>{semester.start} — {semester.end} · {semester.timezone}</p><ul className="preview-list">{draft.data.courses.map(c => <li key={c.id}>{c.code} {c.name} · {draft.data.assessments.filter(a => a.courseId === c.id && !a.archived).length} 个考核</li>)}</ul><div className="info-note">将保存 {draft.data.courses.length} 门课程、{draft.data.assessments.filter(a => !a.archived).length} 个考核、{draft.data.hurdles.length} 个 hurdle 和 {draft.data.events.length} 个课表安排。考核会自动显示在 TODO；未确定日期的项目进入“未安排”。</div></>}
    <div className="form-actions"><Button onClick={() => { localStorage.removeItem(key); close() }}>丢弃草稿</Button>{draft.step > 0 && <Button onClick={() => setDraft(d => ({ ...d, step: d.step - 1 }))}>上一步</Button>}{draft.step < 4 ? <Button appearance="primary" onClick={next}>下一步</Button> : <Button appearance="primary" disabled={parent.busy} onClick={async () => { if (await parent.mutate(data => { const checked = validateWorkspace(draft.data); data.semesters.push(...checked.semesters); data.courses.push(...checked.courses); data.assessments.push(...checked.assessments); data.hurdles.push(...checked.hurdles); data.sources.push(...checked.sources); data.events.push(...checked.events) })) { localStorage.removeItem(key); finish(semester.id); close() } }}>确认创建学期</Button>}</div>
  </Panel>{editor && <TaskEditor {...editor} close={() => setEditor(null)} />}{hurdle && <HurdleEditor {...hurdle} close={() => setHurdle(null)} />}{importing && <IcsImport semesterId={semester.id} draftSemester={semester} close={() => setImporting(false)} />}{manual && <ManualSchedule semesterId={semester.id} close={() => setManual(false)} />}</Model.Provider>
}
