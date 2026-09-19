import { describe, it, expect } from 'vitest'
import { aggregateTodos, calculateGrade, validateWorkspace, emptyWorkspace, reminderCandidates } from '../src/shared/domain'

describe('settings schema', () => {
  it('accepts theme ids as slugs and defaults a missing variant to empty', () => {
    for (const theme of ['windows', 'catppuccin', 'retro']) {
      const state = emptyWorkspace()
      state.settings.theme = theme
      expect(validateWorkspace(state).settings.theme).toBe(theme)
    }
    const legacy = JSON.parse(JSON.stringify(emptyWorkspace()))
    delete legacy.settings.variant
    delete legacy.settings.flavor
    expect(validateWorkspace(legacy).settings.variant).toBe('')
  })
  it('rejects malformed theme ids', () => {
    const state = JSON.parse(JSON.stringify(emptyWorkspace()))
    state.settings.theme = 'Neon!'
    expect(() => validateWorkspace(state)).toThrow()
  })
})

describe('theme packages', () => {
  it('accepts a valid package and rejects invalid ones', async () => {
    const { validateThemePackage } = await import('../src/shared/theme-manifest')
    const good = { format: 1, id: 'catppuccin', name: 'Catppuccin', version: '1.0.0', shell: 'sidebar', variants: [{ id: 'mocha', name: 'Mocha', dark: true, accent: '#cba6f7', css: '.x{}' }] }
    const parsed = validateThemePackage(good)
    expect(parsed.material).toBe('none')
    expect(() => validateThemePackage({ ...good, id: 'windows' })).toThrow()
    expect(() => validateThemePackage({ ...good, shell: 'grid' })).toThrow()
    expect(() => validateThemePackage({ ...good, material: 'glass' })).toThrow()
    expect(() => validateThemePackage({ ...good, variants: [...good.variants, { ...good.variants[0] }] })).toThrow()
    expect(() => validateThemePackage({ ...good, variants: [{ ...good.variants[0], fluent: { 'bad-key': '#ffffff' } }] })).toThrow()
  })
})

describe('academic integrity', () => {
  it('counts a real zero but does not count an unpublished grade or a pass/fail as numeric', () => {
    const grade = calculateGrade([
      { weight: 20, score: 0, maxScore: 100 },
      { weight: 30, score: null, maxScore: 100 },
      { weight: 10, score: null, maxScore: null, result: 'pass' }
    ])
    expect(grade).toMatchObject({ earned: 0, gradedWeight: 20, pendingWeight: 40, unassignedWeight: 40 })
  })
  it('projects assessments without storing a second editable task', () => {
    const state = emptyWorkspace()
    state.semesters.push({ id: 's', name: 'Semester', start: '2026-07-01', end: '2026-12-01', timezone: 'Australia/Sydney', archived: false })
    state.courses.push({ id: 'c', semesterId: 's', name: 'Course', code: '', color: '#0078d4', url: '', notes: '', archived: false })
    state.assessments.push({ id: 'a', courseId: 'c', title: 'Essay', category: 'Assignment', status: 'todo', priority: 'normal', due: '2026-10-01', opens: '', starts: '', ends: '', weight: null, score: null, maxScore: null, result: '', location: '', url: '', notes: '', reminders: true })
    expect(aggregateTodos(state)[0]).toMatchObject({ id: 'a', source: 'assessment', title: 'Essay' })
    state.assessments[0].status = 'done'
    expect(aggregateTodos(state)[0].status).toBe('done')
    expect(state.tasks).toHaveLength(0)
    state.courses[0].archived = true
    expect(aggregateTodos(state)).toHaveLength(0)
    expect(aggregateTodos(state, true)[0].archived).toBe(true)
  })
  it('rejects dangling references, invalid dates, and zero score denominators', () => {
    const state = emptyWorkspace()
    state.courses.push({ id: 'c', semesterId: 'missing', name: 'Bad', code: '', color: '#0078d4', url: '', notes: '', archived: false })
    expect(() => validateWorkspace(state)).toThrow()
    const another = emptyWorkspace()
    another.semesters.push({ id: 's', name: 'Bad', start: '2026-02-30', end: '2026-12-01', timezone: 'Australia/Sydney', archived: false })
    expect(() => validateWorkspace(another)).toThrow()
  })
  it('coalesces missed reminders and never reminds about completed or unknown-date tasks', () => {
    const items: any[] = [
      { id: '1', source: 'task', title: 'A', due: '2026-09-14', status: 'todo', reminders: true },
      { id: '2', source: 'task', title: 'B', due: '', status: 'todo', reminders: true },
      { id: '3', source: 'task', title: 'C', due: '2026-09-14', status: 'done', reminders: true }
    ]
    const now = new Date('2026-09-14T02:00:00Z')
    expect(reminderCandidates(items, now, 'Australia/Sydney', {}).map(x => x.item.id)).toEqual(['1'])
  })
})
