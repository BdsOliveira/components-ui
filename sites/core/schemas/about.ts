/**
 * About block schema — narrative/identity section (data-model "About";
 * FR-002/008/013). Source of truth for `AboutConfig`.
 */
import { z, defineBlockSchema, type BlockConfig } from './base'
import { blockVariant } from './variant'

const media = z.object({ src: z.string(), alt: z.string() })
/** Optional stat/feature points; empty array → none rendered. */
const highlight = z.object({ label: z.string(), value: z.string().optional() })

export const aboutSchema = defineBlockSchema({
  variant: blockVariant(['text', 'media-left', 'media-right'], 'text'),
  heading: z.string(),
  body: z.string(),
  media: media.optional(),
  highlights: z.array(highlight).optional(),
})

export type AboutConfig = BlockConfig<typeof aboutSchema>
