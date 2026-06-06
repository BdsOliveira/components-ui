---
description: "Task list for Universal Block Pattern (Phase 2)"
---

# Tasks: Universal Block Pattern (Phase 2)

**Input**: Design documents from `/specs/002-block-pattern-standard/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/block-contract.md, contracts/conformance-checklist.md, quickstart.md

**Tests**: No test suites requested for Phase 2. Per plan.md, conformance is verified by the pass/fail checklist (FR-017); schema/rendering test suites become enforceable once concrete blocks exist (later phase). No test tasks are generated here.

**Scope note**: Phase 2 delivers the **standard + conformance checklist + the code-level contract primitives** (`BlockProps<T>` type, Zod base/variant/validation conventions). **No concrete blocks** (HeroSection, etc.) are committed. The contract docs already exist under `contracts/`; the tasks below land the primitives those docs reference and validate the whole thing end-to-end with the quickstart recipe.

**Organization**: Tasks grouped by user story for independent implementation and verification.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story the task serves (US1–US5)
- Exact file paths included in each description

## Path Conventions

- Contract primitives live in `sites/core/types/` (the `BlockProps<T>` shape, slot/variant type helpers) and `sites/core/schemas/` (Zod base conventions + validation), per plan.md Structure Decision. No new top-level directories.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the single new runtime dependency and confirm the mandated homes exist.

- [X] T001 Add **Zod** as a runtime dependency in `package.json` (`dependencies`), per Decision 1 / Complexity Tracking
- [X] T002 [P] Add `zod-to-json-schema` as a devDependency in `package.json` for JSON-Schema emission (FR-015, Decision 7)
- [X] T003 Run `npm install` and verify `zod` resolves (`node -e "require('zod')"`) at repo root
- [X] T004 [P] Verify the mandated directories exist (`sites/core/types/`, `sites/core/schemas/`, `sites/core/components/{sections,ui,layout}/`); they were created in Phase 1 — no new top-level dirs

**Checkpoint**: Zod available; contract primitives have a home.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Barrel entry points every story's primitives export through.

**⚠️ CRITICAL**: No user story primitive can be exported/consumed until these barrels exist.

- [X] T005 [P] Create the types barrel `sites/core/types/index.ts` (empty re-export hub for block-contract types)
- [X] T006 [P] Create the schemas barrel `sites/core/schemas/index.ts` (empty re-export hub for Zod conventions)

**Checkpoint**: Foundation ready — user story primitives can now be added and exported.

---

## Phase 3: User Story 1 - One canonical, JSON-driven block interface (Priority: P1) 🎯 MVP

**Goal**: Land the `BlockProps<T>` contract type that structurally enforces "exactly one `data` input, no scalar content props" (C1, FR-002/FR-003) for every future block.

**Independent Test**: Type-check a sample `defineProps<BlockProps<SomeConfig>>()` usage — it must accept exactly a single `data: SomeConfig` prop and reject scalar content props; the written contract dictates the same.

### Implementation for User Story 1

- [X] T007 [US1] Create the single-input contract type `BlockProps<TData> { data: TData }` in `sites/core/types/block-props.ts` (matches data-model.md "Shared type primitive")
- [X] T008 [US1] Re-export `BlockProps` from `sites/core/types/index.ts`
- [X] T009 [US1] Document the single-input rule + canonical `<HeroSection :data="config.hero" />` example (and the prohibited scalar-prop form) in `sites/core/types/README.md`, linking `contracts/block-contract.md` §C1

**Checkpoint**: `BlockProps<T>` usable; single-input contract is code-enforceable. MVP complete.

---

## Phase 4: User Story 2 - Typed, schema-backed configuration (Priority: P1)

**Goal**: Land the Zod conventions that make `data` strongly typed + schema-backed (C2), validated before render with safe fallback (C3), and self-documenting via JSON-Schema (FR-015).

**Independent Test**: Define a sample Zod block schema, derive its type with `z.infer`, run the validation helper on valid / missing / invalid / extra-key inputs — valid renders, the rest fall back safely (never throw), extra keys are stripped; JSON-Schema emits from the schema.

### Implementation for User Story 2

- [X] T010 [P] [US2] Create base block-config schema conventions in `sites/core/schemas/base.ts` (a `defineBlockSchema`/`z.object` helper establishing `z.infer` as the single source of truth, Decision 5)
- [X] T011 [P] [US2] Create the pre-render validation helper in `sites/core/schemas/validate.ts` using `safeParse` with the safe-fallback policy (apply defaults / degrade, never throw; strip unknown keys) per C3 / Decision 6 (FR-005, FR-013, FR-014)
- [X] T012 [US2] Create the JSON-Schema emission helper in `sites/core/schemas/json-schema.ts` wrapping `zod-to-json-schema` for self-documentation (FR-015, Decision 7)
- [X] T013 [US2] Re-export `base`, `validate`, `json-schema` from `sites/core/schemas/index.ts`
- [X] T014 [US2] Document the schema-as-source-of-truth + `z.infer` (never re-declare the type) convention and the validation/failure policy in `sites/core/schemas/README.md`, linking `contracts/block-contract.md` §C2–C3

**Checkpoint**: A block's `data` can be typed, schema-validated pre-render with safe failure, and self-documented. With US1, the core contract is code-backed.

---

## Phase 5: User Story 3 - Named, config-selected variants (Priority: P2)

**Goal**: Land the variant convention — a closed enum + exactly one explicit default, selected via `data.variant` (C4, FR-006/FR-007).

**Independent Test**: Build a sample schema with the variant helper; omitting `variant` yields the declared default, a valid name selects it config-only, an unknown name is schema-rejected → resolves to default via fallback (never an undefined state).

### Implementation for User Story 3

- [X] T015 [P] [US3] Create the variant schema helper in `sites/core/schemas/variant.ts` (`z.enum([...]).default(<default>)` factory enforcing closed set + exactly one explicit default), Decision 3
- [X] T016 [US3] Re-export the variant helper from `sites/core/schemas/index.ts`
- [X] T017 [US3] Document the `data.variant` selection rule (closed set, explicit default, config-only change, unknown→fallback) in `sites/core/schemas/README.md`, linking §C4

**Checkpoint**: Variants are declarable and config-selectable on top of the US1/US2 contract.

---

## Phase 6: User Story 4 - Optional named slots for controlled escape hatches (Priority: P2)

**Goal**: Land the slot convention — optional Vue named slots, additive, baseline renders with zero slots, slot-overrides-config precedence (C5, FR-008/FR-009, Decision 4).

**Independent Test**: Confirm the slot type/convention permits only optional named slots, the documented baseline requires full render without any slot, and slot↔config region precedence (slot overrides) is stated.

### Implementation for User Story 4

- [X] T018 [P] [US4] Create the slot typing/convention helper in `sites/core/types/slots.ts` (optional named-slot type aliases + region/precedence typing) per Decision 4
- [X] T019 [US4] Re-export slot types from `sites/core/types/index.ts`
- [X] T020 [US4] Document the optional-additive slot rule, the zero-slot baseline-render requirement, and slot-overrides-config precedence in `sites/core/types/README.md`, linking §C5

**Checkpoint**: Slots available as optional additive escape hatches; config remains the primary content path.

---

## Phase 7: User Story 5 - Independent, isolated blocks (Priority: P2)

**Goal**: Encode the independence/isolation guarantees (C6, FR-010/FR-011/FR-012) the contract demands and add a guard so blocks can't couple to siblings/global client state.

**Independent Test**: Confirm the documented rules forbid sibling/parent/order coupling, shared mutable global state, and client-specific hardcoded content / client identity from global state; the lint guard flags a forbidden global-client import inside a block.

### Implementation for User Story 5

- [X] T021 [P] [US5] Document the independence/isolation guarantees (no sibling/parent/order coupling, no shared mutable global state, no client-specific hardcoded content / client identity, predictable same-input→same-output) in `sites/core/components/README.md`, linking §C6
- [X] T022 [US5] Add an ESLint guard in the project ESLint config (`eslint.config.*`) forbidding imports of client identity / global client state from within `sites/core/components/**` blocks (`no-restricted-imports`), enforcing FR-010/FR-011

**Checkpoint**: Independence is documented and lint-guarded; all five stories are code/doc-backed.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Prove the primitives actually produce a conforming block and wire up references.

- [X] T023 [P] Author the quickstart.md HeroSection recipe against the real primitives in a throwaway scratch file (NOT committed under `components/`) and confirm it type-checks and compiles
- [X] T024 [P] Run the scratch block through `contracts/conformance-checklist.md` (K1–K23) and confirm ACCEPTED; record any primitive gap as a fix-up task
- [X] T025 [P] Update `sites/core/README.md` (or root pointer) to reference `contracts/block-contract.md` and `contracts/conformance-checklist.md` as the authoritative block standard
- [X] T026 Verify validation adds **no client hydration JS for SSG pages** (Constitution IX) — confirm validation helpers run at build/server time only (`nuxt build` output inspection)
- [X] T027 Delete the scratch HeroSection from T023 (Phase 2 commits no concrete blocks) and confirm `sites/core/components/{sections,ui,layout}/` remain block-free

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories (barrels must exist to export through).
- **User Stories (Phase 3–7)**: All depend on Foundational. US1 and US2 are both P1 and form the core; US3–US5 (P2) build on them.
- **Polish (Phase 8)**: Depends on all desired user stories (the conformance dry-run exercises every clause).

### User Story Dependencies

- **US1 (P1)**: After Foundational. No dependency on other stories. (Single-input type.)
- **US2 (P1)**: After Foundational. Independent of US1 in files, but together they are the core contract. (Schema/validation.)
- **US3 (P2)**: After Foundational. Conceptually layers on US2's schema (variant lives in the schema) but is an independent file; verifiable on its own.
- **US4 (P2)**: After Foundational. Independent of US1–US3; touches `types/` slot file + README.
- **US5 (P2)**: After Foundational. Independent; documentation + lint guard.

### Within Each User Story

- Create the primitive file → export it from the barrel → document it in the README.
- The barrel export (`index.ts`) edit is sequential within a story (same file), so non-`[P]` once another task in the same story also edits that barrel.

### Parallel Opportunities

- Setup: T002 and T004 run parallel to T001/T003.
- Foundational: T005 and T006 are parallel (different barrels).
- Across stories after Foundational: US1, US2, US4, US5 primitive-creation tasks (T007, T010/T011, T018, T021) touch different files and can run in parallel by different developers. US3's variant file (T015) is parallel too.
- Within US2: T010 and T011 are parallel (different files); T012 depends on the `zod-to-json-schema` dep.
- Note: tasks editing the same barrel (`types/index.ts`: T008, T019; `schemas/index.ts`: T013, T016) must serialize against each other.

---

## Parallel Example: After Foundational

```bash
# Different developers, different files — run the primitive-creation tasks together:
Task: "Create BlockProps<T> in sites/core/types/block-props.ts"          # T007 (US1)
Task: "Create base schema conventions in sites/core/schemas/base.ts"     # T010 (US2)
Task: "Create validation helper in sites/core/schemas/validate.ts"       # T011 (US2)
Task: "Create variant helper in sites/core/schemas/variant.ts"           # T015 (US3)
Task: "Create slot types in sites/core/types/slots.ts"                    # T018 (US4)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 — the P1 core)

1. Complete Phase 1: Setup (Zod available).
2. Complete Phase 2: Foundational (barrels).
3. Complete Phase 3 (US1) + Phase 4 (US2) — single-input type **and** schema/validation conventions.
4. **STOP and VALIDATE**: a block can declare `data: z.infer<schema>`, validate pre-render, fail safe. This is the irreducible contract.
5. Run the quickstart recipe (T023/T024) against just US1+US2 to confirm the core holds.

### Incremental Delivery

1. Setup + Foundational → primitives have a home.
2. US1 + US2 (P1) → core contract code-backed → validate with checklist (MVP).
3. US3 (variants) → config-selected treatments.
4. US4 (slots) → optional escape hatches.
5. US5 (independence) → guarantees documented + lint-guarded.
6. Polish → full conformance dry-run, SSG-weight check, scratch cleanup.

### Parallel Team Strategy

1. Team does Setup + Foundational together.
2. Then: Dev A → US1; Dev B → US2; Dev C → US4 + US5; variant (US3) folded into US2's owner since it lives in the schema layer.
3. Reconvene for Polish (conformance dry-run is a shared gate).

---

## Notes

- [P] = different files, no incomplete-task dependency.
- [Story] label maps each task to its user story for traceability against FR-001…FR-017.
- Phase 2 commits **no concrete blocks** — T023's HeroSection is a throwaway proof, deleted in T027.
- The contract docs (`block-contract.md`, `conformance-checklist.md`, `quickstart.md`) already exist; these tasks land the primitives they reference and prove conformance end-to-end.
- Commit after each task or logical group; stop at any checkpoint to validate independently.
