import { expect, it } from 'vitest'
import { DateTime } from 'luxon'
import { digestWindow, dueDigestSlot } from '../src/shared/domain'
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
it('manual digest window covers today from midnight; auto window covers the last 24h from yesterday’s slot', () => {
  const now = DateTime.fromISO('2026-09-15T10:30', { zone: 'Australia/Sydney' })
  const manual = digestWindow(now, '20:00', 'manual')
  expect(manual.since.toISO()).toBe('2026-09-15T00:00:00.000+10:00')
  expect(manual.until.toISO()).toBe(now.toISO())
  const auto = digestWindow(now, '20:00', 'auto')
  expect(auto.since.toISO()).toBe('2026-09-13T20:00:00.000+10:00')
  expect(auto.until.toISO()).toBe('2026-09-14T20:00:00.000+10:00')
  const afterSlot = DateTime.fromISO('2026-09-15T21:00', { zone: 'Australia/Sydney' })
  const autoLate = digestWindow(afterSlot, '20:00', 'auto')
  expect(autoLate.since.toISO()).toBe('2026-09-14T20:00:00.000+10:00')
  expect(autoLate.until.toISO()).toBe('2026-09-15T20:00:00.000+10:00')
  const beforeSlot = DateTime.fromISO('2026-09-15T08:00', { zone: 'Australia/Sydney' })
  const autoEarly = digestWindow(beforeSlot, '20:00', 'auto')
  expect(autoEarly.since.toISO()).toBe('2026-09-13T20:00:00.000+10:00')
  expect(autoEarly.until.toISO()).toBe('2026-09-14T20:00:00.000+10:00')
})
it('preserves individual occurrence mappings without spreading the last edit to its series', () => {
  const event = (id: string, courseId: string): CalendarEvent => ({ id, courseId, uid: 'series', sourceId: 'source', title: 'Lecture', start: '2026-09-14T09:00', end: '2026-09-14T10:00', allDay: false, location: '' })
  const result = mergeCalendarMappings([event('first', 'A'), event('second', 'B')], [event('first', ''), event('second', ''), event('third', '')])
  expect(result.map(e => e.courseId)).toEqual(['A', 'B', ''])
})
