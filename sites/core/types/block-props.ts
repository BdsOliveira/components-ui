/**
 * The single-input block contract (block-contract.md §C1, FR-002/FR-003).
 *
 * Every block receives its content through exactly one prop, `data`, carrying
 * that block's config slice. No scalar content props are permitted.
 *
 *   defineProps<BlockProps<HeroConfig>>()   // exactly one content input: `data`
 *
 * `TData` is the block's inferred schema type (`z.infer<typeof blockSchema>`),
 * so the structural shape of `data` is the source-of-truth schema itself.
 */
export interface BlockProps<TData> {
  data: TData
}
