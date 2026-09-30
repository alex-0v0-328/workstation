import { describe, expect, it } from 'vitest'
import { DateTime } from 'luxon'
import { parseCalendar, expandManual, layoutDayEvents, semesterWeeks, startOfWeek, weekTimeRange } from '../src/shared/calendar'
import { visibleCalendarEvents } from '../src/shared/domain'
import type { Assessment, CalendarEvent, CalendarSource, Course, Semester } from '../src/shared/types'

describe('calendar imports', () => {
  it('keeps recurrence IDs stable while respecting cancellations and single-instance moves', () => {
    const ics = ['BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT','UID:lesson','DTSTART:20260907T010000Z','DTEND:20260907T020000Z','RRULE:FREQ=WEEKLY;COUNT=3','EXDATE:20260914T010000Z','SUMMARY:Lecture','END:VEVENT','BEGIN:VEVENT','UID:lesson','RECURRENCE-ID:20260921T010000Z','DTSTART:20260922T010000Z','DTEND:20260922T020000Z','SUMMARY:Moved lecture','END:VEVENT','END:VCALENDAR'].join('\r\n')
    const result = parseCalendar(ics, 'source', '2026-09-01', '2026-10-01', 'Australia/Sydney')
    expect(result.events).toHaveLength(2)
    expect(result.events[1].start).toContain('2026-09-22')
    expect(parseCalendar(ics, 'source', '2026-09-01', '2026-10-01', 'Australia/Sydney').events.map(x => x.id)).toEqual(result.events.map(x => x.id))
  })
  it('treats floating times in the semester zone and preserves all-day precision', () => {
    const ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:a\r\nDTSTART:20260914T090000\r\nDTEND:20260914T100000\r\nSUMMARY:Local\r\nEND:VEVENT\r\nEND:VCALENDAR'
    expect(parseCalendar(ics, 's', '2026-09-01', '2026-10-01', 'Australia/Sydney').events[0].start).toBe('2026-09-14T09:00:00.000+10:00')
  })
  it('uses teaching weeks for odd/even recurrence and skips specified exceptions', () => {
    const events = expandManual({ courseId: 'c', title: 'Lab', from: '2026-09-07', to: '2026-10-02', weekday: 1, time: '09:00', endTime: '10:00', weeks: 'odd', specific: '', exceptions: '2026-09-21', timezone: 'Australia/Sydney', weekStart: '2026-09-07', location: '' })
    expect(events).toHaveLength(1)
    expect(events[0].start).toContain('2026-09-07')
  })
})

describe('teaching week numbering across daylight saving', () => {
  const base = { courseId: 'c', title: 'Lab', from: '2026-09-28', to: '2026-10-19', weekday: 3, time: '09:00', endTime: '10:00', weeks: 'every', specific: '', exceptions: '', timezone: 'Australia/Melbourne', weekStart: '2026-09-28', location: '' }
  const dates = (input: typeof base) => expandManual(input).map(e => e.start.slice(0, 10))
  it('assigns the Wednesday after the 2026-10-04 switch to teaching week 2, not week 1', () => {
    expect(dates({ ...base, weeks: 'specific', specific: '2' })).toEqual(['2026-10-07'])
    expect(dates({ ...base, weeks: 'odd' })).toEqual(['2026-09-30', '2026-10-14'])
    expect(dates({ ...base, weeks: 'every' })).toEqual(['2026-09-30', '2026-10-07', '2026-10-14'])
  })
  it('keeps Melbourne wall time while the UTC offset changes across the switch', () => {
    const events = expandManual(base)
    expect(events[0].start).toBe('2026-09-30T09:00:00.000+10:00')
    expect(events[1].start).toBe('2026-10-07T09:00:00.000+11:00')
  })
  it('matches a non-DST zone week for week', () => {
    const shanghai = { ...base, timezone: 'Asia/Shanghai' }
    expect(dates({ ...shanghai, weeks: 'specific', specific: '2' })).toEqual(['2026-10-07'])
    expect(dates({ ...shanghai, weeks: 'odd' })).toEqual(dates({ ...base, weeks: 'odd' }))
  })
})

describe('locale-independent teaching week anchor', () => {
  const zone = 'Australia/Melbourne'
  it('maps every day of a week to the same Monday, preserving the zone', () => {
    for (const day of ['2026-09-14', '2026-09-18', '2026-09-20']) {
      const monday = startOfWeek(DateTime.fromISO(`${day}T15:30`, { zone }))
      expect(monday.toISODate()).toBe('2026-09-14')
      expect(monday.weekday).toBe(1)
      expect(monday.toFormat('HH:mm')).toBe('00:00')
      expect(monday.zoneName).toBe(zone)
    }
  })
  it('ignores the locale tag carried by a DateTime', () => {
    const sunday = DateTime.fromISO('2026-09-20T10:00', { zone, locale: 'en-US' })
    expect(startOfWeek(sunday).toISODate()).toBe('2026-09-14')
  })
  it('keeps the Monday anchor across the daylight-saving switch', () => {
    expect(startOfWeek(DateTime.fromISO('2026-10-04T12:00', { zone })).toISODate()).toBe('2026-09-28')
    expect(startOfWeek(DateTime.fromISO('2026-10-05T09:00', { zone })).toISODate()).toBe('2026-10-05')
  })
})

describe('calendar event visibility', () => {
  const semester = (id: string, archived = false): Semester => ({ id, name: id, start: '2026-01-01', end: '2026-12-31', timezone: 'Australia/Melbourne', archived })
  const course = (id: string, semesterId: string, archived = false): Course => ({ id, semesterId, name: id, code: '', color: '#0078d4', url: '', notes: '', archived })
  const source = (id: string, semesterId: string): CalendarSource => ({ id, name: id, url: '', semesterId, lastSync: '', error: '' })
  const event = (id: string, courseId: string, sourceId = ''): CalendarEvent => ({ id, sourceId, uid: id, courseId, title: id, start: '2026-09-14T09:00:00+10:00', end: '2026-09-14T10:00:00+10:00', allDay: false, location: '' })
  const ids = (events: CalendarEvent[]) => events.map(e => e.id)
  it('hides manual events whose course or course semester is archived, like the TODO cascade', () => {
    const semesters = [semester('sem'), semester('old', true)]
    const visible = visibleCalendarEvents(
      [event('manual-active', 'active'), event('manual-archived-course', 'legacy'), event('manual-orphan', 'missing'), event('imported', '', 'feed')],
      [course('active', 'sem'), course('legacy', 'sem', true)],
      [source('feed', 'sem')],
      semesters
    )
    expect(ids(visible)).toEqual(['manual-active', 'imported'])
  })
  it('hides manual events of an archived semester but keeps the subscription rule unchanged', () => {
    const semesters = [semester('sem'), semester('old', true)]
    const visible = visibleCalendarEvents(
      [event('manual-old', 'old-course'), event('imported-old', '', 'old-feed')],
      [course('old-course', 'old')],
      [source('old-feed', 'old')],
      semesters
    )
    expect(ids(visible)).toEqual(['imported-old'])
  })
})

describe('week time-axis layout', () => {
  const zone = 'Australia/Melbourne'
  const day = DateTime.fromISO('2026-09-14', { zone })
  const ev = (id: string, start: string, end: string, allDay = false): CalendarEvent => ({ id, sourceId: '', uid: id, courseId: '', title: id, start, end, allDay, location: '' })
  it('keeps a 08:00–20:00 baseline and extends it around early or late sessions', () => {
    expect(weekTimeRange([], [day], zone)).toEqual({ open: 480, close: 1200 })
    expect(weekTimeRange([ev('a', '2026-09-14T09:15:00+10:00', '2026-09-14T10:45:00+10:00')], [day], zone)).toEqual({ open: 480, close: 1200 })
    expect(weekTimeRange([ev('b', '2026-09-14T06:30:00+10:00', '2026-09-14T21:40:00+10:00')], [day], zone)).toEqual({ open: 360, close: 1320 })
  })
  it('positions sessions proportionally inside the visible range', () => {
    const slots = layoutDayEvents([ev('a', '2026-09-14T09:00:00+10:00', '2026-09-14T10:00:00+10:00')], day, zone, 480, 1200)
    expect(slots).toHaveLength(1)
    expect(slots[0]).toMatchObject({ lane: 0, lanes: 1 })
    expect(slots[0].top).toBeCloseTo(60 / 720)
    expect(slots[0].height).toBeCloseTo(60 / 720)
  })
  it('clips overnight sessions to the day and drops out-of-range ones', () => {
    const slots = layoutDayEvents([ev('late', '2026-09-13T23:00:00+10:00', '2026-09-14T01:00:00+10:00'), ev('gone', '2026-09-15T09:00:00+10:00', '2026-09-15T10:00:00+10:00')], day, zone, 480, 1200)
    expect(slots).toHaveLength(0)
    const wide = layoutDayEvents([ev('late', '2026-09-13T23:00:00+10:00', '2026-09-14T01:00:00+10:00')], day, zone, 0, 1440)
    expect(wide).toHaveLength(1)
    expect(wide[0].top).toBe(0)
    expect(wide[0].height).toBeCloseTo(60 / 1440)
  })
  it('splits overlapping sessions into lanes and skips all-day events', () => {
    const slots = layoutDayEvents([
      ev('a', '2026-09-14T09:00:00+10:00', '2026-09-14T10:30:00+10:00'),
      ev('b', '2026-09-14T10:00:00+10:00', '2026-09-14T11:00:00+10:00'),
      ev('c', '2026-09-14T11:00:00+10:00', '2026-09-14T12:00:00+10:00'),
      ev('d', '2026-09-14', '2026-09-15', true)
    ], day, zone, 480, 1200)
    expect(slots.map(s => [s.event.id, s.lane, s.lanes])).toEqual([['a', 0, 2], ['b', 1, 2], ['c', 0, 1]])
  })
})

describe('anonymized Melbourne subscription fixture', () => {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fixture//Astral Cartography//EN',
    'BEGIN:VTIMEZONE',
    'TZID:Australia/Melbourne',
    'BEGIN:STANDARD',
    'DTSTART:19700405T030000',
    'RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=1SU',
    'TZOFFSETFROM:+1100',
    'TZOFFSETTO:+1000',
    'TZNAME:AEST',
    'END:STANDARD',
    'BEGIN:DAYLIGHT',
    'DTSTART:19701004T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=1SU',
    'TZOFFSETFROM:+1000',
    'TZOFFSETTO:+1100',
    'TZNAME:AEDT',
    'END:DAYLIGHT',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    'UID:fixture-astral-cartography-01',
    'DTSTAMP:20260901T000000Z',
    'DTSTART;TZID=Australia/Melbourne:20260930T090000',
    'DTEND;TZID=Australia/Melbourne:20260930T110000',
    'SUMMARY:Astral Cartography Lecture',
    'LOCATION:Observatory Dome 2',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'UID:fixture-astral-cartography-02',
    'DTSTAMP:20260901T000000Z',
    'DTSTART;TZID=Australia/Melbourne:20261007T090000',
    'DTEND;TZID=Australia/Melbourne:20261007T110000',
    'SUMMARY:Astral Cartography Lecture',
    'LOCATION:Observatory Dome 2',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')
  it('keeps local wall time and correct UTC instants across the 2026-10-04 daylight-saving boundary', () => {
    const zone = 'Australia/Melbourne'
    const result = parseCalendar(ics, 'feed', '2026-09-01', '2026-10-31', zone)
    expect(result.events).toHaveLength(2)
    const [before, after] = result.events
    expect(before.start).toBe('2026-09-29T23:00:00.000Z')
    expect(after.start).toBe('2026-10-06T22:00:00.000Z')
    expect(DateTime.fromISO(before.start).setZone(zone).toFormat('yyyy-MM-dd HH:mm')).toBe('2026-09-30 09:00')
    expect(DateTime.fromISO(after.start).setZone(zone).toFormat('yyyy-MM-dd HH:mm')).toBe('2026-10-07 09:00')
    expect(DateTime.fromISO(before.start).setZone(zone).offset).toBe(600)
    expect(DateTime.fromISO(after.start).setZone(zone).offset).toBe(660)
    expect(before.id).toBe('feed:fixture-astral-cartography-01:2026-09-30T09:00:00')
  })
  it('produces an identical event id sequence on a second parse', () => {
    const args: [string, string, string, string, string] = [ics, 'feed', '2026-09-01', '2026-10-31', 'Australia/Melbourne']
    expect(parseCalendar(...args).events.map(e => e.id)).toEqual(parseCalendar(...args).events.map(e => e.id))
  })
})

describe('semester step row', () => {
  const semester: Semester = { id: 's', name: 'S2', start: '2026-07-22', end: '2026-10-30', timezone: 'Australia/Melbourne', archived: false, weekStart: '2026-07-20', holidays: '' }
  const item = (id: string, due: string, weight: number | null, status: Assessment['status'] = 'todo'): Assessment => ({ id, courseId: 'c', title: id, status, priority: 'normal', due, notes: '', reminders: true, archived: false, category: 'Assignment', opens: '', starts: '', ends: '', weight, score: null, maxScore: null, result: '', location: '', url: '' })
  const now = DateTime.fromISO('2026-10-07T12:00', { zone: 'Australia/Melbourne' })
  const weeks = semesterWeeks(semester, [item('a', '2026-07-24', 5), item('b', '2026-10-08T23:59:00+11:00', 30), item('c', '2026-10-05', null, 'done'), item('d', '', 40)], now)
  it('anchors week 1 on weekStart and counts through the end week', () => {
    expect(weeks).toHaveLength(15)
    expect(weeks[0]).toMatchObject({ index: 1, start: '2026-07-20', level: 1, open: 1, bank: 0 })
    expect(weeks.at(-1)).toMatchObject({ index: 15, start: '2026-10-26', bank: 3 })
  })
  it('lights the current week across the daylight-saving switch and grades weight into levels', () => {
    const current = weeks.filter(w => w.now)
    expect(current.map(w => w.index)).toEqual([12])
    expect(current[0]).toMatchObject({ weight: 30, level: 3, open: 1 })
    expect(current[0].items.map(i => i.id)).toEqual(['b', 'c'])
  })
  it('never arms a week for undated assessments', () => { expect(weeks.reduce((n, w) => n + w.items.length, 0)).toBe(3) })
})
