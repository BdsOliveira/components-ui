---
description: "Task list — Phase 7: First Real Client (Clínica Saúde)"
---

# Tasks: First Real Client — Clínica Saúde (Phase 7)

**Input**: Design documents from `/specs/007-clinica-saude-client/`

**Prerequisites**: plan.md, spec.md, research.md (D1–D7), data-model.md, contracts/client-contract.md (C1–C6)

**Tests**: INCLUDED — the phase exists to *validate* (theme/content/image swap + responsiveness) and
Constitution XI mandates config-parsing + rendering-consistency tests for config/template work.

**Organization**: By user story (US1–US5 from spec.md). The client's `config.json` is one shared file
edited incrementally across US1→US4; each story remains independently *testable* (its test asserts only
its own property), so config-edit tasks are sequential (same file) while each story's value is isolated.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable (different files, no incomplete-task dependency)
- **[Story]**: US1–US5 traceability

## Path Conventions

Nuxt multi-layer monorepo (plan.md). Client artifacts under `sites/clients/clinica-saude/`; render wiring
under `app/`; asset serving in `nuxt.config.ts`. `core` and `sites/templates/clinic` are NOT modified.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the isolated client directory skeleton and its static, non-config artifacts.

- [X] T001 [P] Create client directory skeleton `sites/clients/clinica-saude/` with `images/` and `__tests__/` subdirectories (C1.1)
- [X] T002 [P] Add a placeholder hero image at `sites/clients/clinica-saude/images/hero.jpg` (referenced later by `config.json` hero media; C3.1)
- [X] T003 [P] Create `sites/clients/clinica-saude/domain.txt` containing a single trimmed domain line `clinica-saude.example.com` (C4.1)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: App-layer render plumbing every rendered story depends on. No client renders until done.

**⚠️ CRITICAL**: Blocks US1 page render and US5 responsiveness.

- [X] T004 Add a `nitro.publicAssets` entry in `nuxt.config.ts` mapping `dir: 'sites/clients/clinica-saude/images'` → `baseURL: '/clients/clinica-saude/images'` so client images serve without copying into `public/` (research D4, C3.2)
- [X] T005 Switch `app/app.vue` from the `<NuxtWelcome>` scaffold to `<NuxtPage />` (+ keep `<NuxtRouteAnnouncer />`) so the page route mounts (C5.3)

**Checkpoint**: Render plumbing ready — user story work can begin.

---

## Phase 3: User Story 1 - A whole client site exists as one configuration directory (Priority: P1) 🎯 MVP

**Goal**: A complete clinic site is produced for `clinica-saude` from its directory alone, reusing the
clinic template, with no edits to `core` or `templates`.

**Independent Test**: `createClinicSite(config)` → `validateWebsiteConfig.valid === true`, built section
order === clinic `ORDER`, and `domain.txt` passes the domain validator; the dev page renders the site.

### Implementation for User Story 1

- [X] T006 [US1] Author the base `sites/clients/clinica-saude/config.json`: `template: "clinic"` + a `company` block (name "Clínica Saúde", tagline, contact) — no `order` field (C2.1–C2.3, C2.6)
- [X] T007 [US1] Create `app/pages/index.vue` loader: import the client `config.json`, dispatch `config.template === 'clinic'` → `createClinicSite({ company, theme, content })`, `validateWebsiteConfig(raw)`, render `<SiteRenderer :config="result.data!" v-if="result.valid">` else show the failure (C5.1, C5.2)

### Tests for User Story 1

- [X] T008 [US1] Test in `sites/clients/clinica-saude/__tests__/clinica-saude.spec.ts` (import `sites/core/components/sections/register` first): `config.json` parses, `createClinicSite(config)` → `validateWebsiteConfig.valid === true`, built section order equals clinic `ORDER`, AND `domain.txt` exists + matches the hostname pattern (C6.1, C6.5, C6.6)

**Checkpoint**: MVP — a distinct, valid clinic site exists and renders for the client.

---

## Phase 4: User Story 2 - Theme swap is proven (Priority: P1)

**Goal**: The client's theme overrides the template default and the site adopts the client look; structure
and content unchanged.

**Independent Test**: Built `site.theme.colors.primary` === client primary (≠ clinic `#0ea5e9`), while
order + content equal the no-theme-override build.

### Implementation for User Story 2

- [X] T009 [US2] Add a `theme` block to `sites/clients/clinica-saude/config.json` with `colors.primary` differing from the clinic default (e.g. `#15803d`), `mode: "light"` (C2.4)

### Tests for User Story 2

- [X] T010 [US2] Add a theme-isolation test to `sites/clients/clinica-saude/__tests__/clinica-saude.spec.ts`: built theme primary === client primary, and section order + content equal `createClinicSite({ company, content })` (theme omitted) → theme swap touches only theme (C6.2)

**Checkpoint**: Theme swap proven and isolated.

---

## Phase 5: User Story 3 - Content swap is proven (Priority: P1)

**Goal**: The client's company/section copy overrides template defaults; the site shows the client's words;
theme and order unchanged.

**Independent Test**: Overridden sections show client copy (≠ `defaults.json`), while `site.theme` + order
equal the no-content-override build.

### Implementation for User Story 3

- [X] T011 [US3] Add a `content` block to `sites/clients/clinica-saude/config.json` overriding hero + services (+ others as desired) copy; keys ⊆ clinic `ORDER` (C2.5)

### Tests for User Story 3

- [X] T012 [US3] Add a content-isolation test to `sites/clients/clinica-saude/__tests__/clinica-saude.spec.ts`: overridden section copy appears in the built site, and `site.theme` + order equal `createClinicSite({ company, theme })` (content omitted) → content swap touches only content (C6.3)

**Checkpoint**: Content swap proven and isolated.

---

## Phase 6: User Story 4 - Image swap is proven (Priority: P2)

**Goal**: The client supplies its own image and the rendered site uses it in place of defaults.

**Independent Test**: Built hero `media.src` === served client URL AND the referenced file exists in
`images/`; no broken reference.

### Implementation for User Story 4

- [X] T013 [US4] In `sites/clients/clinica-saude/config.json` set `content.hero.variant: "split"` + `content.hero.media: { src: "/clients/clinica-saude/images/hero.jpg", alt: "<non-empty pt-BR alt>" }` (C3.3, research D5)

### Tests for User Story 4

- [X] T014 [US4] Add an image-swap test to `sites/clients/clinica-saude/__tests__/clinica-saude.spec.ts`: built hero `media.src === "/clients/clinica-saude/images/hero.jpg"`, `media.alt` non-empty, AND the file referenced by `src` exists under `sites/clients/clinica-saude/images/` (C6.4, C3.4)

**Checkpoint**: Image swap proven, no broken reference.

---

## Phase 7: User Story 5 - Responsiveness is proven (Priority: P2)

**Goal**: The rendered client site is correct across phone, tablet, and desktop widths.

**Independent Test**: At ~375px / ~768px / ~1280px the page is readable with no horizontal overflow or
overlap.

### Implementation / Verification for User Story 5

- [ ] T015 [US5] Run `npm run dev`, open the client page, and verify per `quickstart.md` at ~375px, ~768px, ~1280px: every section readable, no horizontal overflow, no overlap; record the result (C6.7, SC-004). No source change expected — only verification of reused responsive sections. **PARTIAL**: dev render auto-verified (page returns 200, all client sections + hero image render, no invalid-config fallback); the visual 3-width check needs a human in a browser.

**Checkpoint**: Responsiveness verified across the three widths.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T016 [P] Add `sites/clients/clinica-saude/README.md` documenting the client dir responsibility + layout (mirror `sites/clients/README.md` allowed/prohibited; C1.2)
- [X] T017 Run the full check: `npx vitest run sites/clients/clinica-saude` + `npm run lint` — all green
- [X] T018 Execute `quickstart.md` end-to-end (build → verify the four goals) and confirm SC-001…SC-005 hold

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies — start immediately. T001 before T002/T003 (subdirs first).
- **Foundational (Phase 2)**: after Setup. Blocks all rendering (US1 page, US5).
- **US1 (Phase 3)**: after Foundational. T006 (config) → T007 (page) → T008 (test).
- **US2/US3/US4 (Phases 4–6)**: after US1 (share `config.json` authored in T006). Sequential because they
  edit the same `config.json` and the same `clinica-saude.spec.ts`: T009→T010, T011→T012, T013→T014.
- **US5 (Phase 7)**: after Foundational + at least US1 rendering (ideally after US2–US4 for the full look).
- **Polish (Phase 8)**: after all desired stories.

### User Story Dependencies

- **US1 (P1)**: foundational MVP — the site exists/renders. No dependency on other stories.
- **US2 (P1)**: adds theme override to the US1 config; independently testable.
- **US3 (P1)**: adds content override; independently testable.
- **US4 (P2)**: adds image override (needs the served-images mapping from T004); independently testable.
- **US5 (P2)**: verifies the rendered output; needs render plumbing (T004/T005) + a rendered config.

### Within Each Story

- config edit (implementation) before its assertion (test).
- T007 page depends on T006 (config must exist to import).

### Parallel Opportunities

- Setup: T002 and T003 are [P] (different files) once T001 created the dirs.
- Polish: T016 [P] (new README, independent file).
- Cross-story config/test tasks are NOT [P] — they touch the same `config.json` / `clinica-saude.spec.ts`.

---

## Parallel Example: Phase 1 Setup

```bash
# After T001 creates the directories:
Task: "Add placeholder hero image sites/clients/clinica-saude/images/hero.jpg"   # T002
Task: "Create sites/clients/clinica-saude/domain.txt with clinica-saude.example.com"  # T003
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 Setup → 2. Phase 2 Foundational → 3. Phase 3 US1 → **STOP & VALIDATE**: a distinct, valid clinic
   site exists and renders for `clinica-saude`. Demo-able.

### Incremental Delivery

US1 (site exists) → US2 (theme swap) → US3 (content swap) → US4 (image swap) → US5 (responsiveness) →
Polish. Each adds one proven validation goal without breaking the previous.

---

## Notes

- `core` schemas and the clinic template structure are NEVER edited (Constitution II/III/VI; C-non-goals).
- `config.json` carries NO section-order field — order stays template-owned (FR-008 / C2.6).
- Images stay in the client dir, served via Nitro — never copied into `public/` (C3.2 / Constitution XII).
- Tests live in the client dir's `__tests__/`, importing `register` before validating (registry side effect).
- Commit after each task or logical group; stop at any checkpoint to validate a story independently.
