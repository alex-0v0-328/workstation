import { ImapFlow } from 'imapflow'
import { MessageError } from '../shared/i18n'

export interface RawMail { source: Buffer; internalDate: Date; unread: boolean }
export interface ImapAuth { user: string; pass: string }

export interface ImapLike {
  search(params: { text?: string; since?: Date; before?: Date }): Promise<number[]>
  fetchOne(uid: number): Promise<RawMail>
  close(): Promise<void>
}

export function mapImapError(e: unknown): Error {
  if (e instanceof MessageError) return e
  const detail = e as { authenticationFailed?: boolean; message?: string } | null
  if (detail?.authenticationFailed || /invalid credentials|authentication failed/i.test(detail?.message || '')) return new MessageError('remote.accessDenied')
  return e instanceof Error ? e : new MessageError('remote.syncFailed')
}

export async function openImap(auth: ImapAuth): Promise<ImapLike> {
  const client = new ImapFlow({ host: 'imap.gmail.com', port: 993, secure: true, auth, logger: false, socketTimeout: 90000, greetingTimeout: 30000 })
  try {
    await client.connect()
  } catch (e) { throw mapImapError(e) }
  const lock = await client.getMailboxLock('INBOX')
  let closed = false
  return {
    async search(params) {
      const query: { text?: string; since?: Date; before?: Date } = {}
      if (params.text) query.text = params.text
      if (params.since) query.since = params.since
      if (params.before) query.before = params.before
      const result = await client.search(query, { uid: true })
      return result || []
    },
    async fetchOne(uid) {
      const message = await client.fetchOne(String(uid), { source: true, internalDate: true, flags: true }, { uid: true })
      if (!message) throw new MessageError('remote.mailMissing')
      if (!message.source) throw new MessageError('remote.mailMissing')
      const internalDate = message.internalDate ? new Date(message.internalDate) : new Date()
      return { source: message.source, internalDate: Number.isNaN(internalDate.getTime()) ? new Date() : internalDate, unread: !message.flags?.has('\\Seen') }
    },
    async close() {
      if (closed) return
      closed = true
      lock.release()
      await client.logout().catch(() => {})
    }
  }
}
