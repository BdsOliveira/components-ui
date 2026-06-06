# Phase 0 Research: Universal Block Pattern

All NEEDS CLARIFICATION items from Technical Context resolved below. Each decision records what was
chosen, why, and what was rejected.

## Decision 1 — Schema / validation library

**Decision**: Adopt **Zod** as the single schema source of truth. Each block declares a Zod schema
for its config slice; the TypeScript type is derived with `z.infer<typeof schema>` (never declared
twice).

**Rationale**:
- Constitution IV mandates strongly-typed, schema-validated, predictable config; FR-004/005 require
  a declared schema and pre-render validation. A runtime schema (not just TS types) is required
  because JSON config must be validated at runtime/build time, where TS types do not exist.
- `z.infer` gives one source of truth → no type/schema drift (DX, Principle VIII).
- `safeParse` returns a discriminated result enabling the safe-fallback policy (FR-013) without
  throwing into the render.
- JSON-Schema emission (e.g. `zod-to-json-schema`) supports editor autocomplete / self-documentation
  (FR-015) and future automated/AI-driven config authoring (Principle XV).
- Validation runs at build/server time for SSG, so bundle weight is not shipped to SSG clients
  (Principle IX preserved).

**Alternatives considered**:
- **Valibot** — lighter, fully tree-shakable; strong fit for client-bundle-sensitive paths. Rejected
  as primary only on ecosystem maturity and `z.infer` familiarity; retained as the documented
  fallback if client-side validation bundle size later becomes a constraint.
- **Hand-rolled validators** — rejected: reinvents a solved problem, no inference, more maintenance,
  contradicts Principle VIII/XIV.
- **TypeScript types only** — rejected: erased at runtime, cannot validate JSON before render
  (fails FR-005 and Principle IV).

## Decision 2 — The single data input

**Decision**: Every block receives its config slice through exactly one prop named **`data`**, typed
as the block's inferred config type: `<HeroSection :data="config.hero" />`. No scalar content props.

**Rationale**: Matches the spec's canonical example and assumption; one input keeps the JSON-driven
mental model uniform across all blocks (FR-002/003). A single typed prop is the minimum surface that
still carries the full config slice.

**Alternatives considered**:
- **`config` as the prop name** — equivalent; `data` chosen to match the spec example verbatim and
  avoid confusion with the top-level `config.json`.
- **Multiple scalar props (`title`, `subtitle`, …)** — explicitly prohibited by FR-003 (prop-drilling
  for content).

## Decision 3 — Variant expression

**Decision**: Variants are a closed string union declared in the block's schema and selected by a
**`variant` key inside the config slice** (`data.variant`). Each block declares an explicit default
applied when `variant` is omitted. Unknown variants are rejected by the schema (caught in validation),
falling back to default only via the FR-013 safe-fallback path.

**Rationale**: Keeps variant selection a config-only change (FR-006/007), JSON-driven, and validated
by the same schema as the rest of the slice. A closed union makes the variant set discoverable and
type-checked.

**Alternatives considered**:
- **Variant as a separate prop** — rejected: violates the single-input rule (FR-002).
- **Open/free-form variant strings** — rejected: no closed set, breaks discoverability and FR-006
  ("closed set of named variants").

## Decision 4 — Slot model

**Decision**: Slots are **Vue named slots**, all optional and additive. Every block MUST render
completely from `data` alone with zero slots filled (FR-008/009). When both a config value and a
slot target the same region, **the slot overrides the config-derived default for that region**, and
this precedence is documented per slot.

**Rationale**: Vue named slots are the native, framework-idiomatic escape hatch and require no new
machinery. Mandating a complete config-only baseline keeps the JSON-driven path primary and prevents
slots becoming a required content channel.

**Alternatives considered**:
- **Slots as the primary content path** — rejected: contradicts FR-009 and the JSON-driven principle.
- **Config-only, no slots** — rejected: reintroduces the "fork the block for one client"
  anti-pattern (Principle XIV) the slot escape hatch exists to prevent.

## Decision 5 — Type ⇄ schema co-location

**Decision**: The Zod schema is authored in `sites/core/schemas/` and is the source of truth; the
block's config type is the inferred type re-exported from `sites/core/types/` (or co-located with the
block once blocks exist). A shared generic contract type `BlockProps<T> = { data: T }` lives in
`sites/core/types/`.

**Rationale**: Single declaration point (schema) with inferred types eliminates drift (FR-004,
Principle VIII). `BlockProps<T>` makes the single-input contract expressible and enforceable in TS
for every future block.

**Alternatives considered**:
- **Declare TS type and schema separately** — rejected: two sources of truth, guaranteed drift.

## Decision 6 — Validation timing & failure policy

**Decision**: Config slices are validated with `safeParse` **before render**. On failure the contract
mandates a **safe fallback**: apply schema defaults / render a degraded-but-valid state, never throw
into the render tree (FR-005/013). Unknown/extra keys are **stripped** by default (Zod default object
behavior), never silently merged into output (FR-014); a block MAY opt into strict rejection where a
typo must fail loudly.

**Rationale**: Guarantees "never crash the render" (SC-005) while keeping behavior predictable and
defined for both missing/partial config and extra keys.

**Alternatives considered**:
- **Throw on invalid config** — rejected: a single bad slice would crash the whole page render,
  violating FR-013/SC-005.
- **Pass unknown keys through** — rejected: silent corruption risk (FR-014).

## Decision 7 — Self-documentation mechanism

**Decision**: Each block self-documents via (a) its exported Zod schema (machine-readable shape), (b)
its declared variant union and slot names, and (c) a short authored doc block. JSON Schema can be
emitted from the Zod schema for editors and future tooling.

**Rationale**: Satisfies FR-015 (usable without reading source) and feeds Principle XV automation.

## Summary of resolved unknowns

| Unknown | Resolution |
|---------|-----------|
| Schema/validation library | Zod (Valibot documented fallback) |
| Single data input shape | one prop `data: T` |
| Variant mechanism | `data.variant` closed union + explicit default |
| Slot mechanism | optional Vue named slots; config-only baseline mandatory; slot overrides region |
| Type/schema source of truth | Zod schema in `core/schemas/`, type via `z.infer`; `BlockProps<T>` in `core/types/` |
| Validation timing/failure | `safeParse` pre-render, safe fallback, strip unknown keys |
