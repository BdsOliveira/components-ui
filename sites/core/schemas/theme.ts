/**
 * Theme config schema — the site-wide visual identity tokens
 * (website-schema-contract.md §W8, data-model "ThemeConfig"; FR-009, FR-013).
 *
 * `theme` holds the visual tokens applied UNIFORMLY across every section, so a
 * whole site is re-skinned by changing configuration — never per-section source
 * edits (FR-009). Every field is defaulted or optional so a missing/partial
 * theme still yields a valid, renderable token set (FR-013): `colors` defaults
 * to a usable palette and `mode` defaults to `'system'`.
 *
 *   import { themeSchema, type ThemeConfig } from '~/sites/core/schemas'
 */
import { z } from 'zod'

/** Color tokens — `primary` is defaulted so an empty `colors` still resolves. */
const colorsSchema = z
  .object({
    primary: z.string().default('#0ea5e9'),
    secondary: z.string().optional(),
    accent: z.string().optional(),
    background: z.string().optional(),
    foreground: z.string().optional(),
  })
  .default({})

/** The typed `theme` portion of a `WebsiteConfig`; defaulted throughout. */
export const themeSchema = z.object({
  colors: colorsSchema,
  typography: z
    .object({
      headingFont: z.string().optional(),
      bodyFont: z.string().optional(),
    })
    .optional(),
  mode: z.enum(['light', 'dark', 'system']).default('system'),
  radius: z.string().optional(),
  spacing: z.string().optional(),
})

/** The inferred `theme` config type — derived from the schema, never re-declared. */
export type ThemeConfig = z.infer<typeof themeSchema>
