# Feature Specification: Core Structure (Phase 1)

**Feature Branch**: `001-core-structure`

**Created**: 2026-06-05

**Status**: Draft

**Input**: User description: "FASE 1 — Estrutura do Core. Primeiro organize o projeto. Estrutura recomendada: sites/ com core/ (components/{sections,ui,layout}, composables, theme, seo, forms, types, utils, schemas), templates/, clients/, onboarding/, assets/, scripts/"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Establish the layered project skeleton (Priority: P1)

A platform builder opens the repository and finds a single, canonical directory layout that
separates the reusable engine from niche templates, client data, intake data, shared assets,
and automation. Every top-level concern has one obvious home, so the next phase (building the
engine and templates) can start without further reorganization.

**Why this priority**: Nothing else in the platform can be built consistently until the
foundational layout exists. Every later feature (components, templates, client onboarding)
depends on knowing where its files belong. This is the irreducible MVP of Phase 1.

**Independent Test**: Clone the repository and confirm the `sites/` tree exists with all
mandated layers (`core/`, `templates/`, `clients/`, `onboarding/`, `assets/`, `scripts/`) and
core sub-areas (`components/{sections,ui,layout}`, `composables`, `theme`, `seo`, `forms`,
`types`, `utils`, `schemas`). A new contributor can place a hypothetical file in the correct
folder using only the structure and its documentation.

**Acceptance Scenarios**:

1. **Given** a freshly cloned repository, **When** a contributor inspects the project root,
   **Then** the `sites/` directory exists containing the six mandated layers.
2. **Given** the `core/` layer, **When** a contributor inspects it, **Then** it contains the
   `components/` (with `sections/`, `ui/`, `layout/` subfolders), `composables/`, `theme/`,
   `seo/`, `forms/`, `types/`, `utils/`, and `schemas/` areas.
3. **Given** a contributor with a new reusable section to add, **When** they consult the
   structure, **Then** there is exactly one unambiguous location for it (`core/components/sections/`).

---

### User Story 2 - Each layer self-documents its responsibility (Priority: P2)

A contributor entering any folder can read a short, authoritative description of what belongs
there and what must not, so the boundaries between engine, templates, and client data stay
intact over time.

**Why this priority**: The structure only delivers lasting value if its boundaries are
understood and respected. Documentation at each layer prevents the slow erosion (client logic
leaking into core, custom layouts replacing templates) that the layering exists to prevent.

**Independent Test**: Open any mandated folder and confirm it carries a description of its
single responsibility, its allowed contents, and its prohibited contents.

**Acceptance Scenarios**:

1. **Given** any top-level layer, **When** a contributor opens it, **Then** a readable
   description states the layer's single responsibility and dependency direction.
2. **Given** the `core/` layer documentation, **When** a contributor reads it, **Then** it
   states that core must remain business-neutral and free of client-specific content.

---

### User Story 3 - Empty layers are preserved in version control (Priority: P3)

A contributor pulling the repository receives the full structure even where folders hold no
files yet, so the layout is stable and identical for every team member from day one.

**Why this priority**: Without preservation, empty mandated folders disappear from version
control and the canonical structure silently fragments across machines. Lower priority because
it is a safeguard on top of Stories 1–2 rather than new capability.

**Independent Test**: Clone the repository on a clean machine and confirm every mandated folder
is present even when it contains no functional files yet.

**Acceptance Scenarios**:

1. **Given** a mandated folder with no functional files, **When** the repository is cloned,
   **Then** the folder is still present in the working tree.

---

### Edge Cases

- What happens when existing files (e.g. the current `app/` entry point) do not fit the new
  layout? The structure must define whether they are migrated, coexist, or are explicitly
  out of scope for Phase 1.
- How does the system prevent a contributor from placing client-specific content inside the
  neutral `core/` layer? Boundaries must be documented and detectable in review.
- What happens when two folders could plausibly hold the same file (e.g. a utility vs. a
  composable)? The structure documentation must disambiguate overlapping areas.
- How does the layout behave if a layer is later renamed or removed? The canonical structure
  is the single source of truth and changes to it must be deliberate.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST contain a top-level `sites/` directory that holds all
  platform layers.
- **FR-002**: The `sites/` directory MUST contain six layers: `core/`, `templates/`,
  `clients/`, `onboarding/`, `assets/`, and `scripts/`.
- **FR-003**: The `core/` layer MUST contain the areas `components/`, `composables/`,
  `theme/`, `seo/`, `forms/`, `types/`, `utils/`, and `schemas/`.
- **FR-004**: The `core/components/` area MUST contain the sub-areas `sections/`, `ui/`,
  and `layout/`.
- **FR-005**: Each mandated folder MUST carry documentation stating its single responsibility,
  its allowed contents, and its prohibited contents.
- **FR-006**: The `core/` layer documentation MUST declare that core is business-neutral and
  MUST NOT contain client-specific or template-specific content.
- **FR-007**: Higher layers (`templates/`, `clients/`) MUST be documented as depending on
  `core/`, and `core/` MUST be documented as never depending on higher layers.
- **FR-008**: Every mandated folder MUST be preserved in version control even when it contains
  no functional files.
- **FR-009**: The structure MUST define the disposition of pre-existing files that do not fit
  the new layout (migrate, coexist, or out of scope), with no orphaned or duplicated concerns.
- **FR-010**: There MUST be exactly one canonical location for each category of file, with no
  ambiguous or overlapping destinations for the same kind of content.
- **FR-011**: The canonical structure MUST be recorded as the single source of truth that
  later phases reference when placing new files.

### Key Entities *(include if feature involves data)*

- **Layer**: A top-level area under `sites/` with a single responsibility (`core`,
  `templates`, `clients`, `onboarding`, `assets`, `scripts`) and a defined dependency direction.
- **Core Area**: A sub-area of `core/` grouping one kind of reusable building block
  (`components`, `composables`, `theme`, `seo`, `forms`, `types`, `utils`, `schemas`).
- **Component Group**: A sub-area of `core/components/` classifying components by role
  (`sections`, `ui`, `layout`).
- **Layer Documentation**: The per-folder description of responsibility, allowed contents,
  prohibited contents, and dependency direction.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new contributor can correctly identify the destination folder for any of ten
  sample file types (a hero section, a button, a header, a composable, a theme token, an SEO
  helper, a form, a type, a utility, a schema) on the first attempt without assistance.
- **SC-002**: 100% of the mandated layers and sub-areas (six layers, eight core areas, three
  component groups) are present in a clean clone.
- **SC-003**: Every mandated folder carries documentation of its responsibility and boundaries
  (100% coverage).
- **SC-004**: Zero files in the repository are placed outside the canonical structure after
  Phase 1 completes.
- **SC-005**: A contributor can locate the home for a given concern in under 30 seconds using
  only the structure and its documentation.

## Assumptions

- The canonical layout follows Constitution Principle II (Layered System Design) and extends
  it with the additional `core/` sub-areas (`types`, `utils`, `schemas`) and a top-level
  `scripts/` layer for automation, as requested in the feature input.
- Phase 1 scope is the structure and its documentation only; populating layers with functional
  components, templates, or client data is deferred to later phases.
- The existing minimal Nuxt entry point (`app/app.vue`) and tooling configuration remain
  functional; reconciling them with `sites/` is addressed by FR-009 and may be deferred if it
  does not block later phases.
- Empty-folder preservation uses the project's standard version-control convention for keeping
  empty directories.
- Folder documentation lives alongside each folder so it travels with the structure.
- This phase introduces no runtime behavior, user-facing features, or data processing; success
  is measured by structural completeness and contributor navigability.
