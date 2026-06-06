# Feature Specification: First Real Client — Clínica Saúde (Phase 7)

**Feature Branch**: `007-clinica-saude-client`

**Created**: 2026-06-06

**Status**: Completed

**Input**: User description: "FASE 7 — Criar 1 cliente fake. Agora crie: clients/clinica-saude/{config.json, images/, domain.txt}. precisamos validar: troca de tema, troca de conteúdo, troca de imagens, responsividade"

## Overview

This phase creates the **first concrete client** of the platform: a self-contained client directory,
`clinica-saude`, that produces a real, distinct clinic website by **configuration only** — no new
source code. The client reuses the existing clinic template and supplies its own identity, content,
images, and domain.

The purpose is not the client itself but the **proof**: a single end-to-end example that validates the
JSON-driven, headless promise made by Phases 2–6. Concretely, the client must demonstrate four
swappable concerns working independently and a layout that holds on any screen:

- **Theme swap** — the client overrides the template's visual identity and the site visibly re-skins.
- **Content swap** — the client overrides the template's copy and the site shows its own words.
- **Image swap** — the client supplies its own images and they replace the template/placeholder images.
- **Responsiveness** — the resulting site renders correctly across phone, tablet, and desktop widths.

The client is the highest layer: it depends on templates and core, and nothing depends on it. It owns
only its own configuration and assets — no shared logic, no cross-client coupling.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A whole client site exists as one configuration directory (Priority: P1)

A site operator creates a new clinic site for "Clínica Saúde" by adding one self-contained directory
that holds the client's configuration, its images, and its domain — and a complete, distinct website is
produced from that data alone, reusing the clinic template without changing any template or core code.

**Why this priority**: This is the irreducible proof of the whole platform — that a real site is born
from data, not from new source. Without it, the JSON-driven claim of Phases 2–6 is unverified. Every
other story in this phase is a property of this one client.

**Independent Test**: Add the `clinica-saude` directory with its configuration, build/preview the site,
and confirm a full clinic site renders for this client with no edits to template or core layers.

**Acceptance Scenarios**:

1. **Given** the clinic template exists, **When** the `clinica-saude` client configuration is added,
   **Then** a complete clinic site is produced for this client using only that configuration.
2. **Given** the client directory, **When** its contents are inspected, **Then** it contains the
   client's configuration, an images location, and a domain definition — and no shared/template logic.
3. **Given** the produced site, **When** it is compared to the bare template, **Then** it is a distinct
   site (different identity/content/images) while the template source is unchanged.

---

### User Story 2 - Theme swap is proven (Priority: P1)

The client supplies its own visual identity (colors, mode, radius, spacing) that overrides the
template's default theme, and the rendered site visibly adopts the client's look while structure and
content stay intact.

**Why this priority**: Theme override is one of the four explicit validation goals and a core promise of
the per-concern override model — a theme change must never touch structure or content.

**Independent Test**: Set a client theme that differs clearly from the template default, render the
site, and confirm the visual identity changes (e.g. primary color) while section order and copy are
unchanged.

**Acceptance Scenarios**:

1. **Given** a client theme that differs from the template default, **When** the site renders, **Then**
   the site shows the client's visual identity, not the template's.
2. **Given** a theme override, **When** the site renders, **Then** section order and content are
   unaffected by the theme change.

---

### User Story 3 - Content swap is proven (Priority: P1)

The client supplies its own company identity and section copy (headings, services, testimonials, FAQ,
contact details) that override the template defaults, and the rendered site shows the client's words.

**Why this priority**: Content override is one of the four explicit validation goals; a real client must
not display the template's placeholder copy.

**Independent Test**: Provide client-specific copy for one or more sections, render the site, and confirm
those sections display the client's content instead of the template defaults, with theme and order
unchanged.

**Acceptance Scenarios**:

1. **Given** client content overrides, **When** the site renders, **Then** the overridden sections show
   the client's copy instead of the template defaults.
2. **Given** a content override, **When** the site renders, **Then** the visual theme and section order
   are unaffected by the content change.

---

### User Story 4 - Image swap is proven (Priority: P2)

The client supplies its own images, and the rendered site uses those client images in place of the
template's or placeholder images.

**Why this priority**: Image override is one of the four explicit validation goals. It is P2 because it
builds on the content/theme override mechanism already proven in Stories 2–3 and exercises the asset
path rather than the core override flow.

**Independent Test**: Place client images in the client's images location, reference them from the
client configuration, render the site, and confirm the client images appear instead of defaults.

**Acceptance Scenarios**:

1. **Given** client images referenced from the client configuration, **When** the site renders, **Then**
   the client's images are shown where images appear.
2. **Given** an image reference, **When** the site renders, **Then** no broken or placeholder image
   remains for the images the client supplied.

---

### User Story 5 - Responsiveness is proven (Priority: P2)

The produced client site renders correctly across common screen sizes — phone, tablet, and desktop —
with no broken layout, overflow, or unreadable content.

**Why this priority**: Responsiveness is one of the four explicit validation goals and a baseline
expectation for any real client site. It is P2 because it validates the rendered output rather than the
configuration mechanism.

**Independent Test**: Render the client site and view it at representative phone, tablet, and desktop
widths, confirming each section remains readable and correctly laid out.

**Acceptance Scenarios**:

1. **Given** the client site, **When** it is viewed at a phone width, **Then** all sections are readable
   with no horizontal overflow or overlapping content.
2. **Given** the client site, **When** it is viewed at tablet and desktop widths, **Then** the layout
   adapts appropriately and remains correctly composed.

---

### Edge Cases

- What happens when the client omits an override for a concern (theme, content, or an image)? The site
  falls back to the corresponding template default for that concern only.
- What happens when the client references an image that is missing from its images location? The missing
  asset must be detectable rather than silently producing a broken site.
- What happens when the client provides only a partial theme or partial section content? Only the
  provided fields override; unspecified fields keep the template default (per-concern, per-field merge).
- What happens when the domain definition is empty or malformed? The domain mapping must be validatable
  so a bad domain is caught rather than mis-routing.
- What happens if a client attempts to change section order or template structure? Structure/order is
  not client-overridable; such an attempt has no effect on render order.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a self-contained `clinica-saude` client directory containing the
  client's configuration, an images location, and a domain definition, with no shared or template logic
  inside it.
- **FR-002**: The client MUST produce a complete clinic site by configuration only, reusing the existing
  clinic template, without any change to template or core source.
- **FR-003**: The client configuration MUST be able to override the template's visual identity (theme),
  and the rendered site MUST reflect the client's theme.
- **FR-004**: The client configuration MUST be able to override the template's company identity and
  section content, and the rendered site MUST reflect the client's content.
- **FR-005**: The client MUST be able to supply its own images and reference them so the rendered site
  uses the client's images in place of defaults/placeholders.
- **FR-006**: A theme override MUST NOT alter content or section order; a content override MUST NOT alter
  theme or section order; an image override MUST NOT alter theme, copy, or order (per-concern
  isolation).
- **FR-007**: Overrides MUST merge per concern and per field: any concern or field the client does not
  override MUST fall back to the template default.
- **FR-008**: Section order and template structure MUST NOT be client-overridable.
- **FR-009**: The client MUST define its domain in a dedicated domain definition that can be validated
  and used to associate the domain with this client.
- **FR-010**: The produced client site MUST render correctly across phone, tablet, and desktop widths
  with no broken layout, horizontal overflow, or unreadable content.
- **FR-011**: The client configuration MUST be validated against the central website/config contract so
  invalid configuration is rejected before it produces a site.
- **FR-012**: Missing or invalid client assets (e.g. a referenced image that is absent) and an invalid
  domain definition MUST be detectable rather than silently producing a broken site.

### Key Entities *(include if feature involves data)*

- **Client Directory (`clinica-saude`)**: The self-contained, highest-layer unit for one client; holds
  the client's configuration, images, and domain. Depends on templates and core; nothing depends on it.
- **Client Configuration (`config.json`)**: The client's data that selects the clinic template and
  supplies per-concern overrides — company identity, theme, section content, and image references.
- **Client Images (`images/`)**: The client-owned image assets referenced by the configuration; replace
  template/placeholder images in the rendered site.
- **Domain Definition (`domain.txt`)**: The client's domain, associating a domain with this client for
  routing/identification.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new clinic site for Clínica Saúde is produced entirely from the `clinica-saude`
  directory, with zero changes to template or core source files.
- **SC-002**: The rendered client site differs from the bare clinic template in theme, content, and
  images simultaneously, while reusing the same template structure and section order.
- **SC-003**: Each of the three overridable concerns (theme, content, images) can be changed
  independently, and changing one leaves the other two visibly unchanged in the rendered site.
- **SC-004**: The client site renders without layout breakage, horizontal overflow, or unreadable
  content at representative phone, tablet, and desktop widths.
- **SC-005**: An invalid client configuration, a missing referenced image, or an invalid domain
  definition is reported rather than producing a broken or silently wrong site.

## Assumptions

- The client directory lives under the existing client layer of the repository (`sites/clients/`), which
  the platform already designates as the highest, per-client layer; the user's shorthand `clients/`
  refers to this layer.
- The clinic template from Phase 6 already exposes a per-concern override mechanism (company, theme,
  content) and fixed section order; this phase consumes it rather than extending it.
- Image references in the client configuration point to assets in the client's `images/` location; the
  exact field shape follows the central config/image contract defined in earlier phases.
- "Validate responsiveness" means visual/layout verification at representative phone, tablet, and
  desktop widths, not a specific device matrix.
- "Fake client" means realistic but fictitious data (Clínica Saúde) used to prove the pipeline; no real
  business, real domain ownership, or production deployment is implied.
- Domain definition format is a single domain string in `domain.txt`; multi-domain or DNS provisioning
  is out of scope for this phase.
