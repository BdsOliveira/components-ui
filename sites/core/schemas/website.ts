/**
 * The central website schema — one canonical whole-site shape
 * (website-schema-contract.md §W1, data-model "WebsiteConfig";
 * FR-001, FR-002, FR-003, FR-006, FR-016).
 *
 * A website IS exactly one `WebsiteConfig = { company, theme, sections }`:
 *   - `company`  — business identity (single site-level source),
 *   - `theme`    — site-wide visual tokens (defaulted; omit -> defaults applied),
 *   - `sections` — an ORDERED list whose array order is the render order; an
 *     empty list is a valid, defined state (FR-016 / §W6).
 *
 * This is the ONLY permitted whole-site representation — no layer defines a
 * private or alternative site shape (FR-003 / FR-017). It is the composition
 * root: it imports the leaf schemas (`companySchema`, `themeSchema`) and the
 * registry-built section union and never redefines them.
 *
 * NOTE: `sections` here uses `buildSectionSchema()` at module-load time for the
 * static `WebsiteConfig` TYPE and shape. Whole-site VALIDATION rebuilds the
 * section union from the live registry per call — see `validate-website.ts`.
 */
import { z } from 'zod'
import { companySchema } from './company'
import { themeSchema } from './theme'
import { buildSectionSchema } from './section'

/** The single canonical whole-site schema. */
export const websiteConfigSchema = z.object({
  company: companySchema,
  // Defaulted so omitting `theme` entirely still yields a valid token set (W4).
  theme: themeSchema.default({}),
  // Ordered; order IS render order (FR-006). Empty list allowed (FR-016 / W6).
  sections: z.array(buildSectionSchema()),
})

/** The inferred whole-site type — the lingua franca across every layer (FR-017). */
export type WebsiteConfig = z.infer<typeof websiteConfigSchema>
