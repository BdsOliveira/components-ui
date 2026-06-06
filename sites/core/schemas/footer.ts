/**
 * Footer block schema — the page closer (data-model "Footer"; FR-002/011).
 * Source of truth for `FooterConfig`.
 *
 * Sources identity/social from site-level `company` (`useSiteCompany`):
 * `tagline` → `company.tagline`, `legal` → `company.legal.legalName`, and
 * `company.social` links render when `showSocial`.
 */
import { z, defineBlockSchema, type BlockConfig } from './base'
import { blockVariant } from './variant'

const link = z.object({ label: z.string(), href: z.string() })
/** A nav column: optional title + its links. */
const linkGroup = z.object({ title: z.string().optional(), links: z.array(link) })

export const footerSchema = defineBlockSchema({
  variant: blockVariant(['columns', 'minimal'], 'columns'),
  tagline: z.string().optional(),
  linkGroups: z.array(linkGroup).optional(),
  legal: z.string().optional(),
  showSocial: z.boolean().default(true),
})

export type FooterConfig = BlockConfig<typeof footerSchema>
