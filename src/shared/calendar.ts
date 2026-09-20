import ICAL from 'ical.js'
import { DateTime } from 'luxon'
import type { CalendarEvent, IcsPreview } from './types'
import { MessageError } from './i18n'
import { zhCN } from './i18n/zh-CN'

export interface CalendarLabels { untitled: string }

export function parseCalendar(input: string, sourceId: string, from: string, to: string, timezone: string, labels?: CalendarLabels): IcsPreview {
  const untitled = labels?.untitled ?? zhCN.remote.untitled
  if (input.length > 5_000_000) throw new MessageError('remote.icsTooBigRange')
  const root = new ICAL.Component(ICAL.parse(input))
  if (root.name !== 'vcalendar') throw new MessageError('remote.notIcs')
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
        if (!dt.isValid) throw new MessageError('remote.unknownZone', { zone: fallback })
        return dt.toISO()!
      }
      return t.toJSDate().toISOString()
    }
    for (const component of components) {
      if (component.hasProperty('recurrence-id')) continue
      if (component.getFirstPropertyValue('status') === 'CANCELLED') continue
      const event = new ICAL.Event(component)
      if (!event.uid || !component.hasProperty('dtstart')) throw new MessageError('remote.missingUid')
      const related = components.filter(c => c !== component && c.getFirstPropertyValue('uid') === event.uid && c.hasProperty('recurrence-id'))
      for (const other of related) event.relateException(other)
      const tzid = component.getFirstProperty('dtstart')?.getParameter('tzid') as string | undefined
      const zone = tzid || timezone
      const iterator = event.iterator()
      let iterations = 0
      while (true) {
        const occurrence = iterator.next()
        if (!occurrence) break
        if (++iterations > 20000) throw new MessageError('remote.tooDense')
        const details = event.getOccurrenceDetails(occurrence)
        const start = convert(details.startDate, zone), end = convert(details.endDate, zone)
        const startAt = DateTime.fromISO(start, { zone: timezone })
        if (DateTime.fromISO(convert(occurrence, zone), { zone: timezone }) > upper.plus({ years: 1 })) break
        if (startAt >= lower && startAt <= upper && details.item.component.getFirstPropertyValue('status') !== 'CANCELLED') {
          events.push({ id: `${sourceId}:${event.uid}:${occurrence.toString()}`, sourceId, uid: event.uid, courseId: '', title: details.item.summary || event.summary || untitled, start, end, allDay: details.startDate.isDate, location: details.item.location || event.location || '' })
        }
        if (!event.isRecurring()) break
      }
    }
    if (events.length === 0) warnings.push('remote.emptyRange')
    return { events: [...new Map(events.map(e => [e.id, e])).values()].sort((a, b) => a.start.localeCompare(b.start)), warnings }
  } finally {
    for (const c of localZones) ICAL.TimezoneService.remove(c.getFirstPropertyValue('tzid') as string)
  }
}

interface ManualInput { courseId: string; title: string; from: string; to: string; weekday: number; time: string; endTime: string; weeks: string; specific: string; exceptions: string; timezone: string; weekStart: string; location: string }
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
// Luxon's startOf('week') follows the runtime locale; teaching weeks anchor to Monday everywhere.
export function startOfWeek(day: DateTime): DateTime {
  return day.minus({ days: day.weekday - 1 }).startOf('day')
}
export function expandManual(input: ManualInput): CalendarEvent[] {
  let day = DateTime.fromISO(input.from, { zone: input.timezone })
  const end = DateTime.fromISO(input.to, { zone: input.timezone })
  if (!day.isValid || !end.isValid || end < day || end.diff(day, 'days').days > 1100 || !input.title.trim()) throw new MessageError('remote.manualRange')
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.endTime) || input.endTime <= input.time) throw new MessageError('remote.timeOrder')
  const anchor = startOfWeek(DateTime.fromISO(input.weekStart || input.from, { zone: input.timezone }))
  const specified = input.specific.split(/[,，\s]+/).map(Number)
  const exceptions = new Set(input.exceptions.split(/[,，\s]+/))
  const result: CalendarEvent[] = []
  const series = crypto.randomUUID()
  for (; day <= end; day = day.plus({ days: 1 })) {
    // Count calendar days rather than elapsed time: a DST switch makes a week 167/169 hours long, and rounding absorbs that skew.
    const week = Math.round(startOfWeek(day).diff(anchor, 'days').days / 7) + 1
    if (day.weekday !== input.weekday || exceptions.has(day.toISODate()!)) continue
    if (input.weeks === 'odd' && week % 2 !== 1 || input.weeks === 'even' && week % 2 !== 0 || input.weeks === 'specific' && !specified.includes(week)) continue
    const start = DateTime.fromISO(`${day.toISODate()}T${input.time}`, { zone: input.timezone })
    const finish = DateTime.fromISO(`${day.toISODate()}T${input.endTime}`, { zone: input.timezone })
    result.push({ id: `${series}:${day.toISODate()}`, uid: series, sourceId: '', courseId: input.courseId, title: input.title, start: start.toISO()!, end: finish.toISO()!, allDay: false, location: input.location })
  }
  return result
}
