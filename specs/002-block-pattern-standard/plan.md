# Implementation Plan: Universal Block Pattern (Phase 2)

**Branch**: `002-block-pattern-standard` | **Date**: 2026-06-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-block-pattern-standard/spec.md`

## Summary

Define the **universal block contract**: the single canonical interface every reusable block
(`sections`, `ui`, `layout`) MUST satisfy. Each block receives exactly one structured data input
(`:data="config.<slice>"`), renders entirely from it, declares a typed + schema-backed config
shape, exposes a closed set of config-selected variants with an explicit default, permits optional
additive named slots, and stays fully independent (no sibling/parent/global-state coupling, no
client-specific hardcoded content).

Phase 2 delivers the **standard and a conformance checklist only** — no concrete blocks
(HeroSection, etc.) are authored here. The technical approach: adopt **Zod** as the schema source
of truth, derive TypeScript types via `z.infer`, validate each config slice before render with a
safe-fallback policy, and record the whole contract as authoritative documentation plus a pass/fail
conformance checklist encoding FR-001–FR-016. Schema lives in `sites/core/schemas/`, the shared
block-contract types in `sites/core/types/`.

## Technical Context

**Language/Version**: TypeScript strict mode (Constitution Technology Constraints). Vue 3 SFC
authoring model for blocks. No concrete block code authored in Phase 2 — the contract is documented
and exemplified.

**Primary Dependencies**: Nuxt 4 (Vue 3, Nitro) — already present. **Zod** (new runtime dependency)
as the schema/validation library and the type source of truth — justified in Complexity Tracking
against Principle XIV.

**Storage**: N/A — config slices are JSON authored under `clients/*/config.json` (later phases);
schemas are TypeScript modules under `sites/core/schemas/`.

**Testing**: Conformance is verified by the Phase 2 checklist (pass/fail against FR-001–FR-016).
Schema validation tests and rendering-consistency tests (Constitution XI) become enforceable once
concrete blocks exist; Phase 2 defines the criteria, not the test suites.

**Target Platform**: Nuxt SSR/SSG build (validation runs at build/server time, not shipped to the
client for SSG paths).

**Project Type**: Multi-client web platform (Nuxt) — standards-definition phase.

**Performance Goals**: Validation cost is build/server-time and MUST NOT add client hydration JS for
SSG pages (Constitution IX). No per-render performance regression introduced by the contract.

**Constraints**: One new runtime dependency only (Zod). Contract MUST be business-neutral and live
in `core/` (Constitution III). No concrete blocks, no client data, no change to runtime behavior in
this phase.

**Scale/Scope**: One universal contract document, one conformance checklist, supporting type +
schema primitives, applied uniformly across 3 component groups (`sections`, `ui`, `layout`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Relevance | Status |
|-----------|-----------|--------|
| I. Modular & Composable Architecture First | Contract guarantees isolated, configurable, independent blocks | PASS — independence + single-input rule are contract clauses (FR-002, FR-010) |
| III. Core Engine Neutrality | Contract lives in `core/`, forbids client-specific hardcoded content | PASS — FR-011 prohibits client coupling; contract is business-neutral |
| IV. JSON-Driven Rendering | Single typed data input, schema-validated before render | PASS — FR-002/004/005 are the JSON-driven contract |
| V. Reusable Component Philosophy | Generic, predictable, theme-aware, accessible APIs | PASS — FR-016 inherits responsive/a11y/theme baselines |
| VIII. Developer Experience Standards | Typed shapes, self-documenting blocks, predictable API | PASS — FR-004/015 require declared types + self-documentation |
| XI. Testing & Reliability | Type-safe contracts, validation, rendering consistency | PASS — contract defines the criteria; checklist is the gate (FR-017) |
| XIV. Anti-Pattern Prohibition | No coupling, no per-client forks, minimal deps | PARTIAL — adds one dependency (Zod); justified in Complexity Tracking |
| XV. Long-Term Vision Alignment | Fixed contract enables config-only assembly at scale | PASS — single inherited contract is the assembly precondition |

**Result**: PASS — the single dependency (Zod) is recorded in Complexity Tracking with
justification; no unjustified violations.

## Project Structure

### Documentation (this feature)

```text
specs/002-block-pattern-standard/
├── plan.md                    # This file (/speckit-plan command output)
├── research.md                # Phase 0 output — decisions (schema lib, input/variant/slot model)
├── data-model.md              # Phase 1 output — contract entities
├── quickstart.md              # Phase 1 output — author a conforming block from the contract
├── contracts/
│   ├── block-contract.md      # The universal block contract (single source of truth)
│   └── conformance-checklist.md  # Pass/fail instrument (FR-017)
├── checklists/
│   └── requirements.md        # Spec quality checklist (existing)
└── tasks.md                   # Phase 3 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

Phase 2 establishes where the contract's primitives live; it authors the standard, not concrete
blocks. The mandated homes (created in Phase 1) are:

```text
sites/core/
├── types/        # BlockProps<T> contract type, variant/slot type helpers (shared block types)
├── schemas/      # Zod schema conventions + base block-config schema primitives (source of truth)
└── components/
    ├── sections/ # future blocks conform to the contract (none authored in Phase 2)
    ├── ui/       #   "
    └── layout/   #   "
```

**Structure Decision**: The universal contract is documented under
`specs/002-block-pattern-standard/contracts/` (authoritative source of truth) and its code-level
primitives are homed in the existing `sites/core/types/` (the `BlockProps<T>` shape) and
`sites/core/schemas/` (Zod base conventions). No new top-level directories. Concrete blocks under
`sites/core/components/{sections,ui,layout}/` are deferred to a later phase and will be measured
against the conformance checklist.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| New runtime dependency: **Zod** | Constitution IV mandates strongly-typed, schema-validated config as the source of truth for props; FR-004/005 require a declared schema and pre-render validation with type inference and self-documentation (FR-015). | **Hand-rolled validators**: rejected — re-implements a solved problem, more code to maintain, no type inference, contradicts DX (VIII). **TS types only (no runtime schema)**: rejected — types vanish at runtime, cannot validate JSON config before render (fails FR-005, IV). **Valibot**: viable lighter alternative, kept as documented fallback in research.md; Zod chosen for ecosystem maturity, `z.infer` DX, and JSON-Schema emission for editor self-documentation. |
