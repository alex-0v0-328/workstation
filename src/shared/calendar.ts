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

export interface WeekSlot { event: CalendarEvent; top: number; height: number; lane: number; lanes: number }
// Shared visible range for the week grid: a 08:00–20:00 baseline, extended to cover earlier or later sessions.
export function weekTimeRange(events: CalendarEvent[], days: DateTime[], zone: string): { open: number; close: number } {
  let open = 480, close = 1200
  for (const day of days) {
    const dayStart = day.startOf('day')
    for (const event of events) {
      if (event.allDay) continue
      const start = DateTime.fromISO(event.start, { zone }).setZone(zone)
      const end = DateTime.fromISO(event.end, { zone }).setZone(zone)
      const from = Math.max(0, start.diff(dayStart, 'minutes').minutes)
      const to = Math.min(1440, end.diff(dayStart, 'minutes').minutes)
      if (to <= from) continue
      open = Math.min(open, Math.floor(from / 60) * 60)
      close = Math.max(close, Math.min(1440, Math.ceil(to / 60) * 60))
    }
  }
  if (close <= open) close = open + 60
  return { open, close }
}
// Positions one day's timed sessions on a proportional time axis; overlapping sessions split into side-by-side lanes.
export function layoutDayEvents(events: CalendarEvent[], day: DateTime, zone: string, open: number, close: number): WeekSlot[] {
  const dayStart = day.startOf('day')
  const span = close - open
  const timed = events.flatMap(event => {
    if (event.allDay) return []
    const start = DateTime.fromISO(event.start, { zone }).setZone(zone)
    const end = DateTime.fromISO(event.end, { zone }).setZone(zone)
    const startMin = Math.max(Math.max(0, start.diff(dayStart, 'minutes').minutes), open)
    const endMin = Math.min(Math.min(1440, end.diff(dayStart, 'minutes').minutes), close)
    return endMin > startMin ? [{ event, startMin, endMin }] : []
  }).sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin)
  const slots: WeekSlot[] = []
  let cluster: typeof timed = [], clusterEnd = -1
  const flush = () => {
    const lanes: number[] = []
    const base = slots.length
    for (const item of cluster) {
      let lane = lanes.findIndex(end => end <= item.startMin)
      if (lane < 0) { lane = lanes.length; lanes.push(0) }
      lanes[lane] = item.endMin
      slots.push({ event: item.event, top: (item.startMin - open) / span, height: (item.endMin - item.startMin) / span, lane, lanes: 0 })
    }
    for (let i = base; i < slots.length; i++) slots[i].lanes = lanes.length
    cluster = []; clusterEnd = -1
  }
  for (const item of timed) {
    if (cluster.length && item.startMin >= clusterEnd) flush()
    cluster.push(item)
    clusterEnd = Math.max(clusterEnd, item.endMin)
  }
  flush()
  return slots
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
