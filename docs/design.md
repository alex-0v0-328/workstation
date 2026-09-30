---
name: Workstation
description: 学期步进器——把一个学期做成一排周次步进键的桌面仪表面板（0.8.3）
colors:
  # Windows 11 built-in skin, light mode. Accent roles derive from the Windows system accent;
  # values below use the fallback system accent #005fb8 (see Colors > Primary).
  accent: "#005fb8"
  on-accent: "#ffffff"
  chase: "#005fb8"
  led: "#005fb8"
  led-off: "#d6d6d6"
  step-a: "#003f79"
  step-b: "#004a90"
  step-c: "#0056a6"
  step-d: "#005fb8"
  tint: "#e8f1f9"
  selected: "#e2e9ef"
  bg: "#f3f3f3"
  sidebar: "#f9f9f9"
  surface: "#ffffff"
  input: "#ffffff"
  key: "#fbfbfb"
  key-edge: "#e5e5e5"
  text: "#1b1b1b"
  muted: "#5d5d5d"
  border: "#e5e5e5"
  strong-border: "#8a8a8a"
  row-rule: "#efefef"
  hover: "#0000000a"
  pressed: "#00000012"
  subtle-band: "#fafafa"
  display-bg: "#f9f9f9"
  menu: "#f9f9f9"
  warning: "#c42b1c"
  success: "#0f7b0f"
  # Windows 11, dark mode
  dark-accent: "#5c99d2"
  dark-on-accent: "#000000"
  dark-step-a: "#5c99d2"
  dark-step-b: "#73a7d8"
  dark-step-c: "#8ab6df"
  dark-step-d: "#a0c4e5"
  dark-bg: "#202020"
  dark-sidebar: "#272727"
  dark-surface: "#2b2b2b"
  dark-key: "#373737"
  dark-key-edge: "#434343"
  dark-text: "#ffffff"
  dark-muted: "#c5c5c5"
  dark-border: "#383838"
  dark-menu: "#2c2c2c"
  dark-warning: "#ff99a4"
  dark-success: "#6ccb5f"
  # Catppuccin pack, Mocha flavor (role names from the official palette)
  ctp-mocha-crust: "#11111b"
  ctp-mocha-base: "#1e1e2e"
  ctp-mocha-surface0: "#313244"
  ctp-mocha-mauve: "#cba6f7"
  ctp-mocha-lavender: "#b4befe"
  ctp-mocha-green: "#a6e3a1"
  ctp-mocha-red: "#f38ba8"
  ctp-mocha-peach: "#fab387"
  ctp-mocha-yellow: "#f9e2af"
  ctp-mocha-rosewater: "#f5e0dc"
  # Cyber pack, Acid variant
  cyber-acid: "#e8ff00"
  cyber-magenta: "#ff3d8b"
  cyber-cyan: "#27e8ff"
  cyber-bone: "#f2f2ec"
  cyber-chassis: "#0c0d0e"
  cyber-surface: "#141517"
  cyber-key: "#1b1c1f"
  cyber-display: "#070808"
  # Retro pack, Classic variant (Windows XP Classic appearance)
  retro-face: "#d4d0c8"
  retro-navy: "#0a246a"
  retro-caption-end: "#a6caf0"
  retro-step-b: "#1d4691"
  retro-step-c: "#3a6ea5"
  retro-step-d: "#6d97c8"
  retro-shade: "#808080"
  retro-dark: "#404040"
  retro-led: "#008000"
  retro-warning: "#a00000"
  retro-tooltip: "#ffffe1"
  retro-calc-digit: "#0000ff"
  retro-calc-operator: "#b00000"
typography:
  display:
    fontFamily: "'Segoe UI Variable Display', 'Segoe UI', 'Microsoft YaHei UI', sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "'Segoe UI Variable Text', 'Segoe UI', 'Microsoft YaHei UI', 'Microsoft YaHei', sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "'Segoe UI Variable Text', 'Segoe UI', 'Microsoft YaHei UI', 'Microsoft YaHei', sans-serif"
    fontSize: "15px"
    fontWeight: 600
  body:
    fontFamily: "'Segoe UI Variable Text', 'Segoe UI', 'Microsoft YaHei UI', 'Microsoft YaHei', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontFamily: "'Segoe UI Variable Text', 'Segoe UI', 'Microsoft YaHei UI', 'Microsoft YaHei', sans-serif"
    fontSize: "12px"
    fontWeight: 400
  label:
    fontFamily: "'Segoe UI Variable Text', 'Segoe UI', 'Microsoft YaHei UI', 'Microsoft YaHei', sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0"
  label-silkscreen:
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.06em"
  readout:
    fontFamily: "'Segoe UI Variable Display', 'Segoe UI', 'Microsoft YaHei UI', sans-serif"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1
    fontFeature: "\"tnum\""
  readout-transport:
    fontFamily: "'Segoe UI Variable Display', 'Segoe UI', 'Microsoft YaHei UI', sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1
    fontFeature: "\"tnum\""
  readout-calc:
    fontFamily: "'Segoe UI Variable Display', 'Segoe UI', 'Microsoft YaHei UI', sans-serif"
    fontSize: "40px"
    fontWeight: 600
    lineHeight: 1.05
    fontFeature: "\"tnum\""
  readout-segment:
    fontFamily: "'DSEG7 Classic', 'Bahnschrift', monospace"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.02em"
  body-retro:
    fontFamily: "'Tahoma', 'SimSun', 'Microsoft YaHei', sans-serif"
    fontSize: "12px"
    fontWeight: 400
  label-cyber:
    fontFamily: "'Bahnschrift SemiCondensed', 'Bahnschrift', 'Microsoft YaHei UI', sans-serif"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.14em"
  display-cyber:
    fontFamily: "'Bahnschrift SemiBold SemiConden', 'Bahnschrift', 'Microsoft YaHei UI', sans-serif"
    fontSize: "26px"
    fontWeight: 600
    letterSpacing: "0.01em"
  step-number:
    fontSize: "11px"
    fontWeight: 600
    lineHeight: "15px"
    fontFeature: "\"tnum\""
rounded:
  radius-sm: "4px"
  radius: "8px"
  radius-lg: "8px"
  key-radius: "4px"
  led-radius: "2px"
  sidebar-radius: "8px"
spacing:
  space-unit: "4px"
  step-gap: "4px"
  bank-gap: "12px"
  panel-padding: "16px"
  row-padding: "10px 16px"
  content-padding: "24px 32px 64px"
  column-gap: "24px"
  readout-gap: "28px"
components:
  step-key:
    backgroundColor: "{colors.key}"
    rounded: "{rounded.key-radius}"
    height: "36px"
  step-key-sequencer:
    backgroundColor: "{colors.key}"
    rounded: "{rounded.key-radius}"
    height: "28px"
  step-key-armed:
    backgroundColor: "{colors.step-c}"
    rounded: "{rounded.key-radius}"
    height: "36px"
  step-number-now:
    backgroundColor: "{colors.chase}"
    textColor: "{colors.on-accent}"
    typography: "{typography.step-number}"
    rounded: "{rounded.key-radius}"
  readout:
    textColor: "{colors.text}"
    typography: "{typography.readout}"
  readout-transport:
    backgroundColor: "{colors.display-bg}"
    textColor: "{colors.text}"
    typography: "{typography.readout-transport}"
    rounded: "{rounded.radius-sm}"
    padding: "6px 12px 7px"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.radius}"
  panel-head:
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    padding: "0 16px"
    height: "44px"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.radius-sm}"
    padding: "5px 12px"
    height: "32px"
  button-primary-hover:
    backgroundColor: "#0056a6"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.radius-sm}"
    padding: "5px 12px"
    height: "32px"
  input:
    backgroundColor: "{colors.input}"
    textColor: "{colors.text}"
    rounded: "{rounded.radius-sm}"
    padding: "7px 10px"
    height: "32px"
  task-row:
    padding: "10px 16px"
    height: "56px"
  nav-item:
    textColor: "{colors.text}"
    rounded: "{rounded.radius-sm}"
    padding: "0 12px"
    height: "38px"
  nav-item-selected:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.text}"
  calc-key:
    backgroundColor: "{colors.key}"
    textColor: "{colors.text}"
    rounded: "{rounded.key-radius}"
    height: "48px"
  calc-key-equals:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.key-radius}"
    height: "48px"
  led:
    backgroundColor: "{colors.led-off}"
    rounded: "{rounded.led-radius}"
    size: "7px"
  led-on:
    backgroundColor: "{colors.led}"
    rounded: "{rounded.led-radius}"
    size: "7px"
---

# Design System: Workstation

本文记录 0.8.3「学期步进器」视觉世界（方向种子 `1b70ac40`），整体取代 0.7.0 的「236px 侧栏 + 面包屑顶栏 + 统计条 + 品牌色块」方案。结构与默认 token 以 `src/renderer/src/styles/base.css` 为准，皮肤取值以 `src/renderer/src/styles/windows.css` 与 `themes/*/` 为准；本文与代码冲突时以代码为准并在同一改动中修正本文（R9）。方向契约见 `.impeccable/surfaces/src-renderer-src-main-tsx.md`，产品事实见 `docs/product.md`。YAML 头中的颜色是内置 Windows 11 浅色皮肤（系统强调色取回落值 `#005fb8`）以及三个示例主题包的签名色；其余皮肤取值见正文各表。

## Overview

**Creative North Star: "学期步进器"**

一个学期就是一段步进序列。Workstation 是一块仪表面板，它的签名是一排周次步进键：有考核的周被「武装」（armed），权重越重键面越满，当前周带追逐灯（chase）。每一页都说同一套语法：哑光面板底、每个控件组上方印一行丝印标签、数字一律以表格数字读出、按键是实体方块并按学期四等分成四个 bank、每种状态只点一盏指示灯。主操作是实心键，次操作是描边键。

密度面向一位整天坐在桌前的大学生：在 1000–1400px 的笔记本和外接副屏上都要一眼读出「现在第几周、哪几周重、今天该交什么」，并且按一个键就能新增、完成、合并或计算。界面明确拒绝 SaaS 仪表盘的套路：没有品牌色块 tile、没有面包屑顶栏、没有卡片里再套统计卡片。

四个皮肤只翻译材质，不改语法：Windows 11（内置，Mica + 系统强调色 + Fluent 方块）、Catppuccin（官方四口味粉彩键 + Maple Mono）、Retro（Windows XP 经典样式程序：立体灰面 + 属性页选项卡 + 状态栏）、Cyber（哑光黑机身 + DSEG7 数码管 + LED 辉光）。结构只写在 `base.css`，皮肤只提供 token 值与材质细节（颜色、字体、键面、斜面、辉光）。

**Key Characteristics:**
- 步进行（`.transport`）常驻内容列顶部：周次键 W1…WN 分四个 bank，右侧是「教学周」「日期」两块读数。
- 读数 = 丝印标签 + 表格数字；计数器、周次、日期、成绩、计算器共用一套读数样式。
- 面板 = 一个面 + 一条 1px 发丝线 + 一条 44px 头条；静止时不靠投影分层。
- 指示灯是 7px 方点，off / on / warn / ok 四态，状态同时写在文字里。
- 换皮肤只换 token 与材质，DOM 结构与类名不变。

## Colors

中性哑光底 + 一个强调色族（强调 / 追逐 / LED）+ 四段 bank 色；状态色只有 warning 与 success 两个。

Windows 皮肤的强调色族不是写死的：主进程 `systemPreferences.getAccentColor()` 读系统个性化颜色（失败回落 `#005fb8`），`src/renderer/src/themes/fluent.ts` 的 `windowsAccent()` 做对比度校正后注入 `.theme-windows{…}`：

- 浅色：把系统色向黑推进（步长 4%），直到对 `#ffffff` ≥ 4.5:1（相当于 AccentDark1）；深色：向白推进，直到对 `#2b2b2b` ≥ 4.5:1（相当于 AccentLight2）。结果为 fill，同时写入 `--accent`、`--accent-ink`、`--led`、`--chase`。
- 四个 bank 在同一色相内排开：浅色为 fill 混黑 34% / 22% / 10% / 0%（由深到浅），深色为 fill 混白 0% / 14% / 28% / 42%。离底色越远对比越高，所以每个 bank 至少和 fill 一样可读。
- `--on-accent` 浅色 `#ffffff`、深色 `#000000`；`--tint` = 面色混 fill 9%（深色 16%）；`--selected` = 底色混 fill 7%（深色 12%）。
- Fluent 品牌色阶也从同一个 fill 生成（`brandRamp`）；`windowsAccent().fluent` 再把 `colorBrandBackground` 直接钉为 fill（悬停混黑 10%、按下 20%，深色改为混白），`colorNeutralForegroundOnBrand` 取 `--on-accent`（深色为黑字），所以 Fluent 主按钮与仪表语法同色，深色下是浅色填充配深色墨，与 Windows 11 强调色按钮一致。

下表 Windows 列带 \* 的值按回落强调色 `#005fb8` 计算。

### Primary

强调色族：选中、焦点、追逐、亮灯、主键填充。

| Token | 作用 | base 回退 | Windows 浅 | Windows 深 | Catppuccin | Cyber Acid | Retro Classic |
|---|---|---|---|---|---|---|---|
| `--accent` | 选中指示条、焦点环、tab 下划线、今日标记、主键与等号键填充 | 必填 | `#005fb8`\* | `#5c99d2`\* | mauve | `#e8ff00` | `#0a246a` |
| `--accent-ink` | 运算键等浅底上的强调文字 | `var(--accent)` | = fill | = fill | mauve | `#e8ff00` | `#0a246a` |
| `--on-accent` | 强调色面上的墨色（追逐周号、复选勾、主键） | `#fff` | `#ffffff` | `#000000` | Latte `#eff1f5`，Frappé `#232634`，Macchiato `#181926`，Mocha `#11111b` | `#0c0d0e` | `#ffffff` |
| `--chase` | 当前周追逐灯：周号底牌、键面外框 | `var(--accent)` | = fill | = fill | lavender | `#e8ff00` | `#0a246a` |
| `--led` | 亮灯（on）颜色 | `var(--accent)` | = fill | = fill | green | `#e8ff00` | `#008000` |
| `--led-off` | 熄灯 | `color-mix(in srgb, var(--text) 18%, transparent)` | `#d6d6d6` | `#4a4a4a` | surface1 | `#2a2b30` | `#808080` |
| `--led-lit` | 追逐键里的灯芯 | `#fff` | `#fff` | `#fff` | crust（Latte `#eff1f5`） | `#0c0d0e` | `#ffffff` |
| `--led-glow` | 亮灯辉光 | `none` | `none` | `none` | `none` | `0 0 6px` accent 70%，`0 0 1px` accent | `none` |
| `--tint` | 强调淡底：提示条、合并结果条、备份横幅 | 必填 | `#e8f1f9`\* | `#333d46`\* | mauve 14% 混入 base | `#e8ff0012` | `#ffffe1` |
| `--selected` | 选中项底：导航、模式键、选中邮件 | `var(--hover)`（邮件回落 `--tint`） | `#e2e9ef`\* | `#272f35`\* | surface0 | `#1a1b1e` | `#d4d0c8` |

### Secondary

四段 bank 色：学期按周数四等分（bank-0…bank-3），每段一色，武装程度用同色的深浅表达。

| Token | bank | Windows 浅 | Windows 深 | Catppuccin | Cyber Acid | Retro Classic |
|---|---|---|---|---|---|---|
| `--step-a` | bank-0（第 1 段） | `#003f79`\* | `#5c99d2`\* | red | `#ff3d8b` | `#0a246a` |
| `--step-b` | bank-1 | `#004a90`\* | `#73a7d8`\* | peach | `#27e8ff` | `#1d4691` |
| `--step-c` | bank-2 | `#0056a6`\* | `#8ab6df`\* | yellow | `#e8ff00` | `#3a6ea5` |
| `--step-d` | bank-3 | `#005fb8`\* | `#a0c4e5`\* | rosewater | `#f2f2ec` | `#6d97c8` |
| `--bank-tint` | 未武装键混入 bank 色的比例 | `7%` | `7%` | `7%` | `7%` | `0%` |

四个 `--step-*` 未声明时全部回落为 `--accent`。Retro 的四个 bank 是 XP 进度条式的藏青色阶（由深到浅），未武装键不混 bank 色，保持灰色立体面。

### Tertiary

| Token | 作用 | base 回退 | Windows 浅 | Windows 深 | Catppuccin | Cyber Acid | Retro Classic |
|---|---|---|---|---|---|---|---|
| `--warning` | 逾期、高优先级、错误、告警读数 | 必填 | `#c42b1c` | `#ff99a4` | red | `#ff3d8b` | `#a00000` |
| `--success` | `.led.ok`：本地状态、已完成、已满足 | `#3f8f5a` | `#0f7b0f` | `#6ccb5f` | green | `#27e8ff` | `#008000` |

### Neutral

| Token | 作用 | Windows 浅 | Windows 深 | Catppuccin | Cyber Acid | Retro Classic |
|---|---|---|---|---|---|---|
| `--bg` | 哑光面板底：根背景与步进行条 | `#f3f3f3` | `#202020` | crust | `#0c0d0e` | `#d4d0c8`（经典立体面） |
| `--sidebar` | 侧栏面 | `#f9f9f9` | `#272727` | mantle | `#111214` | `#d4d0c8` |
| `--surface` | 面板面、对话框 | `#ffffff` | `#2b2b2b` | base | `#141517` | `#d4d0c8` |
| `--input` | 输入框 | `#ffffff` | `#2d2d2d` | mantle | `#0f1012` | `#ffffff` |
| `--key` | 键面（回落 `--surface`） | `#fbfbfb` | `#373737` | surface0（Latte mantle） | `#1b1c1f` | `#d4d0c8` |
| `--key-edge` | 键边（回落 `--border`） | `#e5e5e5` | `#434343` | surface1（Latte surface0） | `#2a2b30` | `#d4d0c8` |
| `--text` | 主文字 | `#1b1b1b` | `#ffffff` | text | `#e6e6e1` | `#000000` |
| `--muted` | 丝印与辅助文字 | `#5d5d5d` | `#c5c5c5` | subtext0（Latte subtext1） | `#9a9ca3` | `#404040` |
| `--border` | 发丝线 | `#e5e5e5` | `#383838` | surface0 | `#25262b` | `#808080` |
| `--strong-border` | 强边：悬停边、输入框底边、bank 括号 | `#8a8a8a` | `#9a9a9a` | overlay0 | `#4f525b` | `#404040` |
| `--row-rule` | 列表行分隔（回落 `--border` 70%） | `#efefef` | `#333333` | surface0 70% | `#1d1e22` | `#ececec` |
| `--hover` | 悬停底 | `#0000000a` | `#ffffff0f` | surface0 60% | `#1b1c20` | `rgba(10,36,106,.07)` |
| `--pressed` | 按下底（回落 `--hover`） | `#00000012` | `#ffffff0a` | surface1 | `#222328` | `#d4d0c8` |
| `--subtle-band` | 表头行、次级 tab 带、邮件日期行（回落 `transparent`） | `#fafafa` | `#282828` | mantle | `#101113` | `#d4d0c8` |
| `--display-bg` | 读数窗、计算器显示屏（回落 `--input`） | `#f9f9f9` | `#262626` | mantle | `#070808` | `#ffffff` |
| `--display-ink` | 显示屏数字（回落 `--text`） | `--text` | `--text` | text | `#e8ff00` | `#000000` |
| `--menu` | 原生 `<select>` 下拉弹层的实色底（回落 `--surface`） | `#f9f9f9` | `#2c2c2c` | 回落 base | 回落 `#141517` | `#ffffff` |

Windows 在 Mica 生效时会把面变为半透明，取值见 Elevation & Depth。原生下拉弹层画不出 Mica 半透明，所以 `select option` / `optgroup` 始终用实色 `--menu` 底、`--text` 字。

Catppuccin 四口味的角色取值（`themes/catppuccin/<flavor>.css`，官方色板）：

| 角色 | Latte | Frappé | Macchiato | Mocha |
|---|---|---|---|---|
| crust | `#dce0e8` | `#232634` | `#181926` | `#11111b` |
| mantle | `#e6e9ef` | `#292c3c` | `#1e2030` | `#181825` |
| base | `#eff1f5` | `#303446` | `#24273a` | `#1e1e2e` |
| surface0 | `#ccd0da` | `#414559` | `#363a4f` | `#313244` |
| surface1 | `#bcc0cc` | `#51576d` | `#494d64` | `#45475a` |
| overlay0 | `#9ca0b0` | `#737994` | `#6e738d` | `#6c7086` |
| text | `#4c4f69` | `#c6d0f5` | `#cad3f5` | `#cdd6f4` |
| subtext0 / subtext1 | `#6c6f85` / `#5c5f77` | `#a5adce` / `#b5bfe2` | `#a5adcb` / `#b8c0e0` | `#a6adc8` / `#bac2de` |
| mauve | `#8839ef` | `#ca9ee6` | `#c6a0f6` | `#cba6f7` |
| lavender | `#7287fd` | `#babbf1` | `#b7bdf8` | `#b4befe` |
| green | `#40a02b` | `#a6d189` | `#a6da95` | `#a6e3a1` |
| red | `#d20f39` | `#e78284` | `#ed8796` | `#f38ba8` |
| peach | `#fe640b` | `#ef9f76` | `#f5a97f` | `#fab387` |
| yellow | `#df8e1d` | `#e5c890` | `#eed49f` | `#f9e2af` |
| rosewater | `#dc8a78` | `#f2d5cf` | `#f4dbd6` | `#f5e0dc` |

### Named Rules

**The One Lamp Rule.** 每种状态只点一盏灯：`.led` 的 off / on / warn / ok；状态必须同时写在标签或文字里，颜色从不单独承载含义。

**The Faces Carry Color Rule.** 步进键面只承载颜色，文字永远不压在键面上：周号印在键上方，范围与待办数印在 bank 括号里。

**The One Hue Row Rule.** Windows 皮肤的四个 bank 取自同一个系统强调色，整排读作一个色相；主题包可以用四色 bank，但 level 0→3 由浅到满的关系不变。

## Typography

**Display Font:** Segoe UI Variable Display（Windows 皮肤的 h1、课程详情标题、读数）
**Body Font:** Segoe UI Variable Text → Segoe UI → Microsoft YaHei UI → Microsoft YaHei
**Label/Mono Font:** 由皮肤决定：Maple Mono（Catppuccin）、Bahnschrift SemiCondensed 与 DSEG7 Classic（Cyber）、Tahoma 与 SimSun（Retro）

**Character:** 面板用中性无衬线，读数用各皮肤自己的「仪表字」：Windows 是 Display 光学尺寸，Catppuccin 是圆角等宽，Cyber 是七段数码管，Retro 是 XP 经典样式的 Tahoma 12px 界面字。中文统一回落到微软雅黑 UI（Retro 回落宋体）。

### Hierarchy

base.css 的层级（Windows 皮肤覆盖见下表）：

- **Display**（600，24px，行高 1.25，字距 -.01em，`text-wrap: balance`）：`h1` 页面标题，经 `SectionTitle` 输出。
- **Headline**（600，18px，行高 1.3）：`h2`。课程详情标题 24px，邮件阅读标题 20px / 1.45，对话框标题 16px，设置分区标题 15px。
- **Title**（600，15px）：`h3`。空状态标题 16px。
- **Body**（400，`--font-size-base` 14px，`--line-height-base` 1.5）：正文与行标题。段落 `p` 行高 1.6、`text-wrap: pretty`；邮件正文 14px / 1.8，最长 76ch；摘要正文最长 80ch。
- **Meta**（400，12–13px，`--muted`）：行元信息、字段帮助、副标题（13px）。
- **Label / 丝印**（`--label-weight` 600，`--label-size` 11px，`--label-tracking` .06em，`--label-case` uppercase，行高 1.3，`--muted`）：`.label`、`th`、`legend`；`.channel` 同字号字重但字距固定 .02em。
- **Readout**（`--readout-weight` 500，30px，行高 1，`--readout-tracking` 0，`tabular-nums`，字族 `--font-readout`）：`.readout-value`。单位 `small` 用正文字族 12px / 400 / `--muted`。变体：步进行读数 24px（1000px 下 20px）、成绩读数 24px、计算器 40px（超过 12 字符降为 26px，行高 1.05）、周课表日期 20px / 500、日程时间 15px、合并序号 16px / 500。
- **Step number**（600，11px / 15px，`tabular-nums`）：周号；bank 括号文字 10px / 600 / 行高 14px，字距跟随 `--label-tracking`。

各皮肤的字体 token：

| 皮肤 | UI 字体（`font` 字段 / `--font`） | `--font-readout` | `--readout-weight` / `--readout-tracking` | 丝印 size / weight / tracking / case | 其它 |
|---|---|---|---|---|---|
| base 默认 | `'Segoe UI Variable Text','Segoe UI','Microsoft YaHei UI','Microsoft YaHei',sans-serif` | `var(--fontFamilyBase, var(--font))` | 500 / 0 | 11px / 600 / .06em / uppercase | — |
| Windows 11 | 同 base | `'Segoe UI Variable Display','Segoe UI','Microsoft YaHei UI',sans-serif` | 600 / 0 | 12px / 600 / 0 / none | h1、课程详情 h2 用 Display；侧栏文字标 16px Display |
| Catppuccin | `'Maple Mono','Microsoft YaHei UI','Microsoft YaHei',monospace` | `'Maple Mono',monospace` | 600 / -.02em | 11px / 600 / .08em / uppercase | h1 字距 -.03em；第 1 读数 mauve、第 2 读数 peach（Latte 为 `#c24d06`）、告警 red；计算器数字 green（Latte 为 text） |
| Cyber | `'Bahnschrift','Microsoft YaHei UI','Microsoft YaHei',sans-serif` | `'DSEG7 Classic','Bahnschrift',monospace` | 700 / .02em | 11px / 600 / .14em / uppercase，字族钉在 `'Bahnschrift SemiCondensed'` | h1 / h2 / 文字标用 `'Bahnschrift SemiBold SemiConden'` 600、字距 .01em；h1 26px 大写；文字标 14px 大写 .12em；读数带 `0 0 8px` accent 45% 文字辉光 |
| Retro | `'Tahoma','SimSun','Microsoft YaHei',sans-serif` | `'Tahoma','SimSun',sans-serif` | 700 / 0（计算器 Tahoma 400 / 26px） | 12px / 400 / 0 / none，`--muted` `#404040`（面板头条为黑色） | 根字号 `--font-size-base: 12px`；h1 14 / 700，h2 13 / 700，h3 12 / 700；读数值 20px |

随包字体：Maple Mono 400 / 600（`themes/catppuccin/fonts/`，OFL，许可证 `OFL-MapleMono.txt`）、DSEG7 Classic 400 / 700（`themes/cyber/fonts/`，OFL，许可证 `OFL-DSEG.txt`）。Segoe UI Variable、Bahnschrift、Tahoma、SimSun、Microsoft YaHei 均为 Windows 系统字体，不随包分发。

### 字体解析顺序

字体随主题固定，设置里没有字体选择。`src/renderer/src/themes/registry.tsx` 按以下顺序取 UI 字体，结果写入 Fluent 主题的 `fontFamilyBase`：

1. 当前变体的 `font`。
2. 主题包的 `font`。
3. 内置 Windows 字体栈（`'Segoe UI Variable Text','Segoe UI','Microsoft YaHei UI','Microsoft YaHei',sans-serif`；内置 Windows 主题始终用它）。

`settings.font` 只为兼容旧的存储数据而保留，渲染层忽略它。FluentProvider 把结果暴露为 `--fontFamilyBase`，`.root-theme` 使用 `font-family: var(--fontFamilyBase, var(--font))`，所以皮肤 CSS 里的 `--font` 只是回落值。`--font-readout` 在 base 中跟随 `--fontFamilyBase`，但四个皮肤都显式声明了它，读数字体与 UI 字体各自独立；Cyber 的丝印、表头、legend、课程通道标与 tab 也显式钉在 Bahnschrift SemiCondensed。

### Named Rules

**The Silkscreen Rule.** 丝印标签只给一个控件组或一个读数命名：面板头条、读数、表头、fieldset legend、分组头、步进行的「学期」。它不是页面标题上方的装饰性眉题；外观只通过 `--label-size` / `--label-weight` / `--label-tracking` / `--label-case` 四个 token 调整。

**The Tabular Readout Rule.** 会变化的数字（计数、周次、日期、时间、成绩、权重、文件序号、行尾到期时间）一律 `font-variant-numeric: tabular-nums`；读数值用 `--font-readout`，单位用正文字族的 12px `small`。

## Layout

空间模型：壳（悬浮侧栏或经典程序框架）+ 内容列。内容列顶部是粘性步进行 `.transport`，其下是 `.main-content`（最大宽度 `--content-max-width` 1480px，居中，内边距 24px 32px 64px）。所有长度落在 4px 网格上，分栏间距以 `--space-unit` 的倍数表达。

页面骨架从上到下：

1. `.page-heading`：`h1` + 13px `--muted` 副标题 + 右侧 `.actions`（外边距 4px 0 22px）。
2. `.readouts`：一行读数（下外边距 20px），TODO 为「待完成 / 未来七天到期 / 已逾期」。
3. 主体：`.workspace-columns`（`minmax(0,1fr)` + `--panel-width` 248px，间距 `--space-unit` × 6 = 24px），或 `.tools-grid`（`minmax(300px,380px)` + `minmax(0,1fr)`，间距 24px），或整宽音序器面板；设置页为单列 `minmax(0,880px)`，间距 `--space-unit` × 4 = 16px。

### 步进行（Transport）

- `position: sticky; top: 0; z-index: 5`，flex，间距 20px，内边距 12px 32px，底色 `--bg`，底部 1px `--border`。
- 左侧 `.transport-semester`（flex 1，最大宽 1120px）：丝印「学期」+ 学期名（12px / 600，单行省略），下面是分 bank 的步进行，键面高 36px。
- 右侧 `.transport-now`（间距 14px，不收缩）：两块框式读数——「教学周」（两位补零，无当前周时为 `--`）与「星期 + 日期」（如 `09.30`）。
- 没有学期时显示一盏熄灯 + `--muted` 12px 提示。
- Windows Mica 下背景透明并加 `backdrop-filter: blur(30px) saturate(120%)`；经典壳内为 `position: static`（工具栏带），且隐藏右侧 `.transport-now`，教学周与日期改由状态栏承载。

### 壳（Shell）布局契约

主题包声明 `shell: sidebar | classic`，渲染层从 `registry.tsx` 的 `shells` 注册表取出组件；内置 Windows 主题固定用 Sidebar 壳。`taskbar` 是 0.8.3 之前的旧名，仍被 schema 接受，但按 Classic 壳渲染、根类名写 `shell-classic`。两个壳都从 `shells/nav.tsx` 的 `useNav()` 取同一份导航：TODO、学习、周课表、生活、工具，外加设置；TODO 项显示未完成数（`tabular-nums`）。两个壳都在内容上方渲染 `Transport`。

**Sidebar 壳（`shell-sidebar`）**，实现 `src/renderer/src/themes/shells/sidebar.tsx`：

- 结构 `.app-layout.shell-sidebar` > `aside.sidebar` + `.main-column`（`Transport` + `main.main-content`）。
- `.sidebar` 固定定位，距上、左、下各 12px，宽 `var(--sidebar-width, 224px)`，外圆角 `var(--sidebar-radius, 8px)`，1px `--border`，底色 `--sidebar`，内边距 18px 10px 14px。
- 顶部是纯文字标 `.brand`（15px / 600，不是色块 tile），其下丝印导航说明 `.nav-caption`。
- 导航按钮高 38px、间隙 2px、圆角 `--radius-sm`、图标 20px `--muted`；悬停 `--hover`，按下 `--pressed` 并下沉 .5px；当前页 `--selected` 底 + 600 字重 + 左侧 3 × 16px `--accent` 指示条（圆角 2px）+ 图标变 `--accent`。
- 底部：设置按钮（同导航样式）+ 本地状态（`.led.ok` + 丝印「本地个人版」）。
- 主列左外边距 `calc(var(--sidebar-width, 224px) + 24px)`。
- 皮肤：Windows 侧栏加 `0 2px 4px rgba(0,0,0,.04)` 细影；Catppuccin 指示条 4px mauve；Cyber 指示条变成左侧 4px 处一颗 6 × 6 带辉光的 LED，选中文字为 accent。

**Classic 壳（`shell-classic`）**，实现 `src/renderer/src/themes/shells/classic.tsx`，结构写在 `base.css` 的「Shell: classic application」段：把应用本身排成一个经典桌面程序，活在原生窗口里，不画任何窗口外框、桌面或任务栏。

- `.classic-app.shell-classic` 撑满视口（`height: 100vh`，纵向 flex，自身不滚动）：`Transport`（静态工具栏带）→ `.classic-sheet` 属性页 → `footer.classic-status` 状态栏。
- `.classic-sheet`（外边距 6px 8px 0）：上方 `nav.classic-tabs` 是一排属性页选项卡（导航五项 + 设置，`button` + `aria-current="page"`，TODO 项带未完成数 `small`），下方 `main.classic-page` 是唯一的滚动区（内边距 16px 18px 24px）。当前选项卡外扩 2px、下压 2px 盖住页框顶边（内边距 4px 14px 7px），读作连在页面上。
- `.classic-status`：一排 12px 窗格，依次为本地状态（`.led.ok` + 「本地个人版」，占满剩余宽度）、教学周（无当前周时为学期名）、完整日期、时钟 `HH:mm`（按设置时区，每 30 秒刷新）；皮肤在末尾画尺寸握把。
- 结构类名固定：`classic-app`、`classic-sheet`、`classic-tabs`、`classic-page`、`classic-status`。主题包只覆盖变量与细节样式（斜面、选项卡形状），不得改 DOM 结构。

### 断点（as built）

两个断点都写在 `base.css` 末尾，派生尺寸为固定值：

| 区域 | 宽屏（> 1200px） | ≤ 1200px | ≤ 1000px |
|---|---|---|---|
| 侧栏宽 `--sidebar-width` | 224px | 196px | 196px |
| `.main-content` 内边距 | 24px 32px 64px | 20px 22px 48px | 同左 |
| `.transport` 内边距 | 12px 32px | 10px 22px | 同左 |
| 步进行 bank 间距 | 12px | 12px | 8px |
| 步进行读数值 / 内边距 | 24px / 6px 12px 7px | 同左 | 20px / 5px 10px 6px |
| `.workspace-columns` | 1fr + 248px，间距 24px | 1fr + 208px，间距 16px | 单列，右侧 `.day-aside` 隐藏 |
| 读数间隔 / 读数值 | 28px / 30px | 20px / 26px | 同左 |
| 音序器 `.seq-grid` | `minmax(200px,260px)` + 1fr + `minmax(150px,210px)` | `minmax(170px,210px)` + 1fr + 150px | `minmax(150px,180px)` + 1fr，「下一项」列隐藏 |
| 邮件列表栏 | `--mail-pane-width` 340px | 280px | 280px |
| `.tools-grid` | `minmax(300px,380px)` + 1fr，间距 24px | `minmax(280px,330px)` + 1fr | `minmax(250px,280px)` + 1fr，间距 16px |
| 计算器键高 | 48px | 48px | 44px |
| 合并行列宽 | 32px / 1fr / 150px / auto | 28px / 1fr / 120px / auto | 24px / 1fr / 96px / auto，间距 8px |
| 其它 | — | — | 表单两列间距 12px；课程详情标题纵向堆叠 |

### 排版布局 Token 表（主题包 `layout` 字段）

主题包可在主题级与变体级声明可选的 `layout` 字段。每个键映射一个 CSS 变量，由 `themes/registry.tsx` 以 `.theme-<id>` / `.theme-<id>.variant-<vid>` 作用域注入。

| Token | CSS 变量 | 默认值（as built） | 用途 |
|---|---|---|---|
| `sidebarWidth` | `--sidebar-width` | `224px`（≤ 1200px 为 `196px`） | 侧栏宽度 |
| `sidebarRadius` | `--sidebar-radius` | `8px` | 悬浮侧栏外圆角（皮肤直接以 CSS 变量覆盖，见 Shapes） |
| `topbarHeight` | `--topbar-height` | 无消费方 | 0.8.3 已无顶栏；键仍被 schema 接受以保持旧包可装 |
| `contentMaxWidth` | `--content-max-width` | `1480px` | 侧栏壳主内容最大宽度（经典壳的属性页撑满窗口，不消费） |
| `panelWidth` | `--panel-width` | `248px`（≤ 1200px 为 `208px`） | TODO 页右侧「今日课表」栏宽 |
| `mailPaneWidth` | `--mail-pane-width` | `340px`（≤ 1200px 为 `280px`） | 邮件列表栏宽 |
| `fontSizeBase` | `--font-size-base` | `14px` | 根字号（Retro 为 `12px`） |
| `lineHeightBase` | `--line-height-base` | `1.5` | 根行高 |
| `spaceUnit` | `--space-unit` | `4px` | 密度基数：TODO 分栏与工具页间距 × 6，设置网格间距 × 4 |
| `radiusSm` / `radius` / `radiusLg` | `--radius-sm` / `--radius` / `--radius-lg` | `4px` / `8px` / `8px` | 圆角体系 |

规则：

- 值必须是 CSS 长度（`px` / `rem` / `em` / `%`）或纯数字，最长 20 字符；未知键或非法值会被 `validateThemePackage` 与 `scripts/build-themes.cjs` 拒绝。
- 宽度与间距的默认值只写在各使用处的 `var()` 回退里，不集中在 `.root-theme`；圆角（`--radius*`、`--key-radius`）由 `.root-theme` 声明、由皮肤覆盖。主题包未声明 `layout` 时渲染与默认一致。
- 1200px / 1000px 断点下的派生尺寸为固定值，`layout` 只影响宽屏布局。例外：1200px 断点在 `.root-theme` 上设置 `--sidebar-width: 196px`，而主题样式后注入且特异性相同，所以声明了 `sidebarWidth` 的主题包在所有宽度下都用自己的值。
- 变体级 `layout` 在主题级之后注入，可对单个变体微调。

### Named Rules

**The Pinned Row Rule.** 学期位置只由内容列顶部的步进行表达，它在两种壳里都位于页面标题之上；页面不得再做第二条学期周次条或面包屑顶栏，需要按课程展开周次时用音序器行（`.seq-grid`）。

## Elevation & Depth

扁平 + 色调分层。面板静止时无投影（`--shadow: none`），层级来自 `--bg` 底与 `--surface` 面的色差和 1px 发丝线；键靠底边加重的描边表达「可按」。投影只属于瞬态层：对话框（`--shadow64`）与消息条（`--shadow-pop`）。Cyber 用光代替深度（辉光），Retro 用斜面代替深度（inset 阴影）。

### 材质（Material）规则

应用窗口材质由主题包的 `material` 字段声明，主进程通过 Electron `setBackgroundMaterial` 应用。

| 材质 | 用途 | 渲染层表现 |
|---|---|---|
| `mica` | 长驻主窗口背景 | 桌面壁纸透过根背景显现，面板变为半透明层；内置 Windows 主题使用 |
| `acrylic` | 瞬态浮层 | 高斯模糊加轻微颜色叠加，只适合菜单、弹窗等短期元素，不做大面积主背景 |
| `none` | 实色 | 不参与 DWM 材质合成，性能最高；三个示例主题包均为 `none` |

降级规则：

- 主进程 `src/main/themes.ts` 的 `effectiveMaterial()` 在以下情况强制 `none`：测试模式（`WORKSTATION_TEST_DATA`，避免截图受材质影响）、非 Windows 平台、Windows build < 22621（早于 Win11 22H2）。其余情况内置主题为 `mica`，主题包取 `manifest.material`（默认 `none`）。
- 系统关闭「透明效果」、节电或高对比时由 Windows DWM 自行把材质渲染为实色；应用侧不单独检测。
- 主进程 `applyMaterial()` 在设置材质之前把 `nativeTheme.themeSource` 对齐到应用自己的外观：内置主题取设置里的浅色 / 深色 / 跟随系统，主题包取所选变体的 `dark`。Mica 与标题栏因此跟随应用而不是系统。
- 渲染层在 `themeState.active.material !== 'none'` 时给根节点加 `material-on`，否则 `material-off`（`src/renderer/src/main.tsx`）。`material-off` 下的颜色变量就是各皮肤的实色值，必须独立可读。

Windows 皮肤 `material-on` 时（`windows.css`）：

- 根背景透明，让 Mica 透出。
- 浅色：`--sidebar`、`--surface`、`--key` 为 `#ffffffb3`，`--subtle-band` `#ffffff4d`，`--display-bg` `#ffffff80`。
- 深色：`--sidebar`、`--surface` 为 `#ffffff0d`，`--key`、`--input` 为 `#ffffff0f`，`--subtle-band` `#ffffff08`，`--display-bg` `#0000001a`。
- `.transport` 透明并加 `backdrop-filter: blur(30px) saturate(120%)`；侧栏只用半透明填充，不再加模糊。
- 对话框回到实色：`--dialog-solid` 浅色 `#f9f9f9`、深色 `#2b2b2b`。

### Shadow Vocabulary

- **面板**（`--shadow: none`）：所有 `.surface`。
- **消息条**（`--shadow-pop`）：base `0 8px 24px rgba(0,0,0,.14)`；Windows 浅色 `0 8px 16px rgba(0,0,0,.14)`，深色 `0 8px 16px rgba(0,0,0,.26)`；Catppuccin `0 10px 30px` crust 60%；Cyber `0 10px 28px rgba(0,0,0,.7)`；Retro `none`。
- **对话框**（`--shadow64`）：base `0 32px 64px rgba(0,0,0,.14)`；Windows 浅色 `0 32px 64px rgba(0,0,0,.19), 0 2px 21px rgba(0,0,0,.15)`，深色 `0 32px 64px rgba(0,0,0,.37), 0 2px 21px rgba(0,0,0,.37)`；Catppuccin `0 24px 64px` crust 70%；Cyber `0 30px 80px rgba(0,0,0,.8), 0 0 0 1px #2c2d33`；Retro `none`（改用窗口斜面）。遮罩 `rgba(0,0,0,.36)`，Retro 无遮罩。
- **Fluent 阶梯**（`--shadow2` `0 0 2px rgba(0,0,0,.12)`、`--shadow4` `0 2px 4px rgba(0,0,0,.14)`、`--shadow8` `0 4px 8px rgba(0,0,0,.14)`、`--shadow16` `0 8px 16px rgba(0,0,0,.14)`、`--shadow28` `0 14px 28px rgba(0,0,0,.14)`）：在 `.root-theme` 上声明供主题包使用，base.css 本身不消费。
- **Cyber 辉光**：`--led-glow`；level-2 键 `0 0 8px` bank 色 25%，level-3 键 `0 0 14px` bank 色 55%；追逐周号 `0 0 10px` accent 60%；等号键与待运算键 `0 0 12px` accent 45%；选中 tab 下划线与当前时间线 `0 0 8px` accent；读数文字 `text-shadow: 0 0 8px` accent 45%；步进行读数与计算器显示屏叠 3px 扫描线。
- **Retro 斜面**（配方来自 98.css，Jordan Scales，MIT，取值换成 XP 经典样式）：`--raised`（凸起：键、按钮、表头、滚动条滑块与箭头键）、`--pressed-bevel`（按下、已选中）、`--window`（属性页页框、对话框）、`--sunken`（白色列表视图、输入框、读数、显示屏）、`--etched`（分组框：面板与 fieldset），均为四层 1px inset `box-shadow`，由 `#ffffff` / `#d4d0c8` / `#808080` / `#404040` 组成；`--status`（状态栏窗格）为两层浅凹。

### Named Rules

**The Flat Panel Rule.** 静止面板无投影；层级来自底 / 面色差与 1px 发丝线。投影只给对话框与消息条这类瞬态层。

**The Light Is State Rule.** Cyber 的辉光只加在「亮着」的东西上：亮灯、level-2/3 键、追逐周号、等号键、读数与当前时间线；静止面板与正文不发光。

## Shapes

形态语言是实体方块：步进键、计算器键、模式键、指示灯、课程通道色标都是小圆角方块，圆角随皮肤从 0 到 14px 变化，但同一皮肤内键比面板更方。

| Token | base | Windows | Catppuccin | Cyber | Retro |
|---|---|---|---|---|---|
| `--radius-sm`（输入框、小框读数、提示条、列表外框） | 4px | 4px | 8px | 2px | 0 |
| `--radius`（面板） | 8px | 8px | 12px | 3px | 0 |
| `--radius-lg`（对话框） | 8px | 8px | 14px | 4px | 0 |
| `--key-radius`（步进键、计算器键、复选框、日历事件） | 4px | 4px | 6px | 2px | 0 |
| `--led-radius`（指示灯、通道色标、未读点） | 1px | 2px | 50% | 1px | 0 |
| `--sidebar-radius`（悬浮侧栏） | 8px | 8px | 14px | 4px | 0 |

形态细节：

- 步进键：列宽 `minmax(14px,1fr)`（banked 行内 `minmax(0,1fr)`），键间距 `--step-gap` 4px；键面高度由 `--step-height` 决定：步进行 36px、音序器 28px、默认 20px。键内 LED 是 8 × 3px 横条。
- bank 括号：8px 高、开口朝上的 1px `--strong-border` 括号，底角 2px，括号文字压在括号线正中（底色 `--bg` 挖空）。
- 指示灯 7 × 7px；课程通道色标 8 × 8px；未读点 6px。
- 虚线表示「空位 / 可放入 / 已清空」：已清空周（有考核且全部完成）、音序器「添加一门课程」行的顶线、PDF 拖放区；周课表的半小时刻度也用虚线（60% 透明度）作为次级刻度。
- tab 选中下划线 3px，圆角 3px 3px 0 0（Cyber 2px 直角带辉光，Retro 改为凸起小键、无下划线）。Retro 唯一的圆角是属性页选项卡顶角 3px 3px 0 0。
- 滚动条 12px，滑块为 `--text` 22%（悬停 38%），4px 透明边框，圆角 8px。Retro 为 16px 经典滚动条：2px 棋盘抖动轨道、凸起滑块、两端凸起箭头键（按下变平）。

## Components

### 步进行（Step Row）

签名组件。实现 `src/renderer/src/StepRow.tsx`（`StepKeys`、`Transport`），数据来自 `src/shared/calendar.ts` 的 `semesterWeeks()`。

- **周的计算：** 从学期 `weekStart`（缺省为 `start`）所在周开始每周一个键，最多 60 个。`bank = min(3, floor(i × 4 / 周数))`，即按周数四等分；`level` 由当周考核的权重之和决定：无考核为 0，有考核但权重和 < 10 为 1，10–24.99 为 2，≥ 25 为 3。`now` 为今天所在周，`past` 为当前周之前，`cleared` 为有考核且全部完成。
- **交互版（步进行）：** `.step-row.banked`（`role="group"`）包含四个 `.step-bank`（`flex-grow` = 本段周数，间距 12px）。每段是一行键 + 下方 `.step-bracket` 括号，括号文字形如「1–5 周 · 0 项」（本段未完成数）。每个键是 `button.step-key`：上方 `.step-num` 周号，下方 `i.step-face` 键面，键面里一颗 `.led`。当前周 `aria-current="date"`，每个键有 `aria-label`（周号、考核数、未完成数）。悬停在下方弹出 Fluent Tooltip：周标题与日期，逐条列出考核与权重（未定显示「待定」，已完成划线）。点击跳到周课表并定位到该周。
- **被动版（音序器行）：** `.step-row`（`aria-hidden`），只有键面，没有周号和 LED。

| 状态 | 键面处理（base） |
|---|---|
| level-0 | `--bank-tint`（7%）的 bank 色混入 `--key`；边 `--key-edge` |
| level-1 | bank 色 30% 混入 `--key`；边 bank 色 50% 混入 `--key-edge` |
| level-2 | 62% / 80% |
| level-3 | 键面与边均为满 bank 色 |
| cleared | 键面回到 `--key`，虚线边为 bank 色 70% |
| now | 周号变成 `--chase` 底牌、`--on-accent` 字；键面外框 2px `--chase`，偏移 1px；LED 变为 `--led-lit` + `--led-glow`（level-0 的当前周 LED 为 `--chase`）；在 `prefers-reduced-motion: no-preference` 下 LED 以 `chase` 动画闪烁（1.6s ease-in-out，透明度 1 ↔ .35） |
| past（非当前） | 键面透明度 .5 |
| hover / active | 边变 `--strong-border`、周号变 `--text` / 键面下沉 1px（.06s） |

各皮肤的键面翻译：

| 皮肤 | 翻译 |
|---|---|
| Windows | 4px Fluent 方块；底边加深（`--key-edge` 混黑 30%；深色为顶边 `#3f3f3f`、底边 `--key-edge`）；level-0 边浅色 `#a8a8a8`（底边 `#8a8a8a`）、深色 `#6a6a6a`，保证未武装键轮廓 ≥ 3:1；level-3 底边为 bank 色混黑 30%；四个 bank 同一色相 |
| Catppuccin | 6px 粉彩键，底边 2px；level-3 底边为 bank 色混 crust 30%；bank 依次 red / peach / yellow / rosewater，追逐 lavender，亮灯 green，圆形 LED |
| Cyber | 键面为 `#1f2024 → #18191c` 渐变，边 `#2c2d33`（上）/ `#202126`（侧）/ `#0d0e10`（下）；level-1 为 bank 色 22% 混入 `#18191c`、边 45%；level-2 55% + 8px 辉光；level-3 满色 + 14px 辉光；追逐周号发光；bank 依次 magenta / cyan / acid / bone |
| Retro | 每个键面都是 `--raised` 凸起斜面（无描边），步进行键高 24px；level-0 为纯立体面（`--bank-tint` 0%），level-1 为 bank 色 30%、level-2 为 62% 混入 `#d4d0c8`，level-3 满色；键内 LED 隐藏；cleared 为 bank 色与立体面的 2px 棋盘抖动；按下为 `--pressed-bevel`；当前周为 1px 黑色点线内框（偏移 -4px）与藏青底白字周号；过去周不降透明度而是去色 60%；bank 为进度条式藏青色阶 `#0a246a` / `#1d4691` / `#3a6ea5` / `#6d97c8` |

### 读数（Readouts）

- `.readouts` 横排可换行；每个 `.readout` 纵向：丝印标签在上（间距 6px），数值在下；右侧 1px `--border` 分隔，间隔 28px，最后一个无分隔。
- `.readout.alert`：数值变 `--warning`，标签前加 `.led.warn`。
- 步进行里的读数是框式：`--display-bg` 底、1px `--border`、`--radius-sm`，数值 24px，颜色 `--display-ink`。
- 成绩读数（课程详情：已得分、已评权重、待评权重、未分配权重）放在一个内边距 16px 的面板里，数值 24px。
- 皮肤：Catppuccin 第 1 / 第 2 读数分别染 mauve / peach；Cyber 数值为 DSEG7 accent 加辉光，步进行读数叠扫描线；Retro 读数是白色 `--sunken` 小窗（数值 20px，间隔 6px，无分隔线）；Classic 壳隐藏步进行读数，教学周与日期进入状态栏窗格。

### 指示灯（LED）

- `.led` 7 × 7px，圆角 `--led-radius`：默认熄灯 `--led-off`；`.on` 为 `--led` + `--led-glow`；`.warn` 为 `--warning`（无辉光）；`.ok` 为 `--success`。
- 用处：逾期读数、逾期到期时间、高优先级（warn）；进行中（on）；考核进度与门槛状态（ok / on / warn / 熄）；本地状态（ok）；设置里被选中的模式键（亮 `--led`）。
- 每盏灯旁都有文字；纯装饰的灯设 `aria-hidden`。Retro 的 `.led.on` 固定为 `#008000`。

### 面板（Panels）

- `.surface`：`--surface` 面、1px `--border`、`--radius`、`--shadow`（none）。
- `.panel-head`：最小高 44px、左右内边距 16px、底部 1px 分隔；左侧丝印标签（可带 `.count`），右侧控件或第二个丝印标签。`.panel-body` 内边距 16px。
- `.panel-bar`：把 tab 条和主键放在同一条头条上（TODO 列表的「添加事项」在列表右上）。
- 列表说明 `.list-caption`（丝印标题 + 丝印行数）、分组头 `.group-header`（丝印 + 延伸到右端的发丝线）。
- 皮肤：Retro 面板是透明底的 `--etched` 分组框，头条 30px、无底线、标签黑色；内部列表视图（任务列表、音序器、表格、邮件列表、合并列表、日程、周课表、摘要）为白色 `--sunken` 井，外边距 4px 8px 8px；行间无分隔、悬停不变色，选中邮件为藏青底白字，表头为凸起 400 字重；Cyber 头条底色 `#111214`。

### 键（Buttons / Keys）

- **主操作 = 实心键：** Fluent `Button appearance="primary"`，4px 圆角，高 32px，内边距 5px 12px，14px / 600。底色来自由 accent 生成的品牌色阶：Windows 由 `windowsAccent().fluent` 直接钉为 fill：浅色 `#005fb8`\*（悬停 `#0056a6`\*）配白字，深色 `#5c99d2`\*（悬停 `#6ca3d7`\*）配黑字；主题包通过 `fluent` 覆盖（Catppuccin 各口味 mauve，Cyber `#e8ff00` 配 `#0c0d0e` 字，Retro 为 `#d4d0c8` 灰色凸起键）。每个页面标题区或面板最多一个主键：TODO「添加事项」、学习「新建学期」、合并「合并并保存」、空状态的行动键。
- **次操作 = 描边键：** Fluent 默认 `Button`（中性底 + 1px 描边），如「导入学业 JSON」「添加课程」「编辑」「清空」。
- **行内 / 第三级：** Fluent `appearance="subtle"`：行内上移、下移、移除，侧栏底部「打开周课表」，「归档已完成」。
- **Retro：** 所有 `.fui-Button` 改为 `--raised` 斜面、`#d4d0c8` 面、黑字 400，最小高 23px、内边距 2px 10px；按下为 `--pressed-bevel`；禁用为灰字 + 1px 白色浮雕；焦点为 1px 黑色点线内框（偏移 -4px）。模式键与口味点选中为按下斜面 + 棋盘抖动底。
- **模式键 / 口味点**（设置 → 外观）：`--key` 面、1px `--border`、`--key-radius`、内边距 6px 12px、最小高 32px；选中为 `--accent` 边 + `--selected` 底 + 600 + 亮灯。**添加类型卡**（新增事项对话框）：两列单选卡，选中为 `--accent` 边 + `--selected` 底。

### 输入（Inputs / Fields）

- `input` / `select` / `textarea`：`--input` 底、1px `--border`（底边 `--strong-border`）、`--radius-sm`、内边距 7px 10px、最小高 32px；悬停边变 `--strong-border`；聚焦时底边变 2px `--accent`（Fluent 下划线式），不加外发光。
- 复选框：18px 自绘方块，`--key-radius`；选中为 `--accent` 填充 + `--on-accent` 勾（clip-path），勾以 .12s ease-out 缩放出现。
- `.search`：与输入框同样的底边规则，`:focus-within` 时底边变 2px `--accent`。
- `.field`：12px / 600 `--text` 字段名（字段名不是丝印）+ 控件 + 12px `--muted` 帮助文字。
- 错误：合并行页码非法时输入框边为 `--warning`；`.error-note` 为 `--warning` 12% 底 + `--warning` 字；`.info-note` 为 `--tint` 底。
- 原生 `<select>` 的弹出列表用实色 `--menu` 底（见 Colors > Neutral），因为弹层不能绘制 Mica 半透明。
- 皮肤：Catppuccin 聚焦底边 lavender，复选框选中为 green；Cyber 复选框选中带 8px 辉光；Retro 输入框为无边的白色 `--sunken` 井（内边距 3px 6px，最小高 22px），聚焦不加下划线；`<select>` 右侧画一个 16px 凸起的经典下拉按钮（黑色三角），聚焦为 1px 黑点线内框；复选框 13px 凹陷白底黑勾。

### 标签页（Tabs）

- `.tabs`：最小高 44px，间距 4px，底部 1px 分隔；按钮 13px `--muted`，悬停 `--text`；选中为 `--text` + 600 + 3px `--accent` 下划线（左右各内缩 10px）。
- 一级 `.category-tabs` 46px / 14px；二级 `.subtabs` 38px / 12px，底色 `--subtle-band`。
- 皮肤：Catppuccin 下划线 mauve；Cyber 选中字为 accent，下划线 2px 直角加辉光；Retro 二级 `.tabs` 为 22px 凸起小键，选中为按下斜面 + 棋盘抖动底，无下划线（一级导航的属性页选项卡见 Navigation）。

### 导航（Navigation）

侧栏与经典属性页的结构、尺寸和状态见 Layout 的壳契约。Retro 的属性页选项卡为 `#d4d0c8` 面，左、上 1px 白色高光，右侧 `#404040` + `#808080` 两层暗边，顶角 3px；当前页选项卡变大并压住页框顶边，页框为 `--window` 斜面；焦点为 1px 黑点线内框。状态栏窗格为 `--status` 浅凹，末尾是斜纹尺寸握把。

### 模式行（Pattern Rows）

- `.task-row`：三列网格 18px | `minmax(0,1fr)` | auto，间距 14px，内边距 10px 16px，最小高 56px；行间 1px `--row-rule`；悬停 `--hover`。
- 左：完成复选框。中：标题 14px（可带「高优先级」warn 灯 + 文字、「进行中」on 灯 + `--accent` 文字）；元信息行 12px `--muted`：课程通道标 `.channel`（8px 课程色标 + 课程代码，丝印字号字重、字距 .02em）+ 课程名 · 类别。右：到期时间 12px `tabular-nums`；逾期时变 `--warning` 600 并加 warn 灯。
- 已完成：标题划线、变 `--muted`。
- 同一行式用于日程（15px 读数时间 + 标题 + 地点）、邮件列表、合并列表、门槛行和表格行：左右 16px 内边距、发丝线分隔。表头 `th` 用丝印样式，`td` 用 `tabular-nums`。
- Retro：行间无分隔，悬停不变色；选中项（邮件）为藏青 `#0a246a` 底白字，文本选区同色。

### 音序器（Study Sequencer）

- `.sequencer` 面板内的 `.seq-grid`：三列 `minmax(200px,260px)` | 1fr | `minmax(150px,210px)`。
- 表头行在 `--subtle-band` 上：丝印「课程」、周号行（10px / 600 `tabular-nums`，当前周为 `--chase` 底牌）、丝印「下一项」。
- 每门课一行（最小高 68px，顶部发丝线，悬停整行 `--hover`）：课程格（通道标 + 课程名 14px / 600 + 统计 12px）→ 该课程自己的被动步进行（键高 28px）→ 下一项（标题 12px / 600 + 日期）。
- 末行 `.seq-add` 为虚线顶边的「添加一门课程」。
- 课程详情：标题区 → 成绩读数面板 → 考核表（丝印表头，进度列为 LED + 状态文字）→ 门槛面板。

### 工具（Tools）

- **计算器**（`.surface.calc`，可聚焦并接受键盘输入，`:focus-visible` 为 2px `--accent` 外框）：显示屏 `.calc-display` 为 `--display-bg` 底、1px 边、`--radius-sm`、最小高 92px，上方丝印显示待运算表达式，下方数值 40px 读数字、`--display-ink`、右对齐（超过 12 字符降为 26px，出错时改为正文字族 18px `--warning`）。键盘为四列网格，间距 `var(--step-gap, 6px)`：键高 48px、`--key` 面、`--key-edge` 边、`--key-radius`、17px / 500 `tabular-nums`；功能键（AC、+/-、%）`--muted` 14px；运算键为 accent 14% 底 + 40% 边 + `--accent-ink` 19px；已选中待运算的运算键与等号键为满 `--accent` 填充；0 键跨两列；键盘输入时对应键显示按下态。
- **PDF 合并**：`.merge-drop` 虚线 `--strong-border` 拖放井（最小高 120px，悬停或拖入时边变 `--accent`、底加 accent 6%、图标 `--accent`）→ `.merge-list` 行（两位序号读数 `01`、文件名 + 大小、页码范围输入 150px、上移 / 下移 / 移除）→ 底部输出文件名字段 + 清空（描边键）+ 合并并保存（主键）→ 结果条（`--tint`，失败为 `--warning`）。
- 皮肤：Catppuccin 运算键 mauve 18% 混 surface0，显示数字 green，PDF 图标 peach；Cyber 渐变键、等号键发光、DSEG7 数字；Retro 仿 Windows 计算器：凸起灰键高 34px，数字键蓝字 `#0000ff` 14px，功能键、运算键与等号键暗红字 `#b00000` 15px，待运算的运算键为按下斜面；显示屏为白色凹陷窗，数值 Tahoma 400 26px 黑字；拖放井为白色凹陷井，悬停或拖入加 1px 黑点线内框，PDF 图标藏青。

### 周课表（Week Board）

- `.week-row`：52px 时间槽 + 7 列日。整点线实线、半小时线虚线（60%）；今天列为 accent 4% 淡底；当前时间线 2px `--accent`，线头为 8px 方块。
- 日标题的日期用读数字 20px / 500，今天为 `--accent` 底牌、`--on-accent` 字。
- 事件 `.calendar-event`：课程色 14% 混入 `--surface` 的键面、38% 边、`--key-radius`；定位事件按高度降级为 compact（隐藏地点）与 tiny（隐藏时间）。
- 皮肤：Catppuccin 当前时间线 red；Cyber 当前时间线发光、今天日期为 1px accent 外框；Retro 周课表为白色凹陷井，今天列 `#f4f6fb`，今天日期藏青底白字，当前时间线 `#a00000`，事件为课程色 16% 混白、1px 黑边直角。

### 对话框与消息

- 原生 `<dialog>` `.native-panel`：1px `--strong-border`、`--radius-lg`、`--shadow64`，最大高 `calc(100dvh - 64px)`；宽 `min(560px, 100vw - 48px)`，宽版 820px。粘性 `.panel-heading`（16px 标题 + 关闭键）；`.form-actions` 右对齐、顶部发丝线。
- Retro：对话框是一扇经典窗口——`--window` 斜面、`#d4d0c8` 面、3px 内边距、无遮罩；标题栏为 `#0a246a` → `#a6caf0` 横向渐变、12px 粗体白字、16 × 14px 关闭键；渐变标题栏只出现在对话框上。
- `.app-message`：底部居中的消息条，`--surface` + `--strong-border` + `--shadow-pop`（Retro 为 `#ffffe1` 1px 黑边、无投影的工具提示样式）；`.busy-indicator` 在右下角。
- Tooltip：Retro 为 `#ffffe1` 底、1px 黑边、直角、无投影、12px 界面字。
- `.empty`：居中，图标 `--muted`，标题 16px，说明 13px `--muted` 最宽 380px，下方一个主键。

## Do's and Don'ts

### Do:
- **Do** 把新结构写进 `base.css`，皮肤只提供 token 值与材质细节（颜色、字体、键面、斜面、辉光）。
- **Do** 在每个控件组和读数上方放 `.label` 丝印，外观只通过 `--label-size` / `--label-weight` / `--label-tracking` / `--label-case` 调整。
- **Do** 所有会变化的数字用 `tabular-nums`，读数值用 `--font-readout`，单位用 12px `small`。
- **Do** 用一盏 `.led`（off / on / warn / ok）加文字表达状态，装饰性的灯设 `aria-hidden`。
- **Do** 主操作用 Fluent primary（实心键），次操作用默认 Button（描边键），行内操作用 subtle；每个标题区或面板最多一个主键。
- **Do** 内容放进 `.surface` 面板，头条用 `.panel-head`（44px，丝印 + 控件）。
- **Do** 让追逐灯和所有过渡在 `prefers-reduced-motion: reduce` 下归零。
- **Do** 每个新界面在 1200px、1000px 两个断点以及四个皮肤下各看一次。

### Don't:
- **Don't** 加品牌色块 tile、面包屑顶栏，或卡片里再套统计卡片。
- **Don't** 在步进键面上放文字；周号印在键上方，范围与待办数印在 bank 括号里。
- **Don't** 用投影给静止面板分层（`--shadow` 为 `none`）；投影只给对话框与消息条。
- **Don't** 只靠颜色表达状态；warning 色必须配文字或 LED + 标签。
- **Don't** 在页面里再做一条学期周次条；学期位置只由步进行表达，按课程展开时用音序器行。
- **Don't** 在皮肤 CSS 里改 DOM 结构或使用 `#root` 等不稳定选择器；只以 `.theme-<id>` / `.theme-<id>.variant-<vid>` 命中。
- **Don't** 在 Cyber 以外的皮肤里加辉光，也不要给 Cyber 的静止面板或正文加辉光。
- **Don't** 在应用内画假桌面、任务栏、开始菜单或窗口外框；窗口外框属于原生窗口。Retro 只把应用本身画成经典样式程序，渐变标题栏只给对话框。

## 主题包契约

### 根类名契约

激活主题的类名挂在 `FluentProvider` 根节点上，按以下顺序拼接：

```
root-theme theme-<id> [variant-<vid>] light-mode|dark-mode [shell-sidebar|shell-classic] material-on|material-off
```

示例：

- 内置 Windows 深色（Mica 生效）：`root-theme theme-windows dark-mode material-on`
- Catppuccin Mocha：`root-theme theme-catppuccin variant-mocha dark-mode shell-sidebar material-off`
- Cyber Acid：`root-theme theme-cyber variant-acid dark-mode shell-sidebar material-off`
- 复古 Windows：`root-theme theme-retro variant-classic light-mode shell-classic material-off`

约定：

- 内置 Windows 主题没有 `variant-<vid>`，根节点也没有 `shell-*` 类；壳类名出现在壳组件自己的根节点上（`app-layout shell-sidebar` / `classic-app shell-classic`）。声明旧值 `taskbar` 的包也得到 `shell-classic`。
- `material-on/off` 由主进程根据平台能力和测试模式决定，不是主题包直接声明的值。
- Fluent 会把这些类复制到 Tooltip 等浮层的挂载节点；`.root-theme[data-portal-node]` 必须透明、不占满高度。
- 主题 CSS 选择器以 `.theme-<id>` 或 `.theme-<id>.variant-<vid>` 开头。

代码对应：`src/renderer/src/themes/registry.tsx` 中 `resolveTheme` 返回的 `classes`，`src/renderer/src/main.tsx` 追加 `material-on/off`。

### 主题包字段

创作源是主题目录下的 `theme.json`，`scripts/build-themes.cjs` 把它构建为 `themes/dist/<id>.wstheme.json`；安装时由 `src/shared/theme-manifest.ts` 的 `validateThemePackage` 校验。

| 字段 | 层级 | 约束 | 作用 |
|---|---|---|---|
| `format` | 主题 | 恒为 `1` | 格式版本 |
| `id` | 主题 / 变体 | slug：小写字母、数字、连字符，1–50 字符；主题 id 不得为 `windows` | 类名 `theme-<id>` / `variant-<vid>` |
| `name` / `author` / `description` | 主题 | ≤ 50 / 100 / 500 字符 | 设置里的显示信息 |
| `version` | 主题 | `x.y.z` | 版本 |
| `shell` | 主题 | `sidebar` \| `classic` \| `taskbar` | 壳；`taskbar` 是 0.8.3 前的旧名，按 `classic` 渲染 |
| `material` | 主题 | `mica` \| `acrylic` \| `none`，默认 `none` | 窗口材质 |
| `layout` | 主题 / 变体 | 见排版布局 Token 表 | 几何与密度 |
| `font` | 主题 / 变体 | CSS 字体族列表，≤ 300 字符，不含 `; { } < > \` | UI 字体，随主题固定：变体优先于主题，都未声明时用内置 Windows 字体栈 |
| `fonts` | 主题（仅创作源） | `[{ family, file, weight?, style? }]`；`family` 匹配 `^[\w .-]{1,60}$`，`file` 为主题目录内的 `.woff2` | 构建时内联为 `@font-face`（base64 data URI，`font-display: swap`） |
| `sharedCss` | 主题（仅创作源） | 主题目录内的 CSS 文件名 | 所有变体共用的样式 |
| `css` | 主题（构建产物） | ≤ 500,000 字符 | = 内联字体 + `sharedCss`，全包只发一份，在变体 CSS 之前注入 |
| `variants` | 主题 | 1–20 个，`id` 不重复 | 变体列表 |
| `variants[].dark` | 变体 | 布尔 | 决定 `light-mode` / `dark-mode` 与自动选择 |
| `variants[].accent` | 变体 | `#rrggbb` | 生成 Fluent 品牌色阶（CSS 的 `--accent` 仍需在 CSS 中声明） |
| `variants[].fluent` | 变体 | 键匹配 `color[A-Z]…`，值 `#rrggbb` | Fluent token 覆盖 |
| `variants[].css` | 变体 | 创作源写文件名，构建后为字符串；≤ 500,000 字符 | 该变体的调色板 |

构建时 `fonts` 与 `sharedCss` 从产物中删除。每个变体都要满足：主题级共享 CSS（含内联字体）+ 该变体 CSS ≤ 500,000 字符。

注入顺序（`registry.tsx`）：主题级 `layout` → 变体级 `layout` → 主题级 `css` → 变体 `css`；内置 Windows 主题注入 `windowsAccent()` 生成的强调色规则。结果写入 `<head>` 末尾的 `<style data-workstation-theme>`，位于 `base.css` 与 `windows.css` 之后。

## 设计检查清单

新增主题或新页面时，按以下清单自测。

### 新增主题

- [ ] `id` 为合法 slug（小写字母、数字、连字符，长度 1–50），且不是 `windows`。
- [ ] `version` 符合 `x.y.z`。
- [ ] `variants` 数量 1–20，变体 `id` 不重复。
- [ ] 每个变体提供必填颜色：`--accent`、`--bg`、`--sidebar`、`--surface`、`--input`、`--text`、`--muted`、`--border`、`--strong-border`、`--hover`、`--tint`、`--warning`。
- [ ] 提供仪表语法 token（否则走回落：四个 bank 同为 `--accent`、键面同为面板面）：`--key`、`--key-edge`、`--step-a`…`--step-d`、`--chase`、`--led`、`--led-off`、`--led-lit`、`--on-accent`、`--accent-ink`、`--display-bg`、`--display-ink`、`--selected`、`--pressed`、`--subtle-band`、`--row-rule`、`--success`。
- [ ] 用 `font` 字段（主题或变体）声明 UI 字体栈并带中文回落；在 CSS 中显式声明 `--font-readout`，让读数字体独立于 UI 字体；按皮肤调整 `--label-*` 四个 token。
- [ ] 随包字体放在主题目录（如 `fonts/`），格式 `.woff2`，列入 `fonts`，许可证文件放在旁边；`family` 与 `font` / `--font-readout` 中的名字一致。
- [ ] 共用样式放进 `sharedCss`（全包只发一份），变体 CSS 只写调色板。
- [ ] 共享 CSS（含 base64 内联字体，体积约为原字体的 4/3）+ 每个变体 CSS ≤ 500KB。
- [ ] `fluent` 仅包含 `color[A-Z]` 开头的键、值为 `#rrggbb`；设置 `colorBrandBackground*` 与 `colorNeutralForegroundOnBrand`，让 Fluent 主键与 `--accent` / `--on-accent` 一致。
- [ ] 在四个 bank 中分别检查 level 0–3、cleared、now、past 都可分辨；未武装键轮廓对底色 ≥ 3:1。
- [ ] 正文、读数、逾期与告警文字在 `material-on` 与 `material-off` 两种状态下都 ≥ 4.5:1。
- [ ] 切换主题 / 变体不重置数据、草稿或滚动位置。
- [ ] 对话框关闭后 `#root` 无残留 `aria-hidden`。
- [ ] Classic 壳主题不改结构类名（`classic-*`），只覆盖变量与细节；不画桌面、任务栏或窗口外框。
- [ ] 引用的第三方配方在 CSS 头注释中署名与许可证（如 Retro 斜面来自 98.css，MIT，取值为 XP 经典样式）。

### 新增页面

- [ ] 页面渲染在壳的 `main-content` / `classic-page` 里，不自带顶栏；步进行始终在最上方。
- [ ] 以 `SectionTitle`（`h1` + 可选副标题 + 操作区）开头；计数用 `.readouts`；内容放进带 `.panel-head` 的 `.surface` 面板。
- [ ] 遵循 4px 网格，优先用 `gap`；分栏间距用 `--space-unit` 的倍数。
- [ ] 面板使用 1px 描边（`border: 1px solid var(--border)`），不依赖装饰阴影表达层级。
- [ ] 分组名用 `.label` 丝印，数字用 `tabular-nums`。
- [ ] 标题层级靠字重区分（标题 600），不靠过大字号。
- [ ] 每个标题区或面板最多一个主键。
- [ ] 状态用 LED + 文字，不只靠颜色。
- [ ] 焦点：按钮与 `[tabindex]` 为 2px `--accent` 外框（偏移 2px）；输入框为 2px `--accent` 底边。
- [ ] 在 `prefers-reduced-motion: reduce` 下无动画与过渡。
- [ ] 在 `1200px` 与 `1000px` 断点下无横向滚动或重叠；1000px 下次要列收起（参照右侧日程栏、音序器「下一项」列）。
- [ ] 所有文案走 i18n 字典（简中 / 繁中 / 英文），英文长串不溢出。
- [ ] 在 Windows 浅色 / 深色、一个 Catppuccin 口味、Cyber、Retro 下各截图检查一次。
