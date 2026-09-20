# Workstation

- Work only in this repository. Preserve the active checkout and WIP.
- Communicate in Chinese; use American English for code, comments, and commits.
- Product decisions: `docs/product.md`. User input template: `docs/academic-template.md`. Import fixture: `examples/academic-example.json`.
- Windows/Fluent design reference and design toolchain conventions (pen.dev, taste-skill): `docs/design-windows.md`.
- Keep business data and operations independent of theme components. Only the `windows` theme ships built-in (light/dark modes, Mica material, sidebar shell). All other themes are installable `.wstheme.json` packages defined by the contract in `src/shared/theme-manifest.ts`; packages may declare Mica/Acrylic material, degrading to solid color when unsupported.
- Academic assessments are the source of truth in TODO views; never create editable duplicate tasks.
- Keep credentials, personal academic information, mail, local databases, and build outputs out of Git.
- Use PowerShell and npm.cmd on Windows. Run `npm.cmd test` and `npm.cmd run build` before claiming an implementation milestone.
- Report real OAuth, AI, subscription, and installed desktop acceptance separately from automated checks.
- Taste-skill guidance applies only to this project; use only guidance appropriate to desktop productivity interfaces.

## Architecture and maintenance

- `src/shared/`: types, validation, grade/TODO/date rules, calendar recurrence, plus the typed trilingual dictionary (`src/shared/i18n/`). Keep these independent of themes and Electron. All user-facing strings must go through the dictionary (see `docs/i18n.md`); never hardcode UI copy.
- `src/main/`: SQLite ownership, revision checks, provider requests, encrypted secrets, backup/restore and scheduler. `index.ts` keeps app lifecycle and IPC wiring; `window.ts` owns window creation/material, `tray.ts` the tray, `scheduler.ts` reminders/subscription sync/digest ticks. IPC validates input and only accepts the main application frame.
- `src/preload/`: explicit typed bridge only. Do not expose raw Electron, SQL or filesystem APIs.
- `src/renderer/src/`: feature views and local form state. `themes/registry.tsx` owns the developer-shipped theme registry and layout contract; `model.tsx` supplies shared state/actions. Theme switches must not reset data or drafts.
- Theme shells are `sidebar` and `taskbar` primitives under `src/renderer/src/themes/shells/`. The root DOM class contract is `root-theme theme-<id> variant-<vid> light-mode|dark-mode shell-<sidebar|taskbar> material-on|off`.
- Theme packages are validated and built by `scripts/build-themes.cjs`, which runs before both `npm run build` and `npm run smoke` and inlines shared/variant CSS into `themes/dist/*.wstheme.json`. Packages may also declare optional `layout` tokens (see the token table in `docs/design.md`) for layout geometry and density.
- UI language is `zh-CN` (default), `zh-TW`, or `en-US`, switched instantly from Settings. Dictionaries live in `src/shared/i18n/` with type-enforced key parity; the main process translates via `src/main/i18n.ts` and rebuilds the tray on language change.
- Profiles are version-2 JSON (`{ version: 2, exportedAt, workspace, themes }`): export carries installed theme packs, import validates each pack and always accepts legacy v1 workspace-only backups. Credentials and mail/AI caches never enter a profile; the before-restore snapshot semantics are unchanged.
- Electron-builder packs the built theme files via `extraResources` (`themes/dist` → `themes`) so the packaged app can load them.
- Modal dialogs use the native HTML dialog lifecycle. Regression: unmounting the previous Fluent modal left `#root` aria-hidden. Preserve the smoke check for accessibility after closing dialogs.
- Academic timestamps preserve date-only versus precise values. Apply the semester time zone to assessments; apply the app time zone to manual tasks. No invented 23:59 deadlines or automatic hurdle decisions.
- Digest windows are half-open; advance the checkpoint only after all included mail succeeds. Retain chunk cache for partial retries and do not mark mail outside the window processed.
- Database schema version and JSON backup version are explicit. Preserve older user data with migrations; never silently replace a database or draft during upgrades.

## Verification and delivery

- `npm.cmd ci` installs locked dependencies and rebuilds better-sqlite3 for Electron. The Node and Electron native ABIs differ; run database integration through Electron.
- `npm.cmd test`: isolated domain/calendar/MIME/digest checks plus module-plane boundary guards (shared/renderer/preload/main import rules). Provider tests use fake responses, not live account verification.
- `npm.cmd run build`: TypeScript plus main/preload/renderer production builds.
- `npm.cmd run smoke`: hidden real Electron UI, isolated `.local/` data, task/study/calendar/theme flows, profile export/restore, language switch, and restart checks. Do not remove isolation or use the user's formal profile for tests.
- `npm.cmd run package`: `scripts/package.cjs` drives electron-builder with `--publish never` (never contacts GitHub) and produces NSIS EXE + MSI for Windows x64 in `release/`. When `.local/certs/workstation-dev.pfx` (self-signed dev certificate, never committed) exists, the `scripts/sign.cjs` hook signs both formats with the Windows SDK signtool; without a certificate the hook skips signing so CI builds stay green. MSIX was evaluated in 0.3.0 and shelved (self-signed MSIX requires a manual certificate-trust step). `node scripts/organize-release.cjs` sorts installers into `release/<version>/` while `win-unpacked/` and `latest.yml` stay at the root. `scripts/generate-icon.ps1` regenerates the checked-in application icon.
- `node scripts/packaged-check.cjs`: packaged EXE resource/bridge/SQLite/restart validation without screenshot capture. On this Windows host, screenshots of the hidden packaged EXE time out; full UI screenshots are verified with the Electron development launcher instead.
- GitHub remote: `https://github.com/alex-0v0-328/workstation`. Use cohesive commits and milestone tags. CI checks Windows builds and uploads installer artifacts.
- Keep `docs/acceptance.md` current with verified evidence and remaining manual/provider checks. Keep `README.md` and `docs/setup.md` consistent with user-visible behavior.

## Collaboration workflow (this installation)

### Collaboration principles

- §1.1 Quadrant assistance — classify each message before acting:
  - Known to both sides → execute directly; do not re-confirm.
  - Known to Alex, unknown to the agent (preferences, standards, real-world constraints) → ask when it affects the outcome; otherwise state the assumption and proceed.
  - Known to the agent, unknown to Alex (risks, better paths, wrong premises) → speak up proactively, with evidence.
  - Unknown to both → turn it into a verifiable hypothesis: minimal experiment plus explicit success/failure signals.
- §1.2 Sub-agent collaboration — the main agent owns the goal, scope, decomposition, and acceptance; sub-agents do only what is delegated:
  - Every dispatch carries six elements: goal, context, allowed paths, forbidden paths, deliverable format, acceptance criteria.
  - Sub-agents never widen scope or change direction; out-of-scope findings are reported, not decided.
  - Reports must include result, evidence (file paths with line numbers), actual changes, verification, assumptions, and leftovers; the main agent re-checks against the live codebase before accepting.
  - Parallel work never shares write files; two Gradle runs never write to the same output directory.
- §1.3 Reply principles — write for a reader who only reads the first and last line:
  - First line = an actionable result/command/conclusion; last line = exactly one next step doable within two minutes.
  - Number multi-step work; keep a one-line progress anchor per item; state errors plainly (cause, fix, done).
  - Lists ≤ 5 items; no preamble, no pleasantries; communicate in Chinese; an ignored or timed-out question means stop and wait — never treat it as consent.

- Every release bumps `package.json` `version` (the settings page renders it via JSON import; never hardcode a version string). Run the full verification chain and let the user install-test before locking a version.
- Lock a version only after the user confirms: one cohesive commit (the user picks the subject), a milestone tag `v*`, then push.
- This host is WSL driving a Windows checkout: run Windows tools via `cmd.exe /c "cd /d C:\alex\code\workstation-alex0v0 && ..."`. `node_modules` is Windows-built, so WSL-side node cannot run it. `git push` only works from Windows-side git (credential manager); WSL git/ssh has no GitHub credentials.
- The Superpowers plugin (installed per-user, so it loads in every project) is permitted in this repository only with these overrides: never invoke its git-worktree or branch-finishing skills, and never auto-commit per task — milestone locking above stays unchanged. Tests and builds still run exclusively through the Windows toolchain (`cmd.exe /c "cd /d C:\alex\code\workstation-alex0v0 && npm.cmd ..."`).
- The user's real profile lives at `%APPDATA%\Workstation`. Never write to it without a fresh backup and the app fully quit (close-to-tray means the window X does not quit). Personal data packages (e.g. `.local/*.json` with subscription tokens) stay in `.local/` and out of Git; third-party uninstaller cleanup wipes `%APPDATA%` — the academic JSON import is the restore path.
