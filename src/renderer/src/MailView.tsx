import { useEffect, useState, useRef, Fragment } from 'react'
import { Button, Badge, Spinner } from '@fluentui/react-components'
import { Mail32Regular, ArrowSync20Regular, Translate20Regular, Open20Regular, Sparkle20Regular, Search20Regular, ChevronDown20Regular, ChevronRight20Regular } from '@fluentui/react-icons'
import DOMPurify from 'dompurify'
import { DateTime } from 'luxon'
import type { Mail, Digest, Connection } from '../../shared/types'
import { useModel, formatDate } from './model'
import { Empty, SectionTitle } from './components'

export function MailView() {
  const { run, setPage, state, busy, messages, t } = useModel()
  const [connection, setConnection] = useState<Connection | null>(null), [messagesList, setMessages] = useState<Mail[]>([]), [mail, setMail] = useState<Mail | null>(null), [query, setQuery] = useState(''), [pageToken, setPageToken] = useState<string>(), [cached, setCached] = useState(false), [tab, setTab] = useState('inbox'), [digests, setDigests] = useState<Digest[]>([]), [translation, setTranslation] = useState(''), [translated, setTranslated] = useState(false), [reading, setReading] = useState(false), [openDigest, setOpenDigest] = useState<string | null>(null)
  const request = useRef(0)
  const [dayToggle, setDayToggle] = useState<Record<string, boolean>>({})
  const list = async (more = false) => {
    if (!more) {
      const snap = await window.workstation.listMail({ query, cachedOnly: true })
      if (snap.hit) { setMessages(snap.messages); setPageToken(snap.nextPageToken); setCached(true) }
    }
    const result = await window.workstation.listMail({ query, pageToken: more ? pageToken : undefined })
    setMessages(previous => more ? [...new Map([...previous, ...result.messages].map(m => [m.id, m])).values()] : result.messages)
    setPageToken(result.nextPageToken); setCached(!!result.cached)
  }
  useEffect(() => { void run(async () => { const c = await window.workstation.connection(); setConnection(c); setDigests(await window.workstation.digests()); if (c.email) await list() }) }, [])
  const read = async (id: string) => {
    const revision = ++request.current; setReading(true); setTranslation(''); setTranslated(false); setMail(null)
    try { const result = await run(() => window.workstation.readMail(id)); if (request.current === revision && result) setMail(result) } finally { if (request.current === revision) setReading(false) }
  }
  const html = mail?.html ? DOMPurify.sanitize(mail.html, { FORBID_TAGS: ['script', 'style', 'form', 'input', 'button', 'iframe', 'object', 'embed', 'link', 'meta', 'base', 'img', 'svg', 'video', 'audio', 'source'], FORBID_ATTR: ['style', 'src', 'srcset', 'background', 'href', 'action', 'formaction'] }) : ''
  const digestStateLabel = (d: Digest) => d.state === 'done' ? t('mail.digestDone') : d.state === 'partial' ? t('mail.digestPartial') : t('mail.digestPending')
  const digestCard = (d: Digest) => <section className="surface digest"><div className="section-header"><h2>{formatDate(messages, d.created, state.settings.timezone)}</h2><Badge appearance="tint" color={d.state === 'done' ? 'success' : 'warning'}>{digestStateLabel(d)}</Badge></div><p className="muted">{t('mail.digestMeta', { count: d.entries.length })}</p>{!d.entries.length && <p>{t('mail.digestEmpty')}</p>}{d.entries.map(entry => <article key={entry.mailId}><h3>{entry.subject || t('mail.mailPending')}</h3><p className={entry.error ? 'warning-text' : 'preserve-text'}>{entry.error ? (t.has(entry.error) ? t.text(entry.error) : entry.error) : entry.summary || t('mail.entryWaiting')}</p><Button size="small" appearance="subtle" icon={<Open20Regular />} onClick={() => void run(() => window.workstation.openExternal(`https://mail.google.com/mail/u/${encodeURIComponent(connection!.email)}`))}>{t('mail.openOriginal')}</Button></article>)}</section>
  const today = DateTime.now().setZone(state.settings.timezone)
  const isToday = (d: Digest) => DateTime.fromISO(d.created).setZone(state.settings.timezone).hasSame(today, 'day')
  const todayDigests = digests.filter(isToday)
  const pastDigests = digests.filter(d => !isToday(d))
  const todayISO = today.toISODate()!
  const mailGroups: { day: string; items: Mail[] }[] = []
  if (!query.trim()) {
    const byDay = new Map<string, Mail[]>()
    for (const m of messagesList) {
      const day = DateTime.fromISO(m.date).setZone(state.settings.timezone).toISODate() || ''
      const group = byDay.get(day)
      if (group) group.push(m)
      else byDay.set(day, [m])
    }
    for (const [day, items] of byDay) mailGroups.push({ day, items })
  }
  const renderMail = (m: Mail) => <button key={m.id} className={`mail-item ${mail?.id === m.id ? 'selected' : ''} ${m.unread ? 'unread' : ''}`} onClick={() => void read(m.id)}><div><span>{m.from.replace(/<.*>/, '').replace(/"/g, '')}</span><small>{formatDate(messages, m.date, state.settings.timezone, 'date')}</small></div><strong>{m.subject}</strong><p>{m.snippet}</p></button>
  return <>
    <SectionTitle title={t('mail.heading')} subtitle={connection?.email || t('mail.subtitleFallback')} actions={<><Button icon={<ArrowSync20Regular />} disabled={!connection?.email || busy} onClick={() => void run(() => list())}>{t('mail.refresh')}</Button><Button appearance="primary" icon={<Sparkle20Regular />} disabled={!connection?.email || !connection.hasKey || busy} onClick={() => void run(async () => { await window.workstation.summarize('manual'); setDigests(await window.workstation.digests()); setTab('digest') })}>{t('mail.summarize')}</Button></>} />
    <div className="tabs" role="tablist" aria-label={t('mail.tabsAria')}><button role="tab" aria-selected={tab === 'inbox'} onClick={() => setTab('inbox')}>{t('mail.tabInbox')}</button><button role="tab" aria-selected={tab === 'digest'} onClick={() => { setTab('digest'); void run(async () => setDigests(await window.workstation.digests())) }}>{t('mail.tabDigest')}</button></div>
    {!connection?.email ? <section className="surface"><Empty icon={<Mail32Regular />} title={t('mail.connectTitle')} action={() => setPage('settings')} actionLabel={t('mail.connectAction')}>{t('mail.connectBody')}</Empty></section> : tab === 'digest' ? <div className="digest-list">{!digests.length && <section className="surface"><Empty icon={<Sparkle20Regular />} title={t('mail.digestEmptyTitle')}>{t('mail.digestEmptyBody')}</Empty></section>}{!!digests.length && <>
      <div className="group-header">{t('mail.digestToday')}</div>
      {todayDigests.length ? todayDigests.map(d => <Fragment key={d.id}>{digestCard(d)}</Fragment>) : <p className="inset muted">{t('mail.digestNoneToday')}</p>}
      {!!pastDigests.length && <>
        <div className="group-header">{t('mail.digestArchive')}</div>
        {pastDigests.map(d => {
          const open = openDigest === d.id
          return <Fragment key={d.id}>
            <button className="digest-archive-row" aria-expanded={open} onClick={() => setOpenDigest(open ? null : d.id)}>
              <strong>{formatDate(messages, d.created, state.settings.timezone, 'date')}</strong>
              <Badge appearance="tint" color={d.state === 'done' ? 'success' : 'warning'}>{digestStateLabel(d)}</Badge>
              <small>{t('mail.digestCount', { count: d.entries.length })}</small>
              {open ? <ChevronDown20Regular className="chevron" /> : <ChevronRight20Regular className="chevron" />}
            </button>
            {open && digestCard(d)}
          </Fragment>
        })}
      </>}
    </>}</div> : <section className="mail-layout surface"><div className="mail-sidebar"><form className="mail-search search" onSubmit={e => { e.preventDefault(); void run(() => list()) }}><Search20Regular /><input aria-label={t('mail.searchAria')} value={query} onChange={e => setQuery(e.target.value)} /><Button type="submit" size="small" appearance="subtle">{t('mail.search')}</Button></form>{cached && <p className="info-note">{t('mail.cacheNote')}</p>}<div className="mail-items">{query.trim() ? messagesList.map(renderMail) : mailGroups.map(group => { const open = dayToggle[group.day] ?? group.day >= todayISO; return <Fragment key={group.day}><button className="mail-day-row" aria-expanded={open} onClick={() => setDayToggle(d => ({ ...d, [group.day]: !open }))}><strong>{formatDate(messages, group.day, state.settings.timezone, 'date')}</strong><small>{t('mail.digestCount', { count: group.items.length })}</small>{open ? <ChevronDown20Regular className="chevron" /> : <ChevronRight20Regular className="chevron" />}</button>{open && group.items.map(renderMail)}</Fragment> })}{!messagesList.length && <p className="inset muted">{t('mail.noMatch')}</p>}{pageToken && <Button disabled={busy} onClick={() => void run(() => list(true))}>{t('mail.loadMore')}</Button>}</div></div><div className="mail-reader">{reading ? <Spinner label={t('mail.reading')} /> : !mail ? <Empty icon={<Mail32Regular />} title={t('mail.pickTitle')}>{t('mail.pickBody')}</Empty> : <><div className="reader-toolbar"><Button icon={<Translate20Regular />} disabled={!connection.hasKey || busy} onClick={() => void run(async () => { const revision = request.current; const result = await window.workstation.translateMail(mail.id); if (request.current === revision) { setTranslation(result); setTranslated(true) } })}>{translation ? t('mail.retranslate') : t('mail.translate')}</Button>{translation && <Button onClick={() => setTranslated(v => !v)}>{translated ? t('mail.viewOriginal') : t('mail.viewTranslation')}</Button>}<Button icon={<Open20Regular />} onClick={() => void run(() => window.workstation.openExternal(mail.threadId ? `https://mail.google.com/mail/u/${encodeURIComponent(connection.email)}/#search/rfc822msgid%3A${encodeURIComponent(mail.threadId)}` : `https://mail.google.com/mail/u/${encodeURIComponent(connection.email)}`))}>{t('mail.openInGmail')}</Button></div><h2>{mail.subject}</h2><p className="muted">{mail.from}<br />{formatDate(messages, mail.date, state.settings.timezone)}</p>{translated ? <div className="mail-body preserve-text">{translation}</div> : mail.text ? <div className="mail-body preserve-text">{mail.text}</div> : <div className="mail-body sanitized-mail" dangerouslySetInnerHTML={{ __html: html }} />}{!!mail.attachments.length && <div className="attachment-list"><h3>{t('mail.attachments')}</h3>{mail.attachments.map((a, i) => <p key={i}>{a.name} · {(a.size / 1024).toFixed(1)} KB</p>)}<small>{t('mail.attachmentNote')}</small></div>}</>}</div></section>}
  </>
}
