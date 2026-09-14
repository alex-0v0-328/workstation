# Acceptance record

## Automated scope

- Domain: grade zero versus missing score, assessment projection, references and dates, reminder coalescing.
- Calendar: recurring imports, EXDATE, changed occurrences, floating time zones, odd/even teaching weeks.
- Mail: MIME decoding and lossless long-message chunking.
- Digest: half-open time window and partial retry checkpointing using local fake provider responses.
- Desktop smoke: real Electron renderer and SQLite using isolated fictional data; create task and semester, add assessment, update completion through TODO, switch theme, create timetable, restart and read data.

## Verified on 2026-09-14

- `npm.cmd test`: 18 tests passed across six suites.
- `npm.cmd run build`: TypeScript and all three production bundles passed.
- Hidden Electron smoke passed with fictional data: one semester, two courses, two assessments, one manual task, and 20 timetable occurrences. A date-pending assessment was created inside the five-step wizard.
- The smoke verified completion from TODO updates the original assessment, native dialogs restore page accessibility, dark theme tokens apply, a 1000-pixel-wide window has no horizontal overflow, and database/theme state persists after restart.
- Backup smoke wrote a real JSON file, restored it after a subsequent change, verified the automatic before-restore copy, and rejected an invalid version without altering existing data.
- Independent read-only review found and verified fixes for three issues: morning catch-up consuming the evening digest slot; subscription refresh overwriting individual occurrence mappings; and unlinked manual events disappearing from the calendar.
- Installer generation succeeded for Windows x64. The final packaged executable passed resource loading, secure bridge settings, SQLite writes, and restart persistence checks (`PACKAGED_RUNTIME_OK`, `PACKAGED_PERSISTENCE_OK`).
- Installer: `Workstation Setup 0.1.0.exe`, 121,556,328 bytes. SHA-256: `5ADAD00264F0BACDE752C7FCC2767CDA7B6178FEA2C5F2B6588D511AA099D25A`.

The expected invalid-backup rejection appears in Electron stderr during the smoke test. It is an asserted rejection path, not a failed smoke run. Provider requests in unit tests are fake responses.

Hidden packaged-EXE screenshots time out on this host after fonts load. Full interaction/screenshot coverage uses the Electron development launcher; packaged runtime coverage uses `scripts/packaged-check.cjs`. Installed interactive rendering and Windows integration remain manual checks.

## Requires user-owned configuration or manual installed-app verification

- Google OAuth browser flow, consent policy, refresh after expiry, revoke/reconnect.
- DeepSeek actual response quality, account quota and selected model.
- A real school ICS subscription including its particular time zone definitions and changes.
- Installed Windows notification delivery, focus settings, login launch, sleep/resume and uninstall preservation.
- Credentials encrypted on the user's Windows account and actual cross-computer backup workflow.

No provider credentials or user-owned academic/mail data are present in automated fixtures.
