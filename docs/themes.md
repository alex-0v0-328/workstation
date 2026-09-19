# Workstation 主题包创作指南

Workstation 0.5.0 起，内置主题仅保留 Windows 11 原生主题；其它主题以 `.wstheme.json` 主题包形式安装。本文说明如何创作并打包主题。

## 包格式

主题包是单个 JSON 文件，扩展名 `.wstheme.json`，`format` 固定为 `1`。主进程使用 `src/shared/theme-manifest.ts` 中的 `themeManifestSchema` 与 `validateThemePackage` 校验。

```json
{
  "format": 1,
  "id": "catppuccin",
  "name": "Catppuccin",
  "version": "0.5.0",
  "author": "Workstation",
  "description": "Catppuccin 官方柔和粉彩配色，四种口味",
  "shell": "sidebar",
  "material": "none",
  "variants": [
    {
      "id": "latte",
      "name": "Latte",
      "dark": false,
      "accent": "#8839ef",
      "css": ".theme-catppuccin.variant-latte { --accent:#8839ef; --bg:#eff1f5; ... }",
      "fluent": {
        "colorNeutralBackground1": "#eff1f5",
        "colorNeutralForeground1": "#4c4f69",
        ...
      }
    }
  ]
}
```

## 字段约束

| 字段 | 约束 | 说明 |
|------|------|------|
| `format` | 必须为 `1` | 包格式版本 |
| `id` | slug：小写字母/数字开头，可含连字符，长度 1–50 | 主题唯一标识，不可与内置主题 `windows` 同名 |
| `name` | 1–50 字符 | 展示名称 |
| `version` | `x.y.z` | 语义版本 |
| `author` | ≤100 字符 | 作者，可选 |
| `description` | ≤500 字符 | 简介，可选 |
| `shell` | `sidebar` 或 `taskbar` | 布局壳，见 `src/renderer/src/themes/registry.tsx` |
| `material` | `mica`、`acrylic` 或 `none`，默认 `none` | 窗口材质，见 `docs/design.md` |
| `variants` | 1–20 项 | 每个变体即一个独立配色方案 |

变体字段：

| 字段 | 约束 | 说明 |
|------|------|------|
| `id` | slug | 变体唯一标识 |
| `name` | 1–50 字符 | 变体展示名称 |
| `dark` | boolean | 是否暗色方案 |
| `accent` | `#rrggbb` | 主题主色 |
| `css` | 字符串，≤500KB | 主题 CSS，会被注入 `<style data-workstation-theme>` |
| `fluent` | 可选，键名 `^color[A-Z]`、值 `#rrggbb` | 覆盖 Fluent UI 2 token |

注意：

- `css` 字段在创作源中写文件名，构建后会被内联为字符串；最终每个变体的 CSS 不得超过 500KB。
- `fluent` 只接受 `colorXxx` 形式的键，例如 `colorNeutralBackground1`、`colorBrandForeground1`。
- 主题包不能包含 JavaScript、HTML、远程 URL 或字体文件外链，只能携带 CSS 字符串。

## 创作源格式

仓库中的主题源位于 `themes/<id>/`，便于版本管理与多文件编辑。结构示例：

```
themes/catppuccin/
  theme.json
  shared.css
  latte.css
  frappe.css
  macchiato.css
  mocha.css
```

`theme.json` 中 `css` 写文件名，`sharedCss` 可选，用于在所有变体前拼接公共样式。

```json
{
  "format": 1,
  "id": "catppuccin",
  "name": "Catppuccin",
  "version": "0.5.0",
  "shell": "sidebar",
  "material": "none",
  "sharedCss": "shared.css",
  "variants": [
    { "id": "latte", "name": "Latte", "dark": false, "accent": "#8839ef", "css": "latte.css", "fluent": { ... } },
    ...
  ]
}
```

`shared.css` 示例：

```css
.theme-catppuccin {
  --radius: 14px;
  --radius-sm: 10px;
  --shadow: 0 3px 10px #00000014;
  --brand-gradient: linear-gradient(145deg, var(--accent), var(--accent-soft));
}

.theme-catppuccin .surface {
  border-width: 2px;
}
```

变体 CSS 示例：

```css
.theme-catppuccin.variant-latte {
  --accent: #8839ef;
  --bg: #eff1f5;
  --surface: #ffffff;
  --text: #4c4f69;
  ...
  color-scheme: light;
}
```

选择器约定：

- 公共样式用 `.theme-<id>`。
- 变体专属样式用 `.theme-<id>.variant-<vid>`。
- 不要写 `#root`、`body` 等全局选择器，避免与内置主题冲突。
- 参考 `themes/catppuccin/` 与 `themes/retro/`。

## 构建命令

运行主题打包脚本：

```bash
node scripts/build-themes.cjs
```

脚本会扫描 `themes/` 下所有子目录（排除 `dist`），读取 `theme.json` 与 CSS 文件，校验字段并把 CSS 内联，输出到：

```
themes/dist/<id>.wstheme.json
```

例如：

- `themes/dist/catppuccin.wstheme.json`
- `themes/dist/retro.wstheme.json`

该脚本会执行以下校验：

- `format === 1`
- `id`、`variant.id` 符合 slug 规则
- `version` 符合 `x.y.z`
- `variants` 数量 1–20 且无重复
- `sharedCss` 与每个变体的 `css` 文件存在
- 拼接后的 CSS 不超过 500KB

主题打包已挂进 `npm.cmd run build` 链，正式构建前会自动执行。

## 安装路径

用户可通过设置页的「安装主题」按钮打开文件对话框选择 `.wstheme.json` 文件，或点击「安装示例主题」一键安装仓库内置的示例包。

安装位置：

- 用户数据目录：`%APPDATA%\Workstation\themes\`
- 开发/测试隔离：`.local\themes\`

示例主题（Catppuccin、复古 Windows）随安装包通过 `electron-builder` 的 `extraResources` 分发到 `resources/themes/`，设置页提供一键安装入口。

## 内置主题保护

内置主题 `windows` 在 `src/renderer/src/themes/registry.tsx` 与 `src/shared/theme-manifest.ts` 中硬编码，不可被同名主题包覆盖。`validateThemePackage` 会拒绝 `id === "windows"` 的主题包。

主题选择回退逻辑：当设置中保存的主题 id 未安装时，自动回退到 `windows`。

## 快速开始

1. 在 `themes/<id>/` 创建 `theme.json` 与 CSS 文件。
2. 运行 `node scripts/build-themes.cjs` 生成 `themes/dist/<id>.wstheme.json`。
3. 在开发环境启动 Workstation，进入「设置 → 主题」，点击「安装主题」选择生成的文件。
4. 切换主题并检查明暗模式、材质开关、窗口缩放下的可读性。
