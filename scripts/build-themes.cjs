const { readdir, readFile, writeFile, mkdir, stat } = require('node:fs/promises')
const { join } = require('node:path')

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,49}$/
const VERSION_RE = /^\d+\.\d+\.\d+$/
const MAX_CSS = 500_000
const LAYOUT_KEYS = ['sidebarWidth', 'sidebarRadius', 'topbarHeight', 'contentMaxWidth', 'panelWidth', 'mailPaneWidth', 'fontSizeBase', 'lineHeightBase', 'spaceUnit', 'radiusSm', 'radius', 'radiusLg']
const LAYOUT_VALUE_RE = /^-?\d+(\.\d+)?(px|rem|em|%)?$/

function checkLayout(layout, srcPath, where) {
  if (layout === undefined) return
  if (!layout || typeof layout !== 'object' || Array.isArray(layout)) throw new Error(`${srcPath}: ${where} 排版设置需为对象`)
  for (const [key, value] of Object.entries(layout)) {
    if (!LAYOUT_KEYS.includes(key)) throw new Error(`${srcPath}: ${where} 排版设置包含未知键 ${key}`)
    if (typeof value !== 'string' || value.length > 20 || !LAYOUT_VALUE_RE.test(value)) throw new Error(`${srcPath}: ${where} 排版键 ${key} 的值需为 CSS 长度或数字`)
  }
}

async function buildThemes() {
  const root = join(__dirname, '..')
  const srcDir = join(root, 'themes')
  const distDir = join(srcDir, 'dist')
  await mkdir(distDir, { recursive: true })

  let entries
  try { entries = await readdir(srcDir, { withFileTypes: true }) } catch { entries = [] }
  const dirs = entries.filter(e => e.isDirectory() && e.name !== 'dist')

  for (const dir of dirs) {
    const themeDir = join(srcDir, dir.name)
    const srcPath = join(themeDir, 'theme.json')
    let raw
    try { raw = await readFile(srcPath, 'utf8') } catch { continue }

    let manifest
    try { manifest = JSON.parse(raw) } catch (e) { throw new Error(`${srcPath}: ${e.message}`) }

    if (manifest.format !== 1) throw new Error(`${srcPath}: format 需为 1`)
    if (!SLUG_RE.test(manifest.id ?? '')) throw new Error(`${srcPath}: id 需为合法 slug`)
    if (!VERSION_RE.test(manifest.version ?? '')) throw new Error(`${srcPath}: version 需为 x.y.z`)
    if (!Array.isArray(manifest.variants) || manifest.variants.length < 1 || manifest.variants.length > 20) {
      throw new Error(`${srcPath}: variants 数量需在 1-20 之间`)
    }
    const variantIds = manifest.variants.map(v => v.id)
    if (new Set(variantIds).size !== variantIds.length) throw new Error(`${srcPath}: 变体 ID 重复`)
    checkLayout(manifest.layout, srcPath, '主题级')

    let sharedCss = ''
    if (manifest.sharedCss) {
      if (typeof manifest.sharedCss !== 'string') throw new Error(`${srcPath}: sharedCss 需为文件名字符串`)
      const sharedPath = join(themeDir, manifest.sharedCss)
      try { sharedCss = await readFile(sharedPath, 'utf8') } catch { throw new Error(`${srcPath}: 共享 CSS 文件不存在 ${manifest.sharedCss}`) }
    }

    const variants = []
    for (const variant of manifest.variants) {
      if (!SLUG_RE.test(variant.id ?? '')) throw new Error(`${srcPath}: 变体 id 需为合法 slug`)
      if (typeof variant.css !== 'string' || !variant.css) throw new Error(`${srcPath}: 变体 ${variant.id} 缺少 css 文件名`)
      checkLayout(variant.layout, srcPath, `变体 ${variant.id}`)
      const cssPath = join(themeDir, variant.css)
      let css
      try { css = await readFile(cssPath, 'utf8') } catch { throw new Error(`${srcPath}: 变体 ${variant.id} CSS 文件不存在 ${variant.css}`) }
      const combined = sharedCss ? `${sharedCss}\n${css}` : css
      if (combined.length > MAX_CSS) throw new Error(`${srcPath}: 变体 ${variant.id} 内联 CSS 超过 500KB`)
      variants.push({ ...variant, css: combined })
    }

    const out = { ...manifest, variants }
    delete out.sharedCss
    const outPath = join(distDir, `${manifest.id}.wstheme.json`)
    await writeFile(outPath, JSON.stringify(out, null, 2))
    console.log(`built ${outPath}`)
  }
}

buildThemes().catch(e => {
  console.error(e.message)
  process.exit(1)
})
