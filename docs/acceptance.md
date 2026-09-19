# Acceptance record

## Automated scope

- Domain: grade zero versus missing score, assessment projection, references and dates, reminder coalescing.
- Calendar: recurring imports, EXDATE, changed occurrences, floating time zones, odd/even teaching weeks.
- Mail: MIME decoding and lossless long-message chunking.
- Digest: half-open time window and partial retry checkpointing using local fake provider responses.
- Desktop smoke: real Electron renderer and SQLite using isolated fictional data; create task and semester, add assessment, update completion through TODO, switch theme families (Windows dark, Catppuccin flavors, retro taskbar) without losing data, create timetable, restart and read data.

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

## Verified on 2026-09-18 (0.2.0)

- `npm.cmd test`: 30 tests passed across six suites. New coverage: locale-independent Monday week anchoring, teaching-week numbering across the Melbourne DST switch, calendar event visibility with archived courses/semesters, an anonymized Melbourne subscription fixture (wall times and occurrence IDs across the DST boundary), and cache pruning with digest-history capping.
- `npm.cmd run build`: TypeScript and all three production bundles passed.
- `npm.cmd run smoke`: passed with isolated fictional data, including restart persistence (`SMOKE_OK`, `PERSISTENCE_OK`).
- `npm.cmd run package`: installer generated for Windows x64. `node scripts/packaged-check.cjs` passed (`PACKAGED_RUNTIME_OK`, `PACKAGED_PERSISTENCE_OK`).
- Installer: `Workstation Setup 0.2.0.exe`, 121,556,877 bytes. SHA-256: `A2C9686D07CA58F50FC54374783EA8FFBE1C440D6FA63FF808A1A93566374517`.
- Real-feed compatibility spot check (kept out of version control per privacy rules): the user's actual university subscription URL served 56 KB over direct HTTPS and parsed into 144 single events; embedded Australia/Melbourne VTIMEZONE produced correct local wall times across the 2026-10-04 DST boundary (+10:00 before, +11:00 after) with zero duplicate IDs and stable ID sequences across parses. This validates the feed shape only; the user's installed-app subscription result remains a manual check.

## Verified on 2026-09-18 (0.3.0)

- `npm.cmd test`: 35 tests passed across seven suites, including the new module-plane boundary guards (shared/renderer/preload/main import isolation and bridge-only renderer service access).
- `npm.cmd run build`: TypeScript and all three production bundles passed.
- `npm.cmd run package`: NSIS EXE + MSI + MSIX produced in one pass via `scripts/package.cjs` with `--publish never` (the GH_TOKEN publish failure cannot recur). All three installers and the NSIS uninstaller are signed with the self-signed dev certificate through the custom sign hook (`scripts/sign.cjs`, Windows SDK 10.0.26100 signtool; the electron-builder bundled 2018 signtool cannot sign MSIX). `signtool verify /pa` reports only the expected untrusted-root error on every format.
- `node scripts/packaged-check.cjs`: passed (`PACKAGED_RUNTIME_OK`, `PACKAGED_PERSISTENCE_OK`).
- `node scripts/organize-release.cjs`: installers archived per version under `release/<version>/`; `win-unpacked/` and `latest.yml` remain at the root.
- Installer hashes: EXE 121,562,480 bytes SHA-256 `CF5442C838DBECF7FF0F60ABC36DCD0E654E899CE5E1DDA4D3039DBF5AE451EB`; MSI 136,028,160 bytes SHA-256 `E6E78B03128402A369DDAF1B4E169F1BB1CCEA9AC77DED751E0488FCCD48CBC4`; MSIX 177,708,657 bytes SHA-256 `71469CFE7CE612BE44FF84B31BED8A6EE562E7729CBC309E3BB8D13E3C89E61E`.
- Installed-app data onboarding performed against the real profile with pre-backup (`workspace.db.backup-*` + `before-import-*.json`): one semester, four courses, 21 assessments, three hurdles, and the live university subscription (144 events, all course-mapped). MSIX installation requires trusting `.local/certs/workstation-dev.cer` first (see README); that install path plus real subscription refresh in the installed app remain manual checks.

## Verified on 2026-09-18 (0.4.0)

- `npm.cmd test`: 35 tests passed across seven suites; `npm.cmd run build`: passed.
- `npm.cmd run smoke`: passed (`SMOKE_OK`, `PERSISTENCE_OK`).
- `npm.cmd run package`: NSIS EXE + MSI only (MSIX shelved), both signed with the self-signed dev certificate via `scripts/sign.cjs`; the NSIS uninstaller signed as well. The sign hook now no-ops without a certificate, so the CI packaging failure (`no certificate configured for signing`) is resolved.
- `node scripts/packaged-check.cjs`: passed (`PACKAGED_RUNTIME_OK`, `PACKAGED_PERSISTENCE_OK`).
- Installer hashes: EXE 121,562,328 bytes SHA-256 `6E2C608157D03B17FF8BA47198FDDE85ED73EA6434614C4E5F432B251BAD988D`; MSI 136,028,160 bytes SHA-256 `3C6FC6A3A16F99EA1A0CDD9856673B8E3DD5485552D4CFDB3EB6F41EFB065A71`.
- Real-profile data incident: the 0.3.0 academic onboarding was wiped by a third-party uninstaller's leftover cleanup (the app's own uninstaller preserves data). Data was re-imported into the fresh profile (verified counts identical), and a personal academic import package was produced for in-app self-service restore. This event motivated the README data-safety section.

## Verified on 2026-09-19 (0.5.0)

- `npm.cmd test`: 41 tests passed across eight suites, including the new theme-package suite (`tests/theme.test.ts`: build-themes output validates against `validateThemePackage`, variant/shared CSS inlining, `pickVariant` fallback) and the settings-schema cases (`theme` + `variant`, legacy `flavor` field dropped).
- `npm.cmd run build`: TypeScript, theme-package build (`scripts/build-themes.cjs` → `themes/dist/*.wstheme.json`), and all three production bundles passed.
- `npm.cmd run smoke`: passed (`SMOKE_OK`, `PERSISTENCE_OK`, `THEMES_OK`). The theme flow installs Catppuccin from a real `.wstheme.json` file through a stubbed open dialog, switches Windows dark → Catppuccin → Macchiato variant → installs the retro example via the one-click example button → retro taskbar shell (`.theme-retro.shell-taskbar`) → back to Windows, asserting task/semester data and dialog accessibility survive every switch; screenshots of each theme are captured.
- A Mica rendering bug was caught before release: the transparent root rule used a descendant selector (`.theme-windows.material-on .root-theme`) that never matches because all theme classes live on the same root element; fixed to the compound selector and verified present in the packaged stylesheet.
- `npm.cmd run package`: NSIS EXE + MSI produced and signed with the self-signed dev certificate (uninstaller signed). Both example theme packages ship via `extraResources` (`resources/themes/*.wstheme.json`, verified inside `win-unpacked`). `node scripts/packaged-check.cjs`: passed (`PACKAGED_RUNTIME_OK`, `PACKAGED_PERSISTENCE_OK`). Installers archived under `release/0.5.0/`.
- Installer hashes: EXE 121,570,536 bytes SHA-256 `775F6C424B4D9FE5F0D5BD68EDD35C3372F844B73F8DB24967FAE03870EA909F`; MSI 136,036,352 bytes SHA-256 `91ADF55AF971E7A1FBA03396F88EA95D62EAB1B367B0DB8C502288C0781B6372`.
- Remaining manual checks for this release: installed-app visual acceptance of Mica transparency and the floating sidebar on the real desktop (the smoke forces material off), one-click example theme install in the installed app, the retro start-menu/clock interaction, and material fallback on systems without Windows 11 22H2+.

## Requires user-owned configuration or manual installed-app verification

- Google OAuth browser flow, consent policy, refresh after expiry, revoke/reconnect.
- DeepSeek actual response quality, account quota and selected model.
- A real school ICS subscription including its particular time zone definitions and changes.
- Installed Windows notification delivery, focus settings, login launch, sleep/resume and uninstall preservation.
- Credentials encrypted on the user's Windows account and actual cross-computer backup workflow.

No provider credentials or user-owned academic/mail data are present in automated fixtures.
