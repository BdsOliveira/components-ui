/**
 * Variant schema helper (block-contract.md §C4, Decision 3; FR-006, FR-007).
 *
 * A block declares a CLOSED set of named variants with EXACTLY ONE explicit
 * default, selected via `data.variant`. Changing a variant is a config-only
 * change. An unknown variant is rejected by the enum and resolves to the
 * default through the safe-fallback path (never an undefined state).
 *
 *   variant: blockVariant(['centered', 'split', 'minimal'], 'centered')
 */
import { z } from 'zod'

/**
 * Build a closed `z.enum(...).default(...)` for a block's `variant` key.
 * The `defaultValue` MUST be a member of `values` (compile-time enforced),
 * guaranteeing the "closed set + exactly one explicit default" rule.
 */
export function blockVariant<const T extends readonly [string, ...string[]]>(
  values: T,
  defaultValue: T[number],
) {
  return z.enum(values).default(defaultValue)
}
