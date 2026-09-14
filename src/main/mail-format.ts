import type { Mail } from '../shared/types'
interface Part { mimeType?: string; filename?: string; body?: { data?: string; size?: number }; parts?: Part[]; headers?: { name: string; value: string }[] }
export interface GmailMessage { id: string; threadId: string; internalDate: string; snippet?: string; labelIds?: string[]; payload?: Part }
export function decodeMail(input: GmailMessage): Mail {
  const headers = input.payload?.headers || []
  const header = (name: string) => headers.find(h => h.name.toLowerCase() === name)?.value || ''
  const plain: string[] = [], html: string[] = [], attachments: Mail['attachments'] = []
  const walk = (part: Part) => {
    if (part.filename) { attachments.push({ name: part.filename, size: part.body?.size || 0 }); return }
    if (part.body?.data) {
      const value = Buffer.from(part.body.data, 'base64url').toString('utf8')
      if (part.mimeType === 'text/plain') plain.push(value)
      if (part.mimeType === 'text/html') html.push(value)
    }
    part.parts?.forEach(walk)
  }
  if (input.payload) walk(input.payload)
  return { id: input.id, threadId: input.threadId, subject: header('subject') || '（无主题）', from: header('from'), date: new Date(Number(input.internalDate)).toISOString(), snippet: input.snippet || '', text: plain.join('\n'), html: html.join('\n'), unread: !!input.labelIds?.includes('UNREAD'), attachments }
}
export function splitText(text: string, limit: number): string[] {
  const parts: string[] = []
  for (let i = 0; i < text.length; i += limit) parts.push(text.slice(i, i + limit))
  return parts.length ? parts : ['（无正文）']
}
