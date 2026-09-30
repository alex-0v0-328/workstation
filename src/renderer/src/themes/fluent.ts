import { createLightTheme, createDarkTheme, type BrandVariants, type Theme } from '@fluentui/react-components'

export function mix(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16))
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('')
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}
// Walk a color toward black (or white) until it reaches the ratio against the ground.
export function readable(color: string, ground: string, ratio: number, toward: '#000000' | '#ffffff'): string {
  for (let t = 0; t <= 1; t += 0.04) { const next = mix(color, toward, t); if (contrast(next, ground) >= ratio) return next }
  return toward
}

function brandRamp(accent: string): BrandVariants {
  const ramp = {} as Record<number, string>
  for (let stop = 10; stop <= 160; stop += 10) {
    const p = stop / 160
    ramp[stop] = p < 0.5 ? mix('#000000', accent, p * 2) : mix(accent, '#ffffff', (p - 0.5) * 2)
  }
  return ramp as unknown as BrandVariants
}

export function buildFluentTheme(accent: string, dark: boolean, overrides?: Record<string, string>): Theme {
  const base = dark ? createDarkTheme(brandRamp(accent)) : createLightTheme(brandRamp(accent))
  return { ...base, ...(overrides || {}) }
}

// Windows 11 skin: the personalization accent drives every accent role. Light mode darkens it like
// AccentDark1 for text and fills under white ink; dark mode lightens it like AccentLight2 under dark ink.
// The four step banks run the accent from deep to light so the semester row reads as one hue.
export function windowsAccent(system: string, dark: boolean): { fill: string; css: string; fluent: Record<string, string> } {
  const surface = dark ? '#2b2b2b' : '#ffffff', ink = dark ? '#000000' : '#ffffff'
  const fill = dark ? readable(system, surface, 4.5, '#ffffff') : readable(system, '#ffffff', 4.5, '#000000')
  // Moving away from the ground only raises contrast with the key ink, so every bank stays as readable as the fill.
  const banks = dark ? [0, 0.14, 0.28, 0.42].map(t => mix(fill, '#ffffff', t)) : [0.34, 0.22, 0.1, 0].map(t => mix(fill, '#000000', t))
  const vars = { '--accent': fill, '--accent-ink': fill, '--on-accent': ink, '--led': fill, '--chase': fill, '--tint': mix(surface, fill, dark ? 0.16 : 0.09), '--selected': mix(dark ? '#202020' : '#f3f3f3', fill, dark ? 0.12 : 0.07), '--step-a': banks[0], '--step-b': banks[1], '--step-c': banks[2], '--step-d': banks[3], '--step-ink-strong': ink }
  // Fluent's dark brand ramp would put white ink on the lightened fill; Windows 11 accent buttons use dark ink there.
  const fluent = { colorBrandBackground: fill, colorBrandBackgroundHover: mix(fill, dark ? '#ffffff' : '#000000', 0.1), colorBrandBackgroundPressed: mix(fill, dark ? '#ffffff' : '#000000', 0.2), colorNeutralForegroundOnBrand: ink, colorBrandForeground1: fill, colorBrandForegroundLink: fill, colorBrandForegroundLinkHover: mix(fill, dark ? '#ffffff' : '#000000', 0.15), colorCompoundBrandStroke: fill, colorCompoundBrandBackground: fill }
  return { fill, fluent, css: `.theme-windows{${Object.entries(vars).map(([k, v]) => `${k}:${v};`).join('')}}` }
}
