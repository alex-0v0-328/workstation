# Workstation

- Work only in this repository. Preserve the active checkout and WIP.
- Communicate in Chinese; use American English for code, comments, and commits.
- Product decisions: `docs/product.md`. User input template: `docs/academic-template.md`. Import fixture: `examples/academic-example.json`.
- Keep business data and operations independent of theme components. The first theme is Windows Fluent, with light and dark modes.
- Academic assessments are the source of truth in TODO views; never create editable duplicate tasks.
- Keep credentials, personal academic information, mail, local databases, and build outputs out of Git.
- Use PowerShell and npm.cmd on Windows. Run `npm.cmd test` and `npm.cmd run build` before claiming an implementation milestone.
- Report real OAuth, AI, subscription, and installed desktop acceptance separately from automated checks.
- Taste-skill guidance applies only to this project; use only guidance appropriate to desktop productivity interfaces.

## Architecture and maintenance

- `src/shared/`: types, validation, grade/TODO/date rules, calendar recurrence. Keep these independent of themes and Electron.
- `src/main/`: SQLite ownership, revision checks, provider requests, encrypted secrets, backup/restore and scheduler. IPC validates input and only accepts the main application frame.
- `src/preload/`: explicit typed bridge only. Do not expose raw Electron, SQL or filesystem APIs.
- `src/renderer/src/`: feature views and local form state. `themes.tsx` owns the developer-shipped theme registry and layout contract; `model.tsx` supplies shared state/actions. Theme switches must not reset data or drafts.
- Modal dialogs use the native HTML dialog lifecycle. Regression: unmounting the previous Fluent modal left `#root` aria-hidden. Preserve the smoke check for accessibility after closing dialogs.
- Academic timestamps preserve date-only versus precise values. Apply the semester time zone to assessments; apply the app time zone to manual tasks. No invented 23:59 deadlines or automatic hurdle decisions.
- Digest windows are half-open; advance the checkpoint only after all included mail succeeds. Retain chunk cache for partial retries and do not mark mail outside the window processed.
- Database schema version and JSON backup version are explicit. Preserve older user data with migrations; never silently replace a database or draft during upgrades.

## Verification and delivery

- `npm.cmd ci` installs locked dependencies and rebuilds better-sqlite3 for Electron. The Node and Electron native ABIs differ; run database integration through Electron.
- `npm.cmd test`: isolated domain/calendar/MIME/digest checks plus module-plane boundary guards (shared/renderer/preload/main import rules). Provider tests use fake responses, not live account verification.
- `npm.cmd run build`: TypeScript plus main/preload/renderer production builds.
- `npm.cmd run smoke`: hidden real Electron UI, isolated `.local/` data, task/study/calendar/theme flows, backup and restart checks. Do not remove isolation or use the user's formal profile for tests.
- `npm.cmd run package`: `scripts/package.cjs` drives electron-builder with `--publish never` (never contacts GitHub) and produces NSIS EXE + MSI + MSIX for Windows x64 in `release/`. When `.local/certs/workstation-dev.pfx` (self-signed dev certificate, never committed) exists it signs all three formats; MSIX is skipped without it since unsigned MSIX cannot be installed. `node scripts/organize-release.cjs` sorts installers into `release/<version>/` while `win-unpacked/` and `latest.yml` stay at the root. `scripts/generate-icon.ps1` regenerates the checked-in application icon.
- `node scripts/packaged-check.cjs`: packaged EXE resource/bridge/SQLite/restart validation without screenshot capture. On this Windows host, screenshots of the hidden packaged EXE time out; full UI screenshots are verified with the Electron development launcher instead.
- GitHub remote: `https://github.com/alex-0v0-328/workstation`. Use cohesive commits and milestone tags. CI checks Windows builds and uploads installer artifacts.
- Keep `docs/acceptance.md` current with verified evidence and remaining manual/provider checks. Keep `README.md` and `docs/setup.md` consistent with user-visible behavior.
