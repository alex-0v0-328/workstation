import { createT, resolveMessages, type MessageId, type MessageParams, type Messages, type TFunction } from '../shared/i18n'

let current: Messages = resolveMessages('zh-CN')
let t: TFunction = createT(current)

export function setMainLanguage(language: unknown): void {
  current = resolveMessages(language)
  t = createT(current)
}

export function mainMessages(): Messages {
  return current
}

export function mt(id: MessageId, params?: MessageParams): string {
  return t(id, params)
}

export function mainT(): TFunction {
  return t
}
