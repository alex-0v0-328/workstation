import { createLightTheme, createDarkTheme, type BrandVariants, type Theme } from '@fluentui/react-components'

function mix(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16))
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('')
}

export function brandRamp(accent: string): BrandVariants {
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
