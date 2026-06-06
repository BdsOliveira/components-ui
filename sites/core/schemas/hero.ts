/**
 * Hero block schema — the opening banner (data-model "Hero"; FR-002/006/008).
 * Source of truth for `HeroConfig`. `heading` is the one thing a hero cannot omit.
 */
import { z, defineBlockSchema, type BlockConfig } from './base'
import { blockVariant } from './variant'

/** A label + destination link, reused for primary/secondary calls to action. */
const link = z.object({ label: z.string(), href: z.string() })
/** An image with required alt text (config-driven a11y, B8). */
const media = z.object({ src: z.string(), alt: z.string() })

export const heroSchema = defineBlockSchema({
  variant: blockVariant(['centered', 'split', 'minimal'], 'centered'),
  heading: z.string(),
  subheading: z.string().optional(),
  cta: link.optional(),
  secondaryCta: link.optional(),
  media: media.optional(),
})

export type HeroConfig = BlockConfig<typeof heroSchema>
