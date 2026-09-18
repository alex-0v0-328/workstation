# Changelog

## 0.3.0 — 2026-09-18

Packaging and architecture-guard release; no user-data behavior changes.

- Package Windows x64 as NSIS EXE, MSI, and MSIX in one `npm run package` pass; electron-builder always runs with `--publish never` so packaging never contacts GitHub.
- Sign all three formats with the local self-signed development certificate when `.local/certs/workstation-dev.pfx` exists (never committed); MSIX is skipped without it because unsigned MSIX cannot be installed.
- Sort versioned installers into `release/<version>/` via `scripts/organize-release.cjs`, keeping `win-unpacked/` and `latest.yml` at the root.
- Add module-plane boundary tests that fail if domain data (`src/shared`), presentation (`src/renderer`), or desktop services (`src/main`) import across planes, so future edits to one plane cannot leak into another.

Live provider credentials are not bundled. Actual Gmail, DeepSeek, school subscription, and installed Windows notification/login-launch acceptance remain explicitly separate from automated coverage.

## 0.2.0 — 2026-09-18

Maintenance release hardening timetable week rules, cache hygiene, and release bookkeeping.

- Show the application version from `package.json` in settings instead of a hardcoded string.
- Anchor teaching-week starts to Monday independent of system locale, and count calendar days so DST switches cannot skew week numbering.
- Unify timetable week navigation on the selected semester's time zone for both the initial week and the "this week" button.
- Hide manual timetable events whose course (or its semester) is archived, matching the TODO cascade semantics.
- Prune mail list/body and AI result cache entries older than 30 days on Gmail connect and on the daily tick; cap digest history at 90 entries.
- Verify a real university subscription feed (144 single events with an embedded Melbourne VTIMEZONE across the DST boundary) parses with correct wall times and stable occurrence IDs; add an anonymized regression fixture.

Live provider credentials are not bundled. Actual Gmail, DeepSeek, school subscription, and installed Windows notification/login-launch acceptance remain explicitly separate from automated coverage.

## 0.1.0 — 2026-09-14

Initial Windows desktop version with local study, task, and mail workflows.

- Add a five-step semester wizard with drafts, configurable courses, assessments, manual hurdles, and timetable preview.
- Share assessment progress directly between study and TODO; retain date-only and unknown dates, manual tasks, archives, and reminders.
- Add basic weighted grade accounting without normalizing incomplete weights or predicting hurdle outcomes.
- Import ICS files/subscriptions and expand manual teaching-week schedules; preserve canceled and modified occurrences and individual course mappings.
- Add read-only Gmail OAuth, safe mail reading, DeepSeek translation, incremental digests, and persistent retry checkpoints.
- Add Windows Fluent light/dark/system modes, a theme layout contract, tray behavior, backup/restore, and an x64 installer.
- Establish project `AGENTS.md`, the academic template, setup guide, automated checks, and Windows CI.

Live provider credentials are not bundled. Actual Gmail, DeepSeek, school subscription, and installed Windows notification/login-launch acceptance remain explicitly separate from automated coverage.
