// core/types — barrel re-export hub for block-contract types.
// Block primitives (BlockProps<T>, slot types) are re-exported from here so
// consumers import from `~/sites/core/types` rather than deep paths.
export type { BlockProps } from './block-props'
export type { BlockSlots, SlotOverridesConfig } from './slots'
