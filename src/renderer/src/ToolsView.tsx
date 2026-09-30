import { useRef, useState, type DragEvent, type KeyboardEvent } from 'react'
import { Button, Spinner } from '@fluentui/react-components'
import { ArrowUp16Regular, ArrowDown16Regular, Dismiss16Regular, DocumentPdf24Regular, FolderOpen20Regular, DocumentArrowDown20Regular } from '@fluentui/react-icons'
import { DateTime } from 'luxon'
import { useModel } from './model'
import { SectionTitle, Field } from './components'
import { calcRows, display, keyFromKeyboard, operators, press, type CalcState } from './tools/calculator'
import { mergePdfs, PdfPartError } from './tools/pdf'

export function ToolsView() {
  const { t } = useModel()
  return <>
    <SectionTitle title={t('tools.heading')} subtitle={t('tools.subtitle')} />
    <div className="tools-grid"><Calculator /><PdfMerge /></div>
  </>
}

const keyNames: Record<string, string> = { AC: 'clear', '+/-': 'negate', '%': 'percent', '÷': 'divide', x: 'multiply', '-': 'subtract', '+': 'add', '=': 'equals', '.': 'point' }

function Calculator() {
  const { t } = useModel()
  const [calc, setCalc] = useState<CalcState>({}), [pressed, setPressed] = useState('')
  const hit = (key: string) => setCalc(state => press(state, key))
  const onKey = (e: KeyboardEvent<HTMLElement>) => { const key = keyFromKeyboard(e.key); if (!key || e.ctrlKey || e.metaKey || e.altKey) return; e.preventDefault(); hit(key); setPressed(key); setTimeout(() => setPressed(p => p === key ? '' : p), 120) }
  const value = display(calc)
  const pending = calc.operation && calc.total ? `${calc.total} ${calc.operation === 'x' ? '×' : calc.operation}` : ''
  return <section className="surface calc" tabIndex={0} onKeyDown={onKey} aria-label={t('tools.calcAria')}>
    <div className="panel-head"><span className="label">{t('tools.calcTitle')}</span><span className="label">{t('tools.calcKeyboard')}</span></div>
    <div className="calc-display" role="status" aria-live="polite"><span className="label"><span>{pending}</span></span>{calc.error ? <strong className="calc-value error">{t('tools.calcError')}</strong> : <strong className={`calc-value ${value.length > 12 ? 'long' : ''}`}>{value}</strong>}</div>
    <div className="calc-keys">{calcRows.flat().map(key => <button key={key} type="button" className={`calc-key ${key === '=' ? 'eq' : operators.has(key) ? 'op' : ['AC', '+/-', '%'].includes(key) ? 'fn' : ''} ${key === '0' ? 'wide' : ''} ${calc.operation === key && !calc.next ? 'armed' : ''} ${pressed === key ? 'pressed' : ''}`} aria-label={keyNames[key] ? t(`tools.key.${keyNames[key]}` as 'tools.key.clear') : key} onClick={() => hit(key)}>{key === 'x' ? '×' : key === '-' ? '−' : key}</button>)}</div>
  </section>
}

interface PdfFile { id: string; name: string; size: number; data: ArrayBuffer; pages: string }

function PdfMerge() {
  const { t } = useModel()
  const input = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<PdfFile[]>([]), [over, setOver] = useState(false), [merging, setMerging] = useState(false), [failed, setFailed] = useState(-1)
  const [name, setName] = useState(() => t('tools.mergeDefaultName', { date: DateTime.now().toISODate()! }))
  const [result, setResult] = useState<{ path?: string; error?: string } | null>(null)
  const add = async (list: FileList | null) => {
    if (!list) return
    const picked = [...list], rejected = picked.filter(f => !/\.pdf$/i.test(f.name) && f.type !== 'application/pdf')
    const accepted = await Promise.all(picked.filter(f => !rejected.includes(f)).map(async f => ({ id: crypto.randomUUID(), name: f.name, size: f.size, data: await f.arrayBuffer(), pages: '' })))
    setFiles(current => [...current, ...accepted]); setFailed(-1)
    setResult(rejected.length ? { error: t('tools.notPdf', { names: rejected.map(f => f.name).join('、') }) } : null)
  }
  const move = (index: number, by: number) => setFiles(current => { const next = [...current]; const [item] = next.splice(index, 1); next.splice(index + by, 0, item); return next })
  const drop = (e: DragEvent) => { e.preventDefault(); setOver(false); void add(e.dataTransfer.files) }
  const merge = async () => {
    setMerging(true); setResult(null); setFailed(-1)
    try {
      const data = await mergePdfs(files.map(f => ({ data: f.data.slice(0), pages: f.pages })))
      const path = await window.workstation.savePdf({ name: name.trim() || t('tools.mergeDefaultName', { date: DateTime.now().toISODate()! }), data })
      if (path) setResult({ path })
    } catch (e) {
      if (e instanceof PdfPartError) { setFailed(e.index); setResult({ error: t('tools.mergeFailedFile', { name: files[e.index]?.name ?? '' }) }) } else setResult({ error: t('tools.mergeFailed') })
    } finally { setMerging(false) }
  }
  const size = (bytes: number) => bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
  return <section className="surface merge">
    <div className="panel-head"><span className="label">{t('tools.mergeTitle')}</span><span className="label">{t('tools.fileCount', { count: files.length })}</span></div>
    <input ref={input} type="file" accept="application/pdf,.pdf" multiple onChange={e => { void add(e.target.files); e.target.value = '' }} />
    <button type="button" className={`merge-drop ${over ? 'over' : ''}`} onClick={() => input.current?.click()} onDragOver={e => { e.preventDefault(); setOver(true) }} onDragLeave={() => setOver(false)} onDrop={drop}><DocumentPdf24Regular /><strong>{t('tools.dropTitle')}</strong><span>{t('tools.dropHint')}</span></button>
    {files.length > 0 && <div className="merge-list" role="list" aria-label={t('tools.listAria')}>{files.map((f, i) => <div role="listitem" key={f.id} className={`merge-row ${failed === i ? 'invalid' : ''}`}><b>{String(i + 1).padStart(2, '0')}</b><div><strong title={f.name}>{f.name}</strong><small>{size(f.size)}</small></div><input aria-label={t('tools.pagesAria', { name: f.name })} placeholder={t('tools.pagesPh')} value={f.pages} onChange={e => { const pages = e.target.value; setFiles(current => current.map(x => x.id === f.id ? { ...x, pages } : x)); if (failed === i) setFailed(-1) }} /><div className="merge-row-actions"><Button size="small" appearance="subtle" aria-label={t('tools.moveUp', { name: f.name })} icon={<ArrowUp16Regular />} disabled={i === 0} onClick={() => move(i, -1)} /><Button size="small" appearance="subtle" aria-label={t('tools.moveDown', { name: f.name })} icon={<ArrowDown16Regular />} disabled={i === files.length - 1} onClick={() => move(i, 1)} /><Button size="small" appearance="subtle" aria-label={t('tools.removeFile', { name: f.name })} icon={<Dismiss16Regular />} onClick={() => { setFiles(current => current.filter(x => x.id !== f.id)); setFailed(-1) }} /></div></div>)}</div>}
    <div className="merge-foot"><Field label={t('tools.outputName')}><input value={name} onChange={e => setName(e.target.value)} /></Field>{files.length > 0 && <Button onClick={() => { setFiles([]); setResult(null); setFailed(-1) }}>{t('tools.clear')}</Button>}<Button appearance="primary" icon={merging ? <Spinner size="tiny" /> : <DocumentArrowDown20Regular />} disabled={files.length < 2 || merging} onClick={() => void merge()}>{merging ? t('tools.merging') : t('tools.merge')}</Button></div>
    {result && <div className={`merge-result ${result.error ? 'error' : ''}`} role={result.error ? 'alert' : 'status'}><span className={`led ${result.error ? 'warn' : 'ok'}`} /><span>{result.error ?? t('tools.saved', { path: result.path! })}</span>{result.path && <Button size="small" appearance="subtle" icon={<FolderOpen20Regular />} onClick={() => void window.workstation.revealPdf()}>{t('tools.reveal')}</Button>}</div>}
    {files.length < 2 && !result && <p className="muted merge-note">{t('tools.mergeNote')}</p>}
  </section>
}
