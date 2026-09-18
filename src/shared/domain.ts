import { z } from 'zod'
import { DateTime } from 'luxon'
import type { Workspace, TodoItem, Semester, Course, CalendarEvent, CalendarSource } from './types'

const text = z.string().max(100000)
const id = z.string().min(1).max(200)
const name = z.string().trim().min(1, '请填写名称').max(500)
const date = z.string().refine(v => v === '' || (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})?)?$/.test(v) && DateTime.fromISO(v).isValid), '日期无效')
const day = date.refine(v => v.length === 10, '请填写日期')
const zone = z.string().refine(v => DateTime.now().setZone(v).isValid, '时区无效')
const url = text.refine(v => !v || /^https?:\/\//i.test(v), '链接必须以 https:// 或 http:// 开头')
const task = z.object({ id, title: name, status: z.enum(['todo', 'doing', 'done']), priority: z.enum(['normal', 'high', 'low']), due: date, notes: text, reminders: z.boolean(), archived: z.boolean().optional(), reminderOffsets: z.array(z.number().int().min(0).max(525600)).max(10).optional() })
export const workspaceSchema = z.object({
  version: z.literal(1), revision: z.number().int().nonnegative(),
  semesters: z.array(z.object({ id, name, start: day, end: day, timezone: zone, archived: z.boolean(), weekStart: date.optional(), holidays: text.optional() })).max(100),
  courses: z.array(z.object({ id, semesterId: id, name, code: text, color: z.string().regex(/^#[0-9a-f]{6}$/i), url, notes: text, archived: z.boolean() })).max(5000),
  assessments: z.array(task.extend({ courseId: id, category: name, opens: date, starts: date, ends: date, weight: z.number().min(0).max(100).nullable(), score: z.number().nonnegative().nullable(), maxScore: z.number().positive().nullable(), result: z.enum(['', 'pass', 'fail']), location: text, url })).max(50000),
  tasks: z.array(task).max(50000),
  hurdles: z.array(z.object({ id, courseId: id, text: name, scope: z.enum(['course', 'assessment', 'group']), assessmentIds: z.array(id), status: z.enum(['pending', 'met', 'unmet']) })).max(10000),
  events: z.array(z.object({ id, sourceId: text, uid: id, courseId: text, title: name, start: date.refine(Boolean), end: date.refine(Boolean), allDay: z.boolean(), location: text })).max(50000),
  sources: z.array(z.object({ id, name, url, semesterId: id, lastSync: date, error: text })).max(100),
  settings: z.object({ theme: z.literal('windows'), appearance: z.enum(['system', 'light', 'dark']), timezone: zone, startAtLogin: z.boolean(), notifications: z.boolean(), digestEnabled: z.boolean(), digestTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), digestSince: date, model: z.string().regex(/^[a-zA-Z0-9._-]{1,100}$/) })
})

export function emptyWorkspace(): Workspace {
  return { version: 1, revision: 0, semesters: [], courses: [], assessments: [], tasks: [], hurdles: [], events: [], sources: [], settings: { theme: 'windows', appearance: 'system', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, startAtLogin: false, notifications: true, digestEnabled: false, digestTime: '20:00', digestSince: '', model: 'deepseek-chat' } }
}

export function validateWorkspace(input: unknown): Workspace {
  const s = workspaceSchema.parse(input)
  for (const rows of [s.semesters, s.courses, s.assessments, s.tasks, s.hurdles, s.events, s.sources]) {
    if (new Set(rows.map(r => r.id)).size !== rows.length) throw new Error('存在重复 ID')
  }
  for (const sem of s.semesters) if (sem.end < sem.start) throw new Error(`学期 ${sem.name} 的结束日期早于开始日期`)
  for (const c of s.courses) if (!s.semesters.some(x => x.id === c.semesterId)) throw new Error(`课程 ${c.name} 缺少有效学期`)
  for (const a of s.assessments) {
    const c = s.courses.find(x => x.id === a.courseId)
    if (!c) throw new Error(`考核 ${a.title} 缺少有效课程`)
    const tz = s.semesters.find(x => x.id === c.semesterId)!.timezone
    if (a.opens && a.due && toDate(a.opens, tz) > toDate(a.due, tz, true)) throw new Error(`${a.title} 的开放时间晚于截止时间`)
    if (a.starts && a.ends && toDate(a.starts, tz) > toDate(a.ends, tz, true)) throw new Error(`${a.title} 的考试结束时间早于开始时间`)
    if (a.score !== null && a.maxScore === null) throw new Error(`${a.title} 有得分时需要填写满分`)
    if (a.score !== null && a.maxScore !== null && a.score > a.maxScore) throw new Error(`${a.title} 的得分高于满分`)
    if (a.result && a.score !== null) throw new Error(`${a.title} 请在数值成绩和 Pass/Fail 中选择一种`)
  }
  for (const h of s.hurdles) {
    if (!s.courses.some(c => c.id === h.courseId) || h.assessmentIds.some(i => !s.assessments.some(a => a.id === i && a.courseId === h.courseId))) throw new Error('Hurdle 关联的课程或考核无效')
    if (h.scope === 'assessment' && h.assessmentIds.length !== 1) throw new Error('单项 hurdle 需要关联一个考核')
    if (h.scope === 'group' && h.assessmentIds.length < 1) throw new Error('分组 hurdle 需要关联考核')
  }
  for (const source of s.sources) if (!s.semesters.some(x => x.id === source.semesterId)) throw new Error('课表来源的学期无效')
  for (const event of s.events) {
    if (!event.sourceId && !event.courseId) throw new Error('手动课表必须关联课程')
    if (event.courseId && !s.courses.some(c => c.id === event.courseId)) throw new Error('课表课程关联无效')
    if (event.sourceId && !s.sources.some(x => x.id === event.sourceId)) throw new Error('课表来源无效')
    if (toDate(event.end, s.settings.timezone) < toDate(event.start, s.settings.timezone)) throw new Error('课表结束时间早于开始时间')
  }
  return s
}

export function aggregateTodos(s: Workspace, includeArchived = false): TodoItem[] {
  const courses = s.courses.filter(c => (includeArchived || !c.archived) && s.semesters.some(x => x.id === c.semesterId && (includeArchived || !x.archived)))
  return [...s.tasks.filter(t => includeArchived || !t.archived).map(t => ({ ...t, source: 'task' as const, timezone: s.settings.timezone })), ...s.assessments.filter(a => (includeArchived || !a.archived) && courses.some(c => c.id === a.courseId)).map(a => {
    const c = courses.find(c => c.id === a.courseId)!
    return { ...a, archived: !!(a.archived || c.archived || s.semesters.find(x => x.id === c.semesterId)!.archived), due: a.due || a.starts, source: 'assessment' as const, courseName: c.name, color: c.color, timezone: s.semesters.find(x => x.id === c.semesterId)!.timezone }
  })]
}
// Calendar views list one semester's courses and sources; manual events inherit the course/semester archive cascade like assessments.
export function visibleCalendarEvents(events: CalendarEvent[], courses: Course[], sources: CalendarSource[], semesters: Semester[]): CalendarEvent[] {
  return events.filter(e => {
    if (e.sourceId) return sources.some(s => s.id === e.sourceId)
    const course = courses.find(c => c.id === e.courseId)
    return !!course && !course.archived && semesters.some(s => s.id === course.semesterId && !s.archived)
  })
}
export function calculateGrade(items: { weight: number | null; score: number | null; maxScore: number | null; result?: string }[]) {
  let earned = 0, gradedWeight = 0, assignedWeight = 0
  for (const a of items) {
    assignedWeight += a.weight ?? 0
    if (a.weight !== null && a.score !== null && a.maxScore !== null && a.maxScore > 0 && !a.result) { earned += a.score / a.maxScore * a.weight; gradedWeight += a.weight }
  }
  return { earned, gradedWeight, pendingWeight: assignedWeight - gradedWeight, unassignedWeight: Math.max(0, 100 - assignedWeight), assignedWeight, complete: assignedWeight === 100 && items.every(x => x.weight !== null) }
}
export function toDate(value: string, timezone: string, endOfDay = false): DateTime {
  const dt = DateTime.fromISO(value, { zone: timezone })
  return value.length === 10 && endOfDay ? dt.endOf('day') : dt
}
export function reminderCandidates(items: TodoItem[], now: Date, timezone: string, sent: Record<string, boolean>) {
  return items.flatMap(item => {
    if (!item.due || item.status === 'done' || !item.reminders) return []
    const tz = item.timezone || timezone
    const dateOnly = item.due.length === 10
    const due = toDate(item.due, tz)
    const offsets = item.reminderOffsets ?? (dateOnly ? [1440, 0] : [1440, 60])
    const available = offsets.map(offset => ({ at: (dateOnly ? due.set({ hour: 9 }) : due).minus({ minutes: offset }), key: `${item.source}:${item.id}:${item.due}:${offset}` })).filter(x => x.at.toMillis() <= now.getTime() && !sent[x.key])
    return available.length ? [{ item, keys: available.map(x => x.key) }] : []
  })
}

export function dueDigestSlot(now: DateTime, time: string, enabledSince: string, lastSlot: string): string | null {
  if (!enabledSince) return null
  const [hour, minute] = time.split(':').map(Number)
  let slot = now.set({ hour, minute, second: 0, millisecond: 0 })
  if (slot > now) slot = slot.minus({ days: 1 })
  if (DateTime.fromISO(enabledSince, { zone: now.zoneName! }) > slot) return null
  const date = slot.toISODate()!
  return lastSlot >= date ? null : date
}
