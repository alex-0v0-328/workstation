import { createContext, useContext } from 'react'
import type { Workspace, Task, Assessment } from '../../shared/types'
import { DateTime } from 'luxon'
export interface AppModel {
  state: Workspace; busy: boolean; page: string; feedback?: string; setPage(page: string): void
  mutate(change: (state: Workspace) => void): Promise<boolean>
  run<T>(action: () => Promise<T>, success?: string): Promise<T | undefined>
  editTask(item?: Task | Assessment, courseId?: string): void
  reload(): Promise<void>
}
export const Model = createContext<AppModel | null>(null)
export const useModel = () => useContext(Model)!
export const uid = (): string => crypto.randomUUID()
export function formatDate(value: string, timezone?: string): string {
  if (!value) return '日期待定'
  const date = DateTime.fromISO(value, { zone: timezone }).setLocale('zh-CN')
  return date.toFormat(value.length === 10 ? 'M月d日' : 'M月d日 HH:mm') + (value.length === 10 ? ' · 时间未定' : '')
}
export const statusLabel = { todo: '未开始', doing: '进行中', done: '已完成' }
export function taskDefaults(): Task { return { id: uid(), title: '', due: '', status: 'todo', priority: 'normal', notes: '', reminders: true, archived: false } }
export function assessmentDefaults(courseId: string): Assessment { return { ...taskDefaults(), courseId, category: 'Assignment', opens: '', starts: '', ends: '', weight: null, score: null, maxScore: null, result: '', location: '', url: '' } }
