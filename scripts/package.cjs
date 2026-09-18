// Package wrapper: builds NSIS EXE + MSI for Windows x64 with --publish never
// (electron-builder must never talk to GitHub; releases are distributed manually).
// When the self-signed dev certificate exists under .local/certs/, scripts/sign.cjs
// signs both formats via the Windows SDK signtool; without it the installers stay
// unsigned. MSIX was evaluated in 0.3.0 and shelved: a self-signed MSIX requires a
// manual certificate trust step that adds friction without value here.
const { existsSync, readFileSync } = require('node:fs')
const { join } = require('node:path')
const { spawnSync } = require('node:child_process')

const root = join(__dirname, '..')
const pfx = join(root, '.local', 'certs', 'workstation-dev.pfx')
const passwordFile = join(root, '.local', 'certs', 'password.txt')

const env = { ...process.env }
if (existsSync(pfx) && existsSync(passwordFile)) {
  env.CSC_LINK = pfx
  env.CSC_KEY_PASSWORD = readFileSync(passwordFile, 'utf8').trim()
  console.log('signing with .local/certs/workstation-dev.pfx (self-signed dev certificate)')
} else {
  console.log('no .local/certs/workstation-dev.pfx found; building unsigned installers')
}

const builder = join(root, 'node_modules', '.bin', 'electron-builder.cmd')
const result = spawnSync(builder, ['--win', 'nsis', 'msi', '--x64', '--publish', 'never'], { cwd: root, env, stdio: 'inherit', shell: true })
process.exit(result.status ?? 1)
