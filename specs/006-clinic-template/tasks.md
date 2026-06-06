---
description: "Task list for Clinic Template (Phase 6)"
---

# Tasks: Clinic Template

**Input**: Design documents from `/specs/006-clinic-template/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/clinic-template-contract.md, quickstart.md

**Tests**: INCLUDED — the contract's "Acceptance instrument" (T1–T7) and quickstart require `clinic-template.spec.ts` plus a repointed `verticals.spec.ts`. Test tasks are therefore mandatory for this feature.

**Organization**: Tasks grouped by user story. This feature is pure orchestration (Constitution VI): the three artifacts are shared foundation; each user story is differentiated by the behavior it proves.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in every task

## Path Conventions

- Source: `sites/templates/clinic/` (template layer; depends only on `sites/core`)
- Tests: `sites/templates/__tests__/`
- Core engine (consumed, never edited): `sites/core/schemas`, `sites/core/components/sections/register.ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the JSON-import toolchain the three-file split relies on

- [X] T001 Verify `resolveJsonModule` is active in `.nuxt/tsconfig*.json` (research.md Decision 3 verification task); if absent, enable it via `typescript` options in `nuxt.config.ts` — one-line, no new dependency. Confirm `import defaults from './defaults.json'` type-resolves.

**Checkpoint**: JSON content artifact can be imported with types in app/server/test contexts.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Author the three separated artifacts and the composition root that EVERY user story consumes. The `createClinicSite` factory built here is the shared surface US1/US2/US3 each exercise differently.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 [P] Create `sites/templates/clinic/theme.ts` exporting `clinicTheme: ThemeConfig` (import `ThemeConfig` from `~~/sites/core/schemas`) — clean clinical identity: cool `colors.primary`, `mode: 'light'`, soft `radius`, generous `spacing` (data-model "Clinic Theme"; quickstart Anatomy; contract T4). NO structure, NO content.
- [X] T003 [P] Create `sites/templates/clinic/defaults.json` as `{ company, sections }` — `company.name` required + generic clinic identity (contact/social/legal optional); `sections` keyed 1:1 with `ORDER` (`hero, services, testimonials, faq, contact, footer`), each value the block `data` slice WITHOUT the `type` field; generic placeholder content only, no real client data (data-model "Clinic Defaults"; quickstart Anatomy; contract T3, FR-007). NO order key, NO theme tokens.
- [X] T004 Create `sites/templates/clinic/page.ts` (composition root) importing `./defaults.json` and `clinicTheme` from `./theme` — declare `const ORDER = ['hero','services','testimonials','faq','contact','footer'] as const` as the single source of ordering, derive `SectionType`, assemble `sections` via `ORDER.map(type => ({ type, ...defaults.sections[type] }))`, and export `clinicSite: WebsiteConfig` (data-model "Produced Clinic Site"; contract T2, FR-002, FR-011). Depends on T002, T003.
- [X] T005 In `sites/templates/clinic/page.ts`, add `ClinicOverrides` interface (`company` / `theme` / `content`) and `createClinicSite(overrides?): WebsiteConfig` that deep-merges overrides over defaults while preserving `ORDER`; set `clinicSite = createClinicSite()` so `clinicSite === createClinicSite()`. `ORDER` is NOT overridable (data-model "Override model"; contract T5; FR-008, FR-009, FR-012). Depends on T004.
- [X] T006 Remove `sites/templates/clinic/config.ts` (superseded Phase 5 single-file sample) — directory must hold exactly `page.ts`, `defaults.json`, `theme.ts` (contract T1; research Decision 1). Depends on T004.
- [X] T007 Repoint `sites/templates/__tests__/verticals.spec.ts`: change the clinic import from `'../clinic/config'` to `'../clinic/page'` (use `clinicSite`); suite must stay green (quickstart Test; contract acceptance #2). Depends on T006.

**Checkpoint**: Three artifacts exist, `clinicSite` + `createClinicSite` export from `page.ts`, `config.ts` gone, `verticals.spec.ts` repointed. User-story verification can now begin.

---

## Phase 3: User Story 1 - Stand up a complete clinic site from the template (Priority: P1) 🎯 MVP

**Goal**: Zero-override `clinicSite` is a valid whole-site config that renders all six sections in `ORDER` with no empty placeholders, using only the eight core block types.

**Independent Test**: Produce the site with zero overrides; assert `validateWebsiteConfig(clinicSite).valid === true` with `data` defined, `sections.map(s => s.type)` equals `ORDER`, and every section type is one of the eight core blocks.

### Tests for User Story 1

> Write FIRST; ensure FAIL before Foundational artifacts are correct, then make pass.

- [X] T008 [US1] Create `sites/templates/__tests__/clinic-template.spec.ts` with a US1 block: import the section registry side-effect (`~~/sites/core/components/sections/register`) and `validateWebsiteConfig` from `~~/sites/core/schemas`; assert no-override `clinicSite` passes validation (`valid === true`, `data` defined), `sections.map(s => s.type)` deep-equals `ORDER`, and section types ⊆ the eight core blocks (contract T6, SC-001, SC-005; quickstart Test bullet 1).

### Implementation for User Story 1

- [X] T009 [US1] Run `npx vitest sites/templates` and make the US1 assertions in `clinic-template.spec.ts` pass by correcting `theme.ts` / `defaults.json` / `page.ts` until `clinicSite` validates and renders in `ORDER` with no empty regions (FR-003, FR-006, FR-010). Depends on T008.

**Checkpoint**: MVP complete — the clinic template produces a valid, ordered, fully-populated site out of the box.

---

## Phase 4: User Story 2 - Customize content without touching structure (Priority: P2)

**Goal**: A content override changes only content; section order/set and theme stay byte-identical to defaults.

**Independent Test**: Call `createClinicSite({ content: { hero: { heading: 'X' } } })`; assert hero heading changed, all other defaults intact, `sections.map(s => s.type)` and `theme` identical to `clinicSite`.

### Tests for User Story 2

- [X] T010 [US2] Add a US2 block to `sites/templates/__tests__/clinic-template.spec.ts`: a content-only override via `createClinicSite({ content, company })` shows overridden values, keeps every non-overridden default, and leaves `sections.map(s => s.type)` and `theme` identical to the no-override site (contract T5/T6, FR-008; quickstart Test bullet 2). Depends on T009.

### Implementation for User Story 2

- [X] T011 [US2] Ensure `createClinicSite` deep-merge in `sites/templates/clinic/page.ts` preserves unspecified content/company fields and never mutates `ORDER` or `theme` on a content override; run `npx vitest sites/templates` until the US2 block passes (FR-008). Depends on T010.

**Checkpoint**: US1 + US2 both pass — content is editable in isolation.

---

## Phase 5: User Story 3 - Adjust the visual identity independently (Priority: P3)

**Goal**: A theme override changes only the theme; structure and content stay byte-identical to defaults.

**Independent Test**: Call `createClinicSite({ theme: { colors: { primary: '#10b981' } } })`; assert `theme` reflects the new token while `sections` types and content equal `clinicSite`.

### Tests for User Story 3

- [X] T012 [US3] Add a US3 block to `sites/templates/__tests__/clinic-template.spec.ts`: a theme-only override changes only `theme` (new token applied), with section types and content identical to the no-override site; also assert the shipped `clinicTheme` applies when no theme override is given (not a bare default) (contract T4/T5, FR-009; quickstart Test bullet 3). Depends on T009.

### Implementation for User Story 3

- [X] T013 [US3] Ensure `createClinicSite` theme merge in `sites/templates/clinic/page.ts` applies overrides over `clinicTheme` without touching `sections`/`company`; run `npx vitest sites/templates` until the US3 block passes (FR-009). Depends on T012.

**Checkpoint**: All three stories pass independently — structure, content, and theme each editable in isolation.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Prove cross-clinic reuse (T7) and confirm the full acceptance instrument

- [X] T014 [P] Add a T7 reuse block to `sites/templates/__tests__/clinic-template.spec.ts`: build ≥3 distinct clinic sites via `createClinicSite(...)` content/theme overrides (e.g. Village Dental, etc.); assert each passes `validateWebsiteConfig` and each preserves `ORDER`, with no edit to `page.ts` structure (contract T7, SC-004; quickstart "Reuse"). Depends on T009.
- [X] T015 Run the full suite (`npm run test`) — confirm `clinic-template.spec.ts` (US1/US2/US3 + T7) and the repointed `verticals.spec.ts` both pass; verify `sites/templates/clinic/` holds exactly `page.ts`, `defaults.json`, `theme.ts` (contract T1, acceptance #1–#3).
- [X] T016 [P] Walk quickstart.md end-to-end (Assemble & validate + Reuse snippets) to confirm SC-002 (presentable site from defaults in <5 min) and that docs match the shipped surface.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories. Within it: T002/T003 parallel → T004 → T005, then T006 → T007.
- **User Stories (Phase 3–5)**: All depend on Foundational. Once Foundational is done, US1/US2/US3 verification can proceed in parallel (separate test blocks); priority order P1 → P2 → P3 if sequential.
- **Polish (Phase 6)**: Depends on US1 (T009) for the factory/site to exist; T015 depends on all stories.

### User Story Dependencies

- **US1 (P1)**: After Foundational. No dependency on other stories. The MVP.
- **US2 (P2)**: After US1 (T009) — exercises the same factory with content overrides; independently testable.
- **US3 (P3)**: After US1 (T009) — exercises the same factory with theme overrides; independently testable. Independent of US2.

### Within Each User Story

- Test block written before/with the make-pass implementation task.
- Foundational artifacts before any story verification.

### Parallel Opportunities

- T002 and T003 (theme.ts, defaults.json — different files) run in parallel.
- After T009, the US2 (T010/T011) and US3 (T012/T013) blocks are independent and can run in parallel.
- T014 and T016 (Polish) are [P] — different concerns.

---

## Parallel Example: Phase 2 Foundational

```bash
# Author the two independent artifacts together:
Task: "Create sites/templates/clinic/theme.ts (clinicTheme)"
Task: "Create sites/templates/clinic/defaults.json (company + sections)"
# Then sequentially: page.ts assembly (T004) → factory (T005) → remove config.ts (T006) → repoint verticals (T007)
```

## Parallel Example: After MVP (US2 + US3)

```bash
# Once US1 (T009) is green, these two stories are independent:
Task: "US2 content-override test + factory content-merge guarantee"
Task: "US3 theme-override test + factory theme-merge guarantee"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup (T001).
2. Phase 2: Foundational (T002–T007) — CRITICAL, blocks all stories.
3. Phase 3: User Story 1 (T008–T009).
4. **STOP and VALIDATE**: zero-override `clinicSite` validates + renders in `ORDER`.
5. Demo: a presentable clinic site from defaults.

### Incremental Delivery

1. Setup + Foundational → three artifacts + factory ready.
2. US1 → valid ordered site (MVP).
3. US2 → content editable in isolation.
4. US3 → theme editable in isolation.
5. Polish → ≥3-clinic reuse proof + full-suite green.

---

## Notes

- This feature is pure orchestration: no new blocks/schemas/renderer changes (Constitution VI, FR-001). Most implementation is the shared Foundational phase; stories are differentiated by the override-independence behavior each proves.
- [P] = different files, no dependencies.
- `ORDER` is fixed for the niche — never overridable via the factory.
- Commit after each task or logical group; stop at any checkpoint to validate a story independently.
