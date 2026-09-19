import { describe, it, expect, beforeAll } from 'vitest'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { validateThemePackage, pickVariant } from '../src/shared/theme-manifest'

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
})
