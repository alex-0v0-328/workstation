# Changelog

## 0.8.2 — 2026-09-28

新增 Cyber 赛博朋克示例主题。

- 新增示例主题包 Cyber 赛博朋克（`themes/cyber/`，变体 Acid）：纯黑底、荧光黄强调、切角几何、边缘辉光，侧边栏带涂鸦色块。它与 Catppuccin、复古 Windows 一样随安装包分发，可在“设置 → 外观与桌面”一键安装。
- smoke 的主题步骤改为按示例行定位“安装”按钮：先装复古 Windows，再装 Cyber 并切换到 Acid 变体。修复了示例包增加到三个后“安装”按钮定位不唯一的问题。
- README、`docs/product.md`、`docs/themes.md` 的示例主题清单同步加入 Cyber。

Live provider credentials are not bundled. Actual Gmail, DeepSeek, school subscription, and installed Windows notification/login-launch acceptance remain explicitly separate from automated coverage.

## 0.8.1 — 2026-09-25

TODO 看板重组、邮件列表缓存优先、每日总结可靠性修复、按时间轴排布的周课表。本版本包含 2026-09-24 的 0.8.0 装测构建。

- TODO 页改为一行页签：今天 / 有DDL / 日常 / 已完成 / 已归档。有DDL 下再分今天 / 未来七天 / 全部三个时间范围。列表按「学业 / 生活」分组；尚未公布时间的学业考核归入「待排期」，不会出现在「日常」里。分类统一由 `todoBucket` 决定。
- 新建入口合并为一个对话框，用「日常」（默认，无截止日期）和「有DDL」两张类型卡片切换。
- 「已完成」页签新增「归档已完成（N）」批量归档。已记录分数或通过/不通过结果的学业考核不会被归档，成绩统计的数据因此得以保留。
- 邮件列表改为缓存优先：先显示本机缓存的快照，再联网刷新（`mail:list` 新增 `cachedOnly` / `hit`）。未输入搜索词时，邮件按日期分组。
- 每日总结：过期的未完成总结不再阻塞新时段，只续做属于当前窗口的未完成总结。一次总结完成后，同一天内窗口被它完全覆盖的旧总结会被替换。生活页把总结分为「今天的总结」和可展开的「历史总结」。
- 周课表改为按时间比例排布：以 08:00–20:00 为基准，遇到更早或更晚的课程会自动延展；时间重叠的课程并排分栏，全天事件单独占一行，当天显示当前时间线。
- 设置页的各个区块可以折叠，折叠状态保存在本机。

Live provider credentials are not bundled. Actual Gmail, DeepSeek, school subscription, and installed Windows notification/login-launch acceptance remain explicitly separate from automated coverage.

## 0.7.0 — 2026-09-20

TODO 分类与双模式新建、Gmail 接入简化为应用专用密码、DeepSeek 默认模型升级、后台运行开关。

- TODO 页分为「有DDL」与「无DDL」两个一级分类（学业考核都有截止日期，学业条目带「学业」标签，手动事项不再标注来源）；时间范围、搜索与状态/优先级/课程筛选作用于当前分类，统计条按分类计数。新建入口并入分类：有DDL 直接打开完整表单，无DDL 只需填写名称。编辑既有事项仍走完整编辑器。
- Gmail 接入从 Google Cloud OAuth 改为 IMAP + 应用专用密码：设置页只需 Gmail 地址和 16 位应用专用密码（空格自动忽略），点击“测试并连接”即完成。邮件读取改用 imapflow（PEEK 模式，不改已读状态），MIME 解析改用 mailparser；摘要半开窗口、分块缓存与部分重试语义不变。“在 Gmail 打开”改用 rfc822msgid 搜索链接。
- DeepSeek 默认模型 `deepseek-chat` → `deepseek-flash`（官方当前推荐），模型输入框提供 `deepseek-flash` / `deepseek-v4-pro` 候选，仍可自由填写。
- 邮件总结窗口重定义：手动点击「生成 / 重试总结」总结今天 00:00 至今的收件箱邮件；每日自动总结覆盖昨日设定时间到今日设定时间的 24 小时窗口（应用时区）。窗口内邮件全量覆盖，不再按历史摘要跳过；AI 分块缓存保证重复总结不产生额外模型调用。
- 新增界面字体选择：Windows 默认 / 苹方 (PingFang SC) / SF Pro / CaskaydiaCove Nerd Font，经 Fluent 主题 `fontFamilyBase` 注入即时生效（修复 Fluent 运行时样式覆盖导致选择无效的问题），与主题独立。
- 设置页改为单列纵向布局；主题切换改为下拉选择（与语言、字体一致），始终显示当前主题名；Catppuccin 主题的默认变体改为 Mocha。
- 界面文案大规模精简：移除 19 个装饰性/重复提示（字段注释、副标题、说明段落），缩短 6 个说明；保留隐私与数据安全相关说明。
- 新增「关闭窗口后后台运行（驻留托盘）」开关（默认开，保持旧行为；关闭后叉掉窗口即退出应用）；开机自启开关文案独立，且应用启动时会向 Windows 同步一次登录项，防止外部改动漂移。`settings.closeToTray` 经 schema 默认值兼容旧数据，无需迁移。
- 凭据仍为 safeStorage 加密的本机 `secrets.bin`（Gmail 应用专用密码 + DeepSeek key），不进用户档案导出；`docs/setup.md` 重写为两步验证 + 应用专用密码指引。

Live provider credentials are not bundled. Actual Gmail, DeepSeek, school subscription, and installed Windows notification/login-launch acceptance remain explicitly separate from automated coverage.

## 0.6.0 — 2026-09-19

Trilingual UI, layout-token theme contract, profile packages, and a simplification pass. No new features.

- 三语言界面：简体中文（默认）、繁體中文、English (US)。全部界面文案（视图、对话框、托盘、通知、OAuth 回调页与校验错误）进入 `src/shared/i18n/` 类型化对照表，三语种 key 由类型系统强制对齐；`t()` 支持 `{count}` 插值与英语单数 `_one` 变体。设置页新增语言选择，`Settings.language` 由 schema 默认值兼容旧数据；切换语言即时重建托盘菜单与 `<html lang>`。
- 主题包契约新增可选 `layout` 字段（主题级与变体级）：白名单排版 token（`sidebarWidth`、`sidebarRadius`、`topbarHeight`、`contentMaxWidth`、`panelWidth`、`mailPaneWidth`、`fontSizeBase`、`lineHeightBase`、`spaceUnit`、`radiusSm`/`radius`/`radiusLg`），经 `themes/registry.tsx` 注入为作用域 CSS 变量；`base.css` 布局尺寸改为 `var(--x, 默认值)`，存量主题渲染逐像素不变。`scripts/build-themes.cjs` 与 `tests/theme.test.ts` 同步校验。
- 用户档案包 v2：导出 `{ version: 2, exportedAt, workspace, themes }`，随档案携带已安装主题包；导入逐包校验（无效主题跳过并在确认框说明），旧 v1 纯工作区备份永远可恢复。凭据与邮件/AI 缓存仍不进入档案，恢复前快照语义不变。
- 主进程精简：`index.ts` 拆出 `window.ts`（窗口与材质）、`tray.ts`、`scheduler.ts`（提醒/订阅同步/digest 调度）；渲染层提取共享导航 `themes/shells/nav.tsx`，SettingsView 按区分组件，清理无引用导出。
- 设计打磨：成绩条/周日号/日期列/议程时间启用 tabular-nums；列表与卡片补 hover 过渡与 :active 下沉反馈；tabs 增加 hover；英文长徽章与单复数排版回归。
- 修复：设置页受控 select（语言、外观模式）在异步保存中读回已回退的 DOM 值导致选择不生效的问题。

Live provider credentials are not bundled. Actual Gmail, DeepSeek, school subscription, and installed Windows notification/login-launch acceptance remain explicitly separate from automated coverage.

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
