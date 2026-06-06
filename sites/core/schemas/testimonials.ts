/**
 * Testimonials block schema — social proof list (data-model "Testimonials";
 * FR-002/013). Source of truth for `TestimonialsConfig`.
 */
import { z, defineBlockSchema, type BlockConfig } from './base'
import { blockVariant } from './variant'

const media = z.object({ src: z.string(), alt: z.string() })

/** One testimonial: `quote` + `author` required; the rest optional. */
const testimonial = z.object({
  quote: z.string(),
  author: z.string(),
  role: z.string().optional(),
  avatar: media.optional(),
  rating: z.number().optional(),
})

export const testimonialsSchema = defineBlockSchema({
  variant: blockVariant(['grid', 'carousel'], 'grid'),
  heading: z.string().optional(),
  items: z.array(testimonial),
})

export type TestimonialsConfig = BlockConfig<typeof testimonialsSchema>
