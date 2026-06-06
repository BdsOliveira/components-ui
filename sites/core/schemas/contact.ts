/**
 * Contact block schema — ways to reach the business (data-model "Contact";
 * FR-002/011). Source of truth for `ContactConfig`.
 *
 * `channels` is a per-block OVERRIDE; when absent (or a channel within it is
 * absent) the Contact SFC falls back to the injected `company.contact`
 * (`useSiteCompany`), so cross-cutting contact info is sourced once at site level.
 */
import { z, defineBlockSchema, type BlockConfig } from './base'
import { blockVariant } from './variant'

const hoursItem = z.object({ label: z.string(), value: z.string() })

export const contactSchema = defineBlockSchema({
  variant: blockVariant(['split', 'stacked'], 'split'),
  heading: z.string().optional(),
  intro: z.string().optional(),
  // Renders a contact-form STRUCTURE only (no delivery — spec Assumption).
  showForm: z.boolean().default(false),
  hours: z.array(hoursItem).optional(),
  mapEmbedUrl: z.string().optional(),
  channels: z
    .object({
      email: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
    })
    .optional(),
})

export type ContactConfig = BlockConfig<typeof contactSchema>
