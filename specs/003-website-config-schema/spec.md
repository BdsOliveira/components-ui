# Feature Specification: Central Website Schema (Phase 3)

**Feature Branch**: `003-website-config-schema`

**Created**: 2026-06-05

**Status**: Draft

**Input**: User description: "FASE 3 — Criar o schema central. Como um site é representado. `interface WebsiteConfig { company: CompanyConfig; theme: ThemeConfig; sections: Section[] }`. Depois `type Section = HeroSection | ServicesSection | TestimonialsSection`. Onboarding gera isso, template consome isso, renderer renderiza isso. Um mini CMS headless."

## Overview

This phase defines the **central website schema**: the single, canonical structure that represents an
entire website as data. A whole site is reduced to one typed configuration object — its business
identity (`company`), its visual identity (`theme`), and an ordered list of `sections`, where each
section is one member of a closed, discriminated union of section types.

This schema is the contract that ties the platform together end to end:

- **onboarding produces it** (intake fills the structure),
- **templates consume it** (niche templates arrange and default sections),
- **the renderer renders it** (turns the structure into a live site).

Each section in the `sections` list carries the **block config slice** defined by the Phase 2
universal block contract — Phase 2 fixed the shape of one block; Phase 3 fixes how blocks are
composed into a complete site. Together they make the platform a JSON-driven, headless mini-CMS:
a site is created and changed by editing data, never by editing source.

No concrete sections or rendering engine are built here. The deliverable is the schema (the
`WebsiteConfig`, `CompanyConfig`, `ThemeConfig` shapes and the `Section` discriminated union) plus
its validation rules and extension procedure.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A whole site is one typed configuration object (Priority: P1)

A site assembler, onboarding pipeline, and renderer all refer to a single authoritative structure
that represents an entire website: a `WebsiteConfig` containing `company`, `theme`, and an ordered
`sections` list. There is exactly one canonical way to describe a site as data; no part of the
platform invents its own site representation.

**Why this priority**: Every later capability (onboarding generation, template orchestration,
rendering) depends on one shared site shape. Without a single canonical structure, the layers
diverge and JSON-driven assembly is impossible. This is the irreducible MVP of Phase 3.

**Independent Test**: Take any sample site description and confirm the schema expresses it as one
`WebsiteConfig` object with `company`, `theme`, and an ordered `sections` list — and that no
alternative site representation is permitted.

**Acceptance Scenarios**:

1. **Given** the central schema, **When** an author reads it, **Then** it defines a single
   `WebsiteConfig` shape composed of `company`, `theme`, and an ordered `sections` list.
2. **Given** a complete site described as data, **When** it is expressed against the schema, **Then**
   the entire site fits one `WebsiteConfig` object with no information held outside it.
3. **Given** two different sites, **When** each is represented, **Then** both use the identical
   `WebsiteConfig` structure, differing only in data values.

---

### User Story 2 - Sections as a closed, discriminated union (Priority: P1)

The `sections` list holds items of type `Section`, a **closed discriminated union** of named section
types (e.g. `HeroSection | ServicesSection | TestimonialsSection`). Each section item is identified
by a discriminator (its type) and carries the typed config slice that the Phase 2 block contract
expects for that block. The order of the list is the render order of the page.

**Why this priority**: The discriminated union is what lets one `sections` list mix many section
types while staying strongly typed and validatable. It is the bridge between the per-block contract
(Phase 2) and the whole-site structure. Equal P1 with Story 1; together they are the core.

**Independent Test**: Inspect the schema and confirm `Section` is a closed union keyed by a
discriminator, that each member maps to a known block's typed config slice, and that an unknown
section type is rejected.

**Acceptance Scenarios**:

1. **Given** the schema, **When** an author defines a section item, **Then** its type is one member
   of the closed `Section` union, identified by a discriminator field.
2. **Given** a `sections` list mixing several section types, **When** it is validated, **Then** each
   item is validated against the schema for its specific section type.
3. **Given** a section item with an unknown or unregistered type, **When** it is processed, **Then**
   it is rejected by validation rather than rendered as an undefined section.
4. **Given** a `sections` list, **When** it is rendered, **Then** sections appear in list order.

---

### User Story 3 - One schema shared across onboarding, templates, and renderer (Priority: P1)

The same `WebsiteConfig` schema is the single contract at every boundary: onboarding output is valid
`WebsiteConfig`, templates are expressed and merged as `WebsiteConfig`, and the renderer accepts only
`WebsiteConfig`. No layer transforms the site into a private shape; the schema is the lingua franca.

**Why this priority**: The schema's value is realized only when all three layers speak it. A shared
contract is what removes glue code and manual translation between stages — the foundation of the
sub-2-hour, code-free assembly goal.

**Independent Test**: Confirm the schema is positioned as the contract consumed/produced by
onboarding, templates, and the renderer, and that each boundary requires valid `WebsiteConfig`
without a layer-specific alternative shape.

**Acceptance Scenarios**:

1. **Given** onboarding intake, **When** it completes, **Then** its output conforms to the
   `WebsiteConfig` schema.
2. **Given** a niche template, **When** it is defined, **Then** it is expressed as (or produces) a
   `WebsiteConfig` and reuses the same `Section` union.
3. **Given** the renderer, **When** it receives input, **Then** it accepts only valid `WebsiteConfig`
   and needs no shape conversion to render.

---

### User Story 4 - Business identity captured in `company` (Priority: P2)

The `company` portion of `WebsiteConfig` carries the client's business identity — the cross-cutting
information (name, contact, social/legal essentials) that many sections reuse — held once at the site
level rather than duplicated into each section.

**Why this priority**: Centralizing business identity prevents the same client details being copied
across sections and keeps onboarding-to-render single-sourced. Important, but builds on the core
`WebsiteConfig` structure.

**Independent Test**: Confirm `company` is a defined typed shape at the site level holding business
identity, and that it is the single source for that information rather than being repeated per
section.

**Acceptance Scenarios**:

1. **Given** the schema, **When** an author inspects `company`, **Then** it declares a typed shape for
   the client's business identity.
2. **Given** a site, **When** business identity is needed, **Then** it is read from `company` once
   rather than duplicated inside individual sections.

---

### User Story 5 - Visual identity captured in `theme` (Priority: P2)

The `theme` portion of `WebsiteConfig` carries the site's visual identity as structured tokens
(e.g. colors, typography, mode) applied consistently across all sections, so appearance is changed
through configuration rather than per-section styling.

**Why this priority**: A single `theme` makes blocks theme-aware (Constitution V, X) and lets a whole
site be re-skinned via data. Important for consistency and reuse, layered on the core structure.

**Independent Test**: Confirm `theme` is a defined typed shape of visual tokens at the site level,
applied across sections, and changeable as configuration without editing sections.

**Acceptance Scenarios**:

1. **Given** the schema, **When** an author inspects `theme`, **Then** it declares typed visual
   identity tokens for the whole site.
2. **Given** a site, **When** the theme value changes, **Then** the visual identity applies across all
   sections without per-section source edits.

---

### User Story 6 - Whole-site validation before render (Priority: P2)

A `WebsiteConfig` is validated as a whole before render: `company`, `theme`, and every item in
`sections` (each against its section type's schema) must be valid, with defined behavior on failure,
so a malformed site is caught before it produces broken output.

**Why this priority**: End-to-end JSON-driven rendering is only safe if the whole structure is
validatable as one unit, extending the per-block validation of Phase 2 to the full site. Builds on
the structure and union above.

**Independent Test**: Confirm the schema requires whole-`WebsiteConfig` validation before render
(including each section against its type schema) with a defined failure behavior.

**Acceptance Scenarios**:

1. **Given** a `WebsiteConfig`, **When** it is processed, **Then** `company`, `theme`, and every
   section item are validated before render.
2. **Given** a `WebsiteConfig` with an invalid section item, **When** it is validated, **Then**
   validation flags the specific failing item with a defined behavior (rejection or safe fallback),
   never silent broken output.
3. **Given** a missing or partial portion of `WebsiteConfig`, **When** it is processed, **Then** the
   defined fallback/default behavior applies and the render does not crash.

---

### User Story 7 - Extensible without breaking existing sites (Priority: P3)

A new section type can be added to the `Section` union, and the schema can be evolved, without
invalidating existing `WebsiteConfig` data or requiring changes to unrelated sections — additions are
deliberate, registered in one place, and backward-compatible.

**Why this priority**: The catalog of section types grows over the platform's life; growth must not
break the hundreds of existing client sites. Valuable for longevity but secondary to defining the
schema itself.

**Independent Test**: Confirm the schema defines a single, deliberate procedure for registering a new
section type into the union, and that adding one leaves existing valid `WebsiteConfig` data still
valid.

**Acceptance Scenarios**:

1. **Given** a new section type, **When** it is added to the union via the defined procedure, **Then**
   it becomes a valid `Section` member without editing unrelated sections.
2. **Given** existing valid `WebsiteConfig` data, **When** a new section type is added, **Then** the
   existing data remains valid (backward compatible).
3. **Given** the schema, **When** an author wants a new section type, **Then** there is one
   authoritative place to register it, not per-template forks.

---

### Edge Cases

- What happens when `sections` is empty? The schema must define whether an empty page is valid and how
  it is handled, never an undefined state.
- What happens when a section item's discriminator is missing or names an unknown type? Validation
  must reject it predictably (it cannot map to a known block schema).
- What happens when a section item's config slice is invalid for its declared type? It must fail
  per-section validation (US6) without invalidating sibling sections that are valid, per the defined
  failure behavior.
- What happens when `company` or `theme` is missing or partial? The schema must define required vs.
  defaulted fields and a safe fallback, never a render crash.
- What happens when the same section type appears multiple times in `sections` (e.g. two CTA
  sections)? The schema must allow repetition; each instance is an independent item with its own
  config slice.
- How is render order determined? It must be the order of the `sections` list, with no hidden
  reordering.
- What happens when a `WebsiteConfig` references a section type not yet registered in the union? It
  must be rejected by validation, surfacing the unsupported type rather than silently dropping it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The platform MUST define a single canonical `WebsiteConfig` structure that represents an
  entire website as data, recorded as the single source of truth for site representation.
- **FR-002**: `WebsiteConfig` MUST be composed of a `company` portion (business identity), a `theme`
  portion (visual identity), and an ordered `sections` list.
- **FR-003**: The platform MUST NOT permit any alternative whole-site representation; all layers MUST
  use `WebsiteConfig`.
- **FR-004**: The `sections` list MUST hold items of a `Section` type that is a closed discriminated
  union of named section types (e.g. Hero, Services, Testimonials).
- **FR-005**: Each `Section` union member MUST be identified by a discriminator (its type) and MUST
  carry the typed config slice expected by that block under the Phase 2 universal block contract.
- **FR-006**: The order of items in `sections` MUST define the render order of the page, with no
  hidden reordering.
- **FR-007**: The schema MUST allow the same section type to appear multiple times in `sections`, each
  instance being an independent item with its own config slice.
- **FR-008**: The `company` portion MUST be a strongly typed shape holding the client's business
  identity, serving as the single source for that information rather than duplicating it per section.
- **FR-009**: The `theme` portion MUST be a strongly typed shape of visual identity tokens applied
  across all sections, changeable as configuration without per-section source edits.
- **FR-010**: `WebsiteConfig`, `company`, `theme`, and `Section` MUST all be strongly typed and
  schema-backed, consistent with the Phase 2 schema-first rule (Constitution IV, VIII).
- **FR-011**: A `WebsiteConfig` MUST be validated as a whole before render — `company`, `theme`, and
  every `sections` item against its specific section type's schema.
- **FR-012**: Validation MUST have a defined behavior on failure (rejection or safe fallback) for the
  whole config and for individual section items, never silent broken output.
- **FR-013**: The schema MUST define handling for missing or partial `WebsiteConfig` portions (safe
  defaults / graceful degradation) such that the render never crashes.
- **FR-014**: A section item whose discriminator is missing or names an unknown/unregistered type MUST
  be rejected by validation, never rendered as an undefined section.
- **FR-015**: An invalid section item MUST fail per-section validation per FR-012 without invalidating
  sibling section items that are valid.
- **FR-016**: The schema MUST define whether an empty `sections` list is valid and how it is handled,
  with no undefined state.
- **FR-017**: The schema MUST be the contract produced by onboarding, consumed by templates, and
  accepted by the renderer, with no layer-specific alternative shape (US3).
- **FR-018**: The schema MUST define a single, deliberate procedure for registering a new section
  type into the `Section` union (one authoritative place, not per-template forks).
- **FR-019**: Adding a new section type or evolving the schema MUST be backward-compatible: existing
  valid `WebsiteConfig` data MUST remain valid.
- **FR-020**: `WebsiteConfig` and its parts MUST be self-documenting (shape of `company`, `theme`, and
  each section type discoverable) so a site can be authored without reading source.
- **FR-021**: The central schema MUST reside in the neutral `core/` layer and contain no
  client-specific or niche-specific hardcoded content (Constitution III).

### Key Entities *(include if feature involves data)*

- **WebsiteConfig**: The single canonical structure representing an entire website as data; composed
  of `company`, `theme`, and an ordered `sections` list. Single source of truth for site
  representation and the contract shared across onboarding, templates, and renderer.
- **CompanyConfig**: The typed `company` portion holding the client's business identity (name,
  contact, and essential identifiers); the single site-level source for that information.
- **ThemeConfig**: The typed `theme` portion holding the site's visual identity tokens (colors,
  typography, mode), applied uniformly across sections.
- **Section**: A closed discriminated union of named section types; each member is identified by a
  discriminator and carries the Phase 2 block config slice for that block.
- **Section Item**: One element of the `sections` list — a concrete instance of a `Section` member,
  with its discriminator and its typed config slice; its list position is its render order.
- **Section Type Registry**: The single authoritative place where section types are registered into
  the `Section` union, governing extension (FR-018) and backward compatibility (FR-019).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of sites are representable as a single `WebsiteConfig` object (`company` + `theme` +
  ordered `sections`); zero sites require information held outside it.
- **SC-002**: 100% of section items in any `sections` list resolve to a member of the closed `Section`
  union and validate against that member's schema; zero items use an unregistered type.
- **SC-003**: Onboarding output, template definitions, and renderer input all use the identical
  `WebsiteConfig` schema with zero layer-specific site shapes or conversion glue.
- **SC-004**: A complete site can be created and changed by editing `WebsiteConfig` data alone, with
  zero source-code changes (verified on a sample multi-section site).
- **SC-005**: 100% of invalid or partial `WebsiteConfig` inputs result in a defined behavior
  (rejection or safe fallback); zero cause a render crash.
- **SC-006**: An invalid section item is flagged specifically without invalidating valid sibling items
  in 100% of cases.
- **SC-007**: A new section type can be added to the union via the defined procedure, and 100% of
  pre-existing valid `WebsiteConfig` data remains valid afterward (backward compatibility).
- **SC-008**: Section render order matches `sections` list order in 100% of cases.
- **SC-009**: A site author can author a valid `WebsiteConfig` using only the schema's
  self-documentation, without reading platform source.

## Assumptions

- The schema is expressed with the same schema-first tooling adopted in Phase 2 (Zod schema as source
  of truth, TS types inferred from it), living in `sites/core/schemas/`; exact file names are
  finalized at planning time but the single-`WebsiteConfig` rule is fixed.
- `Section` is implemented as a discriminated union keyed by a section `type` discriminator, with each
  member reusing a Phase 2 block schema for its config slice; the discriminator key name is finalized
  at planning time.
- Each section item's config slice IS the Phase 2 "block config slice" (including its `variant`/slot
  conventions); Phase 3 does not redefine block internals, only how sections are composed into a site.
- `CompanyConfig` and `ThemeConfig` define the minimum cross-cutting business and visual identity
  needed by baseline sections; concrete field lists are refined at planning/data-model time.
- This phase delivers the schema, its validation rules, and its extension procedure only; building
  concrete sections, onboarding intake, niche templates, and the renderer is deferred to later phases.
- Whole-site validation reuses the per-block validation pipeline from Constitution IV / Phase 2,
  extended to validate the `sections` list and the `company`/`theme` portions.
- Responsive, accessible, and theme-aware baselines are inherited from the constitution and Phase 2
  contract rather than redefined here.
