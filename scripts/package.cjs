// Package wrapper: builds the Windows targets with --publish never (electron-builder must
// never talk to GitHub; releases are distributed manually). When the self-signed dev
// certificate exists under .local/certs/ it signs all three formats through the custom
// sign hook in scripts/sign.cjs (MSIX requires a signature to be installable); without
// the certificate, MSIX is skipped since unsigned MSIX cannot be installed.
const { existsSync, readFileSync } = require('node:fs')
const { join } = require('node:path')
const { spawnSync } = require('node:child_process')

const root = join(__dirname, '..')
const pfx = join(root, '.local', 'certs', 'workstation-dev.pfx')
const passwordFile = join(root, '.local', 'certs', 'password.txt')

const env = { ...process.env }
let targets = ['nsis', 'msi', 'appx']
if (existsSync(pfx) && existsSync(passwordFile)) {
  env.CSC_LINK = pfx
  env.CSC_KEY_PASSWORD = readFileSync(passwordFile, 'utf8').trim()
  console.log('signing with .local/certs/workstation-dev.pfx (self-signed dev certificate)')
} else {
  targets = ['nsis', 'msi']
  console.log('no .local/certs/workstation-dev.pfx found; building nsis+msi unsigned and skipping msix (msix requires a signature)')
}

const builder = join(root, 'node_modules', '.bin', 'electron-builder.cmd')
const result = spawnSync(builder, ['--win', ...targets, '--x64', '--publish', 'never'], { cwd: root, env, stdio: 'inherit', shell: true })
process.exit(result.status ?? 1)
