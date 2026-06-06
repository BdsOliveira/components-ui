# Implementation Plan: Central Website Schema (Phase 3)

**Branch**: `003-website-config-schema` | **Date**: 2026-06-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-website-config-schema/spec.md`

## Summary

Define the **central website schema**: one canonical `WebsiteConfig = { company, theme, sections }`
that represents an entire website as data. `company` holds business identity, `theme` holds visual
identity tokens, and `sections` is an **ordered list** of `Section` — a **closed discriminated
union** keyed by a `type` discriminator whose members each reuse a Phase 2 block schema for their
config slice. This one schema is the contract at every boundary: onboarding produces it, templates
consume/merge it, the renderer accepts only it — a JSON-driven headless mini-CMS.

Phase 2 fixed the shape of **one block**; Phase 3 fixes **how blocks compose into a whole site**.
The technical approach reuses the Phase 2 primitives already in `sites/core/schemas/` (Zod as the
source of truth, `z.infer` for types, `validateBlockConfig` for pre-render validation) — so **no
new runtime dependency** is added. New schema modules (`company`, `theme`, `section` registry,
`website`, whole-site `validate-website`) live in the neutral `core/` layer.

**No concrete sections or rendering engine are built here** (mirroring Phase 2, which authored the
contract but no concrete blocks). The deliverable is the schema mechanism, its whole-site
validation rules, and its single-registry extension procedure, plus the conformance documentation.

## Technical Context

**Language/Version**: TypeScript strict mode (Constitution Technology Constraints). Schema modules
are plain TS consumed by Vue 3 / Nuxt 4 at build/server time. No concrete section components or
renderer authored in Phase 3.

**Primary Dependencies**: Nuxt 4 (Vue 3, Nitro) and **Zod** — both already present from Phase 2.
`zod-to-json-schema` (already a devDependency) powers self-documentation. **Phase 3 adds zero new
dependencies.**

**Storage**: N/A — a `WebsiteConfig` is JSON authored under `clients/*/config.json` in later
phases; schemas are TypeScript modules under `sites/core/schemas/`.

**Testing**: Whole-site validation extends the Phase 2 per-block validation pipeline. Phase 3
defines the criteria (whole-`WebsiteConfig` validation, reject-on-invalid-section policy,
per-section diagnostics, backward-compatible registration); schema-validation and
rendering-consistency test suites (Constitution XI) become enforceable once concrete sections and
the renderer exist (later phases).

**Target Platform**: Nuxt SSR/SSG build. Whole-site validation runs at build/server time and MUST
NOT add client hydration JS for SSG paths (Constitution IX).

**Project Type**: Multi-client web platform (Nuxt) — schema-definition phase.

**Performance Goals**: Validation is build/server-time; discriminated-union dispatch is O(1) on the
`type` key. No per-render performance regression, no added client bundle for SSG.

**Constraints**: Schema MUST be business-neutral and live in `core/` (Constitution III, FR-021).
No concrete sections, no client data, no renderer, no runtime-behavior change in this phase. The
single-`WebsiteConfig` rule and the single section registry are fixed.

**Scale/Scope**: One whole-site schema (`WebsiteConfig`) composed of `CompanyConfig`, `ThemeConfig`,
and a registry-built `Section` union, plus a whole-site validation helper. Designed to scale to a
growing catalog of section types and hundreds of client sites without per-template forks.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Relevance | Status |
|-----------|-----------|--------|
| I. Modular & Composable Architecture First | Whole site = ordered composition of reusable blocks via `sections` | PASS — sites are assembled from registered blocks, never custom-coded (FR-001/004) |
| II. Layered System Design | Schema is the lingua franca across onboarding/templates/renderer layers | PASS — FR-017 makes one shape the contract at every boundary; no reverse deps |
| III. Core Engine Neutrality | Schema lives in `core/`, no client/niche content | PASS — FR-021 keeps `WebsiteConfig` business-neutral in `core/schemas/` |
| IV. JSON-Driven Rendering | One strongly-typed, schema-validated whole-site config | PASS — FR-002/010/011 define the JSON-driven whole-site contract |
| V. Reusable Component Philosophy | `Section` members reuse Phase 2 block schemas unchanged | PASS — flat member = `blockSchema.extend({type})`, no block redefinition |
| VI. Niche-Based Template Strategy | Templates order/default the same `sections` union, no forks | PASS — FR-017/018 forbid per-template alternative shapes |
| VIII. Developer Experience Standards | Typed, self-documenting whole-site shape (JSON-Schema emission) | PASS — FR-010/020 require typed, discoverable shapes |
| XI. Testing & Reliability | Whole-site validation extends per-block validation | PASS — FR-011…FR-015 define criteria; suites land with concrete sections |
| XIV. Anti-Pattern Prohibition | Single registry, no per-template forks, no new deps | PASS — Zod already adopted; FR-018 single authoritative registration |
| XV. Long-Term Vision Alignment | One schema enables config-only assembly + future AI authoring | PASS — self-documenting schema is the automation precondition (FR-020) |

**Result**: PASS — no new runtime dependency (Zod already present in Phase 2) and no unjustified
violations. Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/003-website-config-schema/
├── plan.md                         # This file (/speckit-plan command output)
├── research.md                     # Phase 0 — decisions (discriminator, flat shape, registry, policy)
├── data-model.md                   # Phase 1 — WebsiteConfig/Company/Theme/Section entities
├── quickstart.md                   # Phase 1 — register a section + author a WebsiteConfig as data
├── contracts/
│   └── website-schema-contract.md  # The whole-site schema contract (single source of truth)
├── checklists/
│   └── requirements.md             # Spec quality checklist (existing)
└── tasks.md                        # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

Phase 3 establishes where the whole-site schema lives; it authors the schema mechanism, not
concrete sections or the renderer. The mandated homes (created in the later implement phase) reuse
the existing Phase 2 primitives and add whole-site modules:

```text
sites/core/
├── schemas/
│   ├── base.ts             # (Phase 2) defineBlockSchema, BlockConfig — reused
│   ├── validate.ts         # (Phase 2) validateBlockConfig — reused by whole-site validation
│   ├── variant.ts          # (Phase 2) blockVariant — reused
│   ├── json-schema.ts      # (Phase 2) blockJsonSchema — reused for self-documentation
│   ├── company.ts          # (Phase 3) companySchema, CompanyConfig
│   ├── theme.ts            # (Phase 3) themeSchema, ThemeConfig
│   ├── section.ts          # (Phase 3) registry, defineSection, registerSection, buildSectionSchema, Section
│   ├── website.ts          # (Phase 3) websiteConfigSchema, WebsiteConfig
│   ├── validate-website.ts # (Phase 3) validateWebsiteConfig (whole-site, reject-on-invalid-section)
│   └── index.ts            # barrel — extended with the Phase 3 exports
├── types/                  # (Phase 2) BlockProps<T>, slot types — reused
└── components/
    └── sections/           # concrete sections register into the union — none authored in Phase 3
```

**Structure Decision**: The whole-site contract is documented under
`specs/003-website-config-schema/contracts/` (authoritative source of truth) and its code-level
modules are homed in the existing `sites/core/schemas/`. No new top-level directories. Concrete
sections under `sites/core/components/sections/` (each registering its `type` into the union) and
the renderer are deferred to later phases and measured against this contract.

## Complexity Tracking

> No Constitution Check violations. Phase 3 adds **zero** new runtime dependencies (Zod and
> `zod-to-json-schema` were already adopted in Phase 2) and introduces no anti-patterns — the
> single section registry is the one authoritative extension point (FR-018), satisfying Principle
> XIV rather than violating it. Table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
