/**
 * FAQ block schema — common questions (data-model "FAQ"; FR-002/013).
 * Source of truth for `FaqConfig`.
 */
import { z, defineBlockSchema, type BlockConfig } from './base'
import { blockVariant } from './variant'

/** One Q/A pair — both required. */
const faqItem = z.object({ question: z.string(), answer: z.string() })

export const faqSchema = defineBlockSchema({
  variant: blockVariant(['accordion', 'list'], 'accordion'),
  heading: z.string().optional(),
  items: z.array(faqItem),
})

export type FaqConfig = BlockConfig<typeof faqSchema>
