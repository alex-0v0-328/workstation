import { simpleParser } from 'mailparser'
import type { Mail } from '../shared/types'
import { zhCN } from '../shared/i18n/zh-CN'

export async function parseRawMail(id: string, raw: Buffer, meta: { internalDate: Date; unread: boolean }, labels?: { noSubject?: string }): Promise<Mail> {
  const parsed = await simpleParser(raw)
  const text = parsed.text || ''
  return {
    id,
    threadId: (parsed.messageId || '').replace(/[<>]/g, ''),
    subject: parsed.subject || labels?.noSubject || zhCN.mail.noSubject,
    from: parsed.from?.text || '',
    date: meta.internalDate.toISOString(),
    snippet: text.replace(/\s+/g, ' ').trim().slice(0, 160),
    text,
    html: typeof parsed.html === 'string' ? parsed.html : '',
    unread: meta.unread,
    attachments: parsed.attachments.map(a => ({ name: a.filename || 'attachment', size: a.size || 0 }))
  }
}

export function splitText(text: string, limit: number): string[] {
  const parts: string[] = []
  for (let i = 0; i < text.length; i += limit) parts.push(text.slice(i, i + limit))
  return parts.length ? parts : ['（无正文）']
}
