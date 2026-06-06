---
description: "Task list for Dynamic Renderer (Phase 4)"
---

# Tasks: Dynamic Renderer (Phase 4)

**Input**: Design documents from `/specs/004-dynamic-renderer/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/renderer-contract.md, quickstart.md

**Tests**: Test tasks ARE generated. Per plan.md (Testing) and Constitution XI, Phase 4 is the first phase where **rendering-consistency** tests are enforceable end to end (render order, slice isolation, unknown-type fallback, per-section error isolation, empty-`sections` page, theme propagation). Tests use **fixture sections** (throwaway block schemas + stub components registered in the test) — no production section ships. Runner: Vitest + `@nuxt/test-utils` (devDependency; zero new *runtime* deps per plan.md).

**Scope note**: Phase 4 delivers the **renderer mechanism + an empty component registry** as code in `sites/core/`: the `type`→component registry (`components/sections/registry.ts`), the dynamic section renderer (`components/render/DynamicSection.vue`), the page iterator (`components/render/SiteRenderer.vue`), and the theme channel (`composables/useSiteTheme.ts`). It consumes the Phase 3 schemas (`schemas/website.ts`, `validate-website.ts`, `section.ts`, `theme.ts`) **unchanged**. **No concrete sections** (Hero, Services, …), onboarding, or templates are committed — the component registry ships empty (mirrors the Phase 3 schema registry). The contract docs already exist under `contracts/`; the tasks below land the modules they reference and prove them with the quickstart recipe.

**Organization**: Tasks grouped by user story (US1–US7) for independent implementation and verification.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story the task serves (US1–US7)
- Exact file paths included in each description

## Path Conventions

- Renderer code lives in `sites/core/` (per plan.md Structure Decision): `sites/core/components/render/`, `sites/core/components/sections/registry.ts`, `sites/core/composables/useSiteTheme.ts`. Tests live in `sites/core/components/render/__tests__/` and `sites/core/components/sections/__tests__/`. No new top-level directories. Phase 3 schemas in `sites/core/schemas/` are imported, never modified.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the toolkit, wire the engine components into Nuxt, add the test runner. Zero new **runtime** dependencies.

- [ ] T001 Verify the renderer's runtime toolkit already resolves — `vue` (built-in `<component :is>`) and `zod` — and confirm Phase 3 exports are importable from `sites/core/schemas/index.ts` (`WebsiteConfig`, `validateWebsiteConfig`, `Section`, `ThemeConfig`); no new runtime dependency is added (plan.md Complexity Tracking)
- [ ] T002 [P] Add the test runner as a devDependency in `package.json` — `vitest` + `@nuxt/test-utils` + `@vue/test-utils` + `happy-dom` (or `jsdom`) — and a `test` script (`"test": "vitest run"`); these are dev-only (plan.md Testing)
- [ ] T003 [P] Add `vitest.config.ts` at repo root configuring the Vue/Nuxt test environment (`environment: 'nuxt'` or happy-dom) so `.vue` SFCs mount in tests
- [ ] T004 Wire engine components into Nuxt in `nuxt.config.ts` — add `components: { dirs: [{ path: '~~/sites/core/components', pathPrefix: false }] }` so `<SiteRenderer>` / `<DynamicSection>` resolve in pages; section components stay registry-only, NOT auto-imported (research D6)

**Checkpoint**: Toolkit available, engine components resolvable, tests runnable.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Provide the test fixture helper every per-story rendering test needs (throwaway section schemas + stub components that register into both registries). Blocks all story test tasks.

**⚠️ CRITICAL**: Rendering tests can only assert behavior against *registered* section types; the fixture helper is the shared precondition for US1–US7 tests.

- [ ] T005 Create the test fixture helper in `sites/core/components/render/__tests__/fixtures.ts` — exports `makeStubSection(type)` (a minimal Vue stub component rendering an identifiable marker + its received props) and `registerStub(type, component)` that registers BOTH the schema (`registerSection(defineSection(type, z.object({...})))`) and the component (`registerSectionComponent(type, component)`), plus a `resetRegistries()` calling `clearSectionRegistry()` + `clearSectionComponentRegistry()` for `afterEach`
- [ ] T006 [P] Confirm the Phase 3 input contract is importable and stable for the renderer — `validateWebsiteConfig`, `WebsiteConfig`, `ThemeConfig`, `Section`, and registry helpers (`clearSectionRegistry`) — from `sites/core/schemas/index.ts`; no Phase 3 source is modified (plan.md Structure Decision)

**Checkpoint**: Fixtures ready — section types can be stubbed and registered per test; story phases can begin.

> **Execution note**: `SiteRenderer` (US1) iterates `DynamicSection` (US2), which resolves from the **component registry** (US3). Execute **US3 → US2 → US1** (registry before renderer before iterator), mirroring Phase 3's leaves-before-root order. All three are P1 and together form the MVP.

---

## Phase 3: User Story 3 - Section type resolves to a component via one registry (Priority: P1)

**Goal**: Land the single authoritative `type`→component registry — the runtime sibling of `schemas/section.ts` (R4, FR-003/FR-004). Ships empty (R13/FR-018).

**Independent Test**: Register a stub component for a type, resolve it back, confirm one authoritative map; an unregistered type resolves to nothing; re-registering a type replaces it.

### Tests for User Story 3 ⚠️

- [ ] T007 [P] [US3] Registry test in `sites/core/components/sections/__tests__/registry.spec.ts` — `registerSectionComponent('x', Stub)` then `resolveSectionComponent('x')` returns `Stub`; `resolveSectionComponent('missing')` returns `undefined`; re-register `'x'` replaces; `registeredSectionComponents()` lists keys; `clearSectionComponentRegistry()` empties it; an unregistered registry resolves nothing (empty baseline, R13)

### Implementation for User Story 3

- [ ] T008 [US3] Create the component registry in `sites/core/components/sections/registry.ts` — a module-level `Map<string, Component>` with `registerSectionComponent(type, component)` (idempotent-per-type, replace on re-register), `resolveSectionComponent(type): Component | undefined`, `registeredSectionComponents(): string[]`, and `clearSectionComponentRegistry()`; ships empty; neutral, no client content (research D2, R4)

**Checkpoint**: A type maps to a component through one authoritative place; resolution is O(1).

---

## Phase 4: User Story 2 - Each section item renders via a single dynamic renderer (Priority: P1)

**Goal**: Land `DynamicSection` — one component that resolves a section item's `type` from the registry and renders it via `<component :is>`, no per-type branching (R3, FR-005/FR-007).

**Independent Test**: Pass a single section item of a registered type; confirm the mapped stub renders. Register a new type later; confirm `DynamicSection` renders it with no change to its own source.

### Tests for User Story 2 ⚠️

- [ ] T009 [P] [US2] DynamicSection dispatch test in `sites/core/components/render/__tests__/dynamic-section.spec.ts` — mount `<DynamicSection :section="{ type: 'hero', ...}">` with `'hero'` stub registered; assert the hero stub rendered; register a second type `'services'` and assert a second `<DynamicSection>` renders it with no source change (extensibility, FR-007)

### Implementation for User Story 2

- [ ] T010 [US2] Create `sites/core/components/render/DynamicSection.vue` — `defineProps<{ section: Section }>()`, `const resolved = computed(() => resolveSectionComponent(props.section.type))`, template `<component :is="resolved" v-if="resolved" v-bind="section" />`; no `v-if`/`switch` on concrete type values (R3, research D1)

**Checkpoint**: One dynamic renderer dispatches any registered single section item.

---

## Phase 5: User Story 1 - A whole page renders from its `sections` list (Priority: P1) 🎯 MVP

**Goal**: Land `SiteRenderer` — iterates `DynamicSection` over `WebsiteConfig.sections` in list order with stable keys (R1/R2/R10, FR-001/FR-002/FR-006/FR-016). Completes the P1 MVP.

**Independent Test**: Render a `WebsiteConfig` with several registered-type sections (incl. a repeated type) and confirm one rendered section per item, in list order, each via its type's component.

### Tests for User Story 1 ⚠️

- [ ] T011 [P] [US1] SiteRenderer order test in `sites/core/components/render/__tests__/site-renderer.spec.ts` — render a config with sections `[hero, services, hero]` (stubs registered); assert three sections rendered in that exact DOM order, each by its mapped stub, and the repeated `hero` renders twice independently (R1/R2, FR-002/FR-007)
- [ ] T012 [P] [US1] SiteRenderer keying test in the same spec — assert each item is keyed by `section.id ?? `${index}:${type}`` (stable across re-render; an item with an explicit `id` uses it) (R10, FR-016, research D3)

### Implementation for User Story 1

- [ ] T013 [US1] Create `sites/core/components/render/SiteRenderer.vue` — `defineProps<{ config: WebsiteConfig }>()`, template `v-for="(section, index) in config.sections"` rendering `<DynamicSection :key="(section as any).id ?? `${index}:${section.type}`" :section="section" />`; preserves list order, no reordering (R1/R2/R10)

**Checkpoint**: 🎯 **MVP** — a whole page renders from `WebsiteConfig.sections` in order via the registry. US1+US2+US3 functional and testable independently.

---

## Phase 6: User Story 4 - Each section receives only its own config slice (Priority: P2)

**Goal**: Guarantee each section component receives only its own section item's slice — no sibling data (R5, FR-008/FR-009).

**Independent Test**: Render two sibling sections with distinct props; confirm each stub received only its own item's fields and nothing from the sibling.

### Tests for User Story 4 ⚠️

- [ ] T014 [P] [US4] Slice-isolation test in `sites/core/components/render/__tests__/slice-isolation.spec.ts` — render two sibling sections with distinct props; assert each stub's received props equal its own item (incl. `type`) and contain no sibling fields; assert content rendered derives only from the passed slice (R5, FR-008/FR-009)

### Implementation for User Story 4

- [ ] T015 [US4] Confirm `DynamicSection.vue` binds exactly the section item via `v-bind="section"` (no merged/shared/parent props leak to the resolved component); adjust only if T014 reveals leakage (R5) — implemented in T010, verified here

**Checkpoint**: Sections are data-driven by their own slice only; no cross-section leakage.

---

## Phase 7: User Story 5 - Unknown or unrenderable section types degrade safely (Priority: P2)

**Goal**: Safe degradation — a section whose `type` has no registered component, or that throws at runtime, never crashes the page and never blocks siblings (R6, FR-010/FR-011).

**Independent Test**: Render a section whose `type` is schema-registered but has no component → renders nothing + dev warning, siblings render. A section that throws at render → contained, siblings render.

### Tests for User Story 5 ⚠️

- [ ] T016 [P] [US5] Missing-component test in `sites/core/components/render/__tests__/fallback.spec.ts` — render `[hero, ghost, services]` where `ghost` has a schema type but NO component; assert nothing visible for `ghost`, a dev-only warning naming `ghost` + index is emitted, and `hero`/`services` still render; no throw (R6, FR-010/FR-011, research D4)
- [ ] T017 [P] [US5] Error-isolation test in the same spec — register a `boom` stub that throws on render; render `[hero, boom, services]`; assert `boom` is contained (degrades like missing component) and `hero`/`services` still render (R6, FR-011, research D5, SC-006)

### Implementation for User Story 5

- [ ] T018 [US5] Add fallback handling to `sites/core/components/render/DynamicSection.vue` — when `!resolved`, render nothing and emit a dev-only `console.warn` (suppressed in production) naming `type` + a provided `index`; wrap the resolved component in an `onErrorCaptured` boundary returning `false` so a section throw is contained and degrades to the same fallback (research D4/D5, R6)
- [ ] T019 [US5] Pass the section's `index` from `SiteRenderer.vue` to `DynamicSection` (prop) so fallback warnings can identify the failing item by position (supports T016/T018 diagnostics)

**Checkpoint**: A missing component or a throwing section never crashes the page; siblings unaffected.

---

## Phase 8: User Story 6 - The renderer renders only validated configuration (Priority: P2)

**Goal**: Bind the render path to the Phase 3 validation gate — render only `validateWebsiteConfig(raw).data`; `SiteRenderer` trusts it and never re-validates (R8, FR-012/FR-013).

**Independent Test**: Run raw config through `validateWebsiteConfig` first; valid → `SiteRenderer` renders `result.data`; invalid → Phase 3 failure behavior, no broken page; `SiteRenderer` contains no re-validation.

### Tests for User Story 6 ⚠️

- [ ] T020 [P] [US6] Validated-input test in `sites/core/components/render/__tests__/validated-input.spec.ts` — feed raw config to `validateWebsiteConfig`; on `valid` mount `<SiteRenderer :config="result.data">` and assert it renders; on invalid assert `result.valid === false` and that nothing is rendered (no broken page); assert `SiteRenderer` source calls no validation itself (trusts the gate, R8/FR-012)

### Implementation for User Story 6

- [ ] T021 [US6] Document and lock the render-path entry contract in `sites/core/components/render/SiteRenderer.vue` (doc comment) — input MUST be a Phase-3-validated `WebsiteConfig`; the integration page calls `validateWebsiteConfig(raw)` and mounts `SiteRenderer` only with `result.data` when `result.valid`; `SiteRenderer` performs no internal validation (R8, FR-012/FR-013, research D7)

**Checkpoint**: Only Phase-3-validated config reaches the renderer; no duplicated/contradictory validation.

---

## Phase 9: User Story 7 - The theme applies across all rendered sections (Priority: P3)

**Goal**: Propagate the site-level `theme` (Phase 3 `ThemeConfig`) to every section via one provide/inject channel, no prop-drilling, reuse the Phase 3 theme model (R11, FR-015).

**Independent Test**: Provide a theme via `SiteRenderer`; confirm every rendered section can inject the same theme; change the theme value and confirm all sections see the new value with no section source edits.

### Tests for User Story 7 ⚠️

- [ ] T022 [P] [US7] Theme propagation test in `sites/core/composables/__tests__/use-site-theme.spec.ts` — render a `SiteRenderer` whose theme is `{ colors: { primary: '#abc' }, mode: 'dark' }` with two stubs that inject `useSiteTheme()`; assert both receive the same `ThemeConfig`; re-render with a changed theme and assert both reflect the new value (R11, FR-015, SC-009)

### Implementation for User Story 7

- [ ] T023 [US7] Create `sites/core/composables/useSiteTheme.ts` — an `InjectionKey<ThemeConfig>`; overloaded `useSiteTheme(theme)` (provide) and `useSiteTheme()` (inject, returns the provided `ThemeConfig`); reuse the Phase 3 `ThemeConfig` type, define no new theme model (research D6, R11)
- [ ] T024 [US7] Call `useSiteTheme(props.config.theme)` in `sites/core/components/render/SiteRenderer.vue` so the validated theme is provided to all rendered sections (R11, FR-015)

**Checkpoint**: One shared theme reaches every section; changing `theme` re-skins the whole site via data.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Edge-case proof, docs, and the end-to-end quickstart recipe.

- [ ] T025 [P] Empty-`sections` test in `sites/core/components/render/__tests__/edge-cases.spec.ts` — render a valid `WebsiteConfig` with `sections: []`; assert a valid empty page, no error, no section rendered (R9, FR-014)
- [ ] T026 [P] Empty-registry baseline test in the same spec — with both registries cleared, assert `sections: []` renders empty and that a non-empty list would already be rejected by `validateWebsiteConfig` (empty schema registry), so the renderer never sees an unmapped type in baseline (R13, FR-018)
- [ ] T027 [P] Update `sites/core/components/README.md` and `sites/core/composables/README.md` — document `SiteRenderer`, `DynamicSection`, the section component registry, and `useSiteTheme`, pointing to `contracts/renderer-contract.md` as the source of truth
- [ ] T028 [P] Extend the barrel/exports so the renderer surface is importable where intended — re-export `registerSectionComponent`, `resolveSectionComponent`, `registeredSectionComponents`, `clearSectionComponentRegistry` from `sites/core/components/sections/registry.ts` (and `useSiteTheme` from its module); confirm `~~/sites/core/...` import paths resolve under Nuxt 4
- [ ] T029 Execute the `quickstart.md` recipe end to end with a throwaway fixture section (register schema + component, author a `WebsiteConfig`, validate, render via `SiteRenderer`, inject theme) and confirm every conformance-check row (R1–R13) holds; remove the throwaway afterward (no concrete section ships)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — provides fixtures; BLOCKS all story tests.
- **User Stories (Phases 3–9)**: Depend on Foundational. Internal data dependency: **US3 (registry) → US2 (DynamicSection) → US1 (SiteRenderer)**; US4/US5/US6/US7 build on the DynamicSection/SiteRenderer pair.
- **Polish (Phase 10)**: Depends on the renderer + theme being complete (US1, US5, US7).

### User Story Dependencies

- **US3 (P1)**: After Foundational — no story deps (the registry is the base).
- **US2 (P1)**: After US3 — `DynamicSection` resolves from the registry.
- **US1 (P1)**: After US2 — `SiteRenderer` iterates `DynamicSection`. (US1+US2+US3 = MVP.)
- **US4 (P2)**: After US2 — verifies/locks `v-bind` slice isolation in `DynamicSection`.
- **US5 (P2)**: After US1/US2 — adds fallback + error boundary to `DynamicSection`, index from `SiteRenderer`.
- **US6 (P2)**: After US1 — binds the render path to the Phase 3 validation gate (doc/contract on `SiteRenderer`).
- **US7 (P3)**: After US1 — adds the theme channel and wires it in `SiteRenderer`.

### Within Each User Story

- Tests (where present) are written FIRST and FAIL before implementation (rendering-consistency, Constitution XI).
- Registry/composable modules before the components that consume them.
- Component implementation before integration wiring.

### Parallel Opportunities

- Setup: T002 + T003 in parallel (T004 edits `nuxt.config.ts`).
- Foundational: T006 parallel with T005.
- Each story's `[P]` test tasks run together (distinct spec files).
- US4 test (T014) can run in parallel with US5 tests once `DynamicSection` exists, but US5 *implementation* (T018) edits `DynamicSection.vue` — serialize edits to that file (T010 → T015 verify → T018 → T019).
- Polish: T025/T026/T027/T028 in parallel; T029 last.

⚠️ **Same-file serialization**: `DynamicSection.vue` is touched by T010 (create), T015 (verify), T018 (fallback/boundary), T019 reads its prop contract. `SiteRenderer.vue` is touched by T013 (create), T019 (index prop), T021 (doc), T024 (theme). Do NOT parallelize tasks editing the same file.

---

## Parallel Example: MVP P1 trio (US3 → US2 → US1)

```bash
# US3 (registry) — test then implement:
Task: "Registry test in sites/core/components/sections/__tests__/registry.spec.ts"   # T007
Task: "Create component registry in sites/core/components/sections/registry.ts"      # T008

# US2 (DynamicSection) — after US3:
Task: "DynamicSection dispatch test in .../render/__tests__/dynamic-section.spec.ts" # T009
Task: "Create sites/core/components/render/DynamicSection.vue"                        # T010

# US1 (SiteRenderer) — after US2:  (T011 + T012 in parallel — same spec, distinct cases)
Task: "SiteRenderer order test in .../render/__tests__/site-renderer.spec.ts"        # T011
Task: "Create sites/core/components/render/SiteRenderer.vue"                          # T013
```

---

## Implementation Strategy

### MVP First (P1 trio: US3 + US2 + US1)

1. Phase 1 Setup → Phase 2 Foundational (fixtures).
2. US3 registry → US2 DynamicSection → US1 SiteRenderer.
3. **STOP and VALIDATE**: render a multi-section `WebsiteConfig` in list order via the registry.
4. This is the working JSON-driven renderer — the "heart of scalability."

### Incremental Delivery

1. MVP (US3+US2+US1) → a page renders from data.
2. US4 (slice isolation) → US5 (safe degradation) → US6 (validated-input gate) → harden for real client data.
3. US7 (theme) → whole-site re-skin via data.
4. Polish → edge cases + quickstart end-to-end proof.

### Notes

- [P] = different files, no dependencies. Serialize all edits to `DynamicSection.vue` / `SiteRenderer.vue`.
- Phase 4 ships the **mechanism + empty component registry** — no concrete section, onboarding, or template.
- Phase 3 schemas (`sites/core/schemas/`) are imported, never modified.
- Commit after each task or logical group; stop at the MVP checkpoint to validate independently.
</content>
