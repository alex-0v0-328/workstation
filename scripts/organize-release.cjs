// Organize release/ into per-version folders: installers and blockmaps move to release/<version>/.
// win-unpacked/ and latest.yml stay at the root (packaged-check and update metadata consume them).
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
