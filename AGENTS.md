# Workstation

- Work only in this repository. Preserve the active checkout and WIP.
- Communicate in Chinese; use American English for code, comments, and commits.
- Product decisions: `docs/product.md`. User input template: `docs/academic-template.md`. Import fixture: `examples/academic-example.json`.
- Keep business data and operations independent of theme components. Only the `windows` theme ships built-in (light/dark modes, Mica material, sidebar shell). All other themes are installable `.wstheme.json` packages defined by the contract in `src/shared/theme-manifest.ts`; packages may declare Mica/Acrylic material, degrading to solid color when unsupported.
- Academic assessments are the source of truth in TODO views; never create editable duplicate tasks.
- Keep credentials, personal academic information, mail, local databases, and build outputs out of Git.
- Use PowerShell and npm.cmd on Windows. Run `npm.cmd test` and `npm.cmd run build` before claiming an implementation milestone.
- Report real OAuth, AI, subscription, and installed desktop acceptance separately from automated checks.
- Taste-skill guidance applies only to this project; use only guidance appropriate to desktop productivity interfaces.

## Architecture and maintenance

- `src/shared/`: types, validation, grade/TODO/date rules, calendar recurrence. Keep these independent of themes and Electron.
- `src/main/`: SQLite ownership, revision checks, provider requests, encrypted secrets, backup/restore and scheduler. IPC validates input and only accepts the main application frame.
- `src/preload/`: explicit typed bridge only. Do not expose raw Electron, SQL or filesystem APIs.
- `src/renderer/src/`: feature views and local form state. `themes/registry.tsx` owns the developer-shipped theme registry and layout contract; `model.tsx` supplies shared state/actions. Theme switches must not reset data or drafts.
- Theme shells are `sidebar` and `taskbar` primitives under `src/renderer/src/themes/shells/`. The root DOM class contract is `root-theme theme-<id> variant-<vid> light-mode|dark-mode shell-<sidebar|taskbar> material-on|off`.
- Theme packages are validated and built by `scripts/build-themes.cjs`, which runs before both `npm run build` and `npm run smoke` and inlines shared/variant CSS into `themes/dist/*.wstheme.json`.
- Electron-builder packs the built theme files via `extraResources` (`themes/dist` → `themes`) so the packaged app can load them.
- Modal dialogs use the native HTML dialog lifecycle. Regression: unmounting the previous Fluent modal left `#root` aria-hidden. Preserve the smoke check for accessibility after closing dialogs.
- Academic timestamps preserve date-only versus precise values. Apply the semester time zone to assessments; apply the app time zone to manual tasks. No invented 23:59 deadlines or automatic hurdle decisions.
- Digest windows are half-open; advance the checkpoint only after all included mail succeeds. Retain chunk cache for partial retries and do not mark mail outside the window processed.
- Database schema version and JSON backup version are explicit. Preserve older user data with migrations; never silently replace a database or draft during upgrades.

## Verification and delivery

- `npm.cmd ci` installs locked dependencies and rebuilds better-sqlite3 for Electron. The Node and Electron native ABIs differ; run database integration through Electron.
- `npm.cmd test`: isolated domain/calendar/MIME/digest checks plus module-plane boundary guards (shared/renderer/preload/main import rules). Provider tests use fake responses, not live account verification.
- `npm.cmd run build`: TypeScript plus main/preload/renderer production builds.
- `npm.cmd run smoke`: hidden real Electron UI, isolated `.local/` data, task/study/calendar/theme flows, backup and restart checks. Do not remove isolation or use the user's formal profile for tests.
- `npm.cmd run package`: `scripts/package.cjs` drives electron-builder with `--publish never` (never contacts GitHub) and produces NSIS EXE + MSI for Windows x64 in `release/`. When `.local/certs/workstation-dev.pfx` (self-signed dev certificate, never committed) exists, the `scripts/sign.cjs` hook signs both formats with the Windows SDK signtool; without a certificate the hook skips signing so CI builds stay green. MSIX was evaluated in 0.3.0 and shelved (self-signed MSIX requires a manual certificate-trust step). `node scripts/organize-release.cjs` sorts installers into `release/<version>/` while `win-unpacked/` and `latest.yml` stay at the root. `scripts/generate-icon.ps1` regenerates the checked-in application icon.
- `node scripts/packaged-check.cjs`: packaged EXE resource/bridge/SQLite/restart validation without screenshot capture. On this Windows host, screenshots of the hidden packaged EXE time out; full UI screenshots are verified with the Electron development launcher instead.
- GitHub remote: `https://github.com/alex-0v0-328/workstation`. Use cohesive commits and milestone tags. CI checks Windows builds and uploads installer artifacts.
- Keep `docs/acceptance.md` current with verified evidence and remaining manual/provider checks. Keep `README.md` and `docs/setup.md` consistent with user-visible behavior.

## Collaboration workflow (this installation)

- Every release bumps `package.json` `version` (the settings page renders it via JSON import; never hardcode a version string). Run the full verification chain and let the user install-test before locking a version.
- Lock a version only after the user confirms: one cohesive commit (the user picks the subject), a milestone tag `v*`, then push.
- This host is WSL driving a Windows checkout: run Windows tools via `cmd.exe /c "cd /d C:\alex\code\workstation-alex0v0 && ..."`. `node_modules` is Windows-built, so WSL-side node cannot run it. `git push` only works from Windows-side git (credential manager); WSL git/ssh has no GitHub credentials.
- The user's real profile lives at `%APPDATA%\Workstation`. Never write to it without a fresh backup and the app fully quit (close-to-tray means the window X does not quit). Personal data packages (e.g. `.local/*.json` with subscription tokens) stay in `.local/` and out of Git; third-party uninstaller cleanup wipes `%APPDATA%` — the academic JSON import is the restore path.
