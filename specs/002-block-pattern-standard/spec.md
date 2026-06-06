# Feature Specification: Universal Block Pattern (Phase 2)

**Feature Branch**: `002-block-pattern-standard`

**Created**: 2026-06-05

**Status**: Completed

**Input**: User description: "FASE 2 — Definir o padrão dos blocos. Antes de criar componentes, defina o padrão universal. Todos os blocos: recebem props tipadas, recebem config JSON, possuem variantes, possuem slots opcionais, são independentes. Exemplo: `<HeroSection :data="config.hero" />` e NÃO `<HeroSection title="..." subtitle="..." />`. Porque seu sistema inteiro será JSON driven."

## Overview

This phase defines the **universal block contract**: the single, canonical interface that every
reusable block (section, ui element, layout) in the platform MUST satisfy. No concrete blocks are
built here. The deliverable is the standard itself plus a conformance checklist that any block can
be measured against, so that every later block is interchangeable, JSON-driven, and assembled
rather than hand-coded.

This is the most consequential decision of the project: the contract is fixed once and inherited
by every block forever. Getting it right is the precondition for sub-2-hour, config-only site
assembly.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - One canonical, JSON-driven block interface (Priority: P1)

A block author building any reusable block consults a single authoritative contract that tells them
the exact shape every block must take: it accepts **one structured data input** representing its
slice of the site configuration, and renders entirely from that input. Authors never invent a
per-block prop surface; consumers never wire content prop-by-prop.

The platform's mental model is:

```vue
<HeroSection :data="config.hero" />
```

and explicitly NOT:

```vue
<HeroSection title="..." subtitle="..." cta-label="..." />
```

**Why this priority**: Every other capability (variants, slots, independence, validation) hangs off
the single-input contract. Without one canonical interface, blocks diverge, composition breaks, and
JSON-driven rendering is impossible. This is the irreducible MVP of Phase 2.

**Independent Test**: Take any sample block description and confirm the contract dictates exactly one
structured data input as its content source, with no scattered scalar content props. A reviewer can
accept or reject a hypothetical block against the contract using only the written standard.

**Acceptance Scenarios**:

1. **Given** the universal block contract, **When** an author reads it, **Then** it states that each
   block receives exactly one structured data input carrying that block's config slice.
2. **Given** a candidate block exposing individual content props (`title`, `subtitle`, ...),
   **When** it is checked against the contract, **Then** it is rejected as non-conforming
   (prop-drilling for content is prohibited).
3. **Given** a block and a config slice, **When** the block renders, **Then** its output is derived
   solely from that config slice and is predictable for the same input.

---

### User Story 2 - Typed, schema-backed configuration (Priority: P1)

A block author and the rendering pipeline both rely on the block's data input being strongly typed
and backed by a schema, so the shape is known ahead of render, invalid configurations are caught,
and editors get autocompletion. A site can be assembled from JSON without reading the block's source.

**Why this priority**: A single data input is only safe if its shape is contractually defined.
Typing + schema is what turns "pass an object" into a reliable, validated, automatable contract —
the foundation the JSON-driven engine depends on. Equal P1 with Story 1; together they are the core.

**Independent Test**: Inspect the contract and confirm every block's data input is required to have a
declared type and an associated schema, and that configuration is validated before render with a
defined behavior on failure.

**Acceptance Scenarios**:

1. **Given** the contract, **When** an author defines a block, **Then** they must declare the typed
   shape of its data input and an associated schema.
2. **Given** a config slice that violates the block's schema, **When** it is processed, **Then**
   validation flags it before render rather than producing broken output.
3. **Given** a valid config slice, **When** an editor authors it, **Then** the declared type makes
   the expected fields discoverable without inspecting block internals.

---

### User Story 3 - Named, config-selected variants (Priority: P2)

A site assembler changes a block's visual or behavioral treatment by selecting a named variant in
configuration, without touching block source or creating a new block. A block with no variant
specified renders a defined default.

**Why this priority**: Variants are how one block serves many niches without duplication
(Constitution VI, XIV). They are essential to reuse but build on the typed single-input contract
established in P1.

**Independent Test**: Confirm the contract requires blocks to declare a closed set of named variants
selectable through configuration, with a defined default, and that selecting a variant is a
config-only change.

**Acceptance Scenarios**:

1. **Given** a block declaring variants, **When** a config slice names a valid variant, **Then** the
   block renders that variant with no source change.
2. **Given** a config slice that omits the variant, **When** the block renders, **Then** the block's
   defined default variant is used.
3. **Given** a config slice naming an unknown variant, **When** it is processed, **Then** the
   behavior is defined (rejected by schema or falls back to default), never an undefined state.

---

### User Story 4 - Optional named slots for controlled escape hatches (Priority: P2)

When a niche needs custom content a block's config cannot express, an assembler supplies it through a
block's **optional named slot** instead of forking the block. A block with no slot content renders
correctly and completely on configuration alone.

**Why this priority**: Slots prevent the "fork the component for one client" anti-pattern (XIV) while
keeping the JSON-driven default path intact. Important for flexibility but secondary to the core
data contract.

**Independent Test**: Confirm the contract permits optional named slots, requires blocks to render
fully without any slot filled, and treats slots as additive extensions rather than the primary
content path.

**Acceptance Scenarios**:

1. **Given** a block declaring optional slots, **When** no slot content is provided, **Then** the
   block renders completely from configuration alone.
2. **Given** a niche-specific need, **When** an assembler fills a named slot, **Then** the custom
   content appears without modifying or duplicating the block.
3. **Given** the contract, **When** an author considers slots, **Then** slots are documented as
   optional additive escape hatches, never as a substitute for the typed config input.

---

### User Story 5 - Independent, isolated blocks (Priority: P2)

A block renders standalone given only its config slice — no dependency on sibling blocks, parent
context, global mutable state, render order, or client-specific hardcoded content. Any block can be
reordered, removed, reused across clients, or previewed in isolation.

**Why this priority**: Independence is what makes blocks Lego-style interchangeable across hundreds
of clients (Constitution I, III, XII). It is a contract guarantee, layered on the data, variant, and
slot rules above.

**Independent Test**: Confirm the contract prohibits cross-block coupling, shared mutable global
state, and client-specific hardcoded content inside a block, and requires each block to render from
its config slice alone.

**Acceptance Scenarios**:

1. **Given** any conforming block, **When** it is rendered in isolation with only its config slice,
   **Then** it renders correctly without surrounding blocks or external context.
2. **Given** two blocks on a page, **When** one block's config changes, **Then** the other block's
   output is unaffected (no coupling).
3. **Given** a block, **When** it is reviewed, **Then** it contains no client-specific hardcoded
   content and reads no client identity from global state.

---

### Edge Cases

- What happens when the supplied config slice is missing or partially invalid? The contract must
  define a safe fallback (defaults / graceful degradation), never a render crash.
- What happens when a config slice contains unknown or extra keys? The contract must define
  predictable handling (ignored or rejected by schema), not silent corruption.
- How does a block behave when both a config value and a slot target the same region? The contract
  must define precedence so output stays predictable.
- What happens when a block needs data another block produced? The contract must forbid it — blocks
  receive only their own config slice and stay independent.
- How is a default chosen when a variant is declared but the default is unspecified? The contract
  must require an explicit default per block.
- What happens when a future block needs a capability the contract does not cover? The contract is
  the single source of truth and must be amended deliberately, not bypassed per block.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The platform MUST define a single universal block contract that every reusable block
  (section, ui, layout) conforms to, recorded as the single source of truth for block authoring.
- **FR-002**: Each block MUST receive exactly one structured data input representing that block's
  slice of the site configuration, and MUST render its content from that input.
- **FR-003**: The contract MUST prohibit exposing block content through scattered individual scalar
  props (prop-drilling); content MUST flow through the single structured data input.
- **FR-004**: Each block's data input MUST be strongly typed and backed by a schema that declares its
  shape (Constitution IV, VIII).
- **FR-005**: A block's configuration MUST be validated against its schema before render, with a
  defined behavior on validation failure (safe fallback or rejection), never broken output.
- **FR-006**: Each block MUST be able to declare a closed set of named variants selectable purely
  through configuration, and MUST define a default variant used when none is specified.
- **FR-007**: Selecting or changing a block's variant MUST be a configuration-only change requiring
  no modification to block source or creation of a new block.
- **FR-008**: Each block MUST be able to expose optional named slots for custom content, and MUST
  render completely and correctly when no slot content is provided.
- **FR-009**: Slots MUST be additive escape hatches; the typed config input MUST remain the primary
  content path (slots MUST NOT be required for a block's baseline render).
- **FR-010**: Each block MUST be independent: it MUST NOT depend on sibling blocks, parent context,
  render order, or shared mutable global state, and MUST render given only its config slice.
- **FR-011**: Each block MUST be free of client-specific hardcoded content and MUST NOT read client
  identity from global state (Constitution III, XIV).
- **FR-012**: A block's render MUST be predictable: the same config slice MUST produce the same
  output, independent of surrounding blocks.
- **FR-013**: The contract MUST define handling for missing, partial, or invalid configuration
  (safe defaults / graceful degradation) such that a block never crashes the render.
- **FR-014**: The contract MUST define handling for unknown or extra configuration keys
  (ignored or schema-rejected), never silent corruption.
- **FR-015**: Every block MUST self-document its config shape, available variants, and available
  slots, so it can be used without reading its source.
- **FR-016**: The contract MUST require blocks to be responsive, accessible (WCAG baseline), and
  theme-aware by default (Constitution V, X).
- **FR-017**: The platform MUST provide a conformance checklist that any candidate block can be
  validated against, encoding FR-001 through FR-016 as pass/fail criteria.

### Key Entities *(include if feature involves data)*

- **Block Contract**: The universal, authoritative interface all blocks satisfy — defines the single
  data input, typing/schema requirement, variants, slots, independence, and baseline quality rules.
- **Block Config Slice**: The single structured data input a block receives (e.g. `config.hero`);
  the sole content source for the block's baseline render.
- **Block Schema**: The typed, validatable definition of a block's config slice shape; source of
  truth for the block's props and the gate for pre-render validation.
- **Variant**: A named, config-selected visual/behavioral treatment of a block, drawn from a closed
  declared set with a defined default.
- **Slot**: An optional, named, additive content extension point on a block, used for custom content
  the config cannot express without forking the block.
- **Conformance Checklist**: The pass/fail instrument that validates whether a given block satisfies
  the universal contract.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of blocks expose their content through a single structured config input; zero
  blocks expose content via scattered scalar props.
- **SC-002**: A new conforming block can be placed on a page by supplying only its config slice, with
  zero source changes to any consumer or sibling block.
- **SC-003**: Changing a block's appearance to any declared variant is achievable through a
  configuration change alone in 100% of cases (no source edits).
- **SC-004**: 100% of blocks render correctly in isolation given only their config slice, with no
  surrounding blocks or external context.
- **SC-005**: 100% of invalid or missing config slices result in a defined safe fallback; zero cause
  a render crash.
- **SC-006**: A block author can produce a new contract-conforming block using only the contract and
  conformance checklist, without inventing a bespoke interface (verified by checklist pass).
- **SC-007**: 100% of blocks pass the conformance checklist before being accepted.
- **SC-008**: Zero blocks contain client-specific hardcoded content or read client identity from
  global state.

## Assumptions

- The single data input is conveyed via a `data` input carrying the block's config slice, matching
  the user's example `<HeroSection :data="config.hero" />`; the exact input name is finalized at
  planning time but the single-input rule is fixed.
- Variant selection is expressed as a value within the block's config slice (e.g. a `variant` key),
  consistent with JSON-driven rendering.
- Schema definition and the upstream validation pipeline established by Constitution IV are reused;
  blocks assume validated config but still fail safe per FR-013.
- This phase delivers the standard (contract documentation) and the conformance checklist only;
  authoring concrete blocks (HeroSection, ServicesSection, etc.) is deferred to a later phase.
- Responsive, accessible, and theme-aware baselines are inherited as contract requirements from the
  constitution rather than redefined here.
- The contract lives in the `core/` layer as a neutral, business-agnostic standard and applies
  uniformly to `sections`, `ui`, and `layout` component groups defined in Phase 1.
