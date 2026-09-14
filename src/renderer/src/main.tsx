import React, { useEffect, useState, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { FluentProvider, webLightTheme, webDarkTheme, Button, Spinner } from '@fluentui/react-components'
import { Dismiss16Regular } from '@fluentui/react-icons'
import type { Workspace, Task, Assessment } from '../../shared/types'
import { Model } from './model'
import { themeRegistry } from './themes'
import { TaskEditor } from './TaskEditor'
import './styles.css'

function App() {
  const [state, setState] = useState<Workspace | null>(null), [page, setPage] = useState('todo'), [pending, setPending] = useState(0), [message, setMessage] = useState<{ text: string; error: boolean } | null>(null), [systemDark, setSystemDark] = useState(matchMedia('(prefers-color-scheme: dark)').matches), [editor, setEditor] = useState<{ item?: Task | Assessment; courseId?: string } | null>(null)
  const reload = useCallback(async () => setState(await window.workstation.load()), [])
  const run = useCallback(async <T,>(action: () => Promise<T>, success?: string): Promise<T | undefined> => {
    setPending(x => x + 1)
    try { const result = await action(); if (success) setMessage({ text: success, error: false }); return result }
    catch (e) { setMessage({ text: (e instanceof Error ? e.message : '操作失败').replace(/^Error invoking remote method '[^']+': Error: /, ''), error: true }); return undefined }
    finally { setPending(x => x - 1) }
  }, [])
  useEffect(() => {
    if (!window.workstation) { setMessage({ text: '桌面桥接不可用，请通过 Electron 启动 Workstation。', error: true }); return }
    void run(reload)
    return window.workstation.onChanged(() => { void run(reload) })
  }, [reload, run])
  useEffect(() => { const media = matchMedia('(prefers-color-scheme: dark)'); const listener = () => setSystemDark(media.matches); media.addEventListener('change', listener); return () => media.removeEventListener('change', listener) }, [])
  const mutate = async (change: (value: Workspace) => void): Promise<boolean> => {
    const result = await run(async () => { const current = await window.workstation.load(); change(current); setState(await window.workstation.save(current)); return true })
    return result === true
  }
  const dark = state?.settings.appearance === 'dark' || state?.settings.appearance !== 'light' && systemDark
  const theme = themeRegistry[state?.settings.theme || 'windows']
  const Page = theme.pages[page] || theme.pages.todo
  return <FluentProvider theme={dark ? webDarkTheme : webLightTheme} className={`root-theme ${dark ? 'dark-mode' : 'light-mode'}`}>{state ? <Model.Provider value={{ state, busy: pending > 0, feedback: message?.error ? message.text : '', page, setPage, mutate, run, editTask: (item, courseId) => setEditor({ item, courseId }), reload }}><theme.Shell><Page /></theme.Shell>{editor && <TaskEditor key={editor.item?.id || editor.courseId || 'new'} {...editor} close={() => setEditor(null)} />}</Model.Provider> : <div className="startup"><Spinner label="正在打开工作台…" /></div>}{pending > 0 && state && <div className="busy-indicator" role="status"><Spinner size="tiny" />正在处理…</div>}{message && <div className={`app-message ${message.error ? 'error' : ''}`} role={message.error ? 'alert' : 'status'}><span>{message.text}</span><Button size="small" appearance="subtle" aria-label="关闭提示" icon={<Dismiss16Regular />} onClick={() => setMessage(null)} /></div>}</FluentProvider>
}
createRoot(document.getElementById('root')!).render(<App />)
