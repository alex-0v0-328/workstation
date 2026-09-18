import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const SRC = join(__dirname, '..', 'src')

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? sources(path) : /\.(ts|tsx)$/.test(name) ? [path] : []
  })
}

function importsOf(file: string): string[] {
  const text = readFileSync(file, 'utf8')
  return [...text.matchAll(/(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]/g)].map(m => m[1])
}

// The three planes must stay independent: domain data (shared), presentation (renderer), desktop services (main).
// preload is the typed boundary and may touch electron only.
const RULES: { dir: string; forbidden: (spec: string) => boolean }[] = [
  { dir: 'shared', forbidden: spec => spec === 'electron' || spec === 'better-sqlite3' || spec.startsWith('node:') || spec.includes('/main/') || spec.includes('/renderer/') },
  { dir: 'renderer', forbidden: spec => spec === 'electron' || spec === 'better-sqlite3' || spec.startsWith('node:') || spec.includes('/main/') || spec.includes('/preload/') },
  { dir: 'preload', forbidden: spec => spec !== 'electron' && !spec.startsWith('../shared/') && !spec.startsWith('./') },
  { dir: 'main', forbidden: spec => spec.includes('/renderer/') },
]

describe('module plane boundaries', () => {
  for (const { dir, forbidden } of RULES) {
    it(`src/${dir} never imports across plane boundaries`, () => {
      const violations: string[] = []
      for (const file of sources(join(SRC, dir))) {
        for (const spec of importsOf(file)) {
          if (forbidden(spec)) violations.push(`${relative(SRC, file)} -> ${spec}`)
        }
      }
      expect(violations).toEqual([])
    })
  }

  it('renderer reaches services only through the typed bridge', () => {
    const windowUses = sources(join(SRC, 'renderer'))
      .filter(file => /window\.(workstation|require|ipcRenderer)/.test(readFileSync(file, 'utf8')))
      .map(file => relative(SRC, file))
    for (const file of windowUses) {
      const text = readFileSync(join(SRC, file), 'utf8')
      expect(text.includes('window.require') || text.includes('window.ipcRenderer'), `${file} bypasses the bridge`).toBe(false)
    }
  })
})
