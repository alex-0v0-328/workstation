import ICAL from 'ical.js'
import { DateTime } from 'luxon'
import type { CalendarEvent, IcsPreview } from './types'

export function parseCalendar(input: string, sourceId: string, from: string, to: string, timezone: string): IcsPreview {
  if (input.length > 5_000_000) throw new Error('课表超过 5 MB，请缩小导出范围')
  const root = new ICAL.Component(ICAL.parse(input))
  if (root.name !== 'vcalendar') throw new Error('文件不是有效的 ICS 日历')
  const localZones = root.getAllSubcomponents('vtimezone')
  for (const c of localZones) ICAL.TimezoneService.register(new ICAL.Timezone(c))
  try {
    const components = root.getAllSubcomponents('vevent')
    const events: CalendarEvent[] = [], warnings: string[] = []
    const lower = DateTime.fromISO(from, { zone: timezone }), upper = DateTime.fromISO(to, { zone: timezone }).endOf('day')
    const convert = (t: ICAL.Time, fallback: string): string => {
      if (t.isDate) return t.toString()
      if (t.zone.tzid === 'floating' || t.zone.tzid === 'local') {
        const dt = DateTime.fromISO(t.toString(), { zone: fallback })
        if (!dt.isValid) throw new Error(`无法识别课表时区 ${fallback}`)
        return dt.toISO()!
      }
      return t.toJSDate().toISOString()
    }
    for (const component of components) {
      if (component.hasProperty('recurrence-id')) continue
      if (component.getFirstPropertyValue('status') === 'CANCELLED') continue
      const event = new ICAL.Event(component)
      if (!event.uid || !component.hasProperty('dtstart')) throw new Error('课表事件缺少 UID 或开始时间')
      const related = components.filter(c => c !== component && c.getFirstPropertyValue('uid') === event.uid && c.hasProperty('recurrence-id'))
      for (const other of related) event.relateException(other)
      const tzid = component.getFirstProperty('dtstart')?.getParameter('tzid') as string | undefined
      const zone = tzid || timezone
      const iterator = event.iterator()
      let iterations = 0
      while (true) {
        const occurrence = iterator.next()
        if (!occurrence) break
        if (++iterations > 20000) throw new Error('课表重复规则过于密集或开始时间过早，请限定导出范围')
        const details = event.getOccurrenceDetails(occurrence)
        const start = convert(details.startDate, zone), end = convert(details.endDate, zone)
        const startAt = DateTime.fromISO(start, { zone: timezone })
        if (DateTime.fromISO(convert(occurrence, zone), { zone: timezone }) > upper.plus({ years: 1 })) break
        if (startAt >= lower && startAt <= upper && details.item.component.getFirstPropertyValue('status') !== 'CANCELLED') {
          events.push({ id: `${sourceId}:${event.uid}:${occurrence.toString()}`, sourceId, uid: event.uid, courseId: '', title: details.item.summary || event.summary || '未命名课程安排', start, end, allDay: details.startDate.isDate, location: details.item.location || event.location || '' })
        }
        if (!event.isRecurring()) break
      }
    }
    if (events.length === 0) warnings.push('所选学期内没有课程安排，请确认日期范围。')
    return { events: [...new Map(events.map(e => [e.id, e])).values()].sort((a, b) => a.start.localeCompare(b.start)), warnings }
  } finally {
    for (const c of localZones) ICAL.TimezoneService.remove(c.getFirstPropertyValue('tzid') as string)
  }
}

export interface ManualInput { courseId: string; title: string; from: string; to: string; weekday: number; time: string; endTime: string; weeks: string; specific: string; exceptions: string; timezone: string; weekStart: string; location: string }
export function mergeCalendarMappings(previous: CalendarEvent[], incoming: CalendarEvent[]): CalendarEvent[] {
  const byId = new Map(previous.map(event => [event.id, event.courseId]))
  const series = new Map<string, Set<string>>()
  for (const event of previous) { const values = series.get(event.uid) || new Set<string>(); values.add(event.courseId); series.set(event.uid, values) }
  return incoming.map(event => {
    const mappings = series.get(event.uid)
    const fallback = mappings?.size === 1 ? [...mappings][0] : ''
    return { ...event, courseId: byId.get(event.id) ?? fallback }
  })
}
export function expandManual(input: ManualInput): CalendarEvent[] {
  let day = DateTime.fromISO(input.from, { zone: input.timezone })
  const end = DateTime.fromISO(input.to, { zone: input.timezone })
  if (!day.isValid || !end.isValid || end < day || end.diff(day, 'days').days > 1100 || !input.title.trim()) throw new Error('请填写标题和有效课表日期范围（最多三年）')
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.endTime) || input.endTime <= input.time) throw new Error('课程结束时间必须晚于开始时间')
  const anchor = DateTime.fromISO(input.weekStart || input.from, { zone: input.timezone }).startOf('week')
  const specified = input.specific.split(/[,，\s]+/).map(Number)
  const exceptions = new Set(input.exceptions.split(/[,，\s]+/))
  const result: CalendarEvent[] = []
  const series = crypto.randomUUID()
  for (; day <= end; day = day.plus({ days: 1 })) {
    const week = Math.floor(day.startOf('week').diff(anchor, 'weeks').weeks) + 1
    if (day.weekday !== input.weekday || exceptions.has(day.toISODate()!)) continue
    if (input.weeks === 'odd' && week % 2 !== 1 || input.weeks === 'even' && week % 2 !== 0 || input.weeks === 'specific' && !specified.includes(week)) continue
    const start = DateTime.fromISO(`${day.toISODate()}T${input.time}`, { zone: input.timezone })
    const finish = DateTime.fromISO(`${day.toISODate()}T${input.endTime}`, { zone: input.timezone })
    result.push({ id: `${series}:${day.toISODate()}`, uid: series, sourceId: '', courseId: input.courseId, title: input.title, start: start.toISO()!, end: finish.toISO()!, allDay: false, location: input.location })
  }
  return result
}
