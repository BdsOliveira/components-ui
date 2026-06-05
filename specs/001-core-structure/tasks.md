---
description: "Task list for Core Structure (Phase 1)"
---

# Tasks: Core Structure (Phase 1)

**Input**: Design documents from `/specs/001-core-structure/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/structure-contract.md, quickstart.md

**Tests**: NOT requested. Phase 1 success = structural completeness + navigability (SC-001..SC-005); verification is structural, not unit/integration. No test tasks generated.

**Organization**: Grouped by user story (US1 P1, US2 P2, US3 P3) for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files/dirs, no dependency on incomplete tasks)
- **[Story]**: Maps to a user story from spec.md (US1, US2, US3)
- All paths are repository-root relative.

## Canonical target (from contracts/structure-contract.md)

17 mandated directories, each carrying a `README.md`:

```text
sites/core, sites/core/components, sites/core/components/sections,
sites/core/components/ui, sites/core/components/layout, sites/core/composables,
sites/core/theme, sites/core/seo, sites/core/forms, sites/core/types,
sites/core/utils, sites/core/schemas, sites/templates, sites/clients,
sites/onboarding, sites/assets, sites/scripts
```

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm baseline and version-control hygiene before creating the structure.

- [X] T001 Capture non-breaking baseline: confirm `app/app.vue` exists and `npm run build` succeeds at repo root (record as the pre-change reference per FR-009 / research Decision 3)
- [X] T002 [P] Ensure repo-root `.gitignore` covers Node/Nuxt patterns (`node_modules/`, `dist/`, `.nuxt/`, `.output/`, `*.log`, `.env*`); append only missing patterns

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the parent that every layer attaches to.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 Create the top-level `sites/` directory at repository root (parent of all six layers)

**Checkpoint**: `sites/` exists — user stories can begin.

---

## Phase 3: User Story 1 - Establish the layered project skeleton (Priority: P1) 🎯 MVP

**Goal**: All 17 mandated directories exist under `sites/`, committable and present in a clean clone, with exactly one obvious home per concern.

**Independent Test**: `find sites -type d | sort` lists all 17 directories from `contracts/structure-contract.md`; a clean clone reproduces the full tree (each dir tracked via an interim `.gitkeep`).

### Implementation for User Story 1

> Each task: `mkdir -p <dir>` then add an interim `.gitkeep` so the empty dir is tracked. `.gitkeep` is superseded by the README in US2 (research Decision 2). All [P] — distinct paths, `mkdir -p` self-creates parents.

- [X] T004 [P] [US1] Create `sites/core/` with `sites/core/.gitkeep`
- [X] T005 [P] [US1] Create `sites/core/components/` with `sites/core/components/.gitkeep`
- [X] T006 [P] [US1] Create `sites/core/components/sections/` with `sites/core/components/sections/.gitkeep`
- [X] T007 [P] [US1] Create `sites/core/components/ui/` with `sites/core/components/ui/.gitkeep`
- [X] T008 [P] [US1] Create `sites/core/components/layout/` with `sites/core/components/layout/.gitkeep`
- [X] T009 [P] [US1] Create `sites/core/composables/` with `sites/core/composables/.gitkeep`
- [X] T010 [P] [US1] Create `sites/core/theme/` with `sites/core/theme/.gitkeep`
- [X] T011 [P] [US1] Create `sites/core/seo/` with `sites/core/seo/.gitkeep`
- [X] T012 [P] [US1] Create `sites/core/forms/` with `sites/core/forms/.gitkeep`
- [X] T013 [P] [US1] Create `sites/core/types/` with `sites/core/types/.gitkeep`
- [X] T014 [P] [US1] Create `sites/core/utils/` with `sites/core/utils/.gitkeep`
- [X] T015 [P] [US1] Create `sites/core/schemas/` with `sites/core/schemas/.gitkeep`
- [X] T016 [P] [US1] Create `sites/templates/` with `sites/templates/.gitkeep`
- [X] T017 [P] [US1] Create `sites/clients/` with `sites/clients/.gitkeep`
- [X] T018 [P] [US1] Create `sites/onboarding/` with `sites/onboarding/.gitkeep`
- [X] T019 [P] [US1] Create `sites/assets/` with `sites/assets/.gitkeep`
- [X] T020 [P] [US1] Create `sites/scripts/` with `sites/scripts/.gitkeep`

**Checkpoint**: All 17 directories present and tracked — skeleton independently verifiable (SC-002).

---

## Phase 4: User Story 2 - Each layer self-documents its responsibility (Priority: P2)

**Goal**: Every mandated folder carries a `README.md` stating responsibility, allowed, prohibited, and depends_on — boundaries readable at point-of-use.

**Independent Test**: Open any mandated folder; confirm its `README.md` states single responsibility, allowed contents, prohibited contents, and dependency direction. `core/README.md` declares business-neutrality.

> README content fields come from `data-model.md` (Layer / Core Area / Component Group tables) and the boundary rules in research Decision 5. Use the quickstart README template. All [P] — distinct files. Each requires the matching directory from US1.

### Implementation for User Story 2

- [X] T021 [P] [US2] Write `sites/core/README.md` — responsibility: business-neutral reusable engine; depends_on: nothing; prohibited: client/template-specific content + hardcoded business logic (FR-006)
- [X] T022 [P] [US2] Write `sites/core/components/README.md` — UI components grouped by role (sections/ui/layout); depends_on: core only
- [X] T023 [P] [US2] Write `sites/core/components/sections/README.md` — full page sections (Hero, Services, FAQ, CTA); not atomic UI, not layout chrome
- [X] T024 [P] [US2] Write `sites/core/components/ui/README.md` — atomic UI primitives (Button, Input, Card, Badge); not full sections
- [X] T025 [P] [US2] Write `sites/core/components/layout/README.md` — structural chrome (Header, Footer, Container); not sections
- [X] T026 [P] [US2] Write `sites/core/composables/README.md` — Vue `use*` composables (reactivity/lifecycle); not pure utils
- [X] T027 [P] [US2] Write `sites/core/theme/README.md` — design tokens + dark/light theme system; not component markup
- [X] T028 [P] [US2] Write `sites/core/seo/README.md` — SEO meta utilities/helpers; not page content
- [X] T029 [P] [US2] Write `sites/core/forms/README.md` — form blocks + validation helpers; not full sections
- [X] T030 [P] [US2] Write `sites/core/types/README.md` — shared TypeScript types only; not runtime schemas
- [X] T031 [P] [US2] Write `sites/core/utils/README.md` — pure framework-free functions/data transformers; no Vue reactivity
- [X] T032 [P] [US2] Write `sites/core/schemas/README.md` — versioned runtime-validatable config schemas; not plain types
- [X] T033 [P] [US2] Write `sites/templates/README.md` — niche orchestrations of core sections; depends_on: core; prohibited: duplicated logic, per-client custom layouts (FR-007)
- [X] T034 [P] [US2] Write `sites/clients/README.md` — isolated per-client config + assets + domain; depends_on: core, templates; prohibited: shared/global logic, cross-client coupling; nothing may depend on clients (FR-007)
- [X] T035 [P] [US2] Write `sites/onboarding/README.md` — intake form data + onboarding input; depends_on: core; prohibited: rendering logic
- [X] T036 [P] [US2] Write `sites/assets/README.md` — shared + client assets; depends_on: nothing; prohibited: code/logic
- [X] T037 [P] [US2] Write `sites/scripts/README.md` — automation, scaffolding, generators; depends_on: core; prohibited: client-specific one-offs

**Checkpoint**: 100% doc coverage (SC-003); boundaries documented (FR-005/006/007/010).

---

## Phase 5: User Story 3 - Empty layers are preserved in version control (Priority: P3)

**Goal**: Every mandated folder survives a clean clone, tracked via its README (the keep-file), with no redundant or missing keep-files.

**Independent Test**: On a clean clone, every mandated folder is present; `git ls-files sites` lists a tracked file under each of the 17 directories.

### Implementation for User Story 3

- [X] T038 [US3] Remove the now-redundant interim `.gitkeep` from every directory that received a `README.md` in US2 (README doubles as keep-file — research Decision 2); `git rm` the 17 `.gitkeep` files
- [X] T039 [US3] Safeguard: add `.gitkeep` to any mandated directory that has no `README.md` (none expected; keeps FR-008 invariant if a README was missed)
- [X] T040 [US3] Verify preservation: `git ls-files sites | sed 's#/[^/]*$##' | sort -u` covers all 17 directories; confirm no mandated directory is untracked (FR-008 / SC-002)

**Checkpoint**: Full structure reproducible from a clean clone with one tracked file per directory.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate the structure against contract and success criteria.

- [X] T041 [P] Run quickstart.md verification: `find sites -type d | sort` = 17 dirs; README presence check emits no `MISSING README` line
- [X] T042 [P] Walk the `contracts/structure-contract.md` "Verification checklist" and tick each item (6 layers, 8 core areas, 3 component groups, 4-field READMEs, no untracked dir)
- [X] T043 Confirm non-breaking + SC-004: `app/app.vue` still present, `npm run build` succeeds, and `git status` shows no files placed outside `sites/` (and the intended `.gitignore`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: After Setup — creates `sites/`, BLOCKS all user stories
- **US1 (Phase 3)**: After Foundational — creates the 17 directories
- **US2 (Phase 4)**: Per-folder READMEs depend on the matching directory existing (US1)
- **US3 (Phase 5)**: Depends on US2 (removes `.gitkeep` superseded by READMEs; verifies tracking)
- **Polish (Phase 6)**: After US1–US3 complete

### User Story Dependencies

- **US1 (P1)**: Independent — the MVP skeleton.
- **US2 (P2)**: Builds on US1 directories (documents them). Independently testable once READMEs exist.
- **US3 (P3)**: Safeguard on US1+US2 (preservation correctness). Independently testable via clean-clone / `git ls-files`.

### Within Each User Story

- US1: all directory tasks are parallel ([P]).
- US2: all README tasks are parallel ([P]); each needs its US1 directory.
- US3: T038 → T039 → T040 run in order (mutate then verify).

### Parallel Opportunities

- T002 runs alongside T001.
- All of T004–T020 (US1) can run together.
- All of T021–T037 (US2) can run together once their directories exist.
- T041 and T042 (Polish) can run together.

---

## Parallel Example: User Story 1

```bash
# Create all 17 directories with interim keep-files in parallel:
mkdir -p sites/core/components/{sections,ui,layout} \
  sites/core/{composables,theme,seo,forms,types,utils,schemas} \
  sites/templates sites/clients sites/onboarding sites/assets sites/scripts
find sites -type d -empty -exec touch {}/.gitkeep \;
```

## Parallel Example: User Story 2

```bash
# Author all 17 READMEs together (one per node), then drop interim keep-files:
Task: "Write sites/core/README.md (business-neutral engine, depends on nothing)"
Task: "Write sites/templates/README.md (niche orchestrations, depends on core)"
Task: "Write sites/clients/README.md (per-client isolation, depends on core+templates)"
# … remaining 14 READMEs …
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1: Setup → baseline captured.
2. Phase 2: Foundational → `sites/` exists.
3. Phase 3: US1 → 17 directories present and tracked.
4. **STOP and VALIDATE**: `find sites -type d` lists all 17; clean clone reproduces the tree.

### Incremental Delivery

1. Setup + Foundational → ready.
2. US1 → skeleton (MVP) → validate via clone.
3. US2 → self-documenting boundaries → validate any folder's README.
4. US3 → preservation guarantee → validate via `git ls-files` / clean clone.
5. Polish → contract + quickstart + non-breaking build confirmed.

---

## Notes

- No functional code, components, templates, or client data in Phase 1 — structure + docs only.
- README fields (responsibility/allowed/prohibited/depends_on) sourced from `data-model.md`; boundary disambiguation from research Decision 5.
- `core/` README must assert business-neutrality (FR-006); `clients/` must state nothing depends on it (FR-007).
- `app/app.vue` and Nuxt config are untouched (FR-009 = coexist); wiring `sites/` into Nuxt resolution is a later phase.
- Commit after each phase or logical group; the contract in `contracts/structure-contract.md` is the single source of truth (FR-011) for any future structural change.
