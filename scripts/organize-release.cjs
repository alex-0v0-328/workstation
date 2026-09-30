// Organize release/ into per-version folders: installers and blockmaps move to release/<version>/.
// EXE/MSIX still match so leftovers from older multi-format builds sort the same way.
// win-unpacked/ stays at the root (packaged-check consumes it).
const { readdirSync, mkdirSync, renameSync, statSync } = require('node:fs')
const { join } = require('node:path')

const root = join(__dirname, '..', 'release')
const artifact = /(\d+\.\d+\.\d+).+\.(exe|msi|msix)(\.blockmap)?$|(\d+\.\d+\.\d+)\.(exe|msi|msix)(\.blockmap)?$/

let moved = 0
for (const name of readdirSync(root)) {
  const path = join(root, name)
  if (!statSync(path).isFile()) continue
  const match = name.match(artifact)
  if (!match) continue
  const version = match[1] || match[4]
  const target = join(root, version)
  mkdirSync(target, { recursive: true })
  renameSync(path, join(target, name))
  console.log(`${name} -> ${version}/`)
  moved++
}
console.log(moved ? `organized ${moved} artifact(s)` : 'nothing to organize')
