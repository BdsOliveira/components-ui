# Implementation Plan: Dynamic Renderer (Phase 4)

**Branch**: `004-dynamic-renderer` | **Date**: 2026-06-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-dynamic-renderer/spec.md`

## Summary

Build the **dynamic renderer**: the runtime engine that turns a validated Phase 3 `WebsiteConfig`
into a live page. Two cooperating pieces in the neutral `core/` layer:

1. A **component registry** — one authoritative `type` → component map, the runtime sibling of the
   Phase 3 section *schema* registry (`section.ts`). A section `type` is fully supported only when it
   is both validatable (schema) and renderable (component).
2. A **dynamic section renderer** (`DynamicSection`) — one Vue component that receives a single
   section item, resolves the component for its `type` from the registry via Vue's
   `<component :is>`, passes that item's config slice as props, and renders it. Rendering a whole
   page is iterating it over `sections` in list order (a thin `SiteRenderer` wrapper).

The technical approach reuses what already exists: `validateWebsiteConfig` (Phase 3) is the input
gate, `WebsiteConfig`/`ThemeConfig` are the typed inputs, and Vue 3's built-in dynamic component is
the render primitive. **Phase 4 adds zero new runtime dependencies.**

Phase 4 ships the **mechanism + an (initially empty) component registry** — mirroring Phase 3, which
shipped the section schema registry empty. No concrete section components (Hero, Services, …),
onboarding intake, or niche templates are authored here; later phases only add registry entries. The
deliverable is correct, neutral, extensible rendering of whatever is registered, including the
defined behavior when the registry is empty and when a `type` is validatable but not yet renderable.

## Technical Context

**Language/Version**: TypeScript strict mode (Constitution Technology Constraints). Renderer is a
Vue 3 SFC set (`DynamicSection.vue`, `SiteRenderer.vue`) plus plain-TS registry/composable modules,
consumed by Nuxt 4.

**Primary Dependencies**: Nuxt 4 (Vue 3.5, Nitro) and **Zod 3.23** — both already present. Render
dispatch uses Vue's built-in `<component :is>` (no library). **Phase 4 adds zero new dependencies.**

**Storage**: N/A — input is a `WebsiteConfig` (JSON authored under `clients/*/config.json` in later
phases); the renderer holds no persistent state.

**Testing**: Phase 4 is the first phase where **rendering-consistency tests** (Constitution XI)
become enforceable end to end: render-order, per-section-slice isolation, unknown-type fallback,
per-section error isolation, empty-`sections` empty page, theme propagation. Tests use **fixture
sections** (throwaway block schemas + stub components registered in the test) — no production section
ships. Test runner (Vitest + `@vue/test-utils` / `@nuxt/test-utils`) is finalized at implement time;
the *criteria* are fixed by the contract here.

**Target Platform**: Nuxt SSR/SSG build. The renderer MUST render on the server (SSG-first,
Constitution IX) and add minimal client hydration JS — dispatch is a static map lookup, not a
runtime async import unless a section opts into lazy loading.

**Project Type**: Multi-client web platform (Nuxt) — runtime renderer phase.

**Performance Goals**: `type` → component resolution is an O(1) map lookup (mirrors the O(1)
discriminated-union dispatch). No per-section runtime validation (validation already happened, US6).
No measurable hydration regression for SSG pages.

**Constraints**: Renderer + registry MUST be business-neutral and live in `core/` (Constitution III,
FR-017). Input MUST be a Phase-3-validated `WebsiteConfig` (FR-012); the renderer never re-derives
or contradicts Phase 3 validation. The component registry is the single authoritative type→component
map (FR-003, FR-004) — no per-template/per-client forks. Ships empty (FR-018).

**Scale/Scope**: One `DynamicSection` renderer + one `SiteRenderer` iterator + one component
registry + one theme-propagation composable. Designed to scale to a growing catalog of section types
and hundreds of client sites with the renderer source unchanged (FR-007, FR-019).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Relevance | Status |
|-----------|-----------|--------|
| I. Modular & Composable Architecture First | One renderer composes any registered blocks; site = data rendered | PASS — page is assembled from registered blocks, never custom-coded (FR-001/006) |
| II. Layered System Design | Renderer is `core/` engine; templates/clients depend on it, not reverse | PASS — renderer in `core/`, consumes Phase 3 contract; no reverse deps (FR-017) |
| III. Core Engine Neutrality | Renderer + registry hold no client/niche content | PASS — FR-009/017 keep renderer business-neutral in `core/` |
| IV. JSON-Driven Rendering | A page is produced/changed by editing `WebsiteConfig` data only | PASS — FR-020; render path validates first (FR-012) then renders data |
| V. Reusable Component Philosophy | Each section gets only its config slice; content-driven, theme-aware | PASS — FR-008/009/015 enforce slice-prop isolation + theme propagation |
| VI. Niche-Based Template Strategy | One registry, one renderer reused by every template — no forks | PASS — FR-004/019 forbid per-template renderer/registry copies |
| VIII. Developer Experience Standards | Add a section = register schema + component; no renderer edits | PASS — FR-007; registration mirrors Phase 3, predictable single place |
| IX. Performance & Web Vitals | SSG-first, O(1) static dispatch, minimal hydration | PASS — map lookup, no per-render validation, server-rendered (Technical Context) |
| X. UX Consistency | One shared theme applied across all sections | PASS — FR-015 propagates one `theme` to every section |
| XI. Testing & Reliability | Rendering-consistency + isolation tests now enforceable | PASS — render-order/isolation/fallback/empty/theme suites defined (FR-002/010/011/014/015) |
| XIV. Anti-Pattern Prohibition | No per-type conditionals, no forks, no new deps | PASS — FR-005 forbids per-type branching; single registry; Vue built-in dispatch |
| XV. Long-Term Vision Alignment | Config-only page generation; precondition for AI authoring | PASS — FR-007/019/020 keep catalog growth and sites decoupled from renderer source |

**Result**: PASS — zero new runtime dependencies (Vue dynamic component is built-in), no unjustified
violations. Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/004-dynamic-renderer/
├── plan.md                    # This file (/speckit-plan command output)
├── research.md                # Phase 0 — decisions (dispatch, registry, key, fallback, theme, wiring)
├── data-model.md              # Phase 1 — renderer entities (registry, DynamicSection, render input)
├── quickstart.md              # Phase 1 — register a component + render a WebsiteConfig
├── contracts/
│   └── renderer-contract.md   # The dynamic-renderer contract (single source of truth)
├── checklists/
│   └── requirements.md        # Spec quality checklist (existing)
└── tasks.md                   # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

Phase 4 authors the renderer mechanism and its (empty) component registry in the existing neutral
`core/` layer. It consumes the Phase 3 schemas unchanged and authors no concrete sections.

```text
sites/core/
├── schemas/                        # (Phase 3) consumed unchanged
│   ├── website.ts                  #   WebsiteConfig type — renderer input shape
│   ├── validate-website.ts         #   validateWebsiteConfig — the render-path input gate
│   ├── section.ts                  #   schema registry — the registry mirrored by Phase 4
│   └── theme.ts                    #   ThemeConfig — propagated by the renderer
├── components/
│   ├── render/
│   │   ├── DynamicSection.vue      # (Phase 4) the dynamic section renderer (<component :is>)
│   │   └── SiteRenderer.vue        # (Phase 4) iterates DynamicSection over sections in order
│   └── sections/
│       ├── registry.ts             # (Phase 4) type→component map: registerSectionComponent,
│       │                           #   resolveSectionComponent, registeredSectionComponents, clear*
│       └── (concrete sections)     # NONE in Phase 4 — added in later phases (register here)
└── composables/
    └── useSiteTheme.ts             # (Phase 4) provide/inject WebsiteConfig.theme to all sections

nuxt.config.ts                      # (Phase 4) add `sites/core/components` to `components.dirs`
                                    #   so <SiteRenderer>/<DynamicSection> resolve (Decision 6)
```

**Structure Decision**: The dynamic-renderer contract is documented under
`specs/004-dynamic-renderer/contracts/` (authoritative source of truth); its code lives in the
existing `sites/core/components/` (renderer + section component registry) and
`sites/core/composables/` (theme propagation). No new top-level directories. The component registry
is the runtime sibling of `sites/core/schemas/section.ts`; concrete section components register into
**both** registries (schema + component) and are deferred to later phases.

## Complexity Tracking

> No Constitution Check violations. Phase 4 adds **zero** new runtime dependencies (Vue's
> `<component :is>` is built in) and introduces no anti-patterns — the single component registry is
> the one authoritative type→component map (FR-003/004), satisfying Principle XIV. Table
> intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
</content>
