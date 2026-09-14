export type Status = 'todo' | 'doing' | 'done'
export type Priority = 'normal' | 'high' | 'low'
export interface Semester { id: string; name: string; start: string; end: string; timezone: string; archived: boolean; weekStart?: string; holidays?: string }
export interface Course { id: string; semesterId: string; name: string; code: string; color: string; url: string; notes: string; archived: boolean }
export interface Task { id: string; title: string; status: Status; priority: Priority; due: string; notes: string; reminders: boolean; archived?: boolean; reminderOffsets?: number[] }
export interface Assessment extends Task { courseId: string; category: string; opens: string; starts: string; ends: string; weight: number | null; score: number | null; maxScore: number | null; result: '' | 'pass' | 'fail'; location: string; url: string }
export interface Hurdle { id: string; courseId: string; text: string; scope: 'course' | 'assessment' | 'group'; assessmentIds: string[]; status: 'pending' | 'met' | 'unmet' }
export interface CalendarEvent { id: string; sourceId: string; uid: string; courseId: string; title: string; start: string; end: string; allDay: boolean; location: string }
export interface CalendarSource { id: string; name: string; url: string; semesterId: string; lastSync: string; error: string }
export interface Settings { theme: 'windows'; appearance: 'system' | 'light' | 'dark'; timezone: string; startAtLogin: boolean; notifications: boolean; digestEnabled: boolean; digestTime: string; digestSince: string; model: string }
export interface Workspace { version: 1; revision: number; semesters: Semester[]; courses: Course[]; assessments: Assessment[]; tasks: Task[]; hurdles: Hurdle[]; events: CalendarEvent[]; sources: CalendarSource[]; settings: Settings }
export interface TodoItem extends Task { source: 'assessment' | 'task'; courseId?: string; courseName?: string; category?: string; color?: string; timezone?: string; opens?: string }
export interface Mail { id: string; threadId: string; subject: string; from: string; date: string; snippet: string; text: string; html: string; unread: boolean; attachments: { name: string; size: number }[] }
export interface Digest { id: string; created: string; until: string; state: 'pending' | 'partial' | 'done'; entries: { mailId: string; subject: string; summary: string; error: string }[] }
export interface Connection { email: string; hasOAuth: boolean; hasKey: boolean; lastError: string }
export interface IcsPreview { events: CalendarEvent[]; warnings: string[] }
export interface Bridge {
  load(): Promise<Workspace>
  save(state: Workspace): Promise<Workspace>
  exportBackup(): Promise<string | null>
  restoreBackup(): Promise<Workspace | null>
  importAcademic(): Promise<Workspace | null>
  previewIcs(input: { url?: string; semesterId: string; sourceId: string; semester?: Semester }): Promise<IcsPreview | null>
  syncCalendars(): Promise<Workspace>
  connection(): Promise<Connection>
  saveSecrets(input: { clientId?: string; clientSecret?: string; apiKey?: string }): Promise<Connection>
  connectGmail(): Promise<Connection>
  disconnectGmail(): Promise<Connection>
  listMail(input: { query: string; pageToken?: string }): Promise<{ messages: Mail[]; nextPageToken?: string; cached?: boolean }>
  readMail(id: string): Promise<Mail>
  translateMail(id: string): Promise<string>
  testAI(): Promise<string>
  digests(): Promise<Digest[]>
  summarize(): Promise<Digest>
  openExternal(url: string): Promise<void>
  onChanged(callback: () => void): () => void
}
