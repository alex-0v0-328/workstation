import { useEffect, useRef, useState, type ReactNode, type FormEvent } from 'react'
import { Button, Spinner } from '@fluentui/react-components'
import { Dismiss20Regular, Add20Regular } from '@fluentui/react-icons'
import { useModel } from './model'
import { DateTime } from 'luxon'

export function Panel({ title, children, close, wide = false, footer }: { title: string; children: ReactNode; close(): void; wide?: boolean; footer?: ReactNode }) {
  const { busy, feedback } = useModel()
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { const dialog = ref.current!; dialog.showModal(); return () => dialog.close() }, [])
  return <dialog ref={ref} className={`dialog native-panel ${wide ? 'wide' : ''}`} aria-label={title} onCancel={e => { e.preventDefault(); if (!busy) close() }}><header className="panel-heading"><h2>{title}</h2><Button appearance="subtle" aria-label="关闭" icon={<Dismiss20Regular />} onClick={close} disabled={busy} /></header>{feedback && <p className="error-note" role="alert">{feedback}</p>}<div className="panel-content">{children}</div>{footer && <footer>{footer}</footer>}</dialog>
}
export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) { return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label> }
export function TextField({ label, name, value = '', type = 'text', required = false, placeholder, hint, min, max }: { label: string; name: string; value?: string | number | null; type?: string; required?: boolean; placeholder?: string; hint?: string; min?: string | number; max?: string | number }) {
  return <Field label={label} hint={hint}><input name={name} type={type} defaultValue={value ?? ''} required={required} placeholder={placeholder} min={min} max={max} step={type === 'number' ? 'any' : undefined} /></Field>
}
export function DateField({ label, name, value = '', timezone }: { label: string; name: string; value?: string; timezone?: string }) {
  const [precision, setPrecision] = useState(value.length > 10 ? 'time' : 'date')
  const [date, setDate] = useState(value.length > 10 ? DateTime.fromISO(value, { zone: timezone }).toFormat("yyyy-MM-dd'T'HH:mm") : value)
  return <Field label={label}><div className="date-input"><input aria-label={label} name={name} type={precision === 'time' ? 'datetime-local' : 'date'} value={date} onChange={e => setDate(e.target.value)} /><select aria-label={`${label}精度`} value={precision} onChange={e => { setPrecision(e.target.value); setDate(e.target.value === 'date' ? date.slice(0, 10) : date.length === 10 ? date + 'T09:00' : date) }}><option value="date">仅日期</option><option value="time">精确时间</option></select></div><small>可留空待定；精确时间使用所属学期时区。</small></Field>
}
export function Empty({ icon, title, children, action, actionLabel }: { icon?: ReactNode; title: string; children: ReactNode; action?: () => void; actionLabel?: string }) { return <div className="empty"><div className="empty-icon">{icon}</div><h3>{title}</h3><p>{children}</p>{action && <Button appearance="primary" icon={<Add20Regular />} onClick={action}>{actionLabel}</Button>}</div> }
export function SaveButton({ label = '保存' }: { label?: string }) { const { busy } = useModel(); return <Button type="submit" appearance="primary" disabled={busy} icon={busy ? <Spinner size="tiny" /> : undefined}>{busy ? '正在处理…' : label}</Button> }
export const readForm = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); return new FormData(event.currentTarget) }
export const str = (data: FormData, key: string) => String(data.get(key) ?? '').trim()
export const num = (data: FormData, key: string) => str(data, key) === '' ? null : Number(str(data, key))
export function SectionTitle({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }) { return <div className="page-heading"><div><h1>{title}</h1><p>{subtitle}</p></div><div className="actions">{actions}</div></div> }
