---
description: "Task list for Central Website Schema (Phase 3)"
---

# Tasks: Central Website Schema (Phase 3)

**Input**: Design documents from `/specs/003-website-config-schema/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/website-schema-contract.md, quickstart.md

**Tests**: No test suites requested for Phase 3. Per plan.md, schema-validation and rendering-consistency test suites (Constitution XI) become enforceable once concrete sections and the renderer exist (later phase). Whole-site validation behavior is proven end-to-end with the quickstart recipe (Polish). No test tasks are generated here.

**Scope note**: Phase 3 delivers the **central website schema + whole-site validation + the single-registry extension procedure** as code-level modules in `sites/core/schemas/` (`company`, `theme`, `section` registry, `website`, `validate-website`), reusing the Phase 2 primitives (`defineBlockSchema`, `blockVariant`, `validateBlockConfig`, `blockJsonSchema`). **No concrete sections** (Hero, Services, …) and **no renderer** are committed — the section registry ships empty. The contract docs already exist under `contracts/`; the tasks below land the modules those docs reference and prove the whole thing with the quickstart recipe.

**Organization**: Tasks grouped by user story (US1–US7) for independent implementation and verification.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story the task serves (US1–US7)
- Exact file paths included in each description

## Path Conventions

- All Phase 3 modules live in `sites/core/schemas/` (per plan.md Structure Decision), reusing the existing Phase 2 primitives in the same directory. No new top-level directories. The barrel `sites/core/schemas/index.ts` already exists (Phase 2) and is extended with the Phase 3 exports.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the toolkit and homes already exist — Phase 3 adds **zero** new dependencies.

- [X] T001 Verify `zod` and `zod-to-json-schema` already resolve (`node -e "require('zod'); require('zod-to-json-schema')"`) at repo root — no new dependency is added in Phase 3 (plan.md Complexity Tracking)
- [X] T002 [P] Confirm the Phase 2 primitives exist and are exported from `sites/core/schemas/index.ts` (`defineBlockSchema`, `blockVariant`, `validateBlockConfig`, `blockJsonSchema`) — the Phase 3 modules build on them

**Checkpoint**: Toolkit available; Phase 3 modules have a home.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ensure the single barrel every Phase 3 module exports through is ready to receive the new exports.

**⚠️ CRITICAL**: The `WebsiteConfig` composition root (US1) and whole-site validation (US6) export through this barrel; the leaf schemas must export through it for the root to import cleanly.

- [X] T003 Confirm `sites/core/schemas/index.ts` barrel is present and will be the single re-export surface for the Phase 3 exports (`companySchema`, `themeSchema`, section registry helpers + `Section`, `websiteConfigSchema` + `WebsiteConfig`, `validateWebsiteConfig`)

**Checkpoint**: Foundation ready — leaf schemas can now be added and the root can compose them.

> **Execution note**: The `WebsiteConfig` root (US1, P1) is a **composition root** that imports the section union (US2, P1), `companySchema` (US4, P2), and `themeSchema` (US5, P2). Execute the leaf schemas (US2, US4, US5) before US1. See Dependencies & Execution Order.

---

## Phase 3: User Story 1 - A whole site is one typed configuration object (Priority: P1) 🎯 MVP

**Goal**: Land the single canonical `WebsiteConfig = { company, theme, sections }` schema — the one authoritative whole-site shape (W1, FR-001/FR-002/FR-003).

**Independent Test**: Author any sample site as one `WebsiteConfig` object and confirm it type-checks with exactly `company`, `theme`, and an ordered `sections` array — and that no alternative whole-site shape is exported.

> **Depends on** the leaf schemas from US2 (`buildSectionSchema`), US4 (`companySchema`), US5 (`themeSchema`). Execute those first (they are leaves with no inter-dependency).

### Implementation for User Story 1

- [X] T004 [US1] Create `sites/core/schemas/website.ts`: `websiteConfigSchema = z.object({ company: companySchema, theme: themeSchema, sections: z.array(buildSectionSchema()) })` and `export type WebsiteConfig = z.infer<typeof websiteConfigSchema>` (data-model "WebsiteConfig"; `sections` ordered, empty allowed per W6)
- [X] T005 [US1] Re-export `websiteConfigSchema` and `WebsiteConfig` from `sites/core/schemas/index.ts`
- [X] T006 [US1] Document the single-`WebsiteConfig` rule (one object = `company` + `theme` + ordered `sections`, no info held outside it) in `sites/core/schemas/README.md`, linking `contracts/website-schema-contract.md` §W1

**Checkpoint**: A whole site is expressible as one typed `WebsiteConfig`. MVP core (with US2/US4/US5 leaves) complete.

---

## Phase 4: User Story 2 - Sections as a closed, discriminated union (Priority: P1)

**Goal**: Land the `Section` discriminated union keyed by `type`, its single registry, and the flat-member convention reusing Phase 2 block schemas (W3/W6/W7, FR-004/FR-005/FR-014/FR-016).

**Independent Test**: Register a sample block schema, build the union, and confirm a flat `{ type, ...slice }` item validates against its member, an unknown `type` is rejected, and an empty registry yields a reject-all element schema (empty `sections` still valid).

### Implementation for User Story 2

- [X] T007 [P] [US2] Create `sites/core/schemas/section.ts`: `defineSection(type, blockSchema)` = `blockSchema.extend({ type: z.literal(type) })` (flat member, research Decision 2); a single section **registry** (`type → member schema`); `registerSection(member)`; and `buildSectionSchema()` returning `z.discriminatedUnion('type', [...registered])` — or a defined **reject-all** element schema when the registry is empty (W6, Decision 4). Export `export type Section = z.infer<ReturnType<typeof buildSectionSchema>>`
- [X] T008 [US2] Re-export `defineSection`, `registerSection`, `buildSectionSchema`, and `Section` from `sites/core/schemas/index.ts`
- [X] T009 [US2] Document the `type`-keyed discriminated union, flat-member convention, unknown-`type` rejection, and empty-registry behavior in `sites/core/schemas/README.md`, linking §W3/§W6

**Checkpoint**: `sections` items are a closed, discriminated, validatable union built from one registry.

---

## Phase 5: User Story 3 - One schema shared across onboarding, templates, and renderer (Priority: P1)

**Goal**: Make `WebsiteConfig` the single contract surface every layer uses — no layer-specific alternative shape (W1, FR-017).

**Independent Test**: Confirm `WebsiteConfig` is the sole exported whole-site type from the schemas barrel and that no alternative whole-site shape exists anywhere in `sites/`.

### Implementation for User Story 3

- [X] T010 [US3] Document in `sites/core/schemas/README.md` that onboarding **produces**, templates **consume/merge**, and the renderer **accepts only** `WebsiteConfig` — one import surface (`sites/core/schemas`), no per-layer site shape — linking §W1 and FR-017
- [X] T011 [US3] Guard: grep `sites/` for any competing whole-site type/shape (e.g. `interface .*Site`, `SiteConfig`, `PageConfig`) and confirm `WebsiteConfig` is the only one; record the check result

**Checkpoint**: `WebsiteConfig` is the lingua franca; no alternative site representation exists.

---

## Phase 6: User Story 4 - Business identity captured in `company` (Priority: P2)

**Goal**: Land `CompanyConfig` — the site-level single source of business identity (W8, FR-008).

**Independent Test**: Inspect `companySchema`: `name` is required, the rest (tagline/contact/social/legal) are optional/defaulted, and identity is read once from `company` rather than duplicated per section.

### Implementation for User Story 4

- [X] T012 [P] [US4] Create `sites/core/schemas/company.ts`: `companySchema = z.object({ name: z.string(), tagline: z.string().optional(), contact: z.object({ email, phone, address }).partial().optional(), social: z.record(z.string()).optional(), legal: z.object({ legalName, taxId }).partial().optional() })` and `export type CompanyConfig = z.infer<...>` (data-model "CompanyConfig"; partial/optional for graceful degradation, FR-013)
- [X] T013 [US4] Re-export `companySchema` and `CompanyConfig` from `sites/core/schemas/index.ts`
- [X] T014 [US4] Document `company` as the single site-level source of business identity (not duplicated per section) in `sites/core/schemas/README.md`, linking §W8 / FR-008

**Checkpoint**: Business identity is typed and single-sourced at the site level.

---

## Phase 7: User Story 5 - Visual identity captured in `theme` (Priority: P2)

**Goal**: Land `ThemeConfig` — site-wide visual tokens applied across all sections (W8, FR-009).

**Independent Test**: Inspect `themeSchema`: it declares color/typography/mode tokens with defaults; changing a value re-skins the whole site with no per-section edit; a missing/partial theme still yields a valid token set.

### Implementation for User Story 5

- [X] T015 [P] [US5] Create `sites/core/schemas/theme.ts`: `themeSchema = z.object({ colors: z.object({ primary, secondary?, accent?, background?, foreground? }), typography: z.object({ headingFont?, bodyFont? }).optional(), mode: z.enum(['light','dark','system']).default('system'), radius?, spacing? })` with defaults throughout, and `export type ThemeConfig = z.infer<...>` (data-model "ThemeConfig"; all defaulted for FR-013)
- [X] T016 [US5] Re-export `themeSchema` and `ThemeConfig` from `sites/core/schemas/index.ts`
- [X] T017 [US5] Document `theme` as site-wide visual tokens changeable as configuration (no per-section source edit) in `sites/core/schemas/README.md`, linking §W8 / FR-009

**Checkpoint**: Visual identity is typed, defaulted, and applied site-wide via configuration.

---

## Phase 8: User Story 6 - Whole-site validation before render (Priority: P2)

**Goal**: Land `validateWebsiteConfig` — validate `company`, `theme`, and every section item; reject the whole config on any invalid section item, with per-item diagnostics (W4/W5, FR-011/FR-012/FR-013/FR-015).

**Independent Test**: Run `validateWebsiteConfig` on: a valid site (passes), a missing/partial `theme` (defaults applied, no crash), an unknown-`type` item (whole config rejected, item flagged by index), and a known-`type` invalid slice (whole config rejected, item flagged by index+type, valid siblings reported valid).

> **Depends on** US1 (`websiteConfigSchema`). Reuses Phase 2 `validateBlockConfig`.

### Implementation for User Story 6

- [X] T018 [US6] Create `sites/core/schemas/validate-website.ts`: `validateWebsiteConfig(input)` that never throws — applies schema defaults to missing/partial `company`/`theme` (W4/FR-013), validates each `sections` item against its member schema, **rejects the whole config** if any item is invalid (W5/FR-012/FR-014), and returns a per-item report `{ index, type?, valid, issues? }` with valid siblings marked valid (FR-015/SC-006); preserve `sections` order (FR-006). Reuse `validateBlockConfig` from `validate.ts` where applicable
- [X] T019 [US6] Re-export `validateWebsiteConfig` (and its result type) from `sites/core/schemas/index.ts`
- [X] T020 [US6] Document the whole-site validation policy (defaults for partial company/theme vs. reject on invalid section item; per-item diagnostics) in `sites/core/schemas/README.md`, linking §W4/§W5

**Checkpoint**: A `WebsiteConfig` is validatable as one unit with a defined, non-crashing failure behavior.

---

## Phase 9: User Story 7 - Extensible without breaking existing sites (Priority: P3)

**Goal**: Establish and prove the single-registry extension procedure — one authoritative place to register a new section type, backward-compatible with existing data (W7, FR-018/FR-019).

**Independent Test**: Register a new section type via the one registry call, confirm it becomes a valid `Section` member, and confirm a previously valid `WebsiteConfig` (using other types) still validates unchanged.

> **Depends on** US2 (registry) and US6 (validation) for the backward-compat proof.

### Implementation for User Story 7

- [X] T021 [US7] Document the single-registry extension procedure (author block schema → one `registerSection(defineSection('type', schema))` call → `buildSectionSchema()` picks it up; field additions to `company`/`theme` must be optional/defaulted) in `sites/core/schemas/README.md`, linking §W7 / FR-018 / FR-019
- [X] T022 [US7] Backward-compat proof (scratch file, NOT committed): register a throwaway section type, confirm it validates as a `Section` member, and confirm a sample `WebsiteConfig` authored before the addition still passes `validateWebsiteConfig` unchanged

**Checkpoint**: New section types are added in one place, backward-compatibly; existing sites stay valid.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Prove the schema end-to-end with the quickstart and keep Phase 3 free of concrete sections.

- [X] T023 [P] Author the quickstart.md recipe in a throwaway scratch file (register a stub block schema as `hero`, author the sample `WebsiteConfig`, run `validateWebsiteConfig`): valid renders, order = list order, unknown `type` rejects whole config, empty `sections: []` valid, omitted `theme` defaults — confirm it type-checks and compiles (SC-001/004/008/009)
- [X] T024 Verify whole-site validation runs at **build/server time only** and adds **no client hydration JS for SSG pages** (Constitution IX) via `nuxt build` output inspection
- [X] T025 [P] Update `sites/core/README.md` (or root pointer) to reference `contracts/website-schema-contract.md` as the authoritative whole-site standard
- [X] T026 Delete the scratch files from T022/T023 (Phase 3 commits no concrete sections) and confirm `sites/core/components/sections/` remains section-free and the registry ships empty

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — confirms the single barrel.
- **Leaf schemas (US2, US4, US5)**: Depend on Foundational; **no inter-dependency** — run in parallel.
- **Composition root (US1)**: Depends on US2 + US4 + US5 (imports their schemas).
- **US3, US6**: Depend on US1 (US3 documents/guards the single contract; US6 validates `websiteConfigSchema`).
- **US7**: Depends on US2 (registry) + US6 (validation, for the backward-compat proof).
- **Polish (Phase 10)**: Depends on all desired user stories (the quickstart exercises every clause).

### User Story Dependencies

- **US2 (P1)** — section union: leaf, after Foundational. No story dependency.
- **US4 (P2)** — company: leaf, after Foundational. No story dependency.
- **US5 (P2)** — theme: leaf, after Foundational. No story dependency.
- **US1 (P1)** — website root: after US2 + US4 + US5 (composition root; priority-inverted dependency on P2 leaves is inherent to a composition root).
- **US3 (P1)** — shared contract: after US1.
- **US6 (P2)** — whole-site validation: after US1.
- **US7 (P3)** — extensibility: after US2 + US6.

### Within Each User Story

- Create the schema module → re-export it from the barrel → document it in the README.
- The barrel (`schemas/index.ts`) edit serializes across stories (same file): T005, T008, T013, T016, T019 must not run concurrently with each other.

### Parallel Opportunities

- Setup: T002 runs parallel to T001.
- Leaf creation after Foundational: **T007 (US2), T012 (US4), T015 (US5)** touch different files → run in parallel by different developers.
- README edits (T006, T009, T010, T014, T017, T020, T021) target the same `schemas/README.md` and must serialize.
- Polish: T023 and T025 are parallel (different files); T024/T026 are checks/cleanup.

---

## Parallel Example: Leaf schemas (after Foundational)

```bash
# Different developers, different files — run the leaf-schema creation tasks together:
Task: "Create section registry + union in sites/core/schemas/section.ts"   # T007 (US2)
Task: "Create companySchema in sites/core/schemas/company.ts"              # T012 (US4)
Task: "Create themeSchema in sites/core/schemas/theme.ts"                  # T015 (US5)
```

---

## Implementation Strategy

### MVP First (the P1 core: US1 composing US2)

1. Complete Phase 1: Setup (toolkit confirmed, no new deps).
2. Complete Phase 2: Foundational (barrel ready).
3. Complete the leaf schemas — **US2** (section union, P1) and the thin **US4/US5** (company/theme) the root requires.
4. Complete **US1** — `websiteConfigSchema` composing them.
5. **STOP and VALIDATE**: a whole site is expressible as one typed `WebsiteConfig` with a closed, discriminated `sections` union. This is the irreducible MVP.

### Incremental Delivery

1. Setup + Foundational → barrel ready.
2. US2 + US4 + US5 (leaves) → US1 (root) → a typed whole-site shape (MVP).
3. US3 → confirm one shared contract across layers.
4. US6 → whole-site validation with reject-on-invalid-section + per-item diagnostics.
5. US7 → prove the single-registry extension procedure is backward-compatible.
6. Polish → quickstart end-to-end proof, SSG-weight check, scratch cleanup.

### Parallel Team Strategy

1. Team does Setup + Foundational together.
2. Then: Dev A → US2 (section); Dev B → US4 (company); Dev C → US5 (theme) — in parallel.
3. Reconvene: one dev composes US1, then US3 + US6 proceed; US7 after US6.
4. Polish is a shared gate (quickstart dry-run).

---

## Notes

- [P] = different files, no incomplete-task dependency.
- [Story] label maps each task to its user story for traceability against FR-001…FR-021.
- Phase 3 commits **no concrete sections** and ships the registry **empty** — T022/T023 scratch files are throwaway proofs, deleted in T026.
- The contract docs (`website-schema-contract.md`, `quickstart.md`) already exist; these tasks land the modules they reference and prove the schema end-to-end.
- Commit after each task or logical group; stop at any checkpoint to validate independently.
