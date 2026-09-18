import { describe, it, expect, vi, afterEach } from 'vitest'
import { emptyWorkspace } from '../src/shared/domain'
import type { Store } from '../src/main/store'
vi.mock('electron', () => ({ safeStorage: {}, shell: {} }))
import { Providers } from '../src/main/providers'

function harness() {
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
  const providers = new Providers(fake as unknown as Store, 'test-file-does-not-exist', () => {})
  Object.assign(providers as any, { secrets: { apiKey: 'test', email: 'example@example.test', accessToken: 'test', expiresAt: Date.now() + 3600000 } })
  return { providers, state, cache }
}
afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers() })
describe('daily digest checkpoint integrity', () => {
  it('does not mark an email arriving after the upper boundary as summarized', async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-09-14T10:00:00Z'))
    const { providers, state } = harness()
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.includes('messages?')) return Response.json({ messages: [{ id: 'future' }] })
      if (url.includes('/messages/future')) return Response.json({ id: 'future', threadId: 't', internalDate: String(Date.parse('2026-09-14T10:00:00.500Z')), payload: { mimeType: 'text/plain', body: { data: Buffer.from('Future').toString('base64url') } } })
      throw new Error('Unexpected request')
    }))
    const digest = await providers.summarize()
    expect(digest.entries).toHaveLength(0)
    expect(state.settings.digestSince).toBe('2026-09-14T10:00:00.000Z')
    vi.unstubAllGlobals()
  })
  it('keeps a failed email pending and retries only unsuccessful model calls', async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-09-14T10:00:00Z'))
    const { providers, state } = harness()
    let failed = false, aiCalls = 0
    vi.stubGlobal('fetch', vi.fn(async (url: string, options?: RequestInit) => {
      if (url.includes('messages?')) return Response.json({ messages: [{ id: 'a' }, { id: 'b' }] })
      if (url.includes('/messages/')) { const id = url.includes('/a?') ? 'a' : 'b'; return Response.json({ id, threadId: id, internalDate: String(Date.parse('2026-09-14T02:00:00Z')), payload: { mimeType: 'text/plain', body: { data: Buffer.from(id).toString('base64url') } } }) }
      aiCalls++
      if (!failed && String(options?.body).includes('\\"emailContent\\":\\"b\\"')) { failed = true; return new Response('', { status: 429 }) }
      return Response.json({ choices: [{ message: { content: '摘要' } }] })
    }))
    expect((await providers.summarize()).state).toBe('partial')
    expect(state.settings.digestSince).toBe('2026-09-14T00:00:00Z')
    expect((await providers.summarize()).state).toBe('done')
    expect(aiCalls).toBe(3)
    expect(state.settings.digestSince).toBe('2026-09-14T10:00:00.000Z')
    vi.unstubAllGlobals()
  })
})
describe('cache pruning', () => {
  it('removes expired and legacy mail/ai cache entries while keeping fresh ones', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-09-18T00:00:00Z'))
    const { providers, cache } = harness()
    const now = Date.now(), day = 24 * 3600 * 1000
    cache.set('mail:body:stale', { at: now - 31 * day, value: { id: 'stale' } })
    cache.set('mail:body:fresh', { at: now - day, value: { id: 'fresh' } })
    cache.set('mail:body:edge', { at: now - 30 * day, value: { id: 'edge' } })
    cache.set('mail:body:legacy', { id: 'legacy' })
    cache.set('mail:list:in:inbox', { at: now - 31 * day, value: { messages: [] } })
    cache.set('ai:summary:model:a:hash', { at: now - 31 * day, value: '摘要' })
    cache.set('ai:summary:model:b:hash', { at: now - day, value: '摘要' })
    cache.set('digest:history', [])
    const removed = providers.pruneCaches()
    expect(removed).toBe(4)
    expect(cache.has('mail:body:stale')).toBe(false)
    expect(cache.has('mail:body:legacy')).toBe(false)
    expect(cache.has('mail:list:in:inbox')).toBe(false)
    expect(cache.has('ai:summary:model:a:hash')).toBe(false)
    expect(cache.has('mail:body:fresh')).toBe(true)
    expect(cache.has('mail:body:edge')).toBe(true)
    expect(cache.has('ai:summary:model:b:hash')).toBe(true)
    expect(cache.has('digest:history')).toBe(true)
  })
  it('truncates digest history to the most recent 90 entries', async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-09-14T10:00:00Z'))
    const { providers, cache } = harness()
    cache.set('digest:history', Array.from({ length: 95 }, (_, i) => ({ id: `old-${i}`, created: '2026-09-01T00:00:00Z', until: '2026-09-01T00:00:00Z', state: 'done', entries: [] })))
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.includes('messages?')) return Response.json({})
      throw new Error('Unexpected request')
    }))
    const digest = await providers.summarize()
    expect(digest.state).toBe('done')
    const history = cache.get('digest:history') as { id: string }[]
    expect(history).toHaveLength(90)
    expect(history[0].id).toBe(digest.id)
    vi.unstubAllGlobals()
  })
})
