/**
 * Services block schema — the "what we do" list (data-model "Services";
 * FR-002/013). Source of truth for `ServicesConfig`. `items` is required but may
 * be empty → the list region renders nothing (B5).
 */
import { z, defineBlockSchema, type BlockConfig } from './base'
import { blockVariant } from './variant'

const link = z.object({ label: z.string(), href: z.string() })
const media = z.object({ src: z.string(), alt: z.string() })

/** One service: only `title` is required; everything else degrades gracefully. */
const serviceItem = z.object({
  title: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  media: media.optional(),
  cta: link.optional(),
})

export const servicesSchema = defineBlockSchema({
  variant: blockVariant(['grid', 'list'], 'grid'),
  heading: z.string().optional(),
  items: z.array(serviceItem),
})

export type ServicesConfig = BlockConfig<typeof servicesSchema>
