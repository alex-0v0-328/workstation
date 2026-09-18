import { describe, expect, it } from 'vitest'
import { DateTime } from 'luxon'
import { parseCalendar, expandManual, startOfWeek } from '../src/shared/calendar'
import { visibleCalendarEvents } from '../src/shared/domain'
import type { CalendarEvent, CalendarSource, Course, Semester } from '../src/shared/types'

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
