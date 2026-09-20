import { zhCN, type Messages } from './zh-CN'
import { zhTW } from './zh-TW'
import { enUS } from './en-US'

export type { Messages } from './zh-CN'
export type Language = 'zh-CN' | 'zh-TW' | 'en-US'

export const languages: { id: Language; label: string }[] = [
  { id: 'zh-CN', label: zhCN.meta.label },
  { id: 'zh-TW', label: zhTW.meta.label },
  { id: 'en-US', label: enUS.meta.label }
]

export function isLanguage(value: unknown): value is Language {
  return value === 'zh-CN' || value === 'zh-TW' || value === 'en-US'
}

export function resolveMessages(language: unknown): Messages {
  if (language === 'zh-TW') return zhTW
  if (language === 'en-US') return enUS
  return zhCN
}

export type MessageParams = Record<string, string | number>

type Leaves<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : T[K] extends readonly string[] ? `${Prefix}${K}` : Leaves<T[K], `${Prefix}${K}.`>
}[keyof T & string]

export type MessageId = Leaves<Messages>

export function formatMessage(template: string, params?: MessageParams): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (raw, key: string) => (key in params ? String(params[key]) : raw))
}

function lookup(messages: Messages, id: string): string | undefined {
  let node: unknown = messages
  for (const part of id.split('.')) {
    if (!node || typeof node !== 'object' || !(part in node)) return undefined
    node = (node as Record<string, unknown>)[part]
  }
  return typeof node === 'string' ? node : undefined
}

export interface TFunction {
  (id: MessageId, params?: MessageParams): string
  has(id: string): boolean
  text(id: string, params?: MessageParams): string
}

export function createT(messages: Messages): TFunction {
  const t = (id: MessageId, params?: MessageParams): string => {
    let raw = lookup(messages, id)
    if (params && Number(params.count) === 1) raw = lookup(messages, `${id}_one`) ?? raw
    return raw === undefined ? id : formatMessage(raw, params)
  }
  t.has = (id: string) => lookup(messages, id) !== undefined
  t.text = (id: string, params?: MessageParams) => {
    const raw = lookup(messages, id)
    return raw === undefined ? id : formatMessage(raw, params)
  }
  return t
}

// Validation and provider layers throw these; IPC and view boundaries translate them.
export class MessageError extends Error {
  readonly params?: MessageParams
  constructor(readonly id: MessageId, params?: MessageParams) {
    super(id)
    this.name = 'MessageError'
    this.params = params
  }
}

const keyPattern = /[a-z]+\.[a-zA-Z][a-zA-Z0-9]*/g

export function localizeError(error: unknown, t: TFunction): string {
  if (error instanceof MessageError) return t(error.id, error.params)
  const raw = error instanceof Error ? error.message : String(error)
  return raw.replace(keyPattern, token => (t.has(token) ? t.text(token) : token))
}
