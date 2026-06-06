/**
 * Slot typing conventions (block-contract.md §C5, Decision 4; FR-008, FR-009).
 *
 * Slots are optional, additive Vue named slots. A block MUST render completely
 * with zero slots filled — slots are escape hatches, never the primary content
 * path. When a slot and a config value target the same region, the SLOT
 * OVERRIDES that region.
 */
import type { Slot } from 'vue'

/**
 * The optional named slots a block exposes. Every entry is optional by
 * construction, enforcing the "renders fully without slots" baseline.
 *
 *   defineSlots<BlockSlots<'heading' | 'cta'>>()
 */
export type BlockSlots<Names extends string = never> = {
  [K in Names]?: Slot
}

/**
 * Precedence marker for a region targetable by both config and a slot: the
 * slot overrides the config-derived default for that region (§C5). Document
 * the overridden region per slot.
 */
export type SlotOverridesConfig = 'slot-overrides-config'
