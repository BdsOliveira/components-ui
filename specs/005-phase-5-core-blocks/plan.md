# Implementation Plan: Core Block Set (Phase 5)

**Branch**: `005-phase-5-core-blocks` | **Date**: 2026-06-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-phase-5-core-blocks/spec.md`

## Summary

Build the **first eight concrete blocks** — Hero, About, Services, CTA, Testimonials, FAQ, Contact,
Footer — that turn the empty section registries (shipped empty by Phases 3 and 4) into a usable kit
capable of assembling complete single-page sites for clinics, lawyers, restaurants, schools, and
local businesses (~80% of the target market) from configuration alone.

Each block is authored once in the neutral `core/` layer as: a **Zod schema** (`sites/core/schemas/
<block>.ts`, the source of truth for its `data` type), a **Vue SFC**
(`sites/core/components/sections/<Block>Section.vue`), and a single **dual-registration**
(`registerSection` + `registerSectionComponent`). A `register.ts` module plus a Nuxt plugin populate
both registries at app boot. Every block conforms to the unchanged Phase 2 block contract (§C1–C7):
one `data` prop, schema-derived type, closed config-selected variants with one default, optional
additive content that degrades gracefully, client-neutral, responsive/accessible/theme-aware.

The approach reuses everything prior phases built — `defineBlockSchema`/`blockVariant`/`BlockProps`
(Phase 2), `companySchema`/`themeSchema`/`defineSection`/`validateWebsiteConfig` (Phase 3), the
component registry + `DynamicSection`/`SiteRenderer` + `useSiteTheme` (Phase 4). **Phase 5 adds zero
new runtime dependencies.**

Two small, user-approved amendments to the Phase 4 renderer are required to let §C1-conforming blocks
work: (1) bind the slice as a single prop `:data="section"` instead of flat-spread `v-bind="section"`
(Decision 1), and (2) add a `useSiteCompany()` site-context channel mirroring `useSiteTheme()` so
Contact/Footer source cross-cutting identity from site level without duplication (Decision 2). The
Phase 4 renderer tests/fixtures are updated accordingly.

## Technical Context

**Language/Version**: TypeScript strict mode (Constitution Technology Constraints). Blocks are Vue 3
SFCs; schemas are plain-TS Zod modules; consumed by Nuxt 4.

**Primary Dependencies**: Nuxt 4 (Vue 3.5, Nitro), **Zod 3.23**, `@nuxtjs/tailwindcss`, `@nuxt/image`,
`@nuxt/icon`, `@nuxt/fonts` — all already present. **Phase 5 adds zero new dependencies.**

**Storage**: N/A — block content is the `WebsiteConfig` slice (JSON/TS config authored under
`sites/templates/<niche>/` here, `sites/clients/*/config.json` in later phases). Blocks hold no state.

**Testing**: Vitest + `@vue/test-utils` + happy-dom (existing `vitest.config.ts`, `~~`/`~` aliases).
Per block: schema tests (defaults, required-missing rejected, unknown variant → default, empty list)
and render tests (minimal vs full content, each variant, slice isolation, theme-awareness). Plus a
five-vertical integration test rendering each sample config through `SiteRenderer`. Updated Phase 4
renderer tests/fixtures (read `props.data`, exercise `useSiteCompany`).

**Target Platform**: Nuxt SSR/SSG build. Blocks render server-side (SSG-first, Constitution IX) with
minimal hydration; dispatch stays the O(1) registry lookup from Phase 4.

**Project Type**: Multi-client web platform (Nuxt) — first concrete-block phase.

**Performance Goals**: No renderer dispatch regression (still O(1) map lookup). Blocks prioritize
Lighthouse/Web Vitals (Constitution IX): optimized images via `@nuxt/image`, minimal hydration JS.

**Constraints**: All blocks live in neutral `core/` and contain no client/niche hardcoded content
(Constitution III, FR-005); exactly eight blocks, no more (FR-001); each conforms to block-contract
§C1–C7 and `block-set-contract.md` B1–B8; cross-cutting identity sourced once from site level
(FR-011); validation-before-render is Phase 3's, not re-done per block.

**Scale/Scope**: 8 schemas + 8 SFCs + 1 `register.ts` + 1 Nuxt plugin + 1 `useSiteCompany`
composable + 2 renderer amendments + 5 sample vertical configs + tests. Designed so a sixth+ block
later is "add files + one registration", no renderer edits.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Relevance | Status |
|-----------|-----------|--------|
| I. Modular & Composable Architecture First | Sites assembled from the eight reusable blocks, never custom-coded | PASS — FR-004/FR-014; config-only assembly (SC-003) |
| II. Layered System Design | Blocks in `core/`; sample sites in `templates/`; no reverse deps | PASS — schemas/SFCs in `core/`, niche configs in `templates/` |
| III. Core Engine Neutrality | Blocks hold no client/niche content; identity from site level | PASS — FR-005/FR-011; B6 |
| IV. JSON-Driven Rendering | Each block renders solely from its validated config slice | PASS — FR-002/FR-010; B2/B3 |
| V. Reusable Component Philosophy | One `data` prop, generic, content-driven, theme-aware, accessible | PASS — block-contract §C1–C7; B2/B8 |
| VI. Niche-Based Template Strategy | Five verticals are orchestrations of the same blocks, no custom layouts | PASS — Decision 7; sample configs in `templates/<niche>/` |
| VII. Speed-First Operations | Adding a block = files + one registration; no renderer edits thereafter | PASS — Decision 3; B7 |
| VIII. Developer Experience Standards | Schema-first, strict TS, single registration site, predictable layout | PASS — Decision 3; schema = source of truth |
| IX. Performance & Web Vitals | SSG-first, `@nuxt/image`, minimal hydration | PASS — Technical Context; B8 |
| X. UX Consistency | Shared variant/spacing vocabulary, conversion-oriented CTAs, theme tokens | PASS — Decision 4/6; B8 |
| XI. Testing & Reliability | Component + schema-validation + rendering-consistency tests | PASS — Decision 8; per-block + five-vertical tests |
| XII. Multi-Client Scalability | Same eight blocks serve every client; sample sites isolated per niche | PASS — Decision 7 |
| XIII. Deployment Discipline | No deploy/runtime change; pure additive blocks + plugin | PASS — no infra change |
| XIV. Anti-Pattern Prohibition | No tight coupling, no duplicated layouts, no per-client logic | PASS — B6/B7; blocks independent (§C6) |
| XV. Long-Term Vision Alignment | The kit is the precondition for onboarding/AI-driven site generation | PASS — bounded set, schema-discoverable |

**Gate result**: PASS. Two Phase 4 renderer amendments (Decisions 1–2) are corrections that bring
the renderer into line with the constitutional block contract (§C1) and FR-011; they are recorded in
Complexity Tracking below as scoped, justified deviations from the spec's "don't modify foundations"
assumption (user-approved).

## Project Structure

### Documentation (this feature)

```text
specs/005-phase-5-core-blocks/
├── plan.md              # This file
├── research.md          # Phase 0 — 8 decisions
├── data-model.md        # Phase 1 — 8 block schemas + context channels
├── quickstart.md        # Phase 1 — author/register/assemble guide
├── contracts/
│   └── block-set-contract.md   # Phase 1 — B1–B8 public surface
├── checklists/
│   └── requirements.md  # spec quality checklist (from /speckit-specify)
└── tasks.md             # Phase 2 — created by /speckit-tasks (NOT here)
```

### Source Code (repository root)

```text
sites/core/schemas/
├── hero.ts about.ts services.ts cta.ts                 # NEW: 8 block schemas
├── testimonials.ts faq.ts contact.ts footer.ts         #   (source of truth, z.infer types)
└── index.ts                                            # EDIT: re-export the 8 schemas/types

sites/core/components/sections/
├── HeroSection.vue AboutSection.vue ServicesSection.vue CtaSection.vue        # NEW: 8 SFCs
├── TestimonialsSection.vue FaqSection.vue ContactSection.vue FooterSection.vue
├── register.ts                                         # NEW: 8 dual-registrations
├── registry.ts                                         # (exists, unchanged)
├── index.ts                                            # EDIT: export register entrypoint
└── __tests__/                                          # NEW: per-block schema + render specs

sites/core/composables/
└── useSiteCompany.ts                                   # NEW: company provide/inject (Decision 2)

sites/core/components/render/
├── DynamicSection.vue                                  # EDIT: v-bind="section" -> :data="section"
├── SiteRenderer.vue                                    # EDIT: provide useSiteCompany(config.company)
└── __tests__/                                          # EDIT: fixtures/specs read props.data

app/plugins/
└── register-sections.ts                                # NEW: import sections/register for boot side effect

sites/templates/
├── clinic/config.ts lawyer/config.ts restaurant/config.ts   # NEW: 5 sample vertical sites
├── school/config.ts local-business/config.ts
└── __tests__/verticals.spec.ts                         # NEW: validate + render each vertical
```

**Structure Decision**: Blocks (schemas + SFCs) live in the neutral `core/` layer per Constitution
II/III; the single dual-registration per block (Decision 3) populates both the Phase 3 schema
registry and the Phase 4 component registry; sample vertical sites live in `templates/<niche>/` as
niche orchestrations (Constitution VI). The only edits outside new files are the two user-approved
Phase 4 renderer amendments and barrel/index re-exports.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Amend Phase 4 `DynamicSection` binding (`v-bind="section"` → `:data="section"`) — contradicts spec Assumption "does not modify foundations" | Phase 2 block-contract §C1 (constitutional, "fixed forever") mandates a single `data` prop; the shipped renderer flat-spread is incompatible and would give §C1 blocks `data=undefined` | "Blocks read flat props" violates §C1 and would force amending the immutable block contract — a larger, worse change (research D1) |
| Add `useSiteCompany` provide/inject + `SiteRenderer` provide call | FR-011 requires cross-cutting identity sourced once from site level; only `theme` had a channel | Duplicating contact/social into Contact & Footer slices violates FR-011 and "change once at site level" (research D2) |
