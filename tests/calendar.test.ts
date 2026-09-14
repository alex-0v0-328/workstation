import { describe, expect, it } from 'vitest'
import { parseCalendar, expandManual } from '../src/shared/calendar'

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
