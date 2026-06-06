# Feature Specification: Clinic Template

**Feature Branch**: `006-clinic-template`

**Created**: 2026-06-06

**Status**: Completed

**Input**: User description: "FASE 6 — Criar 1 template forte. Escolha UM nicho: clínica (alta demanda, estrutura previsível, visual simples, ticket melhor). Estrutura: templates/clinic/ com page.ts, defaults.json, theme.ts. O template apenas organiza seções, define ordem e define defaults. Nada mais."

## Overview

Phase 6 delivers one strong, opinionated **clinic** template built entirely on the eight core blocks from Phase 5. Rather than a single mixed file that interleaves structure, content, and styling, the clinic template separates three concerns into three artifacts:

- **Page structure** — which sections appear and in what order.
- **Defaults** — the default content that fills each section so the template renders coherently out of the box.
- **Theme** — the visual identity (color, typography, spacing tokens) the template ships with.

The template **only** organizes sections, fixes their order, and supplies defaults. It introduces no new blocks, no new layout logic, and no business logic — it is pure orchestration. A person standing up a clinic site can either accept the defaults as-is or override individual pieces of content/theme without touching the page structure.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Stand up a complete clinic site from the template (Priority: P1)

A person responsible for a clinic's web presence selects the clinic template and gets a complete, coherent single-page site with no further input required. Hero, services, testimonials, FAQ, contact, and footer appear in a sensible clinic order, each pre-filled with realistic clinic-appropriate placeholder content, themed with a clean clinic-appropriate look.

**Why this priority**: This is the core value of the phase — a "strong template" must produce a usable, presentable clinic site immediately. Without this, nothing else matters.

**Independent Test**: Apply the clinic template with zero overrides and confirm it produces a valid whole-site configuration that renders all default sections in the defined order, coherently and without empty placeholders.

**Acceptance Scenarios**:

1. **Given** the clinic template with no overrides, **When** a site is produced from it, **Then** the result is a valid whole-site configuration that passes site validation.
2. **Given** the clinic template applied with defaults, **When** the site renders, **Then** the sections appear in the template's defined order and every section shows meaningful default content (no blank or placeholder-only regions).
3. **Given** the clinic template, **When** its section list is inspected, **Then** it contains only section types drawn from the eight core blocks and no other types.

---

### User Story 2 - Customize content without touching structure (Priority: P2)

A person personalizes a clinic site (clinic name, services offered, patient testimonials, FAQ entries, contact details) by editing the template's default content, while the page structure and section order remain fixed and reusable across many clinics.

**Why this priority**: A template is only "strong" if it is reusable. Separating content defaults from structure lets the same arrangement serve many clinics with different content. High value, but depends on US1 existing first.

**Independent Test**: Override one or more default content fields, leave structure untouched, and confirm the produced site reflects the new content in the same section order with no structural change.

**Acceptance Scenarios**:

1. **Given** the clinic template, **When** specific default content values are overridden, **Then** the produced site shows the overridden values and keeps every other default unchanged.
2. **Given** overridden content, **When** the site is produced, **Then** the section order and the set of sections are identical to the un-overridden template.
3. **Given** a content override that omits an optional region, **When** the site renders, **Then** that region renders nothing rather than an empty placeholder.

---

### User Story 3 - Adjust the visual identity independently (Priority: P3)

A person changes the clinic site's look (primary color and other theme tokens) by adjusting the template's theme, without editing page structure or content defaults.

**Why this priority**: Independent theming makes the template adaptable to different clinic brands. Valuable polish, lower priority than producing and populating the site.

**Independent Test**: Change a theme token, leave structure and content untouched, and confirm the produced site carries the new visual tokens while structure and content are unchanged.

**Acceptance Scenarios**:

1. **Given** the clinic template, **When** a theme token is changed, **Then** the produced site reflects the new theme and its structure and content defaults are unchanged.
2. **Given** the clinic template with no theme override, **When** the site is produced, **Then** the template's shipped clinic theme is applied (not a bare, unstyled default).

---

### Edge Cases

- What happens when a content default is left empty for an optional region? → That region renders nothing; no empty placeholder appears.
- What happens when a required piece of content (e.g., clinic name, hero heading) is missing? → The configuration fails site validation before render, surfacing the gap rather than rendering a broken section.
- What happens if someone tries to add a section type that is not one of the eight core blocks? → It is rejected as invalid by site validation.
- What happens when the theme is omitted entirely? → The template's shipped clinic theme still applies; the site is never left visually bare.
- What happens when the defaults are overridden only partially? → Overridden fields take the new values; all non-overridden fields keep the template defaults.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The clinic template MUST be composed exclusively from the eight existing core blocks (hero, about, services, cta, testimonials, faq, contact, footer); it MUST NOT introduce new block types, new layouts, or new business logic.
- **FR-002**: The clinic template MUST define a fixed page structure — an ordered list of sections — where the order is the render order.
- **FR-003**: The clinic template MUST provide default content for every section it includes, such that producing a site with no overrides yields a coherent, fully populated clinic site.
- **FR-004**: The clinic template MUST provide a shipped clinic-appropriate theme (visual tokens) applied by default.
- **FR-005**: The template's three concerns — page structure (order), content defaults, and theme — MUST be separated so that each can be changed independently without modifying the others.
- **FR-006**: A site produced from the template with no overrides MUST be a valid whole-site configuration that passes the existing site validation.
- **FR-007**: The default content MUST be clinic-appropriate and realistic enough to present, while remaining clearly placeholder (no real client's private data).
- **FR-008**: Overriding any default content value MUST leave all other defaults and the page structure unchanged.
- **FR-009**: Overriding the theme MUST leave the page structure and content defaults unchanged.
- **FR-010**: Omitted optional content regions MUST render nothing (no empty placeholders); missing required content MUST be rejected at validation before render.
- **FR-011**: The clinic section order MUST follow a sensible clinic journey (introduce the clinic, present services, build trust, answer questions, drive contact, close with footer).
- **FR-012**: The template MUST be reusable across multiple clinics — the same structure serving different content/theme — with no per-client custom layout baked in.

### Key Entities *(include if feature involves data)*

- **Clinic Page Structure**: The ordered list of section types the clinic template arranges. Defines what appears and in what order; carries no content of its own beyond the arrangement.
- **Clinic Defaults**: The default content values that populate each section so the template renders coherently with zero input. One default set per section in the structure.
- **Clinic Theme**: The set of visual tokens (e.g., primary color and related identity tokens) the template ships with and applies by default.
- **Produced Clinic Site**: The valid whole-site configuration that results from combining structure + defaults (+ optional overrides) + theme; the artifact that renders.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A clinic site produced from the template with zero overrides passes site validation and renders every section in the defined order with no empty placeholder regions — 100% of default sections populated.
- **SC-002**: A person can produce a presentable clinic site from the template in under 5 minutes using only the shipped defaults.
- **SC-003**: A person can change clinic content (name, services, testimonials, FAQ, contact) without altering the page structure, and a person can change the theme without altering structure or content — each concern editable in isolation.
- **SC-004**: The same template structure can be reused to produce sites for at least 3 distinct clinics differing only in content and theme, with no change to the page structure.
- **SC-005**: The produced site uses only the eight core block types — zero new block types introduced by the template.

## Assumptions

- The eight core blocks and the whole-site validation delivered in Phase 5 are available and unchanged; this phase consumes them and adds no new blocks.
- "One strong template" means depth on a single niche (clinic) rather than breadth; other niches are out of scope for this phase.
- The existing single-file clinic sample from Phase 5 is the conceptual starting point; Phase 6 elevates it into the separated structure/defaults/theme form. Keeping or retiring that earlier sample is an implementation detail for planning.
- Default content is illustrative placeholder content for a generic clinic, not data for any real client.
- Visual quality of the shipped theme should follow the project's frontend-design guidance (`.agents/skills/frontend-design/SKILL.md`) where applicable, aiming for a clean, trustworthy clinic look rather than a generic unstyled default.
- The clinic journey order is assumed as: hero → services → testimonials → faq → contact → footer (consistent with the Phase 5 clinic sample), adjustable during planning if a stronger ordering is identified.
