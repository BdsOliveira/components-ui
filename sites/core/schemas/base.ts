/**
 * Base block-config schema conventions (block-contract.md §C2, Decision 5).
 *
 * A block declares ONE Zod schema for its config slice; the TypeScript type is
 * ALWAYS derived from it (`z.infer`), never declared separately. The schema is
 * the single source of truth for the block's props and the gate for pre-render
 * validation.
 *
 *   const heroSchema = defineBlockSchema({ heading: z.string() })
 *   type HeroConfig = BlockConfig<typeof heroSchema>   // = z.infer<typeof heroSchema>
 */
import { z } from 'zod'

// Re-export `z` so blocks import their schema toolkit from one place.
export { z }

/**
 * Declare a block's config schema. A thin convention wrapper over `z.object`
 * that fixes "one object schema per block" and keeps unknown keys stripped
 * (Zod's default object behavior — never silently merged, FR-014).
 */
export function defineBlockSchema<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape)
}

/** The inferred config type of a block schema — the contract type for `data`. */
export type BlockConfig<S extends z.ZodTypeAny> = z.infer<S>
