import { useEffect, useState, type ReactNode } from 'react'
import { Button, Badge } from '@fluentui/react-components'
import { ArrowDownload20Regular, ArrowUpload20Regular, PlugConnected20Regular, ShieldCheckmark20Regular, ChevronDown20Regular, ChevronRight20Regular } from '@fluentui/react-icons'
import { SectionTitle, Field, TextField, SaveButton, readForm, str } from './components'
import { useModel } from './model'
import type { Connection, Workspace } from '../../shared/types'
import { languages, type Language } from '../../shared/i18n'
import { version } from '../../../package.json'

function Collapsible({ id, title, badge, children }: { id: string; title: string; badge?: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(() => localStorage.getItem(`settings:section:${id}`) !== '0')
  const toggle = () => setOpen(value => { localStorage.setItem(`settings:section:${id}`, value ? '0' : '1'); return !value })
  return <section className="surface settings-section">
    <button className="settings-toggle" aria-expanded={open} onClick={toggle}>
      {badge ? <span className="section-header"><h2>{title}</h2>{badge}</span> : <h2>{title}</h2>}
      {open ? <ChevronDown20Regular className="chevron" /> : <ChevronRight20Regular className="chevron" />}
    </button>
    {open && children}
  </section>
}

export function SettingsView() {
  const { state, run, t } = useModel()
  const [connection, setConnection] = useState<Connection | null>(null)
  useEffect(() => { void run(async () => setConnection(await window.workstation.connection())) }, [])
  return <>
    <SectionTitle title={t('settings.heading')} />
    <div className="settings-grid">
      <AppearanceSection state={state} />
      <GmailSection connection={connection} setConnection={setConnection} />
      <AssistantSection state={state} connection={connection} setConnection={setConnection} />
      <ProfileSection />
    </div>
  </>
}

function AppearanceSection({ state }: { state: Workspace }) {
  const { mutate, run, busy, themeState, setThemeState, t } = useModel()
  const activeManifest = themeState?.themes.find(x => x.id === state.settings.theme)
  return <Collapsible id="appearance" title={t('settings.appearance')}>
    <div className="field"><span>{t('settings.language')}</span><select aria-label={t('settings.language')} value={state.settings.language} onChange={e => { const language = e.target.value as Language; void mutate(s => { s.settings.language = language }) }}>{languages.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}</select></div>
    <div className="field"><span>{t('settings.font')}</span><select aria-label={t('settings.font')} value={state.settings.font} onChange={e => { const font = e.target.value as typeof state.settings.font; void mutate(s => { s.settings.font = font }) }}><option value="">{t('settings.fontDefault')}</option><option value="pingfang">苹方 (PingFang SC)</option><option value="sfpro">SF Pro</option><option value="caskaydia">CaskaydiaCove Nerd Font</option></select></div>
    <div className="field"><span>{t('settings.theme')}</span><select aria-label={t('settings.theme')} value={state.settings.theme} disabled={!themeState} onChange={e => { const id = e.target.value; void mutate(s => { s.settings.theme = id; s.settings.variant = id === 'catppuccin' ? 'mocha' : '' }) }}>{themeState ? <><option value="windows">Windows 11</option>{themeState.themes.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</> : <option value={state.settings.theme}>{state.settings.theme}</option>}</select></div>
    {state.settings.theme !== 'windows' && activeManifest && activeManifest.variants.length > 1 && <div className="field"><span>{t('settings.variant')}</span><div className="flavor-row"><button className={`flavor-dot ${state.settings.variant === '' ? 'chosen' : ''}`} onClick={() => void mutate(s => { s.settings.variant = '' })}>{t('settings.followAppearance')}</button>{activeManifest.variants.map(v => <button key={v.id} className={`flavor-dot ${state.settings.variant === v.id ? 'chosen' : ''}`} onClick={() => void mutate(s => { s.settings.variant = v.id })}><i style={{ background: v.accent }} />{v.name}</button>)}</div></div>}
    {state.settings.theme === 'windows' && <><div className="field"><span>{t('settings.appearanceMode')}</span><select value={state.settings.appearance} onChange={e => { const appearance = e.target.value as typeof state.settings.appearance; void mutate(s => { s.settings.appearance = appearance }) }}><option value="system">{t('settings.modeSystem')}</option><option value="light">{t('settings.modeLight')}</option><option value="dark">{t('settings.modeDark')}</option></select></div><div className="theme-previews"><button className={`theme-preview swatch-light ${state.settings.appearance === 'light' ? 'chosen' : ''}`} onClick={() => void mutate(s => { s.settings.appearance = 'light' })}><div><i /><span><b /><b /><b /></span></div><strong>{t('settings.modeLight')}</strong></button><button className={`theme-preview swatch-dark ${state.settings.appearance === 'dark' ? 'chosen' : ''}`} onClick={() => void mutate(s => { s.settings.appearance = 'dark' })}><div><i /><span><b /><b /><b /></span></div><strong>{t('settings.modeDark')}</strong></button></div></>}
    <div className="actions"><Button onClick={() => void run(async () => { const next = await window.workstation.installTheme(); if (next) setThemeState(next) }, t('settings.themeInstalled'))}>{t('settings.installTheme')}</Button>{state.settings.theme !== 'windows' && <Button disabled={busy} onClick={() => void run(async () => { const next = await window.workstation.removeTheme(state.settings.theme); setThemeState(next) }, t('settings.themeRemoved'))}>{t('settings.remove')}</Button>}</div>
    {!!themeState?.examples.length && <div className="field"><span>{t('settings.examples')}</span><div className="theme-list">{themeState.examples.map(ex => <div key={ex.id} className="theme-row example-row"><div><strong>{ex.name}</strong><small>{ex.description}</small></div><Button size="small" onClick={() => void run(async () => { const next = await window.workstation.installExampleTheme(ex.id); setThemeState(next) }, t('settings.exampleInstalled', { name: ex.name }))}>{t('settings.install')}</Button></div>)}</div></div>}
    <form onSubmit={async e => { const f = readForm(e); await mutate(s => { s.settings.timezone = str(f, 'timezone'); s.settings.notifications = f.has('notifications'); s.settings.startAtLogin = f.has('login'); s.settings.closeToTray = f.has('closeToTray') }) }}><TextField label={t('settings.appTimezone')} name="timezone" value={state.settings.timezone} required /><label className="check-label"><input type="checkbox" name="notifications" defaultChecked={state.settings.notifications} />{t('settings.notifications')}</label><label className="check-label"><input type="checkbox" name="closeToTray" defaultChecked={state.settings.closeToTray} />{t('settings.closeToTray')}</label><label className="check-label"><input type="checkbox" name="login" defaultChecked={state.settings.startAtLogin} />{t('settings.loginItem')}</label><div className="form-actions"><SaveButton label={t('settings.saveDesktop')} /></div></form>
  </Collapsible>
}

function GmailSection({ connection, setConnection }: { connection: Connection | null; setConnection(c: Connection): void }) {
  const { run, reload, busy, t } = useModel()
  const connected = !!connection?.email && !!connection?.hasPassword
  return <Collapsible id="gmail" title={t('settings.gmailHeading')} badge={<Badge appearance="tint" color={connected ? 'success' : 'subtle'}>{connected ? t('settings.connected') : t('settings.notConnected')}</Badge>}>
    <p className="muted">{t('settings.gmailDesc')}</p><p className="muted">{t('settings.gmailImapHint')}</p>
    {connection?.email && <p className="info-note">{connection.email}</p>}{connection?.lastError && <p className="error-note">{t.has(connection.lastError) ? t.text(connection.lastError) : connection.lastError}</p>}
    <form onSubmit={e => { const f = readForm(e); void run(async () => { setConnection(await window.workstation.saveSecrets({ email: str(f, 'email'), appPassword: str(f, 'appPassword') })) }, t('settings.mailboxSaved')) }}><TextField key={connection?.email || 'blank'} label={t('settings.gmailAddress')} name="email" value={connection?.email || ''} required placeholder={t('settings.gmailAddressPh')} /><TextField label={t('settings.appPassword')} name="appPassword" type="password" placeholder={connection?.hasPassword ? t('settings.appPasswordPh') : 'xxxx xxxx xxxx xxxx'} /><div className="form-actions"><SaveButton label={t('settings.saveMailbox')} /></div></form>
    <div className="actions"><Button icon={<PlugConnected20Regular />} appearance="primary" disabled={busy || !connected} onClick={() => void run(async () => setConnection(await window.workstation.connectGmail()), t('settings.gmailConnected'))}>{t('settings.connectMailbox')}</Button>{connection?.email && <Button disabled={busy} onClick={() => void run(async () => { setConnection(await window.workstation.disconnectGmail()); await reload() }, t('settings.disconnected'))}>{t('settings.disconnect')}</Button>}</div>
    <p className="muted">{t('settings.disconnectNote')}</p><Button appearance="subtle" onClick={() => void run(() => window.workstation.openExternal('https://myaccount.google.com/apppasswords'))}>{t('settings.openAppPasswords')}</Button>
  </Collapsible>
}

function AssistantSection({ state, connection, setConnection }: { state: Workspace; connection: Connection | null; setConnection(c: Connection): void }) {
  const { mutate, run, busy, t } = useModel()
  return <Collapsible id="assistant" title={t('settings.aiHeading')} badge={<Badge appearance="tint" color={connection?.hasKey ? 'success' : 'subtle'}>{connection?.hasKey ? t('settings.keySaved') : t('settings.keyMissing')}</Badge>}>
    <form onSubmit={e => { const f = readForm(e); const form = e.currentTarget; void run(async () => { setConnection(await window.workstation.saveSecrets({ apiKey: str(f, 'apiKey') })); form.reset() }, t('settings.apiKeySaved')) }}><TextField label="API key" name="apiKey" type="password" placeholder={t('settings.apiKeyPh')} /><div className="form-actions"><Button disabled={busy || !connection?.hasKey} onClick={() => void run(async () => { await window.workstation.testAI() }, t('settings.testOk'))}>{t('settings.testConnection')}</Button><SaveButton label={t('settings.saveApiKey')} /></div></form>
    <form onSubmit={async e => { const f = readForm(e); await mutate(s => { s.settings.model = str(f, 'model'); s.settings.digestTime = str(f, 'time'); s.settings.digestEnabled = f.has('enabled') }) }}><Field label={t('settings.modelName')}><input name="model" defaultValue={state.settings.model} list="deepseek-models" required /></Field><datalist id="deepseek-models"><option value="deepseek-flash" /><option value="deepseek-v4-pro" /></datalist><TextField label={t('settings.digestTime')} name="time" value={state.settings.digestTime} type="time" required /><label className="check-label"><input type="checkbox" name="enabled" defaultChecked={state.settings.digestEnabled} />{t('settings.digestEnable')}</label><div className="info-note">{t('settings.digestNote')}</div><div className="form-actions"><SaveButton label={t('settings.saveAi')} /></div></form>
  </Collapsible>
}

function ProfileSection() {
  const { run, reload, busy, t } = useModel()
  return <Collapsible id="profile" title={t('settings.profileHeading')}>
    <p className="muted">{t('settings.profileDesc')}</p>
    <div className="backup-banner"><ShieldCheckmark20Regular /><div><strong>{t('settings.profileBanner')}</strong><p>{t('settings.profileBannerBody')}</p></div></div>
    <div className="actions"><Button icon={<ArrowDownload20Regular />} disabled={busy} onClick={() => void run(async () => { const path = await window.workstation.exportBackup(); if (!path) return }, t('settings.profileExported'))}>{t('settings.exportProfile')}</Button><Button icon={<ArrowUpload20Regular />} disabled={busy} onClick={() => void run(async () => { await window.workstation.restoreBackup(); await reload() })}>{t('settings.importProfile')}</Button></div>
    <p className="muted">{t('settings.profileNote')}</p>
    <div className="settings-about"><strong>Workstation</strong><span>{version} · {t('shell.local')}</span><Button appearance="subtle" onClick={() => void run(() => window.workstation.openExternal('https://github.com/alex-0v0-328/workstation'))}>{t('settings.projectLink')}</Button></div>
  </Collapsible>
}
