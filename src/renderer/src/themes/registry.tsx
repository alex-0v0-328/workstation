import type { ComponentType, ReactNode } from 'react'
import { webLightTheme, webDarkTheme, type Theme } from '@fluentui/react-components'
import type { Settings, ThemeState } from '../../../shared/types'
import { BUILTIN_THEME, pickVariant, type LayoutToken, type ThemeManifest, type ThemeVariant } from '../../../shared/theme-manifest'
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

const fontStacks: Record<Settings['font'], string> = {
  "": "'Segoe UI Variable Text','Segoe UI','Microsoft YaHei',sans-serif",
  pingfang: "'PingFang SC','Segoe UI Variable Text','Segoe UI','Microsoft YaHei',sans-serif",
  sfpro: "'SF Pro Text','SF Pro Display','Segoe UI Variable Text','Segoe UI','Microsoft YaHei',sans-serif",
  caskaydia: "'CaskaydiaCove Nerd Font','Cascadia Mono','Segoe UI Variable Text','Segoe UI',monospace"
}

const layoutVarNames: Record<LayoutToken, string> = {
  sidebarWidth: '--sidebar-width',
  sidebarRadius: '--sidebar-radius',
  topbarHeight: '--topbar-height',
  contentMaxWidth: '--content-max-width',
  panelWidth: '--panel-width',
  mailPaneWidth: '--mail-pane-width',
  fontSizeBase: '--font-size-base',
  lineHeightBase: '--line-height-base',
  spaceUnit: '--space-unit',
  radiusSm: '--radius-sm',
  radius: '--radius',
  radiusLg: '--radius-lg'
}

function layoutCss(scope: string, layout: ThemeManifest['layout']): string {
  if (!layout) return ''
  const decl = Object.entries(layout).map(([key, value]) => `${layoutVarNames[key as LayoutToken]}: ${value};`).join('')
  return decl ? `${scope}{${decl}}` : ''
}

export function resolveTheme(settings: Settings | undefined, external: ThemeManifest[], systemDark: boolean): ResolvedTheme {
  const manifest = external.find(t => t.id === settings?.theme)
  const prefersDark = settings?.appearance === 'dark' || (settings?.appearance !== 'light' && systemDark)
  const fontFamilyBase = fontStacks[settings?.font ?? '']

  if (!manifest || manifest.id === BUILTIN_THEME) {
    const dark = prefersDark
    return {
      id: BUILTIN_THEME,
      label: 'Windows 11',
      dark,
      variant: null,
      fluent: { ...(dark ? webDarkTheme : webLightTheme), fontFamilyBase },
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
    fluent: buildFluentTheme(variant.accent, variant.dark, { ...variant.fluent, fontFamilyBase }),
    classes: `root-theme theme-${manifest.id} variant-${variant.id} ${variant.dark ? 'dark-mode' : 'light-mode'} shell-${manifest.shell}`,
    Shell: shells[manifest.shell] ?? SidebarShell,
    css: layoutCss(`.theme-${manifest.id}`, manifest.layout) + layoutCss(`.theme-${manifest.id}.variant-${variant.id}`, variant.layout) + variant.css
  }
}
