import { it, expect } from 'vitest'
import { validateWorkspace, calculateGrade, aggregateTodos, reminderCandidates } from '../src/shared/domain'
import example from '../examples/academic-example.json'
it('accepts the published academic import template with a date-only deadline and unknown exam', () => {
  const state = validateWorkspace(example)
  expect(state.assessments[0].due).toHaveLength(10)
  expect(aggregateTodos(state).find(t => t.id === 'example-exam')?.due).toBe('')
})
it('rejects zero denominators, impossible windows and cross-course hurdle links', () => {
  const state = validateWorkspace(example)
  state.assessments[0].score = 10; state.assessments[0].maxScore = 0
  expect(() => validateWorkspace(state)).toThrow()
  state.assessments[0].maxScore = 100; state.assessments[0].opens = '2026-10-01'
  expect(() => validateWorkspace(state)).toThrow(/开放/)
  state.assessments[0].opens = ''; state.hurdles[0].assessmentIds = ['missing']
  expect(() => validateWorkspace(state)).toThrow(/关联/)
})
it('does not normalize incomplete or overallocated weights', () => {
  const result = calculateGrade([{ weight: 80, score: 50, maxScore: 100 }, { weight: 40, score: null, maxScore: 100 }])
  expect(result).toMatchObject({ earned: 40, assignedWeight: 120, complete: false })
})
it('rejects manual timetable events that would become unreachable without a course', () => {
  const state = validateWorkspace(example)
  state.events.push({ id: 'orphan', uid: 'orphan', sourceId: '', courseId: '', title: 'Lab', start: '2026-09-14T09:00', end: '2026-09-14T10:00', allDay: false, location: '' })
  expect(() => validateWorkspace(state)).toThrow(/手动/)
})
it('does not repeat delivered reminders and preserves daylight-saving wall-clock time', () => {
  const state = validateWorkspace(example)
  state.assessments[0].due = '2026-10-04T09:00'
  const items = aggregateTodos(state)
  const first = reminderCandidates(items, new Date('2026-10-04T00:00:00Z'), 'Australia/Sydney', {})
  expect(first).toHaveLength(1)
  const sent = Object.fromEntries(first.flatMap(r => r.keys.map(k => [k, true])))
  expect(reminderCandidates(items, new Date('2026-10-04T00:00:00Z'), 'Australia/Sydney', sent)).toHaveLength(0)
})
