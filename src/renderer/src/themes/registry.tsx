import type { ComponentType, ReactNode } from 'react'
import { webLightTheme, webDarkTheme, type Theme } from '@fluentui/react-components'
import type { Settings, ThemeState } from '../../../shared/types'
import { BUILTIN_THEME, pickVariant, type ThemeManifest, type ThemeVariant } from '../../../shared/theme-manifest'
import { buildFluentTheme } from './fluent'
import { SidebarShell } from './shells/sidebar'
import { TaskbarShell } from './shells/taskbar'

export interface ResolvedTheme {
  id: string
  label: string
  dark: boolean
  variant: ThemeVariant | null
  fluent: Theme
  classes: string
  Shell: ComponentType<{ children: ReactNode }>
  css: string
}

const shells: Record<string, ComponentType<{ children: ReactNode }>> = {
  sidebar: SidebarShell,
  taskbar: TaskbarShell
}

export function resolveTheme(settings: Settings | undefined, external: ThemeManifest[], systemDark: boolean): ResolvedTheme {
  const manifest = external.find(t => t.id === settings?.theme)
  const prefersDark = settings?.appearance === 'dark' || (settings?.appearance !== 'light' && systemDark)

  if (!manifest || manifest.id === BUILTIN_THEME) {
    const dark = prefersDark
    return {
      id: BUILTIN_THEME,
      label: 'Windows 11',
      dark,
      variant: null,
      fluent: dark ? webDarkTheme : webLightTheme,
      classes: `root-theme theme-windows ${dark ? 'dark-mode' : 'light-mode'}`,
      Shell: SidebarShell,
      css: ''
    }
  }

  const variant = pickVariant(manifest, settings?.variant ?? '', prefersDark)
  return {
    id: manifest.id,
    label: manifest.name,
    dark: variant.dark,
    variant,
    fluent: buildFluentTheme(variant.accent, variant.dark, variant.fluent),
    classes: `root-theme theme-${manifest.id} variant-${variant.id} ${variant.dark ? 'dark-mode' : 'light-mode'} shell-${manifest.shell}`,
    Shell: shells[manifest.shell] ?? SidebarShell,
    css: variant.css
  }
}
