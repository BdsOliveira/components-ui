---
description: "Task list for Automatic Client Scaffold (Phase 8)"
---

# Tasks: Automatic Client Scaffold (Phase 8)

**Input**: Design documents from `/specs/008-new-client-scaffold/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: INCLUDED — the spec's acceptance scenarios and FR-014 (a discovered
starter test) explicitly require tests.

**Organization**: Grouped by user story for independent implementation/testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: US1 / US2 / US3 / US4 (Setup/Foundational/Polish have none)
- Exact file paths included

## Path Conventions

Layered Nuxt repo: `sites/{core,templates,clients,scripts}/`, `app/`, repo-root
configs. Tests live in `sites/**/__tests__/**/*.spec.ts` (vitest include).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Make the command runnable as `npm run new-client`.

- [X] T001 Add `tsx` devDependency and `"new-client": "tsx sites/scripts/new-client.ts"` script to `package.json` (research D1)
- [X] T002 [P] Create scaffold entry stub `sites/scripts/new-client.ts` (ESM, strict TS, `main()` skeleton, Node-builtin imports only) and the test dir `sites/scripts/__tests__/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: One-time template normalization + dynamic build-target wiring. Blocks
all stories — seeding needs the registry/defaults; previewing a non-default client
needs dynamic config/asset resolution.

**⚠️ CRITICAL**: No user story work begins until this phase is complete.

- [X] T003 Create template dispatch registry `sites/templates/registry.ts` exporting a map `template discriminator → { factory, defaults }` (research D5; data-model TemplateSource)
- [X] T004 [P] Normalize `lawyer` to factory shape: split `sites/templates/lawyer/config.ts` into `sites/templates/lawyer/defaults.json` (content+company), `sites/templates/lawyer/theme.ts`, and `sites/templates/lawyer/page.ts` exporting `createLawyerSite(overrides)` + `LawyerOverrides` (mirror `clinic/page.ts`)
- [X] T005 [P] Normalize `restaurant` to factory shape under `sites/templates/restaurant/` (defaults.json, theme.ts, page.ts → `createRestaurantSite`)
- [X] T006 [P] Normalize `school` to factory shape under `sites/templates/school/` (defaults.json, theme.ts, page.ts → `createSchoolSite`)
- [X] T007 [P] Normalize `local-business` to factory shape under `sites/templates/local-business/` (defaults.json, theme.ts, page.ts → `createLocalBusinessSite`)
- [X] T008 Register all five templates (`clinic` + the four normalized) in `sites/templates/registry.ts` (depends T003–T007)
- [X] T009 Rewrite `app/pages/index.vue` to load the client config via `import.meta.glob('~~/sites/clients/*/config.json', { eager: true })` keyed by `useRuntimeConfig().public.client`, and dispatch through `sites/templates/registry.ts` instead of the inline `{ clinic }` map (build-target-contract C-BT-2; research D4)
- [X] T010 Make `nuxt.config.ts` `CLIENT`-driven: compute `nitro.publicAssets` dir/baseURL from `sites/clients/${CLIENT}/images` and set `runtimeConfig.public.client = process.env.CLIENT` with default `clinica-saude` (build-target-contract C-BT-1/C-BT-3; research D3)
- [X] T011 Update `sites/templates/__tests__/verticals.spec.ts` to build the four normalized verticals via their factories, and add a regression test that `clinica-saude` validates with `CLIENT` unset (default) and set (FR-008, SC-004; build-target-contract C-BT-5)

**Checkpoint**: Registry + factories + dynamic selection live; existing clients unchanged.

---

## Phase 3: User Story 1 - One command scaffolds a complete client (Priority: P1) 🎯 MVP

**Goal**: `npm run new-client` writes a complete, conventionally-shaped client
directory from a template — no file created by hand.

**Independent Test**: Run the command for a new name against a template; inspect the
result — full client dir in the conventional shape, template/core unchanged.

### Tests for User Story 1 ⚠️

- [X] T012 [P] [US1] Test in `sites/scripts/__tests__/new-client.spec.ts`: running the scaffold (non-interactive flags) creates `sites/clients/<name>/` with `config.json`, `domain.txt`, `images/`, `README.md`, `__tests__/<name>.spec.ts`, matching the Phase-7 shape; and template/core source are byte-unchanged (US1 scenarios 1–3)

### Implementation for User Story 1

- [X] T013 [US1] Implement input layer in `sites/scripts/new-client.ts`: parse `--name/--template/--domain` (`--k v` and `--k=v`), prompt for missing via `node:readline/promises`, run non-interactively when all three present (FR-002; contract C-CLI-1..3)
- [X] T014 [US1] Implement input validation + derivation in `sites/scripts/new-client.ts`: slug rule, template-in-registry, hostname rule, and title-cased `displayName` from the slug (research D8/D9; data-model rules 1–3)
- [X] T015 [US1] Implement config seeding in `sites/scripts/new-client.ts`: build `config.json` from the registry's template defaults + theme, inject `company.name = displayName`, set `template` discriminator (FR-004; data-model ClientScaffold)
- [X] T016 [US1] Implement the client-dir writer in `sites/scripts/new-client.ts`: write `config.json`, `domain.txt`, a placeholder `images/` asset referenced by the seeded config, and a `README.md` in the Phase-7 shape (FR-003)
- [X] T017 [US1] Implement staging→rename atomicity + success report in `sites/scripts/new-client.ts`: build under `sites/clients/.new-client-tmp-<name>/`, then atomic rename; on success print where created + how to select/generate (FR-012/FR-013; research D6; contract C-CLI-4)

**Checkpoint**: A new client directory is produced by one command (MVP).

---

## Phase 4: User Story 2 - Scaffolded client is valid and renders, no manual fixes (Priority: P1)

**Goal**: The generated config validates and renders a real site for the new
client with zero manual edits.

**Independent Test**: Scaffold a client, run validation + build/preview without
editing — config passes, the site renders, the new client's test passes.

### Tests for User Story 2 ⚠️

- [X] T020 [P] [US2] Test in `sites/scripts/__tests__/new-client.spec.ts`: a freshly scaffolded client's emitted spec passes, `validateWebsiteConfig(create<X>Site(config))` is `valid: true`, and `CLIENT=<name>` renders via `SiteRenderer` (US2 scenarios 1–3; FR-005/FR-006)

### Implementation for User Story 2

- [X] T018 [US2] Implement starter-test emission in `sites/scripts/new-client.ts`: write `sites/clients/<name>/__tests__/<name>.spec.ts` modeled on `clinica-saude.spec.ts` (parse → build via the template factory → `validateWebsiteConfig` valid → identity/domain/image checks) so the suite discovers it (FR-014)
- [X] T019 [US2] Implement the validation gate in `sites/scripts/new-client.ts`: run `vitest run` scoped to the staged client spec; reject (and clean up) on non-zero before rename (research D7; FR-005)

**Checkpoint**: Scaffolded clients validate and render unedited.

---

## Phase 5: User Story 3 - Deploy-ready without breaking existing clients (Priority: P2)

**Goal**: The new client is selectable as the static-build target; its assets and
domain resolve from its own directory; existing clients build unchanged.

**Independent Test**: Scaffold a second client; generate each via `CLIENT=<name>`;
each resolves its own images/domain with no shared-wiring edit between runs.

### Tests for User Story 3 ⚠️

- [X] T021 [US3] Integration test in `sites/scripts/__tests__/new-client.spec.ts`: after scaffolding, `CLIENT=<name>` resolves the new client's `config.json`, image base path, and `domain.txt` from its own dir; `clinica-saude` still builds unchanged; no edit to `nuxt.config.ts`/`index.vue`/templates/core occurred during the scaffold run (US3 scenarios 1–3; FR-007/FR-008/FR-009; build-target-contract C-BT-5/C-BT-6)

**Checkpoint**: Multiple clients independently selectable and isolated.

---

## Phase 6: User Story 4 - Safe, guided, repeatable runs (Priority: P3)

**Goal**: Foreseeable mistakes are refused with a clear reason; the workspace is
left unchanged.

**Independent Test**: Trigger each guarded case; the command reports an actionable
reason and creates nothing.

### Tests for User Story 4 ⚠️

- [X] T024 [P] [US4] Tests in `sites/scripts/__tests__/new-client.spec.ts`: name collision (refuses, no overwrite), unknown template (lists available), invalid name (states rule), invalid/reused domain (surfaces conflict), and a forced mid-run failure leaves no staging/partial dir (US4 scenarios 1–4; SC-005; FR-010/FR-011/FR-012)

### Implementation for User Story 4

- [X] T022 [US4] Implement up-front guards in `sites/scripts/new-client.ts`: collision check on `sites/clients/<name>/`, unknown-template rejection that lists registry keys, invalid name/domain rejection with the rule, and domain-reuse scan over `sites/clients/*/domain.txt` (FR-010/FR-011; contract C-CLI-5)
- [X] T023 [US4] Implement failure cleanup in `sites/scripts/new-client.ts`: any error removes the staging dir and exits non-zero, leaving nothing behind (FR-012; research D6)

**Checkpoint**: All guardrails enforced; tool is safe for repeated use.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T025 [P] Update `sites/scripts/README.md` to document `new-client` (usage, flags, guards) and `CLIENT` build-target selection
- [X] T026 [P] Run the `quickstart.md` flow end-to-end (scaffold → validate → `CLIENT=<name> npm run generate`) and confirm SC-001 (<2 min) / SC-002 (zero manual edits)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies.
- **Foundational (Phase 2)**: depends on Setup. BLOCKS all user stories.
- **US1 (Phase 3)**: depends on Foundational (needs registry/defaults).
- **US2 (Phase 4)**: depends on US1 (scaffold must produce a client to validate/render).
- **US3 (Phase 5)**: depends on US1 (a scaffolded client) + Foundational wiring.
- **US4 (Phase 6)**: depends on US1 (guards wrap the write path).
- **Polish (Phase 7)**: depends on all targeted stories.

### Within-Story Notes

- Tests written first and expected to fail before implementation.
- US1: T013 → T014 → T015 → T016 → T017 (sequential — same file `new-client.ts`).
- US2: T018, T019 sequential (same file); T020 after both.
- US4: T022 → T023 (same file); T024 after.

### Parallel Opportunities

- T004–T007 (template normalization) — different template dirs, fully parallel.
- T012, T020, T021, T024 are in `new-client.spec.ts` (same file) — NOT parallel with each other; write incrementally per phase.
- T002 parallel with T001 review.
- T025, T026 parallel in Polish.

---

## Parallel Example: Phase 2 Foundational

```bash
# Normalize the four flat templates in parallel (distinct directories):
Task: "Normalize lawyer to factory shape in sites/templates/lawyer/"
Task: "Normalize restaurant to factory shape in sites/templates/restaurant/"
Task: "Normalize school to factory shape in sites/templates/school/"
Task: "Normalize local-business to factory shape in sites/templates/local-business/"
```

---

## Implementation Strategy

### MVP First (US1)

1. Phase 1 Setup → 2. Phase 2 Foundational → 3. Phase 3 US1 → STOP & validate: a
   complete client directory is produced by one command.

### Incremental Delivery

Foundational → US1 (write) → US2 (valid+renders) → US3 (selectable+isolated) →
US4 (guardrails) → Polish. Each story adds value without breaking prior ones.

---

## Notes

- The per-run command edits ONLY `sites/clients/<name>/` (FR-009); the shared
  wiring (`nuxt.config.ts`, `app/pages/index.vue`) and template normalization are
  one-time Foundational tasks, not per-run writes.
- No new runtime dependency — Node builtins for I/O/prompts; `tsx` is a devDep.
- Commit after each task or logical group; stop at any checkpoint to validate.
