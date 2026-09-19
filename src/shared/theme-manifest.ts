import { z } from 'zod'

export const BUILTIN_THEME = 'windows'

const slug = z.string().regex(/^[a-z0-9][a-z0-9-]{0,49}$/, '主题 ID 只能包含小写字母、数字与连字符')
const hex = z.string().regex(/^#[0-9a-f]{6}$/i, '颜色需为 #rrggbb')
const fluentOverrides = z.record(z.string().regex(/^color[A-Z][A-Za-z0-9]*$/), hex)

export const themeVariantSchema = z.object({
  id: slug,
  name: z.string().trim().min(1).max(50),
  dark: z.boolean(),
  accent: hex,
  fluent: fluentOverrides.optional(),
  css: z.string().max(500_000)
})

export const themeManifestSchema = z.object({
  format: z.literal(1),
  id: slug,
  name: z.string().trim().min(1).max(50),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, '版本需为 x.y.z'),
  author: z.string().max(100).default(''),
  description: z.string().max(500).default(''),
  shell: z.enum(['sidebar', 'taskbar']),
  material: z.enum(['mica', 'acrylic', 'none']).default('none'),
  variants: z.array(themeVariantSchema).min(1).max(20)
})

export type ThemeVariant = z.infer<typeof themeVariantSchema>
export type ThemeManifest = z.infer<typeof themeManifestSchema>

export function validateThemePackage(input: unknown): ThemeManifest {
  const manifest = themeManifestSchema.parse(input)
  if (new Set(manifest.variants.map(v => v.id)).size !== manifest.variants.length) throw new Error('主题变体 ID 重复')
  if (manifest.id === BUILTIN_THEME) throw new Error('windows 为内置主题，不可安装同名包')
  return manifest
}

// '' means follow the appearance mode: pick the first variant matching the effective darkness.
export function pickVariant(manifest: ThemeManifest, variant: string, dark: boolean): ThemeVariant {
  return manifest.variants.find(v => v.id === variant) ?? manifest.variants.find(v => v.dark === dark) ?? manifest.variants[0]
}
