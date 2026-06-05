# Phase 0 Research: Core Structure (Phase 1)

No `NEEDS CLARIFICATION` markers remained in the spec. The following decisions resolve the
small set of structural choices Phase 1 implies. All are derived from the Constitution and
Nuxt 4 conventions.

## Decision 1 — Empty-folder preservation

- **Decision**: Place a `.gitkeep` file in every mandated folder that would otherwise be empty.
- **Rationale**: Git does not track empty directories. `.gitkeep` is the de-facto convention
  for forcing an empty folder into version control, satisfying FR-008 / SC-002 (full structure
  present in a clean clone).
- **Alternatives considered**:
  - `.gitignore` with negation rules — more complex, easy to misconfigure, no benefit here.
  - Seeding folders with placeholder code — violates "structure only" scope and risks
    misleading contributors.

## Decision 2 — Per-folder self-documentation

- **Decision**: Each mandated folder carries a `README.md` stating: single responsibility,
  allowed contents, prohibited contents, and dependency direction. The `README.md` doubles as
  the keep-file, so folders with a `README.md` do not also need `.gitkeep`.
- **Rationale**: Satisfies FR-005/006/007 and SC-003 (100% doc coverage). Co-locating docs with
  the folder means documentation travels with the structure and is seen at point-of-use.
- **Alternatives considered**:
  - A single central `STRUCTURE.md` — single source is good for the contract, but does not put
    guidance at point-of-use; contributors browsing a folder would not see it. Use both: central
    contract (Decision 4) + per-folder READMEs.
  - Code comments / header files — not discoverable when navigating directories.

## Decision 3 — Reconciling the existing `app/` entry point

- **Decision**: Leave `app/app.vue` and all current Nuxt/tooling config unchanged in Phase 1.
  `sites/` is created alongside `app/` and is not yet wired into Nuxt resolution.
- **Rationale**: Phase 1 is explicitly structural and non-breaking (FR-009 disposition =
  "coexist"). Wiring `core/` for auto-import / Nuxt layers / `srcDir` changes runtime behavior
  and belongs to a later phase. Keeping the entry point intact guarantees the app still builds.
- **Alternatives considered**:
  - Move `app/` under `sites/` now — breaks Nuxt's default resolution and exceeds Phase 1 scope.
  - Configure `sites/core` as a Nuxt layer now — premature; no components exist to auto-import yet.

## Decision 4 — Canonical structure as a recorded contract

- **Decision**: Record the canonical layout once in `contracts/structure-contract.md` as the
  single source of truth later phases reference (FR-011).
- **Rationale**: Gives `/speckit-tasks` and later features a stable, machine-and-human readable
  definition of "where things go", and a checklist to verify structural completeness.
- **Alternatives considered**:
  - Rely only on per-folder READMEs — no single authoritative list to diff against; harder to
    detect a missing layer in review.

## Decision 5 — Disambiguating overlapping areas

- **Decision**: Document explicit boundaries for areas that could overlap, in their READMEs:
  - `utils/` = pure, framework-free functions and data transformers (no Vue reactivity).
  - `composables/` = Vue composables using reactivity / lifecycle (`use*` functions).
  - `types/` = shared TypeScript types only; `schemas/` = runtime-validatable config schemas.
  - `components/ui/` = atomic primitives; `components/sections/` = full page sections;
    `components/layout/` = structural chrome (header/footer/container).
- **Rationale**: Satisfies FR-010 and the spec edge case on ambiguous destinations; makes
  SC-001 (correct folder on first attempt) achievable.

## Summary

All structural decisions resolved with no open clarifications. Phase 1 = create 17 mandated
directories, each with a `README.md`, plus `.gitkeep` only where a folder has no README;
record the canonical contract; leave the Nuxt app untouched.
