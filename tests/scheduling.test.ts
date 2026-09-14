import { expect, it } from 'vitest'
import { DateTime } from 'luxon'
import { dueDigestSlot } from '../src/shared/domain'
import { mergeCalendarMappings } from '../src/shared/calendar'
import type { CalendarEvent } from '../src/shared/types'

it('morning catch-up consumes yesterday, preserving the evening digest slot', () => {
  const morning = DateTime.fromISO('2026-09-15T09:00', { zone: 'Australia/Sydney' })
  const enabled = '2026-09-14T12:00:00+10:00'
  expect(dueDigestSlot(morning, '20:00', enabled, '')).toBe('2026-09-14')
  expect(dueDigestSlot(morning, '20:00', enabled, '2026-09-14')).toBeNull()
  expect(dueDigestSlot(morning.set({ hour: 20 }), '20:00', enabled, '2026-09-14')).toBe('2026-09-15')
  expect(dueDigestSlot(morning, '20:00', '2026-09-15T08:00:00+10:00', '')).toBeNull()
})
it('preserves individual occurrence mappings without spreading the last edit to its series', () => {
  const event = (id: string, courseId: string): CalendarEvent => ({ id, courseId, uid: 'series', sourceId: 'source', title: 'Lecture', start: '2026-09-14T09:00', end: '2026-09-14T10:00', allDay: false, location: '' })
  const result = mergeCalendarMappings([event('first', 'A'), event('second', 'B')], [event('first', ''), event('second', ''), event('third', '')])
  expect(result.map(e => e.courseId)).toEqual(['A', 'B', ''])
})
