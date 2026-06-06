# Feature Specification: Dynamic Renderer (Phase 4)

**Feature Branch**: `004-dynamic-renderer`

**Created**: 2026-06-05

**Status**: Completed

**Input**: User description: "FASE 4 — Criar o Renderer Dinâmico. Essa provavelmente é a peça mais importante da arquitetura. Precisamos de algo tipo `<DynamicSection v-for=\"section in sections\" :key=\"section.id\" :section=\"section\" />`. E internamente: `const map = { hero: HeroSection, services: ServicesSection }`. Agora o site inteiro vira `{ \"sections\": [ { \"type\": \"hero\" }, { \"type\": \"services\" } ] }`. Isso é o coração da escalabilidade."

## Overview

This phase defines the **dynamic renderer**: the engine piece that turns a validated `WebsiteConfig`
(Phase 3) into a live page by walking its ordered `sections` list and rendering each section item with
the component that belongs to its `type`. A whole site is rendered by data — never by hand-writing a
page per client.

Two cooperating pieces make this work:

- A **section-to-component registry** (a `type` → component map) that says which component renders each
  registered section `type`. This map runs in lockstep with the Phase 3 section *schema* registry: a
  section `type` that can be validated must also resolve to a component to render.
- A **dynamic section renderer** — one component that receives a single section item, looks up the
  component for its `type`, and renders it with that item's config slice. Rendering the whole page is
  iterating the renderer over `sections` in list order.

This is the runtime counterpart of Phase 3's structural contract. Phase 3 fixed *what a site is as
data*; Phase 4 fixes *how that data becomes a rendered page*, completing the JSON-driven, headless
mini-CMS loop: onboarding produces a `WebsiteConfig`, templates arrange it, and the renderer renders
it with zero per-client source code.

This phase delivers the renderer mechanism and its component registry only. It does **not** build the
concrete section components (Hero, Services, etc.), onboarding intake, or niche templates — those
populate the registry in later phases. The deliverable is correct, neutral, extensible rendering of
whatever sections are registered, including the defined behavior when nothing is registered yet.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A whole page renders from its `sections` list (Priority: P1)

A site author or pipeline hands the renderer a validated `WebsiteConfig`, and the renderer produces
the page by rendering each item in `sections`, in list order, with the component bound to that item's
`type`. No page is authored by hand; the page *is* the data rendered.

**Why this priority**: This is the core mechanism of the platform — the moment data becomes a site.
Every later capability (concrete sections, templates, onboarding-to-live) depends on the renderer
existing. It is the irreducible MVP of Phase 4.

**Independent Test**: Given a `WebsiteConfig` with a `sections` list of registered types, confirm the
renderer outputs one rendered section per item, in the same order as the list, each using its
type's component.

**Acceptance Scenarios**:

1. **Given** a validated `WebsiteConfig` with a non-empty `sections` list, **When** it is rendered,
   **Then** one section is rendered per list item, each by the component mapped to that item's `type`.
2. **Given** the same `sections` list, **When** it is rendered, **Then** rendered sections appear in
   the exact order of the list, with no reordering.
3. **Given** a `sections` list containing the same `type` more than once, **When** it is rendered,
   **Then** each occurrence renders independently with its own config slice.

---

### User Story 2 - Each section item renders via a single dynamic renderer (Priority: P1)

The page is built by applying one **dynamic section renderer** to each section item. That renderer
receives a single section item, resolves the component for its `type` from the registry, and renders
it — the caller never hand-maps types to components or writes per-type conditionals.

**Why this priority**: A single dynamic renderer is what keeps the page-building code constant-size as
the catalog of section types grows from 2 to 200. Without it, every new section type forces edits to
page-rendering logic — the anti-pattern this phase exists to eliminate. Equal P1 with Story 1.

**Independent Test**: Confirm there is one renderer that, given any single section item of a registered
type, renders the correct component bound to that `type` — and that adding a new type requires no
change to the renderer itself.

**Acceptance Scenarios**:

1. **Given** a single section item of a registered `type`, **When** the dynamic renderer receives it,
   **Then** it renders the component mapped to that `type`.
2. **Given** the dynamic renderer, **When** a new section type is later registered, **Then** the
   renderer renders it with no change to the renderer's own logic.
3. **Given** the page-building code, **When** it renders many section types, **Then** it contains no
   per-type branching — type-to-component resolution lives in the registry, not in the caller.

---

### User Story 3 - Section type resolves to a component via one registry (Priority: P1)

There is one authoritative **type → component registry** that maps each registered section `type` to
the component that renders it. This map is the runtime sibling of the Phase 3 section schema registry:
a section type is fully supported only when it is both validatable (schema) and renderable (component).

**Why this priority**: A single source for type-to-component mapping is the renderer's foundation — it
is how scalability is achieved (add an entry, gain a renderable section) without touching the renderer
or callers. Equal P1: the renderer (US2) is meaningless without the map it reads.

**Independent Test**: Confirm one registry maps section types to components, that registering a type
makes it renderable, and that there is exactly one place this mapping is declared (no per-template
forks).

**Acceptance Scenarios**:

1. **Given** the component registry, **When** a section `type` is looked up, **Then** it resolves to a
   single component responsible for rendering that type.
2. **Given** a new section type, **When** its component is registered in the one authoritative place,
   **Then** the renderer can render that type without further changes.
3. **Given** the platform, **When** a contributor adds a section type, **Then** there is exactly one
   registry to update for rendering (mirroring the Phase 3 schema registry), not per-template copies.

---

### User Story 4 - Each section receives only its own config slice (Priority: P2)

When the renderer renders a section item, it passes that item's typed config slice (its Phase 2 block
config, minus the `type` discriminator role) to the section's component as its props — so each section
component is content-driven by data and never reaches outside its own slice.

**Why this priority**: Passing each section exactly its slice is what keeps section components generic,
reusable, and decoupled (Constitution III, V). It builds on the core render loop but is essential for
the components to be data-driven blocks rather than bespoke code.

**Independent Test**: Confirm the renderer hands each section component the config slice from its own
section item (and nothing from sibling items), so the component renders purely from that input.

**Acceptance Scenarios**:

1. **Given** a section item with a config slice, **When** its component is rendered, **Then** it
   receives that item's slice as its input and renders from it.
2. **Given** two sibling section items, **When** each is rendered, **Then** neither component receives
   the other's config slice.
3. **Given** a section component, **When** it renders, **Then** all content it shows derives from the
   passed config slice (content-driven, no hardcoded client content).

---

### User Story 5 - Unknown or unrenderable section types degrade safely (Priority: P2)

If a section item's `type` has no component in the registry (e.g. a type that is validatable but not
yet renderable, or an unexpected value), the renderer applies a defined, safe behavior — it does not
crash the page and does not emit broken or undefined output for that item.

**Why this priority**: With one engine rendering many client sites, an unhandled type must never take
down a page. Defined degradation is what makes the renderer safe to run on real client data. Builds on
the core loop with the resilience the platform requires (Constitution XI, XIV).

**Independent Test**: Give the renderer a section item whose `type` is not in the component registry and
confirm the defined behavior (skip / placeholder / surfaced warning) occurs, the page still renders,
and no crash or undefined output results.

**Acceptance Scenarios**:

1. **Given** a section item whose `type` has no registered component, **When** the page is rendered,
   **Then** the defined fallback behavior applies and the page does not crash.
2. **Given** that same unrenderable item, **When** it is handled, **Then** the remaining valid section
   items still render normally.
3. **Given** an unrenderable item, **When** the fallback applies, **Then** no broken or undefined
   markup is emitted for that item, and the condition is surfaced (not silently dropped) per the
   defined behavior.

---

### User Story 6 - The renderer renders only validated configuration (Priority: P2)

The renderer operates on a `WebsiteConfig` that has passed Phase 3 whole-site validation
(`company`, `theme`, every section item). The renderer relies on that validation contract rather than
re-deriving its own, so it never renders unvalidated or malformed data.

**Why this priority**: Coupling rendering to the Phase 3 validation contract is what guarantees the
JSON-driven pipeline is safe end to end (Constitution IV). It builds directly on Phase 3 and on the
fallback behavior of US5.

**Independent Test**: Confirm the renderer's input contract is a validated `WebsiteConfig`, and that
the path from raw config to render runs validation first, with the defined behavior on validation
failure.

**Acceptance Scenarios**:

1. **Given** a raw config, **When** it is rendered, **Then** it is validated as a `WebsiteConfig`
   (Phase 3 contract) before any section is rendered.
2. **Given** a config that fails whole-site validation, **When** rendering is attempted, **Then** the
   defined failure behavior applies (per Phase 3) and no broken page is produced.
3. **Given** a validated `WebsiteConfig`, **When** it is rendered, **Then** the renderer trusts the
   validated shape and does not duplicate or contradict the Phase 3 validation rules.

---

### User Story 7 - The theme applies across all rendered sections (Priority: P3)

The renderer makes the site-level `theme` from `WebsiteConfig` available to every rendered section, so
all sections share one visual identity applied through configuration rather than per-section styling.

**Why this priority**: A single applied theme is what makes a whole site re-skinnable via data and
keeps sections theme-aware (Constitution V, X). Valuable for consistency but layered on top of the
core render mechanism.

**Independent Test**: Confirm the renderer exposes the `WebsiteConfig.theme` to rendered sections so a
theme change is reflected across all sections without editing section components.

**Acceptance Scenarios**:

1. **Given** a `WebsiteConfig` with a `theme`, **When** the page renders, **Then** the theme is
   available to every rendered section as one shared visual identity.
2. **Given** a changed `theme` value, **When** the page re-renders, **Then** the new visual identity
   applies across all sections with no per-section source edits.

---

### Edge Cases

- What happens when `sections` is empty? The renderer must produce a valid empty page (no sections),
  consistent with Phase 3 allowing `sections: []` — never an error or undefined state.
- What happens when a section item's `type` is registered for schema but has no component? US5
  fallback applies; the page still renders.
- What happens when the component registry is entirely empty (the Phase 4 baseline, before any concrete
  section ships)? The renderer must still operate: a `WebsiteConfig` with `sections: []` renders an
  empty page, and any non-empty `sections` would already have failed Phase 3 validation (empty schema
  registry rejects all section items), so the renderer is never asked to render an unmapped type in the
  baseline state.
- What happens when the same `type` appears multiple times? Each item renders independently with its
  own slice (no shared/cached state across instances).
- How is render order determined? Strictly the order of the `sections` list, with no hidden
  reordering, matching Phase 3 FR-006.
- What happens if a section component itself errors during render? The defined isolation behavior must
  prevent one section's failure from collapsing the whole page (consistent with US5 resilience).
- What identifies each rendered section for stable updates? Each section item needs a stable identity
  for keying during render; the schema/render contract must define how that identity is derived.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The platform MUST provide a dynamic renderer that renders a validated `WebsiteConfig` by
  rendering each item of its `sections` list with the component bound to that item's `type`.
- **FR-002**: The renderer MUST render section items in the exact order of the `sections` list, with no
  reordering (consistent with Phase 3 FR-006).
- **FR-003**: The platform MUST provide a single authoritative registry mapping each section `type` to
  the one component that renders it (the type → component map).
- **FR-004**: Registering a section type's component MUST happen in exactly one place (mirroring the
  Phase 3 section schema registry), not per-template or per-client forks.
- **FR-005**: The platform MUST provide a single dynamic section renderer that, given one section item,
  resolves its component from the registry and renders it — callers MUST NOT hand-map types or branch
  per type.
- **FR-006**: Rendering an entire page MUST be expressible as iterating the dynamic section renderer
  over the `sections` list (e.g. one renderer per item, keyed by a stable identity).
- **FR-007**: Adding a new renderable section type MUST require only registering its schema (Phase 3)
  and its component (FR-003), with no change to the dynamic renderer or to page-building callers.
- **FR-008**: The renderer MUST pass each section component only that section item's own config slice
  as its input; a component MUST NOT receive sibling items' data.
- **FR-009**: Section components MUST be content-driven from the passed config slice, with no
  client-specific or niche-specific hardcoded content (Constitution III, V).
- **FR-010**: The renderer MUST define and apply a safe fallback when a section item's `type` has no
  registered component (skip, placeholder, or surfaced warning) — never a crash and never broken or
  undefined output.
- **FR-011**: A single unrenderable or erroring section item MUST NOT prevent the remaining valid
  section items from rendering (per-section isolation).
- **FR-012**: The renderer's input contract MUST be a `WebsiteConfig` validated by the Phase 3
  whole-site validation; the render path MUST validate before rendering and MUST NOT re-derive or
  contradict the Phase 3 validation rules.
- **FR-013**: On whole-site validation failure, the renderer MUST apply the Phase 3 defined failure
  behavior and MUST NOT produce a broken page.
- **FR-014**: The renderer MUST handle an empty `sections` list by rendering a valid empty page, with
  no error or undefined state (consistent with Phase 3 FR-016).
- **FR-015**: The renderer MUST make the site-level `theme` from `WebsiteConfig` available to every
  rendered section so one visual identity applies across all sections without per-section source edits.
- **FR-016**: Each rendered section MUST have a stable identity for keying so re-renders update
  correctly; the contract MUST define how that identity is derived from the section item.
- **FR-017**: The renderer and its component registry MUST reside in the neutral `core/` layer and
  contain no client-specific or niche-specific content (Constitution III).
- **FR-018**: The renderer MUST behave correctly when the component registry is empty (Phase 4
  baseline): an empty `sections` list renders an empty page, and no concrete section component is
  required for the mechanism to be complete.
- **FR-019**: The same dynamic renderer MUST be reusable across all templates and clients without
  modification (one renderer, many sites), consistent with the single-engine model.
- **FR-020**: The renderer MUST be JSON-driven: producing or changing a page MUST require only changing
  `WebsiteConfig` data, never editing the renderer or section-mapping source (Constitution IV).

### Key Entities *(include if feature involves data)*

- **Dynamic Section Renderer**: The single component/mechanism that receives one section item, resolves
  its component from the registry by `type`, passes the item's config slice, and renders it. The unit
  iterated over `sections` to render a whole page.
- **Component Registry**: The one authoritative `type` → component map declaring which component
  renders each registered section type; the runtime sibling of the Phase 3 section schema registry.
- **Rendered Section**: One section item from `sections` realized as output by its mapped component,
  driven solely by that item's config slice, occupying its list position in render order.
- **Render Input (validated `WebsiteConfig`)**: The renderer's input — a `WebsiteConfig` that has
  passed Phase 3 whole-site validation (`company`, `theme`, all section items), carrying the `theme`
  shared across sections and the ordered `sections` to render.
- **Fallback Behavior**: The defined, safe handling for a section item whose `type` has no registered
  component (or whose render errors), keeping the page rendering and surfacing the condition rather
  than crashing or emitting broken output.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of items in a validated `WebsiteConfig.sections` list render via their mapped
  component, in list order, with zero reordering.
- **SC-002**: A new section type becomes renderable by registering only its schema (Phase 3) and its
  component (one registry entry), with zero changes to the dynamic renderer or page-building callers.
- **SC-003**: Page-building code contains zero per-type conditionals; 100% of type-to-component
  resolution happens through the registry.
- **SC-004**: 100% of section components receive only their own section item's config slice; zero
  components receive sibling data.
- **SC-005**: 100% of section items whose `type` has no registered component result in the defined safe
  fallback; zero cause a page crash or broken/undefined output.
- **SC-006**: A single unrenderable or erroring section never prevents sibling sections from rendering
  in 100% of cases (per-section isolation verified).
- **SC-007**: 100% of rendered configs pass Phase 3 whole-site validation before render; zero
  unvalidated configs reach the render path.
- **SC-008**: An empty `sections` list renders a valid empty page in 100% of cases, with zero errors.
- **SC-009**: A theme change applied at `WebsiteConfig.theme` is reflected across all rendered sections
  with zero per-section source edits.
- **SC-010**: The identical dynamic renderer renders two different sites (different `sections`) with
  zero renderer source changes between them (single-engine reuse verified).
- **SC-011**: A complete page is produced and changed by editing `WebsiteConfig` data alone, with zero
  source-code changes (verified on a sample multi-section site once concrete sections exist).

## Assumptions

- The renderer consumes the Phase 3 `WebsiteConfig` schema and its whole-site validation unchanged;
  Phase 4 adds the runtime renderer and component registry, not new structural schema. It lives in the
  neutral `core/` layer (e.g. `sites/core/components/` and/or `sites/core/composables/`); exact file
  names are finalized at planning time.
- The component registry is keyed by the same section `type` discriminator used by the Phase 3 section
  schema registry, keeping schema-registration and component-registration in lockstep per type.
- Section components receive the section item's Phase 2 block config slice as props; Phase 4 does not
  redefine block/section internals, only how items are dispatched to components and rendered.
- Phase 4 ships the renderer mechanism and an (initially empty) component registry; concrete section
  components (Hero, Services, …), onboarding intake, and niche templates are delivered in later phases
  and only add registry entries.
- Rendering uses the project's Nuxt 4 / Vue 3 dynamic-component capability with SSR/SSG-first behavior
  (Constitution IX); the precise rendering primitive is finalized at planning time.
- The stable per-section render identity is derived from the section item (e.g. an `id` field and/or
  list index convention); the exact derivation is finalized at planning/data-model time.
- "Theme available to every section" reuses the Phase 3 `ThemeConfig` and the existing theme system
  (Constitution V/X); Phase 4 wires it through the renderer rather than defining a new theme model.
- Responsive, accessible, performance, and theme-aware baselines are inherited from the constitution
  and earlier phases rather than redefined here.
</content>
