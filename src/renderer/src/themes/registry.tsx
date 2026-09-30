import type { ComponentType, ReactNode } from 'react'
import type { Theme } from '@fluentui/react-components'
import type { Settings, ThemeState } from '../../../shared/types'
import { BUILTIN_THEME, pickVariant, type LayoutToken, type ThemeManifest, type ThemeVariant } from '../../../shared/theme-manifest'
import { buildFluentTheme, windowsAccent } from './fluent'
import { SidebarShell } from './shells/sidebar'
import { ClassicShell } from './shells/classic'

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
  classic: ClassicShell,
  // Pre-0.8.3 packs declared the retired taskbar desktop; they now get the classic application shell.
  taskbar: ClassicShell
}

// Fonts belong to the theme (0.8.3): the manifest/variant font, or Segoe UI Variable for the built-in theme.
const windowsFont = "'Segoe UI Variable Text','Segoe UI','Microsoft YaHei UI','Microsoft YaHei',sans-serif"

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

export function resolveTheme(settings: Settings | undefined, external: ThemeManifest[], systemDark: boolean, systemAccent = '#005fb8'): ResolvedTheme {
  const manifest = external.find(t => t.id === settings?.theme)
  const prefersDark = settings?.appearance === 'dark' || (settings?.appearance !== 'light' && systemDark)

  if (!manifest || manifest.id === BUILTIN_THEME) {
    const dark = prefersDark
    const accent = windowsAccent(systemAccent, dark)
    return {
      id: BUILTIN_THEME,
      label: 'Windows 11',
      dark,
      variant: null,
      fluent: buildFluentTheme(accent.fill, dark, { ...accent.fluent, fontFamilyBase: windowsFont }),
      classes: `root-theme theme-windows ${dark ? 'dark-mode' : 'light-mode'}`,
      Shell: SidebarShell,
      css: accent.css
    }
  }

  const variant = pickVariant(manifest, settings?.variant ?? '', prefersDark)
  return {
    id: manifest.id,
    label: manifest.name,
    dark: variant.dark,
    variant,
    fluent: buildFluentTheme(variant.accent, variant.dark, { ...variant.fluent, fontFamilyBase: variant.font || manifest.font || windowsFont }),
    classes: `root-theme theme-${manifest.id} variant-${variant.id} ${variant.dark ? 'dark-mode' : 'light-mode'} shell-${manifest.shell === 'taskbar' ? 'classic' : manifest.shell}`,
    Shell: shells[manifest.shell] ?? SidebarShell,
    css: layoutCss(`.theme-${manifest.id}`, manifest.layout) + layoutCss(`.theme-${manifest.id}.variant-${variant.id}`, variant.layout) + (manifest.css ?? '') + variant.css
  }
}
