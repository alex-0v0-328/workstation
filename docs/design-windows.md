# Workstation 0.6.0 Windows 桌面设计参考

## 开篇说明

本文档是 0.6.0 阶段设计优化的**外部参考与工具链约定**，用于在 pen.dev、WinUI 设计原则、taste-skill 等外部输入与项目实现之间建立转换层。

项目已锁定的视觉契约见 [`docs/design.md`](./design.md)。**当本文内容与 `docs/design.md` 冲突时，以 `docs/design.md` 为准。** 本文档不重复定义 token 表、壳契约、材质规则或检查清单，只说明如何引用、映射与验证。

- 调研日期：2026-09-19
- 信息来源：
  - Microsoft Fluent 2 for Windows：[fluent2.microsoft.design/components/windows](https://fluent2.microsoft.design/components/windows)
  - WinUI 3 官方文档：[learn.microsoft.com/windows/apps/winui/winui3](https://learn.microsoft.com/en-us/windows/apps/winui/winui3/)
  - OpenAI curated `winui-app` skill 参考文件（已做适配萃取，见下节）
  - pen.dev 官网与桌面客户端说明：[https://pen.dev](https://pen.dev)

## Fluent 2 Windows 权威参考

| 外部参考 | 项目对应关系 |
|---|---|
| [Fluent 2 for Windows](https://fluent2.microsoft.design/components/windows) | 项目 UI 组件库 `@fluentui/react-components` v9 即 Fluent 2 设计体系的官方 React 实现 |
| [WinUI 3 文档](https://learn.microsoft.com/en-us/windows/apps/winui/winui3/) | 仅用作设计原则来源；项目使用 Electron + React，不直接使用 WinUI 3/XAML |
| Windows UI kit（Figma） | 仅作静态视觉参考，项目不使用 Figma 工作流或 Figma MCP |
| Fluent 2 elevation tokens（`shadow2`/`shadow4`/`shadow8`/`shadow16`/`shadow28`/`shadow64`） | 已映射到 `docs/design.md` 的 `--shadow2..64` token 表，定义于 `src/renderer/src/styles/base.css` |
| WinUI Mica / Acrylic 背景材质 | 已映射到 `docs/design.md` 的材质规则：`mica` 主窗口背景、`acrylic` 瞬态浮层、`none` 实色，并由 `src/shared/theme-manifest.ts` 的 `material` 枚举约束 |

## WinUI 设计原则萃取（适配本项目）

以下原则来自 OpenAI curated `winui-app` skill 的五个参考文件，已剔除 XAML/C#/WinUI 3 专属实现细节，转写为适用于 Electron + Fluent UI React + CSS 变量主题包的条款。

### 1. 优先使用现成组件与命令表面

- **原则**：不要为“外观不一样”而自绘整套按钮行、工具栏或弹窗；优先使用 `@fluentui/react-components` 提供的 `Toolbar`、`Menu`、`Dialog`、`Popover`、`Button`、`SplitButton` 等现成命令表面。
- **本项目落点**：
  - 页面级操作使用 `Toolbar` 或 `Menu` 组合；模态决策使用 `Dialog`（遵循原生 HTML dialog 生命周期，见 `AGENTS.md`）。
  - 自定义组件只应做**组合**（把现成组件拼成业务视图）与**换肤**（覆盖 CSS 变量），不重新实现焦点、键盘、ARIA 行为。
  - 出处：`src/renderer/src/` 各 feature views；主题壳在 `src/renderer/src/themes/shells/`。

### 2. 避免“双层卡片”嵌套

- **原则**：如果子内容本身已经是卡片/面板，就不要再在外面包一层装饰性容器；用间距、标题、分割线完成分组。
- **本项目落点**：
  - `docs/design.md` 新增页面检查清单已要求“卡片使用 1px stroke，不依赖装饰阴影表达层级”。
  - 新增页面时自检：若删除某个外层 `border`/`surface` 后层级依然清晰，则该容器是冗余的，应移除。

### 3. 滚动归属显式化

- **原则**：页面已纵向滚动时，集合不再自创横向滚动容器；必须明确哪个元素拥有滚动。
- **本项目落点**：
  - 邮件列表、任务列表、日历等长列表：主列 `main-content` 通常负责纵向滚动；横向“媒体架/标签架”仅在确有需要时使用独立容器，并保证键盘与触控可正常操作。
  - 避免把一个可滚动的集合嵌套在另一个可滚动区域内而不做显式隔离，防止滚动冲突或意外的单列堆叠。

### 4. 响应式是壳 + 页两级问题

- **原则**：`sidebar`/`taskbar` 两种 shell 与页面内容各自承担断点职责。
- **本项目落点**：
  - 壳层断点：`src/renderer/src/themes/shells/sidebar.tsx` 与 `taskbar.tsx` 负责侧栏宽度、悬浮/内嵌切换、底部栏折叠。
  - 页面断点：遵循 `docs/design.md` 的 `1200px` 与 `1000px` 断点，页面内容从多列 → 单列，从水平架 → 垂直堆叠。
  - 极小宽度下，shell 应切为 overlay 或最小化模式，页面内边距与装饰性 chrome 同步缩减。

### 5. 亮/暗双模式默认支持

- **原则**：不硬编码单模式颜色；主题包通过 `variants` 提供 light/dark，并保留高对比/节电场景下的可读性。
- **本项目落点**：
  - `docs/design.md` 根类名契约包含 `light-mode | dark-mode`。
  - `src/shared/theme-manifest.ts` 约束 `fluent` token 仅使用 `color[A-Z]` 开头的键，确保 Fluent UI 组件自身能跟随主题。
  - 主题包必须提供 `--bg`、`--surface`、`--text`、`--muted` 等语义变量，并在 `material-on` 与 `material-off` 两种状态下均可读。

### 6. 材质使用纪律

- **原则**：Mica 只给主窗口背景，Acrylic 只给瞬态浮层。
- **本项目落点**：直接引用 `docs/design.md` 的材质规则：
  - `mica` → 长驻主窗口背景 / 侧栏壳；`acrylic` → 菜单、弹窗、悬浮导航；`none` → 实色 fallback。
  - 由主进程根据平台能力裁决 `material-on/off`，主题包只声明 `material` 字段。
  - 具体实现：`src/renderer/src/styles/windows.css`、主进程窗口创建逻辑。

### 7. 字重、焦点环与 reduced-motion

- **原则**：用字重而非字号建立层级；焦点环清晰；在 `prefers-reduced-motion: reduce` 下无动画。
- **本项目落点**：
  - `docs/design.md` 已要求标题 `font-weight: 600`、指标 `500`、正文常规；焦点环使用 `var(--accent)`。
  - 新增页面检查清单包含 `prefers-reduced-motion` 项。
  - 动画只作为点缀，不能影响功能可见性；减少 motion 时必须保证状态切换仍然可感知（例如用瞬时透明度变化代替淡入淡出）。

### 8. 图标风格统一

- **原则**：使用 Fluent 图标语言，保持视觉重量一致，不混用多种图标风格。
- **本项目落点**：项目图标统一使用 `@fluentui/react-icons`；主题包不引入自有图标字体，避免与壳或页面图标风格冲突。

### 9. 长列表的感知性能

- **原则**：骨架屏、乐观更新、避免布局抖动；让主线程保持响应。
- **本项目落点**：
  - 邮件、任务、日历等长列表优先使用虚拟化友好布局，避免一次性渲染全部条目。
  - 远端数据加载时显示骨架屏或占位行，不阻塞滚动。
  - 批量更新后一次性设置状态，避免逐条触发重排；列表高度/宽度变化时使用稳定 key，减少 DOM 抖动。

## pen.dev 设计工作流约定

1. **文件存放**：`.pen` 设计文件放在仓库根目录的 `design/` 文件夹下，可安全提交 Git。**注意：`.pen` 文件是加密格式（pen.dev MCP server v1.0 实测确认），只能通过 pen.dev MCP 工具读写——不要对 `.pen` 文件使用 Read/Grep 等直接文件访问。**
2. **流程**：
   - 在 pen.dev 画布完成视觉与布局定稿；
   - 按 `docs/design.md` 的 token 表、壳契约与根类名契约，在 `src/renderer/` 实现；
   - 验证命令（Windows 侧）：
     ```
     cmd.exe /c "cd /d C:\alex\code\workstation-alex0v0 && npm.cmd test && npm.cmd run build"
     ```
   - 若涉及主题包、壳结构或材质变化，额外运行 `npm.cmd run smoke`。
3. **边界**：设计稿只表达视觉与布局；业务数据结构、学术评估规则、日期/时区规则仍以 `src/shared/` 与 `docs/product.md` 为准。

## pen.dev MCP 接入手册

### 用户手动步骤（Windows 侧）

1. 访问 [https://pen.dev](https://pen.dev) 下载并安装 Windows 桌面版（当前免费）。
2. 启动 pen.dev，新建 `.pen` 文档并保存到仓库 `design/` 目录。
3. 打开 Settings（⚙️）→ MCP，启用集成。

### AI 配置步骤（2026-09-19 已完成）

1. pen.dev 提供的官方配置为 stdio 形式（Windows 侧 exe，`--app desktop`）。已镜像为 WSL 路径写入用户级配置 `/home/alex/.kimi-code/mcp.json`（与既有 `jetbrains`、`context7` 条目并列，**该文件不进 Git**）：

   ```json
   {
     "mcpServers": {
       "pencil": {
         "command": "/mnt/c/Users/alex/AppData/Local/Programs/Pen/resources/app.asar.unpacked/out/mcp-server-windows-x64.exe",
         "args": ["--app", "desktop"],
         "startupTimeoutMs": 45000
       }
     }
   }
   ```

   对应 pen.dev 生成的原始 Windows 配置（供其他客户端参考）：

   ```json
   {
     "name": "pencil",
     "transport": "stdio",
     "command": "C:\\Users\\alex\\AppData\\Local\\Programs\\Pen\\resources\\app.asar.unpacked\\out\\mcp-server-windows-x64.exe",
     "args": ["--app", "desktop"]
   }
   ```

2. WSL → Windows exe 的 stdio 桥接已通过 initialize 握手实测（serverInfo: `pencil` v1.0.0），无需 mirrored networking。
3. 使用前提：pen.dev 桌面应用保持运行，且目标 `.pen` 文档处于打开状态（MCP 调用代理到运行中的桌面应用）。
4. 实测经验（2026-09-19）：桌面端未运行时，WSL 侧可用 `powershell.exe -NoProfile -Command "Start-Process 'C:\Users\alex\AppData\Local\Programs\Pen\Pen.exe'"` 拉起；`cmd.exe /c start` 在此环境会返回"拒绝访问"。`.pen` 文档只能由桌面端 UI 创建（加密格式），MCP 无法代建；首次使用需在 pen.dev 新建文档并保存到 `design/`。

### 备选路径

- 主配置（上节 exe 直连）已验证可用，无需备选。仅在以下情况考虑：
- 需要 headless 批量操作 `.pen` 文件时，可全局安装 pen.dev CLI：
  ```bash
  npm install -g @pen.dev/cli
  ```
  当前 WSL 侧 Node v24.19.0 已满足 Node ≥ 22.19 的要求。
- 若未来 pen.dev 改为监听 Windows 侧 `127.0.0.1` 的 HTTP 服务而 WSL 访问不通，**可选方案**是在 Windows 用户目录 `.wslconfig` 中启用 `networkingMode=mirrored`，然后执行 `wsl --shutdown` 重启 WSL。**执行前必须征得用户同意。**

### 验证方式

1. 配置在**新开会话**才会加载（当前会话不会注册 pencil 工具）；新会话中用 `/mcp` 确认 `pencil` 连接成功。
2. 保持 pen.dev 桌面应用运行并打开目标 `.pen` 文档，发送一次只读调用（例如读取画布元数据）做端到端确认。

## taste-skill 使用边界

项目用户级目录 `~/.agents/skills/` 已安装两个相关 taste-skill：

| 技能 | 用途 | 本项目使用建议 |
|---|---|---|
| `design-taste-frontend` v2 | 面向新功能的全新设计：读简报、推断设计语言、通过 VARIANCE / MOTION / DENSITY 三旋钮校准 | 低 VARIANCE、低 MOTION、高 DENSITY |
| `redesign-existing-projects` | 面向存量界面的审计与修复：先审计再修布局/间距/层级/样式 | 0.6.0 优化的主流程 |

**边界约定**：

- 两个技能只提供“流程与判断”，不覆盖 `docs/design.md` 中的 token 表、壳契约、材质规则、检查清单。
- 当 taste-skill 输出与 `docs/design.md` 冲突时，以 `docs/design.md` 为准；产出必须通过 `docs/design.md` 的设计检查清单。
- 若 `design-taste-frontend` v2（experimental）输出不稳定，回退方案是换装 `design-taste-frontend-v1`，并同时移除 v2，避免同族技能产生歧义。

## 不采用项存档

以下方案经评估后不在 0.6.0 使用，存档防止重复评估：

| 方案 | 不采用原因 |
|---|---|
| Figma MCP | 远程服务器仅对官方目录客户端（VS Code / Cursor / Claude Code / Codex / Xcode）开放，Kimi Code 不在列；桌面版需 Dev Mode 付费席位；项目无 Figma 工作流 |
| `winui-app` skill 整包 | 面向 WinUI 3 / C# / XAML 脚手架，含 `winget configure` 安装 Visual Studio 的机器级动作，与 Electron + React 栈不符；其设计原则已在本文件萃取，无需安装 |
| Onlook | 直接改写 React 代码的可视化编辑器，面向 Next.js / Tailwind 代码库，与本项目 CSS 变量 + Fluent 组件 + 主题包契约冲突 |
| taste-skill 其余子技能 | `gpt-taste`（面向 GPT/Codex）、`soft-skill` / `minimalist-skill` / `brutalist-skill`（锁定特定视觉方向）、`image-to-code` 与 `imagegen` 系列（图像流水线，设计源已由 pen.dev 承担）、`output-skill`（非设计）、`stitch-skill`（Google Stitch 专用） |
| Figma 替代方案 | **pen.dev** 为当前最优（本地 MCP + `.pen` 开放 JSON 入仓 + 免费 + 可导入 live UI）；**Penpot**（开源、可自托管、有 MCP）为后备；OpenPencil / Quant UX / Open Design 成熟度低，观望；FigWright 仍需 Figma 文件，无意义；Builder.io / Anima / Magic Patterns / Figma Make 依赖 Figma 工作流，排除 |
