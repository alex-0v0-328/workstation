# Changelog

## 0.5.0 — 2026-09-19

Theme package architecture and a redesigned shared shell.

- 内置仅 Windows 11 主题：Mica 毛玻璃与悬浮侧边栏 shell；主题包可声明 Mica/Acrylic 材质，系统不支持时自动降级实色。
- 用可安装的 `.wstheme.json` 主题包替代旧的内置多主题机制：format 1 契约位于 `src/shared/theme-manifest.ts`，可在设置页安装/移除。示例包随应用提供：Catppuccin（Latte/Frappé/Macchiato/Mocha 四变体）与复古 Windows 任务栏 shell，均支持一键安装。
- 设置页外观区改为行式列表，移除示意图卡片。
- 工作区设置从 `flavor` 迁移为 `theme` + `variant`；旧配置仍可解析，且切换主题不会重置数据或草稿。
- 将 `scripts/build-themes.cjs` 插入构建链（`npm run build`）与 smoke 前置步骤，生成 `themes/dist/*.wstheme.json`。
- 通过 `extraResources` 将 `themes/dist` 打包为安装目录下的 `themes`，供应用加载。
- 新增 `tests/theme.test.ts`，校验主题包构建、CSS 内联、共享 CSS 与变体解析。

Live provider credentials are not bundled. Actual Gmail, DeepSeek, school subscription, and installed Windows notification/login-launch acceptance remain explicitly separate from automated coverage.

## 0.4.0 — 2026-09-18

Packaging hardening and data-safety documentation; no runtime behavior changes.

- Fix CI packaging failure: the custom sign hook now skips signing when no certificate is configured instead of aborting the build.
- Drop the MSIX target and keep NSIS EXE + MSI. MSIX signing was proven in 0.3.0, but a self-signed MSIX requires a manual certificate-trust step that adds friction without value here.
- Document the academic JSON import as the supported external data interface (semesters, courses, assessments, hurdles, timetable sources and events) alongside in-app editing, and document that third-party "leftover cleaner" uninstallers wipe `%APPDATA%` data while the app's own uninstaller keeps it.

Live provider credentials are not bundled. Actual Gmail, DeepSeek, school subscription, and installed Windows notification/login-launch acceptance remain explicitly separate from automated coverage.

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
