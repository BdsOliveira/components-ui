# Implementation Plan: Clinic Template

**Branch**: `006-clinic-template` | **Date**: 2026-06-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-clinic-template/spec.md`

## Summary

Deliver one strong clinic niche template assembled purely from the eight Phase 5 core blocks, with the three template concerns split into three files: **page structure/order** (`page.ts`), **content defaults** (`defaults.json`), and **visual identity** (`theme.ts`). `page.ts` is the composition root: it imports the JSON defaults and the theme, fixes the clinic section order (`hero → services → testimonials → faq → contact → footer`), and assembles them into a validated `WebsiteConfig` exported as `clinicSite`. A small `createClinicSite(overrides)` factory keeps the same structure reusable across many clinics (content/theme overrides only). This replaces the Phase 5 single-file `sites/templates/clinic/config.ts`. No new blocks, schemas, renderer changes, or layout logic — pure orchestration (Constitution VI).

## Technical Context

**Language/Version**: TypeScript (strict mode), Vue 3 / Nuxt 4 (Nitro)

**Primary Dependencies**: existing `sites/core` engine only — `WebsiteConfig`/`themeSchema`/`companySchema`, `validateWebsiteConfig`, the eight registered block schemas + section components, `SiteRenderer`. No new runtime dependencies.

**Storage**: N/A — static config artifacts (`defaults.json`, `theme.ts`, `page.ts`)

**Testing**: Vitest + `@vue/test-utils` (mirrors `sites/templates/__tests__/verticals.spec.ts`)

**Target Platform**: SSG-first web (Nuxt), browsers

**Project Type**: Web app — multi-client website engine; this feature lives in the `templates/` layer

**Performance Goals**: inherits core block baseline (Constitution IX, SSG, minimal hydration); template adds no runtime cost beyond object assembly at module load

**Constraints**: template MUST only organize sections, fix order, and supply defaults (no new blocks/layouts/business logic, FR-001); produced site MUST pass `validateWebsiteConfig` (FR-006); concerns separated so each is independently editable (FR-005)

**Scale/Scope**: one niche (clinic), 6 sections, 3 source files + 1 test; reusable across ≥3 clinics by content/theme override (SC-004)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Modular & Composable | ✅ | Site assembled from existing blocks; zero from-scratch UI. |
| II. Layered System Design | ✅ | All work in `sites/templates/clinic/`; depends only on `core`, never reverse. |
| III. Core Engine Neutrality | ✅ | No edits to `core`; no business logic added to engine. |
| IV. JSON-Driven Rendering | ✅ | Content lives in `defaults.json`; assembled config validated before render. |
| V. Reusable Component Philosophy | ✅ | Consumes generic blocks via config only; no component changes. |
| VI. Niche-Based Template Strategy | ✅ | This IS the canonical niche template: orders sections + visual identity, no per-client custom layout. |
| VII. Speed-First | ✅ | Zero-override site in <5 min (SC-002); factory enables fast per-clinic reuse. |
| VIII. Developer Experience | ✅ | Strict TS, predictable file layout, clear naming. |
| IX. Performance & Web Vitals | ✅ | No new runtime; inherits block SSG/hydration baseline. |
| X. UX Consistency | ✅ | Clinic journey order + cohesive theme; CTA in hero → contact. |
| XI. Testing & Reliability | ✅ | Template-rendering + validation test (critical flow: template rendering). |
| XII. Multi-Client Scalability | ✅ | `createClinicSite(overrides)` keeps structure reusable across clinics; no client data baked in. |
| XIII. Deployment Discipline | ✅ | No deployment change. |
| XIV. Anti-Pattern Prohibition | ✅ | No monolithic template, no duplicated layout, no client-hardcoded logic (defaults = generic placeholder). |
| XV. Long-Term Vision | ✅ | Split structure/defaults/theme is the seed of automated/AI-driven template generation. |

**Result**: PASS — no violations. Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/006-clinic-template/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── clinic-template-contract.md   # Phase 1 output
├── checklists/
│   └── requirements.md  # from /speckit-specify
└── tasks.md             # /speckit-tasks (NOT created here)
```

### Source Code (repository root)

```text
sites/templates/clinic/
├── page.ts            # NEW — composition root: section ORDER + assembly; exports clinicSite + createClinicSite
├── defaults.json      # NEW — default CONTENT (company + per-section data slices)
├── theme.ts           # NEW — clinic ThemeConfig (clinicTheme)
└── config.ts          # REMOVED — superseded by page.ts (Phase 5 single-file sample)

sites/templates/__tests__/
├── verticals.spec.ts        # UPDATED — import clinic site from '../clinic/page' (was '../clinic/config')
└── clinic-template.spec.ts  # NEW — concern-separation + override tests (US1/US2/US3)
```

**Structure Decision**: Work confined to the `templates/` layer (Constitution II). `page.ts` becomes the clinic entry point (composition root), importing `defaults.json` (content) and `theme.ts` (identity) and emitting an ordered, validated `WebsiteConfig`. The Phase 5 `config.ts` is removed and its sole consumer (`verticals.spec.ts`) repointed to `page.ts`, so the directory holds exactly the three requested files plus tests.

## Complexity Tracking

> No Constitution violations. Section intentionally empty.
