import { describe, it, expect, vi, afterEach } from 'vitest'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { rmSync } from 'node:fs'
import { emptyWorkspace } from '../src/shared/domain'
import type { Store } from '../src/main/store'
import type { ImapLike } from '../src/main/imap'
vi.mock('electron', () => ({ safeStorage: { isEncryptionAvailable: () => true, encryptString: (value: string) => Buffer.from(value), decryptString: (value: Buffer) => value.toString() } }))
import { Providers } from '../src/main/providers'

interface FakeMail { uid: number; raw: Buffer; internalDate: Date }
const rawMail = (subject: string, text: string) => Buffer.from(['MIME-Version: 1.0', `Subject: ${subject}`, 'From: Sender <sender@example.com>', `Message-ID: <${subject}@example.com>`, 'Content-Type: text/plain; charset=utf-8', 'Content-Transfer-Encoding: 8bit', '', text].join('\r\n'))
const dayFloor = (d: Date) => new Date(new Date(d).setUTCHours(0, 0, 0, 0))

function fakeImap(mails: FakeMail[]) {
  return async (): Promise<ImapLike> => ({
    async search(params) {
      return mails.filter(m => (!params.since || m.internalDate >= dayFloor(params.since)) && (!params.before || m.internalDate < dayFloor(params.before))).map(m => m.uid)
    },
    async fetchOne(uid) {
      const mail = mails.find(m => m.uid === uid)
      if (!mail) throw new Error('remote.mailMissing')
      return { source: mail.raw, internalDate: mail.internalDate, unread: true }
    },
    async close() {}
  })
}

function harness(mails: FakeMail[] = []) {
  const state = emptyWorkspace()
  state.settings.digestSince = '2026-09-14T00:00:00Z'
  const cache = new Map<string, unknown>()
  const fake = {
    load: () => structuredClone(state),
    save: (value: typeof state) => Object.assign(state, value),
    get: (key: string, fallback: unknown) => cache.has(key) ? structuredClone(cache.get(key)) : fallback,
    set: (key: string, value: unknown) => cache.set(key, structuredClone(value)),
    clearPrefix: (prefix: string) => { for (const key of [...cache.keys()]) if (key.startsWith(prefix)) cache.delete(key) },
    prunePrefix: (prefix: string, maxAgeMs: number, now = Date.now()) => {
      let removed = 0
      for (const [key, value] of [...cache.entries()]) {
        if (!key.startsWith(prefix)) continue
        const at = (value as { at?: unknown } | null)?.at
        if (typeof at !== 'number' || at < now - maxAgeMs) { cache.delete(key); removed++ }
      }
      return removed
    }
  }
  const secretPath = join(tmpdir(), `workstation-test-secrets-${process.pid}-${Math.random().toString(16).slice(2)}.bin`)
  const providers = new Providers(fake as unknown as Store, secretPath, () => {}, fakeImap(mails))
  Object.assign(providers as any, { secrets: { apiKey: 'test', email: 'example@example.test', appPassword: 'pw' } })
  return { providers, state, cache, secretPath }
}
afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers() })

describe('mailbox credentials', () => {
  it('stores an app password without spaces and refuses account switches until disconnect', () => {
    const { providers, secretPath } = harness()
    Object.assign(providers as any, { secrets: {} })
    providers.configure({ email: ' User@Example.com ', appPassword: 'abcd efgh ijkl mnop' })
    expect(providers.status()).toMatchObject({ email: 'user@example.com', hasPassword: true, hasKey: false })
    expect((providers as any).secrets.appPassword).toBe('abcdefghijklmnop')
    expect(() => providers.configure({ email: 'other@example.com' })).toThrow()
    providers.disconnect()
    expect(providers.status()).toMatchObject({ email: '', hasPassword: false })
    rmSync(secretPath, { force: true })
  })
  it('rejects a connection attempt without mailbox credentials and invalid mail ids', async () => {
    const { providers } = harness()
    Object.assign(providers as any, { secrets: {} })
    await expect(providers.connect()).rejects.toThrow('remote.needMailbox')
    await expect(providers.read('not-a-uid')).rejects.toThrow('remote.mailIdInvalid')
  })
})
describe('daily digest checkpoint integrity', () => {
  it('does not mark an email arriving after the upper boundary as summarized', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] }); vi.setSystemTime(new Date('2026-09-14T10:00:00Z'))
    const { providers, state } = harness([{ uid: 7, raw: rawMail('future', 'Future'), internalDate: new Date('2026-09-14T10:00:00.500Z') }])
    const digest = await providers.summarize('manual')
    expect(digest.entries).toHaveLength(0)
    expect(state.settings.digestSince).toBe('2026-09-14T10:00:00.000Z')
  })
  it('keeps a failed email pending and retries only unsuccessful model calls', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] }); vi.setSystemTime(new Date('2026-09-14T10:00:00Z'))
    const { providers, state } = harness([
      { uid: 1, raw: rawMail('a', 'a'), internalDate: new Date('2026-09-14T02:00:00Z') },
      { uid: 2, raw: rawMail('b', 'b'), internalDate: new Date('2026-09-14T02:00:00Z') }
    ])
    let failed = false, aiCalls = 0
    vi.stubGlobal('fetch', vi.fn(async (_url: string, options?: RequestInit) => {
      aiCalls++
      if (!failed && String(options?.body).includes('\\"emailContent\\":\\"b\\"')) { failed = true; return new Response('', { status: 429 }) }
      return Response.json({ choices: [{ message: { content: '摘要' } }] })
    }))
    expect((await providers.summarize('manual')).state).toBe('partial')
    expect(state.settings.digestSince).toBe('2026-09-14T00:00:00Z')
    expect((await providers.summarize('manual')).state).toBe('done')
    expect(aiCalls).toBe(3)
    expect(state.settings.digestSince).toBe('2026-09-14T10:00:00.000Z')
    vi.unstubAllGlobals()
  })
  it('re-covers the whole manual window on repeated runs without new model calls', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] }); vi.setSystemTime(new Date('2026-09-14T10:00:00Z'))
    const { providers, state } = harness([{ uid: 1, raw: rawMail('a', 'a'), internalDate: new Date('2026-09-14T02:00:00Z') }])
    let aiCalls = 0
    vi.stubGlobal('fetch', vi.fn(async () => { aiCalls++; return Response.json({ choices: [{ message: { content: '摘要' } }] }) }))
    const first = await providers.summarize('manual')
    expect(first.state).toBe('done')
    expect(first.entries).toHaveLength(1)
    const second = await providers.summarize('manual')
    expect(second.id).not.toBe(first.id)
    expect(second.entries).toHaveLength(1)
    expect(aiCalls).toBe(1)
    expect(state.settings.digestSince).toBe('2026-09-14T10:00:00.000Z')
    vi.unstubAllGlobals()
  })
  it('auto digest covers yesterday’s slot to today’s slot', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] }); vi.setSystemTime(new Date('2026-09-14T20:30:00Z'))
    const { providers, state } = harness([
      { uid: 1, raw: rawMail('old', 'old'), internalDate: new Date('2026-09-13T10:00:00Z') },
      { uid: 2, raw: rawMail('inside', 'inside'), internalDate: new Date('2026-09-14T10:00:00Z') }
    ])
    state.settings.timezone = 'UTC'
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ choices: [{ message: { content: '摘要' } }] })))
    const digest = await providers.summarize('auto')
    expect(digest.state).toBe('done')
    expect(digest.since).toBe('2026-09-13T20:00:00.000Z')
    expect(digest.until).toBe('2026-09-14T20:00:00.000Z')
    expect(digest.entries.map(e => e.mailId)).toEqual(['2'])
    vi.unstubAllGlobals()
  })
})
describe('cache pruning', () => {
  it('removes expired and legacy mail/ai cache entries while keeping fresh ones', () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] }); vi.setSystemTime(new Date('2026-09-18T00:00:00Z'))
    const { providers, cache } = harness()
    const now = Date.now(), day = 24 * 3600 * 1000
    cache.set('mail:body:stale', { at: now - 31 * day, value: { id: 'stale' } })
    cache.set('mail:body:fresh', { at: now - day, value: { id: 'fresh' } })
    cache.set('mail:body:edge', { at: now - 30 * day, value: { id: 'edge' } })
    cache.set('mail:body:legacy', { id: 'legacy' })
    cache.set('mail:list::0', { at: now - 31 * day, value: { messages: [] } })
    cache.set('ai:summary:model:a:hash', { at: now - 31 * day, value: '摘要' })
    cache.set('ai:summary:model:b:hash', { at: now - day, value: '摘要' })
    cache.set('digest:history', [])
    const removed = providers.pruneCaches()
    expect(removed).toBe(4)
    expect(cache.has('mail:body:stale')).toBe(false)
    expect(cache.has('mail:body:legacy')).toBe(false)
    expect(cache.has('mail:list::0')).toBe(false)
    expect(cache.has('ai:summary:model:a:hash')).toBe(false)
    expect(cache.has('mail:body:fresh')).toBe(true)
    expect(cache.has('mail:body:edge')).toBe(true)
    expect(cache.has('ai:summary:model:b:hash')).toBe(true)
    expect(cache.has('digest:history')).toBe(true)
  })
  it('truncates digest history to the most recent 90 entries', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] }); vi.setSystemTime(new Date('2026-09-14T10:00:00Z'))
    const { providers, cache } = harness()
    cache.set('digest:history', Array.from({ length: 95 }, (_, i) => ({ id: `old-${i}`, created: '2026-09-01T00:00:00Z', until: '2026-09-01T00:00:00Z', state: 'done', entries: [] })))
    const digest = await providers.summarize('manual')
    expect(digest.state).toBe('done')
    const history = cache.get('digest:history') as { id: string }[]
    expect(history).toHaveLength(90)
    expect(history[0].id).toBe(digest.id)
  })
})
