import { createContext, useContext } from 'react'
import type { Workspace, Task, Assessment, ThemeState } from '../../shared/types'
import { DateTime } from 'luxon'
import type { Messages, TFunction } from '../../shared/i18n'

export interface AppModel {
  state: Workspace; themeState: ThemeState | null; busy: boolean; page: string; feedback?: string
  messages: Messages; t: TFunction
  setPage(page: string): void
  mutate(change: (state: Workspace) => void): Promise<boolean>
  run<T>(action: () => Promise<T>, success?: string): Promise<T | undefined>
  editTask(item?: Task | Assessment, courseId?: string): void
  reload(): Promise<void>
  setThemeState(state: ThemeState | null): void
}
export const Model = createContext<AppModel | null>(null)
export const useModel = () => useContext(Model)!
export const uid = (): string => crypto.randomUUID()
export function formatDate(m: Messages, value: string, timezone?: string, style: 'auto' | 'date' = 'auto'): string {
  if (!value) return m.time.dateTbd
  const date = DateTime.fromISO(value, { zone: timezone }).setLocale(m.meta.locale)
  if (style === 'date') return date.toFormat(m.time.dateShort)
  return date.toFormat(value.length === 10 ? m.time.dateShort : m.time.dateTimeShort) + (value.length === 10 ? ` · ${m.time.timeTbd}` : '')
}
export function taskDefaults(): Task { return { id: uid(), title: '', due: '', status: 'todo', priority: 'normal', notes: '', reminders: true, archived: false } }
export function assessmentDefaults(courseId: string): Assessment { return { ...taskDefaults(), courseId, category: 'Assignment', opens: '', starts: '', ends: '', weight: null, score: null, maxScore: null, result: '', location: '', url: '' } }
