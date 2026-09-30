import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, writeFileSync, readFileSync, chmodSync, accessSync, existsSync, rmSync, constants } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { writeReplacing, copyContent, removeFile } from '../src/main/files'

// Regression for 0.8.3 install test: MSI resources are read-only, copyFile carried the flag into the
// profile, and upgrading an example theme pack then failed with EPERM.
describe('profile file writes', () => {
  let dir = ''
  const writable = (path: string) => { try { accessSync(path, constants.W_OK); return true } catch { return false } }
  beforeEach(() => { dir = mkdtempSync(join(tmpdir(), 'ws-files-')) })
  afterEach(() => { for (const name of ['a.json', 'b.json']) { try { chmodSync(join(dir, name), 0o666) } catch { /* already gone */ } } rmSync(dir, { recursive: true, force: true }) })

  it('copies content without carrying the read-only flag and overwrites a read-only copy', async () => {
    const source = join(dir, 'a.json'), target = join(dir, 'b.json')
    writeFileSync(source, 'v2'); chmodSync(source, 0o444)
    writeFileSync(target, 'v1'); chmodSync(target, 0o444)
    await copyContent(source, target)
    expect(readFileSync(target, 'utf8')).toBe('v2')
    expect(writable(target)).toBe(true)
  })

  it('replaces and removes read-only files', async () => {
    const target = join(dir, 'b.json')
    writeFileSync(target, 'old'); chmodSync(target, 0o444)
    await writeReplacing(target, 'new')
    expect(readFileSync(target, 'utf8')).toBe('new')
    chmodSync(target, 0o444)
    await removeFile(target)
    expect(existsSync(target)).toBe(false)
  })

  it('writes a new file when none exists', async () => {
    await writeReplacing(join(dir, 'b.json'), 'fresh')
    expect(readFileSync(join(dir, 'b.json'), 'utf8')).toBe('fresh')
  })
})
