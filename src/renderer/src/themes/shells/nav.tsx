import { useModel } from '../../model'

export interface NavItem { id: string; title: string }

export function useNav(): { items: NavItem[]; titles: Record<string, string>; open: number } {
  const { state, t } = useModel()
  const titles: Record<string, string> = { todo: t('nav.todo'), study: t('nav.study'), calendar: t('nav.calendar'), life: t('nav.life'), tools: t('nav.tools'), settings: t('nav.settings') }
  const items: NavItem[] = ['todo', 'study', 'calendar', 'life', 'tools'].map(id => ({ id, title: titles[id] }))
  const open = state.tasks.filter(x => x.status !== 'done' && !x.archived).length + state.assessments.filter(x => x.status !== 'done' && !x.archived).length
  return { items, titles, open }
}
