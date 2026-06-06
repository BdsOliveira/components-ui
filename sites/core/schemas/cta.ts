/**
 * CTA block schema — a focused conversion prompt (data-model "CTA"; FR-002/006).
 * Source of truth for `CtaConfig`. Both `heading` and `cta` are required — a CTA
 * without an action is meaningless.
 */
import { z, defineBlockSchema, type BlockConfig } from './base'
import { blockVariant } from './variant'

const link = z.object({ label: z.string(), href: z.string() })

export const ctaSchema = defineBlockSchema({
  variant: blockVariant(['banner', 'boxed'], 'banner'),
  heading: z.string(),
  body: z.string().optional(),
  cta: link,
  secondaryCta: link.optional(),
})

export type CtaConfig = BlockConfig<typeof ctaSchema>
