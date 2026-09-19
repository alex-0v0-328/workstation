# Workstation 设计规范

本文沉淀 0.5.0 主题架构重构后的视觉与布局约定，供后续页面、主题和组件开发遵循。项目当前仅内置 Windows 11 原生主题，其它主题为可安装的 `.wstheme.json` 主题包。

## 材质（Material）规则

应用窗口材质由主题包的 `material` 字段声明，主进程在创建窗口时通过 Electron `backgroundMaterial` 应用。

| 材质 | 用途 | 渲染层表现 |
|------|------|------------|
| `mica` | 长驻主窗口背景 | 桌面壁纸/窗口后内容透过根背景显现，适合高频停留的侧边栏壳 |
| `acrylic` | 瞬态浮层 | 高斯模糊、带轻微颜色叠加，仅用于菜单、弹窗、悬浮导航等短期元素，不做大面积主背景 |
| `none` | 实色 | 不参与 DWM 材质合成，性能最高，复古主题或节电场景首选 |

降级规则：

- 系统关闭「透明效果」、节电模式、高对比模式，或运行在非 Win11 22H2+ 环境时，材质自动降级为实色。
- 测试模式（`WORKSTATION_TEST_DATA`）强制 `none`，避免截图与材质相关的不确定性。
- 即使材质开启，也必须提供实色 fallback：材质生效时渲染层会额外添加 `material-on` 类，但 `material-off` 下的颜色变量仍需可读。

材质在代码中的对应关系：

- `src/shared/theme-manifest.ts`：`material` 枚举为 `mica | acrylic | none`。
- `src/renderer/src/themes/registry.tsx`：外部主题不直接写入 `material-on/off`，由主进程根据平台状态裁决后回传；内置 Windows 主题默认使用 Mica。
- `src/renderer/src/styles/windows.css`：`.theme-windows.material-on .root-theme` 将根背景设为透明，让 Mica 透出；侧栏再叠加 `backdrop-filter: blur(20px) saturate(125%)`。

## 设计 Token 表

基础 token 定义于 `src/renderer/src/styles/base.css` 的 `.root-theme`，主题包通过覆盖 CSS 变量改变外观。所有长度均基于 4px 网格。

| Token | 默认值 | 用途 |
|-------|--------|------|
| `--radius` | `9px` | 卡片、面板主圆角 |
| `--radius-sm` | `6px` | 按钮、输入框、小标签圆角 |
| `--radius-lg` | `12px` | 大面板、弹窗圆角 |
| `--shadow` | `0 2px 4px #00000005` | 卡片默认投影 |
| `--shadow-pop` | `0 8px 35px #0002` | 悬浮提示、消息条 |
| `--shadow2` | `0 0 2px rgba(0,0,0,.12)` | Fluent 2 最小阴影 |
| `--shadow4` | `0 2px 4px rgba(0,0,0,.14)` | 小卡片、选中态 |
| `--shadow8` | `0 4px 8px rgba(0,0,0,.14)` | 悬浮侧栏 |
| `--shadow16` | `0 8px 16px rgba(0,0,0,.14)` | 下拉菜单、开始菜单 |
| `--shadow28` | `0 14px 28px rgba(0,0,0,.14)` | 大型浮层 |
| `--shadow64` | `0 32px 64px rgba(0,0,0,.14)` | 对话框 |

语义颜色变量（主题必须提供）：

| Token | 说明 |
|-------|------|
| `--accent` | 主题主色，用于选中指示条、链接、焦点环、今日标记 |
| `--accent-soft` | 可选辅色，用于品牌渐变 |
| `--bg` | 应用根背景 |
| `--sidebar` | 侧边栏/任务栏背景 |
| `--surface` | 卡片、面板、输入区背景 |
| `--input` | 输入框背景 |
| `--text` | 主文本 |
| `--muted` | 辅助文本 |
| `--border` | 普通边框 |
| `--strong-border` | 强边框/分割线 |
| `--hover` | 列表/按钮悬停背景 |
| `--tint` | 强调色淡 tint，用于空状态图标、选中背景 |
| `--warning` | 警告/错误文本 |

字体层级优先于字号：标题使用 `font-weight: 600`，数据指标使用 `font-weight: 500`，正文保持常规。字族通过 `--font` 变量覆盖，默认使用 `Segoe UI Variable Text`、`Segoe UI`、`Microsoft YaHei`。

## 壳（Shell）布局契约

主题包声明 `shell: sidebar | taskbar`，渲染层从 `src/renderer/src/themes/registry.tsx` 的 `shells` 注册表中取出对应组件。

### Sidebar 壳（`shell-sidebar`）

实现：`src/renderer/src/themes/shells/sidebar.tsx`。

- 侧栏悬浮于主内容左侧，四边留白 `12px`，宽度 `var(--sidebar-width, 256px)`，外圆角 `var(--sidebar-radius, 8px)`，投影 `var(--shadow8)`。
- 主列左外边距为 `calc(var(--sidebar-width, 256px) + 24px)`，留出悬浮间隙。
- 导航项高 `44px`、圆角 `var(--radius-sm)`、间隙 `4px`；选中态左侧有 `3px` 圆角指示条。
- 侧栏半透明时配合 `backdrop-filter: blur(20px) saturate(125%)`。

### Taskbar 壳（`shell-taskbar`）

实现：`src/renderer/src/themes/shells/taskbar.tsx`。

- 桌面容器撑满视口，内容区窗口居中，最大宽度 `1500px`。
- 底部任务栏高度由内容撑出，包含「开始」按钮、任务列表、时钟。
- 开始菜单为固定定位浮层，从任务栏上方弹出。
- 该壳依赖 `taskbar-desktop`、`taskbar-window`、`taskbar-titlebar`、`taskbar-content`、`taskbar-bar`、`taskbar-start-menu` 等结构类名，主题包只覆盖变量与细节样式，不得修改 DOM 结构。

## 根类名契约

激活主题的根节点类名按以下顺序拼接：

```
root-theme theme-<id> variant-<vid> light-mode|dark-mode shell-sidebar|shell-taskbar material-on|material-off
```

示例：

- 内置 Windows 暗色：`root-theme theme-windows dark-mode shell-sidebar material-on`
- Catppuccin Macchiato：`root-theme theme-catppuccin variant-macchiato dark-mode shell-sidebar material-off`
- 复古 Windows：`root-theme theme-retro variant-classic light-mode shell-taskbar material-off`

约定：

- 内置 Windows 主题无 `variant-<vid>`（无变体）。
- `material-on/off` 由主进程根据平台能力和测试模式决定，不是主题包直接声明的值。
- 主题 CSS 选择器应以前缀 `.theme-<id>` 或 `.theme-<id>.variant-<vid>` 命中，避免使用 `#root` 等不稳定选择器。

代码对应：`src/renderer/src/themes/registry.tsx` 中 `resolveTheme` 函数返回的 `classes` 字段。

## 设计检查清单

新增主题或新页面时，按以下清单自测。

### 新增主题

- [ ] `id` 为合法 slug（小写字母、数字、连字符，长度 1–50）。
- [ ] `version` 符合 `x.y.z`。`
- [ ] `variants` 数量 1–20，变体 `id` 不重复。
- [ ] 每个变体提供 `--accent`、`--bg`、`--surface`、`--text`、`--muted`、`--border`、`--strong-border`、`--hover`、`--tint`、`--warning`。
- [ ] `fluent` 仅包含 `color[A-Z]` 开头的键，值为 `#rrggbb`。
- [ ] 内联 CSS 不超过 500KB。
- [ ] 在 `material-on` 与 `material-off` 两种状态下文本均可读。
- [ ] 切换主题/变体不重置数据、草稿或滚动位置。
- [ ] 对话框关闭后 `#root` 无残留 `aria-hidden`。

### 新增页面

- [ ] 容器使用 `app-layout` / `main-column` / `main-content` 结构，不破坏壳组件。
- [ ] 遵循 4px 间距网格，优先用 `gap` 而非固定 margin。
- [ ] 卡片使用 1px `stroke`（`border: 1px solid var(--border)`），不依赖装饰阴影表达层级。
- [ ] 灰阶色带 2–6% 色相偏移，避免纯灰。
- [ ] 标题层级使用字重而非过大字号区分。
- [ ] 焦点环使用 `var(--accent)`，轮廓清晰。
- [ ] 在 `prefers-reduced-motion: reduce` 下无动画。
- [ ] 在 `1200px` 与 `1000px` 断点下无横向滚动或重叠。
