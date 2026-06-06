# Phase 1 Data Model: Universal Block Pattern

Entities are the conceptual pieces of the **contract**, not runtime tables. They define the shape
every future block inherits. Validation rules trace to the spec's functional requirements.

## Entity: Block Contract

The universal, authoritative interface all blocks satisfy. Single source of truth for block
authoring (FR-001). Not data itself — it is the set of rules the entities below encode.

| Aspect | Rule | Trace |
|--------|------|-------|
| Content input | Exactly one structured input `data` | FR-002 |
| Prop drilling | No scalar content props | FR-003 |
| Typing | `data` strongly typed + schema-backed | FR-004 |
| Validation | Validated before render, defined failure behavior | FR-005, FR-013 |
| Variants | Closed named set, explicit default, config-selected | FR-006, FR-007 |
| Slots | Optional, additive, baseline renders without them | FR-008, FR-009 |
| Independence | No sibling/parent/order/global-state coupling | FR-010, FR-012 |
| Neutrality | No client-specific hardcoded content / identity | FR-011 |
| Baseline quality | Responsive, accessible (WCAG), theme-aware | FR-016 |
| Self-documentation | Config shape, variants, slots discoverable | FR-015 |

## Entity: Block Config Slice

The single structured input a block receives (e.g. `config.hero`). Sole content source for the
block's baseline render.

- **Fields**: arbitrary block-specific fields + reserved `variant?: <closed union>`.
- **Type**: `z.infer<typeof blockSchema>` — the inferred type IS the contract type.
- **Validation**: MUST validate against the block's schema before render (FR-005). Missing/partial →
  safe defaults (FR-013). Unknown/extra keys → stripped (FR-014).
- **Relationship**: one slice per block instance; never shared with or sourced from sibling blocks
  (FR-010).

## Entity: Block Schema

The typed, validatable Zod definition of a config slice's shape. Source of truth for the block's
props and the gate for pre-render validation.

- **Fields**: a Zod object schema; `variant` modeled as `z.enum([...]).default(<default>)`.
- **Rules**: one schema per block; the TS type is derived from it (never declared independently,
  Decision 5). Emits JSON Schema for self-documentation (FR-015).
- **Home**: `sites/core/schemas/`.
- **State**: schemas are versioned/consistent (Constitution IV); changes are schema-first
  (Workflow gate).

## Entity: Variant

A named, config-selected visual/behavioral treatment, drawn from a closed declared set with a
defined default.

- **Fields**: `name` (member of closed union), `isDefault` (exactly one per block).
- **Selection**: via `data.variant`; omission → default (FR-006).
- **Validation**: unknown variant rejected by schema; resolves to default only through the safe
  fallback path (FR-006 edge case), never an undefined state.
- **Constraint**: changing variant is config-only, no source edit (FR-007).

## Entity: Slot

An optional, named, additive content extension point.

- **Fields**: `name`, `optional = true (always)`, `region` it targets.
- **Rules**: block MUST render fully with zero slots filled (FR-008); slots never required for
  baseline (FR-009). When slot and config target the same region, **slot overrides** (Decision 4).
- **Constraint**: slots are escape hatches, never the primary content path (FR-009).

## Entity: Conformance Checklist

The pass/fail instrument validating whether a block satisfies the contract (FR-017).

- **Fields**: one criterion per FR-001…FR-016, each `pass | fail | n/a`.
- **Rule**: a block is accepted only when every applicable criterion passes (SC-007).
- **Artifact**: `contracts/conformance-checklist.md`.

## Shared type primitive

```ts
// sites/core/types — the single-input contract, expressible per block
export interface BlockProps<TData> {
  data: TData
}
```

Every block component is typed `defineProps<BlockProps<HeroConfig>>()` where `HeroConfig` is the
inferred schema type — structurally enforcing FR-002/003.
