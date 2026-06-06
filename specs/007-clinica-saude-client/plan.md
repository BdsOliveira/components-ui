# Implementation Plan: First Real Client — Clínica Saúde (Phase 7)

**Branch**: `007-clinica-saude-client` | **Date**: 2026-06-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-clinica-saude-client/spec.md`

## Summary

Create the platform's first concrete client, `sites/clients/clinica-saude/`, that produces a real,
distinct clinic site by **configuration only** — reusing the Phase 6 clinic template, the Phase 3 schema,
and the Phase 4 renderer with no source changes to `core` or `templates`. The client supplies a
`config.json` override document (template + company/theme/content), client-owned `images/`, and a
`domain.txt`. The phase's real deliverable is the **proof**: theme swap, content swap, image swap, and
responsiveness all verified end-to-end. Technical approach (research): feed `config.json` to
`createClinicSite(overrides)`, `validateWebsiteConfig` the result, render via `<SiteRenderer>` from a new
`app/pages/index.vue`; serve client images via a Nitro `publicAssets` mapping; validate with Vitest
instruments plus a documented responsive visual check.

## Technical Context

**Language/Version**: TypeScript (strict), Vue 3 SFC, JSON config — per constitution Technology Constraints.

**Primary Dependencies**: Nuxt 4 (Nitro), existing in-repo layers — `sites/core/schemas`
(`validateWebsiteConfig`), `sites/templates/clinic` (`createClinicSite`), `sites/core/components/render`
(`SiteRenderer`/`DynamicSection`). No new runtime dependencies (Constitution XIV).

**Storage**: Static files — `config.json`, `images/*`, `domain.txt` under the client directory. No DB.

**Testing**: Vitest (existing `vitest.config.ts`); tests under `sites/clients/clinica-saude/__tests__/`
mirroring `sites/templates/__tests__/`.

**Target Platform**: Web (SSR/SSG via Nuxt/Nitro); browser render verified at phone/tablet/desktop widths.

**Project Type**: Web application (Nuxt multi-layer monorepo under `sites/` + `app/`).

**Performance Goals**: Reuse already-responsive, SSG-friendly core sections (Constitution IX/X); no new
perf surface introduced this phase.

**Constraints**: No edits to `core` schemas or clinic template structure; client adds data + assets only;
dispatch/loader must not invert layer dependencies (core MUST NOT import templates).

**Scale/Scope**: One client, one rendered index page. Multi-client routing, domain→client resolution,
image optimization, and onboarding generation are explicitly out of scope (later phases).

## Constitution Check

*GATE: evaluated against constitution v1.0.0.*

| Principle | Gate | Status |
|-----------|------|--------|
| I Modular/Composable | Site assembled from existing blocks/template, no from-scratch build | PASS — reuses clinic template + core blocks. |
| II Layered Design | Client under `sites/clients/`; deps point downward only | PASS — client depends on templates/core; loader in `app/`, not core. |
| III Core Neutrality | No client/template logic added to `core` | PASS — `core` untouched; dispatch lives in `app/`. |
| IV JSON-Driven | Site driven by validated `config.json`, no source edit to add a site | PASS — `config.json` → factory → `validateWebsiteConfig` → render. |
| V Reusable Components | Components stay generic, responsive, a11y (required `alt`) | PASS — no component changes; client supplies `media.alt`. |
| VI Niche Template | Reuse niche template, no per-client custom layout/order | PASS — clinic template + fixed `ORDER`; client cannot reorder. |
| IX Performance | SSG-friendly, image refs not bloated | PASS — reuse existing sections; images served statically. |
| X UX Consistency | Responsive, consistent layout | PASS — verified at 3 widths (SC-004). |
| XI Testing | Config-parsing + rendering-consistency tests for config/template work | PASS — Vitest instruments C6.1–C6.6 + documented responsive check. |
| XII Multi-Client Scale | Client isolated dir w/ config + assets + domain | PASS — exactly this layout; images stay in client dir. |
| XIV Anti-Patterns | No duplication, no hardcoded client logic in shared layers, no excess deps | PASS — overrides not full config; no new deps; no copies into `public/`. |

**Result**: PASS — no violations. Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/007-clinica-saude-client/
├── plan.md              # This file
├── research.md          # Phase 0 — Decisions 1–7
├── data-model.md        # Phase 1 — client dir, config, images, domain, loader entities
├── quickstart.md        # Phase 1 — author + verify the four goals
├── contracts/
│   └── client-contract.md   # Phase 1 — C1–C6 client/config/domain/render contract
├── checklists/
│   └── requirements.md  # spec quality checklist (from /speckit-specify)
└── tasks.md             # Phase 2 — created by /speckit-tasks (NOT here)
```

### Source Code (repository root)

```text
sites/
├── core/                         # UNCHANGED — schemas, validateWebsiteConfig, SiteRenderer
├── templates/clinic/             # UNCHANGED — createClinicSite, defaults.json, theme.ts
└── clients/
    └── clinica-saude/            # NEW — the first real client (highest layer)
        ├── config.json           # NEW — ClientConfig override document (C2)
        ├── domain.txt            # NEW — single domain string (C4)
        ├── images/               # NEW — client-owned assets, served at /clients/clinica-saude/images
        │   └── hero.jpg          # NEW — referenced by config hero.media
        └── __tests__/
            └── clinica-saude.spec.ts   # NEW — C6.1–C6.6 instruments

app/
├── app.vue                       # EDIT — <NuxtWelcome> → <NuxtPage /> (+ RouteAnnouncer)
└── pages/
    └── index.vue                 # NEW — load config → build → validate → <SiteRenderer>

nuxt.config.ts                    # EDIT — add nitro.publicAssets for client images
```

**Structure Decision**: Nuxt multi-layer monorepo. All new client artifacts live in the isolated
`sites/clients/clinica-saude/` directory (Constitution II/XII). The only edits outside it are the minimal
app-layer wiring needed to render the client (`app/pages/index.vue`, `app/app.vue`) and a Nitro asset
mapping in `nuxt.config.ts` — the render dispatch stays in the top `app` layer so no lower layer depends
on a higher one. `core` and `sites/templates/clinic` are not modified.

## Complexity Tracking

> No Constitution Check violations — section intentionally empty.
