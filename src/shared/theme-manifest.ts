import { z } from 'zod'
import { MessageError } from './i18n'

export const BUILTIN_THEME = 'windows'

const slug = z.string().regex(/^[a-z0-9][a-z0-9-]{0,49}$/, 'validation.themeSlug')
const hex = z.string().regex(/^#[0-9a-f]{6}$/i, 'validation.themeHex')
const fluentOverrides = z.record(z.string().regex(/^color[A-Z][A-Za-z0-9]*$/), hex)

// Layout tokens a theme pack may declare (all optional). Values become CSS variables;
// the renderer maps each key to its --* variable and base.css provides matching defaults.
export const layoutTokens = ['sidebarWidth', 'sidebarRadius', 'topbarHeight', 'contentMaxWidth', 'panelWidth', 'mailPaneWidth', 'fontSizeBase', 'lineHeightBase', 'spaceUnit', 'radiusSm', 'radius', 'radiusLg'] as const
export type LayoutToken = typeof layoutTokens[number]
const layoutValue = z.string().regex(/^-?\d+(\.\d+)?(px|rem|em|%)?$/, 'validation.themeLayout').max(20)
const layoutSchema = z.record(z.string().max(40), layoutValue).optional()
export type LayoutTokens = Partial<Record<LayoutToken, string>>

const themeVariantSchema = z.object({
  id: slug,
  name: z.string().trim().min(1).max(50),
  dark: z.boolean(),
  accent: hex,
  fluent: fluentOverrides.optional(),
  layout: layoutSchema,
  css: z.string().max(500_000)
})

const themeManifestSchema = z.object({
  format: z.literal(1),
  id: slug,
  name: z.string().trim().min(1).max(50),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'validation.themeVersion'),
  author: z.string().max(100).default(''),
  description: z.string().max(500).default(''),
  shell: z.enum(['sidebar', 'taskbar']),
  material: z.enum(['mica', 'acrylic', 'none']).default('none'),
  layout: layoutSchema,
  variants: z.array(themeVariantSchema).min(1).max(20)
})

export type ThemeVariant = z.infer<typeof themeVariantSchema>
export type ThemeManifest = z.infer<typeof themeManifestSchema>

function checkLayout(layout: Record<string, string> | undefined): void {
  if (!layout) return
  for (const key of Object.keys(layout)) {
    if (!(layoutTokens as readonly string[]).includes(key)) throw new MessageError('validation.themeLayoutKey', { key })
  }
}

export function validateThemePackage(input: unknown): ThemeManifest {
  const manifest = themeManifestSchema.parse(input)
  if (new Set(manifest.variants.map(v => v.id)).size !== manifest.variants.length) throw new MessageError('validation.variantDup')
  if (manifest.id === BUILTIN_THEME) throw new MessageError('validation.builtinReserved')
  checkLayout(manifest.layout)
  for (const variant of manifest.variants) checkLayout(variant.layout)
  return manifest
}

// '' means follow the appearance mode: pick the first variant matching the effective darkness.
export function pickVariant(manifest: ThemeManifest, variant: string, dark: boolean): ThemeVariant {
  return manifest.variants.find(v => v.id === variant) ?? manifest.variants.find(v => v.dark === dark) ?? manifest.variants[0]
}
