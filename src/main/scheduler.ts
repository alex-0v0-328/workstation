import { Notification } from 'electron'
import { DateTime } from 'luxon'
import { aggregateTodos, reminderCandidates, dueDigestSlot } from '../shared/domain'
import { mt } from './i18n'
import type { Store } from './store'
import type { Providers } from './providers'
import type { Workspace } from '../shared/types'

export function createScheduler(deps: { store: Store; providers: Providers; syncCalendars(): Promise<Workspace>; changed(): void; notify(title: string, body: string): void }): () => Promise<void> {
  let ticking = false
  return async function tick() {
    if (ticking) return
    ticking = true
    const { store, providers } = deps
    try {
      try { providers.pruneCaches() } catch (e) { providers.lastError = e instanceof Error ? e.message : 'remote.cachePruneFailed' }
      const state = store.load(), now = DateTime.now().setZone(state.settings.timezone)
      if (state.settings.notifications) {
        const sent = store.get<Record<string, boolean>>('reminder:sent', {})
        const reminders = reminderCandidates(aggregateTodos(state), now.toJSDate(), state.settings.timezone, sent)
        if (reminders.length && Notification.isSupported()) {
          deps.notify(mt('remote.reminderTitle'), reminders.slice(0, 4).map(r => r.item.title).join('、') + (reminders.length > 4 ? mt('remote.reminderMore', { count: reminders.length }) : ''))
          for (const r of reminders) for (const key of r.keys) sent[key] = true
          store.set('reminder:sent', sent)
        }
      }
      if (Date.now() - store.get<number>('calendar:checked', 0) > 3600000) { await deps.syncCalendars(); store.set('calendar:checked', Date.now()) }
      const lastDate = store.get<string>('digest:lastDate', '')
      const slot = dueDigestSlot(now, state.settings.digestTime, state.settings.digestSince, lastDate)
      if (state.settings.digestEnabled && slot && Date.now() - store.get<number>('digest:lastAttempt', 0) > 900000) {
        store.set('digest:lastAttempt', Date.now())
        const digest = await providers.summarize('auto')
        if (digest.state === 'done') {
          const completedSlot = dueDigestSlot(DateTime.fromISO(digest.until).setZone(state.settings.timezone), state.settings.digestTime, state.settings.digestSince, '')
          if (completedSlot && completedSlot > lastDate) store.set('digest:lastDate', completedSlot)
        }
        if (state.settings.notifications) deps.notify(digest.state === 'done' ? mt('remote.digestDoneTitle') : mt('remote.digestRetryTitle'), mt('remote.digestBody', { count: digest.entries.length }))
      }
    } catch (e) { providers.lastError = e instanceof Error ? e.message : 'remote.backgroundFailed'; deps.changed() }
    finally { ticking = false }
  }
}
