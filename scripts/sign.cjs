// Custom electron-builder sign hook: uses the installed Windows SDK signtool (the
// electron-builder bundled 2018 signtool cannot sign MSIX packages). No timestamping —
// these are self-signed local builds, and it keeps packaging fully offline.
const { existsSync, readdirSync } = require('node:fs')
const { join } = require('node:path')
const { spawnSync } = require('node:child_process')

function findSigntool() {
  const kitsRoot = 'C:\\Program Files (x86)\\Windows Kits\\10\\bin'
  if (!existsSync(kitsRoot)) throw new Error('Windows SDK not found; cannot sign')
  const versions = readdirSync(kitsRoot).filter(v => existsSync(join(kitsRoot, v, 'x64', 'signtool.exe'))).sort().reverse()
  if (!versions.length) throw new Error('Windows SDK signtool.exe not found; cannot sign')
  return join(kitsRoot, versions[0], 'x64', 'signtool.exe')
}

module.exports = async function sign(configuration) {
  const csc = configuration.cscInfo
  // No certificate (CI or a machine without .local/certs): skip signing instead of failing the build.
  if (!csc || !('file' in csc)) return
  const signtool = findSigntool()
  const args = ['sign', '/fd', (configuration.hash || 'sha256').toLowerCase(), '/f', csc.file]
  if (csc.password) args.push('/p', csc.password)
  if (configuration.name) args.push('/d', configuration.name)
  if (configuration.site) args.push('/du', configuration.site)
  args.push(configuration.path)

  // The NSIS uninstaller occasionally stays locked by the packager for a moment.
  let lastError = ''
  for (let attempt = 0; attempt < 3; attempt++) {
    const result = spawnSync(signtool, args, { encoding: 'utf8' })
    if (result.status === 0) return
    lastError = `${result.stdout || ''}${result.stderr || ''}`
    if (!lastError.includes('being used by another process')) break
    await new Promise(resolve => setTimeout(resolve, 10000))
  }
  throw new Error(`signtool failed for ${configuration.path}: ${lastError.trim()}`)
}
