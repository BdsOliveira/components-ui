# Implementation Plan: Core Structure (Phase 1)

**Branch**: `001-core-structure` | **Date**: 2026-06-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-core-structure/spec.md`

## Summary

Establish the canonical layered directory skeleton under `sites/` (six layers: `core`,
`templates`, `clients`, `onboarding`, `assets`, `scripts`) with `core/` broken into eight
areas and `core/components/` into three groups. Each mandated folder is self-documented
(responsibility, allowed/prohibited contents, dependency direction) and preserved in version
control even while empty. Phase 1 delivers structure and documentation only — no functional
components, templates, or client data, and no change to runtime behavior. The existing minimal
Nuxt entry point (`app/app.vue`) stays functional; wiring `sites/` into Nuxt's resolution is
deferred to a later phase.

## Technical Context

**Language/Version**: TypeScript (strict mode), as mandated by Constitution Technology Constraints. No code authored in Phase 1.

**Primary Dependencies**: Nuxt 4 (Vue 3, Nitro) — already present; not modified in this phase.

**Storage**: N/A (filesystem directory layout only)

**Testing**: Structural verification — presence of mandated folders, docs, and keep-files. No unit/integration tests in Phase 1.

**Target Platform**: Repository working tree (developer machines + CI clone)

**Project Type**: Multi-client web platform (Nuxt) — scaffolding phase

**Performance Goals**: N/A for Phase 1 (no runtime). Contributor navigation target: locate any concern in <30s (SC-005).

**Constraints**: Must not break existing Nuxt entry point; must not introduce runtime dependencies; empty folders must survive clone.

**Scale/Scope**: 6 layers, 8 core areas, 3 component groups = 17 mandated directories, each with documentation.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Relevance | Status |
|-----------|-----------|--------|
| II. Layered System Design | This feature *is* the canonical layered structure | PASS — directly implements |
| III. Core Engine Neutrality | `core/` docs declare business-neutrality | PASS — enforced via per-folder docs (FR-006) |
| VIII. Developer Experience Standards | Clear folder organization, predictable structure | PASS — single source of truth, one home per concern (FR-010/011) |
| XII. Multi-Client Scalability | `clients/` per-client isolation | PASS — `clients/` layer documented for isolated client dirs |
| XIV. Anti-Pattern Prohibition | No coupling, no overengineering | PASS — scaffolding only, no abstractions introduced |
| XV. Long-Term Vision Alignment | Foundation for SaaS-scale assembly engine | PASS — layout matches the operating-system trajectory |

**Result**: PASS — no violations. Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/001-core-structure/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── structure-contract.md
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify)
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
sites/
├── core/                       # technical engine — business-neutral, reusable
│   ├── components/
│   │   ├── sections/           # page sections (Hero, Services, FAQ, CTA, …)
│   │   ├── ui/                 # atomic UI primitives (Button, Input, Card, …)
│   │   └── layout/             # structural layout (Header, Footer, Container, …)
│   ├── composables/            # reusable Vue composables
│   ├── theme/                  # design tokens, theme system (dark/light)
│   ├── seo/                    # SEO meta utilities and helpers
│   ├── forms/                  # form building blocks and validation helpers
│   ├── types/                  # shared TypeScript types
│   ├── utils/                  # pure utility functions / data transformers
│   └── schemas/                # versioned config schemas (source of truth for props)
├── templates/                  # niche-specific orchestrations of core sections
├── clients/                    # per-client config.json + assets + domain config
├── onboarding/                 # onboarding form data and intake
├── assets/                     # shared and client assets
└── scripts/                    # automation / scaffolding / generators

app/                            # existing Nuxt entry point — unchanged in Phase 1
└── app.vue
```

Each mandated folder carries a `README.md` (responsibility, allowed/prohibited contents,
dependency direction) and a `.gitkeep` where it would otherwise be empty.

**Structure Decision**: Multi-layer platform layout rooted at `sites/`, per Constitution
Principle II, extended with `core/{types,utils,schemas}` and top-level `scripts/` from the
feature input. `app/` remains the Nuxt entry point; reconciling it with `sites/` (Nuxt layer
or `srcDir`/auto-import wiring) is explicitly deferred to a later phase to keep Phase 1
structural and non-breaking.

## Complexity Tracking

> No Constitution Check violations. Section intentionally empty.
