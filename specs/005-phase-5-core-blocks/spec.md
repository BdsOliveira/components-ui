# Feature Specification: Core Block Set (Phase 5)

**Feature Branch**: `005-phase-5-core-blocks`

**Created**: 2026-06-05

**Status**: Draft

**Input**: User description: "FASE 5 — Criar SOMENTE 5–8 blocos. Não tente criar tudo. Começaremos com: Hero, About, Services, CTA, Testimonials, FAQ, Contact, Footer. Com isso, conseguimos montar site para atender: clínica, advogado, restaurante, escola, negócio local. 80% do mercado."

## Overview

This phase delivers the **first concrete, reusable blocks** of the platform — the smallest set that
can assemble a complete, presentable single-page website for the most common small-business
verticals. Up to now the platform has a block contract (Phase 2), a whole-site config schema
(Phase 3), and a renderer that turns config into a page (Phase 4) — but the section registry is
empty, so no real page can be built yet.

Phase 5 fills that gap with exactly eight blocks: **Hero, About, Services, CTA, Testimonials, FAQ,
Contact, Footer**. The set is deliberately bounded. These eight cover the recurring page structure
of clinics, lawyers, restaurants, schools, and local businesses — an estimated ~80% of the target
market — without attempting an exhaustive component library. Every block conforms to the existing
universal contract (one structured data input, closed variants with one default, optional slots,
self-contained), so each becomes selectable in site configuration and renderable by the existing
dynamic renderer with no new wiring per block beyond registration.

The deliverable is the eight blocks themselves plus their registration, so that a complete sample
site for each target vertical can be assembled from configuration alone.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Assemble a complete vertical site from configuration (Priority: P1)

A site builder selects from the eight available block types, orders them, and supplies each block's
content as configuration, producing a full single-page website for a real small business (e.g., a
clinic) without writing or editing component code. The renderer turns that configuration into the
finished page.

**Why this priority**: This is the headline value of the whole platform and the reason Phase 5
exists — turning the empty registry into a usable kit. If only this works, the platform can already
deliver real sites for the target verticals.

**Independent Test**: Provide a single sample configuration listing several of the eight block types
in order with content for each; confirm a complete, coherent page is produced from configuration
alone, with every listed block rendered in the given order.

**Acceptance Scenarios**:

1. **Given** a site configuration listing Hero, Services, Testimonials, and Contact in that order
   with content, **When** the site is rendered, **Then** all four blocks appear in that exact order
   as one coherent page.
2. **Given** any of the eight block types named in a configuration, **When** the configuration is
   validated, **Then** the type is recognized as an available, selectable block.
3. **Given** a block type not among the eight, **When** the configuration is validated, **Then** it
   is reported as unavailable (the available set is exactly these eight).

---

### User Story 2 - Each block is content-driven and reusable across businesses (Priority: P1)

The same block type carries different content for different businesses: one clinic's Hero and one
restaurant's Hero are the same block fed different configuration. A builder fills each block's
content fields and the block renders that content, with no business- or niche-specific text baked
into the block.

**Why this priority**: Reusability across verticals is what makes eight blocks cover 80% of the
market. Without it, the kit would need per-business variants and the bounded set would not hold.

**Independent Test**: Feed one block type two different content sets representing two different
verticals; confirm both render correctly from their own content and that the block contains no
hardcoded business-specific content of its own.

**Acceptance Scenarios**:

1. **Given** one block type and two distinct content sets, **When** each is rendered, **Then** each
   output reflects its own content with no leakage from the other.
2. **Given** a block with no client content supplied, **When** inspected, **Then** it contains no
   hardcoded client/niche text (only neutral structure and defaults).
3. **Given** cross-cutting business information already held once at site level (e.g., business name,
   contact details), **When** a block needs it, **Then** it is sourced from the site-level
   information rather than re-entered per block.

---

### User Story 3 - Switch a block's look via configuration variants (Priority: P2)

A builder changes the visual treatment of a block (e.g., a centered Hero vs. a split Hero) by
selecting one of that block's named variants in configuration, with no code change. If no variant is
chosen, the block uses its single defined default.

**Why this priority**: Variants let the same eight blocks produce visually distinct sites across
verticals, multiplying coverage. It is high value but secondary to having the blocks render at all.

**Independent Test**: Render one block with each of its declared variants selected, then with no
variant selected; confirm each selection changes the presentation and the unselected case uses the
documented default.

**Acceptance Scenarios**:

1. **Given** a block offering multiple variants, **When** a valid variant is selected in
   configuration, **Then** the block renders in that variant.
2. **Given** the same block with no variant selected, **When** rendered, **Then** it uses its single
   defined default variant.
3. **Given** an unrecognized variant value, **When** the configuration is processed, **Then** the
   block falls back to its default rather than entering an undefined state.

---

### User Story 4 - Optional content degrades gracefully (Priority: P2)

A builder supplies only the content a particular business has — omitting optional parts (e.g., a
Hero with no secondary call-to-action, a Services block with three items instead of six, a Footer
with no social links). Each block renders cleanly with what is provided and omits what is not,
without errors or empty placeholders.

**Why this priority**: Real businesses have uneven content. Graceful optional handling is what lets
the bounded set serve many businesses without forcing every field.

**Independent Test**: Render each block with only its required content and again with full content;
confirm both produce a clean result and omitted optional parts simply do not appear.

**Acceptance Scenarios**:

1. **Given** a block with only its required content supplied, **When** rendered, **Then** it
   produces a clean result with optional parts absent (no empty slots or placeholder text).
2. **Given** a list-based block (e.g., Services, Testimonials, FAQ) with a small number of items,
   **When** rendered, **Then** it lays out the provided items without reserving space for absent
   ones.
3. **Given** required content missing from a block, **When** the configuration is validated, **Then**
   it is reported as invalid before rendering.

---

### Edge Cases

- What happens when a list-based block (Services, Testimonials, FAQ) is given an empty list — is the
  block omitted, or rendered empty? (Assumption: an empty list is treated as no content for that
  block; see Assumptions.)
- How does a block behave when a referenced site-level value it relies on (e.g., contact phone) is
  not present at site level?
- What happens when the same block type appears multiple times in one site (e.g., two CTA blocks)?
- How does the Contact block behave when only some contact channels (email, phone, address, map) are
  provided?
- How does a block handle content far longer than typical (very long headings, many list items)
  without breaking the page layout?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The platform MUST provide exactly these eight blocks: Hero, About, Services, CTA,
  Testimonials, FAQ, Contact, and Footer — no more in this phase.
- **FR-002**: Each block MUST conform to the established universal block contract: it receives its
  content through one structured data input and renders solely from that input.
- **FR-003**: Each block MUST be registered as an available, selectable block type so it can be
  named in site configuration and rendered by the existing renderer.
- **FR-004**: A site MUST be assemblable as an ordered selection of these block types with per-block
  content, producing a complete page from configuration alone (no per-site code).
- **FR-005**: Each block MUST be free of business- or niche-specific hardcoded content; all client
  content comes from configuration.
- **FR-006**: Each block MUST define a closed set of named visual variants with exactly one default,
  selectable via configuration without code changes.
- **FR-007**: An unrecognized variant value MUST resolve to the block's default rather than an
  undefined state.
- **FR-008**: Each block MUST distinguish required from optional content; optional content omitted
  MUST render cleanly with the optional parts absent.
- **FR-009**: Missing required content for a block MUST be reported as invalid before rendering.
- **FR-010**: Each block's content shape MUST be validated against its defined schema before
  rendering.
- **FR-011**: Where a block needs cross-cutting business information already held once at site level
  (e.g., business name, contact details, social links), it MUST source it from there rather than
  duplicating it per block.
- **FR-012**: The eight blocks together MUST be sufficient to assemble a complete, presentable
  single-page site for each target vertical: clinic, lawyer, restaurant, school, and local business.
- **FR-013**: List-based blocks (Services, Testimonials, FAQ) MUST render a variable number of items
  from configuration without per-count code changes.
- **FR-014**: Each block MUST be self-contained and independently usable — selecting or omitting one
  block MUST NOT affect the rendering of others.

### Key Entities *(include if feature involves data)*

- **Hero block**: The opening banner — primary headline, supporting text, and primary
  call-to-action; optional secondary action and supporting media.
- **About block**: A narrative/identity section — heading and descriptive body about the business;
  optional supporting media and highlight points.
- **Services block**: A list of offerings — each item with a title and description; optional icon,
  media, or per-item action. The core "what we do" section across all verticals.
- **CTA block**: A focused conversion prompt — a short message and a primary action (e.g., "Book
  now", "Get a quote", "Reserve a table").
- **Testimonials block**: A list of social-proof entries — each with a quote and attribution
  (name/role); optional rating or media.
- **FAQ block**: A list of question/answer pairs addressing common customer questions.
- **Contact block**: Ways to reach the business — combinations of address, phone, email, hours, and
  optionally a contact form and/or map, drawing on site-level contact information.
- **Footer block**: The page closer — business identity, navigation/links, legal line, and optional
  social links, drawing on site-level information.
- **Block variant**: A named visual treatment within a block's closed variant set, with one default.
- **Site assembly**: An ordered list of selected blocks with their content that the renderer turns
  into a complete page (reuses the existing whole-site configuration).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All eight named blocks (Hero, About, Services, CTA, Testimonials, FAQ, Contact,
  Footer) are available and selectable in site configuration.
- **SC-002**: A complete single-page sample site can be assembled and rendered from configuration
  alone for each of the five target verticals (clinic, lawyer, restaurant, school, local business) —
  five sample sites, all rendering coherently.
- **SC-003**: Building each sample vertical site requires zero changes to block code — configuration
  only.
- **SC-004**: Each block renders correctly with both its minimal (required-only) content and its
  full content, with no errors and no empty placeholders in the minimal case.
- **SC-005**: Each block offers at least two selectable variants, and switching variants is a
  configuration-only change.
- **SC-006**: No block contains hardcoded business- or niche-specific content (verifiable by
  inspection — blocks render only supplied configuration).
- **SC-007**: A new small-business site covering the common page structure can be assembled from the
  eight blocks in under two hours by configuration alone.

## Assumptions

- The eight blocks are the complete scope of this phase; additional blocks (pricing, gallery, team,
  blog, etc.) are explicitly out of scope and deferred to later phases.
- "5–8 blocks" is resolved as the full eight blocks the user listed; the set is treated as the
  bounded target, not a range to trim.
- Each block ships with at least two visual variants and exactly one default, per the existing
  variant rule.
- Visual/brand styling (colors, fonts, spacing) is driven by the existing site-level theme rather
  than re-specified per block; this phase defines block structure and content, not a new theming
  system.
- An empty list supplied to a list-based block (Services, Testimonials, FAQ) is treated as "no
  content for that block" and the block renders nothing rather than an empty shell.
- Cross-cutting business information (name, contact, social) continues to live once at site level
  and is reused by blocks (Contact, Footer) rather than duplicated.
- The Contact block's form submission/handling (delivery of submitted messages) is out of scope for
  this phase; the block presents contact information and, where applicable, a form structure, but
  message delivery is a later concern.
- Responsive layout across common screen sizes is expected of every block as a baseline quality bar.
- The blocks build on and reuse the existing block contract, whole-site configuration schema, and
  dynamic renderer; this phase does not modify those foundations.
