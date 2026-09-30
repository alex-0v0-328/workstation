import { describe, it, expect, beforeAll } from 'vitest'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { validateThemePackage, pickVariant } from '../src/shared/theme-manifest'
import { windowsAccent, contrast } from '../src/renderer/src/themes/fluent'

const ROOT = join(__dirname, '..')
const DIST = join(ROOT, 'themes', 'dist')

function distManifests() {
  return readdirSync(DIST)
    .filter(name => name.endsWith('.wstheme.json'))
    .map(name => ({ name, manifest: validateThemePackage(JSON.parse(readFileSync(join(DIST, name), 'utf8'))) }))
}

describe('theme packages', () => {
  beforeAll(() => {
    execFileSync(process.execPath, [join(ROOT, 'scripts', 'build-themes.cjs')], { stdio: 'pipe' })
  })

  it('builds every source theme into a valid install package', () => {
    const built = distManifests()
    expect(built.length).toBeGreaterThan(0)
    for (const { name, manifest } of built) {
      expect(name).toBe(`${manifest.id}.wstheme.json`)
      expect(manifest.id).not.toBe('windows')
      expect(existsSync(join(ROOT, 'themes', manifest.id, 'theme.json'))).toBe(true)
    }
  })

  it('inlines variant css and shared css into the package', () => {
    for (const { manifest } of distManifests()) {
      expect(manifest).not.toHaveProperty('sharedCss')
      for (const variant of manifest.variants) {
        expect(variant.css.length).toBeGreaterThan(100)
        expect(variant.css.endsWith('.css')).toBe(false)
        expect(variant.accent).toMatch(/^#[0-9a-f]{6}$/i)
      }
    }
  })

  it('resolves a variant for both light and dark appearances', () => {
    for (const { manifest } of distManifests()) {
      for (const dark of [false, true]) {
        const variant = pickVariant(manifest, '', dark)
        expect(manifest.variants).toContain(variant)
      }
    }
  })

  it('accepts declared layout tokens and rejects unknown keys or bad values', () => {
    const base = distManifests()[0].manifest
    const good = validateThemePackage({ ...base, layout: { sidebarWidth: '300px', spaceUnit: '6px', lineHeightBase: '1.6' }, variants: base.variants.map(v => ({ ...v, layout: { fontSizeBase: '15px' } })) })
    expect(good.layout).toMatchObject({ sidebarWidth: '300px' })
    expect(() => validateThemePackage({ ...base, layout: { sidebarWiddth: '300px' } })).toThrow('validation.themeLayoutKey')
    expect(() => validateThemePackage({ ...base, layout: { radius: 'solid 1px' } })).toThrow()
  })

  it('accepts the classic shell and keeps taskbar as a legacy alias', () => {
    const base = distManifests()[0].manifest
    expect(validateThemePackage({ ...base, shell: 'classic' }).shell).toBe('classic')
    expect(validateThemePackage({ ...base, shell: 'taskbar' }).shell).toBe('taskbar')
    expect(() => validateThemePackage({ ...base, shell: 'desktop' })).toThrow()
  })
})

describe('windows accent', () => {
  for (const system of ['#0078d4', '#ffd700', '#107c10', '#e3008c']) {
    it(`keeps ${system} readable in both modes with Windows-style ink`, () => {
      const light = windowsAccent(system, false), dark = windowsAccent(system, true)
      expect(contrast(light.fill, '#ffffff')).toBeGreaterThanOrEqual(4.5)
      expect(contrast(dark.fill, '#2b2b2b')).toBeGreaterThanOrEqual(4.5)
      expect(light.fluent.colorNeutralForegroundOnBrand).toBe('#ffffff')
      expect(dark.fluent.colorNeutralForegroundOnBrand).toBe('#000000')
      expect(contrast(dark.fill, '#000000')).toBeGreaterThanOrEqual(4.5)
    })
  }
})
