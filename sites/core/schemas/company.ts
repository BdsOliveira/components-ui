/**
 * Company config schema — the site-level business identity
 * (website-schema-contract.md §W8, data-model "CompanyConfig"; FR-008, FR-013).
 *
 * `company` is the SINGLE site-level source of cross-cutting business identity
 * (name, contact, social, legal) that many sections reuse — never duplicated
 * per section. `name` is the one piece of identity a real site cannot omit and
 * is therefore required; everything else is optional so partial input degrades
 * gracefully (FR-013) rather than crashing.
 *
 *   import { companySchema, type CompanyConfig } from '~/sites/core/schemas'
 */
import { z } from 'zod'

/** The typed `company` portion of a `WebsiteConfig`. */
export const companySchema = z.object({
  // The only required identity field — a real site cannot omit its name.
  name: z.string(),
  tagline: z.string().optional(),
  contact: z
    .object({
      email: z.string(),
      phone: z.string(),
      address: z.string(),
    })
    .partial()
    .optional(),
  // platform -> profile URL (e.g. { instagram: 'https://...' }).
  social: z.record(z.string()).optional(),
  legal: z
    .object({
      legalName: z.string(),
      taxId: z.string(),
    })
    .partial()
    .optional(),
})

/** The inferred `company` config type — derived from the schema, never re-declared. */
export type CompanyConfig = z.infer<typeof companySchema>
