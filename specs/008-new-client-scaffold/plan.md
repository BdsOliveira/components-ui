# Implementation Plan: Automatic Client Scaffold (Phase 8)

**Branch**: `008-new-client-scaffold` | **Date**: 2026-06-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/008-new-client-scaffold/spec.md`

## Summary

Replace the hand-built Phase-7 client ritual with a single command,
`npm run new-client`, that scaffolds a complete, valid, deploy-ready client from a
chosen niche template — copy template defaults, generate the client's `config.json`
with its own identity, create the conventional client directory (config, domain,
images, tests, README), and make it selectable as the static-build target — without
hand-editing any shared or lower-layer source.

Technical approach: a strict-TypeScript script in the `scripts` layer
(`sites/scripts/new-client.ts`, run via `tsx`) using only Node builtins for input
(flags + `readline/promises`), seeding from a normalized template-factory shape,
staging-then-rename for atomicity, and a scoped `vitest run` as the "ready to
build" validation gate. A bounded **one-time infra change** makes any client
selectable by a `CLIENT` env var via convention/auto-discovery
(`import.meta.glob` config load + computed `nitro.publicAssets`), replacing today's
hardcoded single-client wiring. The four flat sample templates are normalized to
the `clinic` factory shape so all five are seedable and dispatchable.

## Technical Context

**Language/Version**: TypeScript (strict, Constitution VIII), Node ≥ 20, ESM (`"type": "module"`)

**Primary Dependencies**: Nuxt 4, Vue 3, Zod, Vitest, `@vue/test-utils`, happy-dom; **new devDep**: `tsx` (scaffold runner). No new runtime dependency.

**Storage**: Filesystem — per-client directories under `sites/clients/<name>/` (`config.json`, `domain.txt`, `images/`, `__tests__/`, `README.md`)

**Testing**: Vitest (`sites/**/__tests__/**/*.spec.ts`); the scaffold emits a starter spec the suite discovers; the scaffold's validation gate is a scoped `vitest run`

**Target Platform**: Local developer tooling (Node CLI) producing a Nuxt SSG site (`nuxt generate`), shipped to a static host (Vercel per Constitution XIII)

**Project Type**: Multi-client Nuxt website starter-kit (single repo, layered: core / templates / clients / scripts)

**Performance Goals**: Scaffold a deploy-ready client in under 2 minutes (SC-001); 100% of scaffolded configs valid on first run (SC-003)

**Constraints**: No edits to template/core/shared source per run (FR-009); atomic — no partial output on failure (FR-012); existing clients unchanged & still selectable (FR-008); no silent defaults for name/template/domain (FR-002)

**Scale/Scope**: One client per run; five selectable niche templates; designed for hundreds of clients (Constitution XII)

## Constitution Check

*GATE: evaluated against constitution v1.0.0. Re-checked after Phase 1 design.*

| Principle | Status | Note |
|-----------|--------|------|
| I Modular/Composable | ✅ | Clients assembled from templates+core; scaffold composes, never custom-codes a site |
| II Layered design | ✅ | Command lives in `scripts` (its stated job: "scaffold a client, validate structure, generate config"); depends only on reading templates + core; nothing lower depends on it |
| III Core neutrality | ✅ | No client logic added to `core`; scaffold never edits core |
| IV JSON-driven | ✅ | Output is a `config.json` validated by the existing `validateWebsiteConfig` before render |
| V Reusable components | ✅ | Unchanged; clients reuse existing blocks |
| VI Niche templates | ✅ | Normalizing the four flat templates to the factory shape strengthens the niche-template strategy; section ORDER stays template-owned |
| VII Speed-first | ✅ | Replaces multi-file manual ritual with one command (SC-001) |
| VIII Developer experience | ✅ | A scaffolding command (explicitly encouraged); strict TS via `tsx` |
| IX Performance/Web Vitals | ✅ | SSG preserved; per-client `nuxt generate`; assets served from client dir, not copied |
| X UX consistency | ✅ | Templates own layout/UX; scaffold only seeds content |
| XI Testing/Reliability | ✅ | Emits a starter test (FR-014); validation gate reuses the existing whole-site validator; infra change to config-load/build-target is a critical flow (config parsing + deployment generation) covered by tests |
| XII Multi-client scalability | ✅ | Isolated per-client dir; domain abstracted; selection additive/auto-discovered |
| XIII Deployment discipline | ✅ | One reproducible static build per client via `CLIENT` env var |
| XIV Anti-pattern prohibition | ✅ | Node builtins for prompts (no excessive deps); one minimal devDep (`tsx`) justified; one-time wiring removes hardcoding rather than adding abstraction |
| XV Long-term vision | ✅ | Scaffolding + auto-discovery is a direct step toward automated, scaled onboarding |

**Result**: PASS — no violations; Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/008-new-client-scaffold/
├── plan.md                          # This file
├── spec.md                          # Feature spec
├── research.md                      # Phase 0 — 9 decisions
├── data-model.md                    # Phase 1 — entities, rules, flow
├── quickstart.md                    # Phase 1 — usage
├── contracts/
│   ├── scaffold-cli-contract.md     # the npm run new-client interface
│   └── build-target-contract.md     # CLIENT env-var selection convention
├── checklists/
│   └── requirements.md              # existing
└── tasks.md                         # Phase 2 (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
sites/
├── scripts/
│   └── new-client.ts                # NEW — the scaffold command (tsx entry)
├── templates/
│   ├── registry.ts                  # NEW — discriminator → { factory, defaults }
│   ├── clinic/                      # existing factory shape (defaults.json, theme.ts, page.ts) — register
│   ├── lawyer/                      # NORMALIZE config.ts → defaults.json + theme.ts + page.ts factory
│   ├── restaurant/                  # NORMALIZE (same)
│   ├── school/                      # NORMALIZE (same)
│   └── local-business/              # NORMALIZE (same)
├── clients/
│   ├── clinica-saude/               # existing (default build target)
│   └── <new-client>/                # OUTPUT of the command
└── core/                            # UNCHANGED (read-only by scaffold)

app/
└── pages/
    └── index.vue                    # EDIT (one-time) — glob config load + registry dispatch by CLIENT

nuxt.config.ts                       # EDIT (one-time) — CLIENT-driven publicAssets + runtimeConfig.public.client
package.json                         # EDIT — "new-client" script + tsx devDep
```

**Structure Decision**: Single layered Nuxt repo (the established core/templates/
clients/scripts layout). The scaffold is platform tooling in `scripts`; its output
is a client directory in `clients`. The only shared-source edits are the **one-time**
build-target wiring (`nuxt.config.ts`, `app/pages/index.vue`) and template
normalization — none of which the per-run command performs (FR-009).

## Phase 2 Notes (for /speckit-tasks)

Suggested task ordering, mapped to user stories:

1. **One-time infra (enables US3, unblocks dispatch)** — `templates/registry.ts`;
   normalize lawyer/restaurant/school/local-business to factory shape; make
   `nuxt.config.ts` + `app/pages/index.vue` `CLIENT`-driven (build-target-contract).
   Add a test proving every existing client still builds with `CLIENT` unset/set
   (FR-008, SC-004).
2. **US1 (P1)** — `sites/scripts/new-client.ts`: flag/prompt input, slug/template/
   domain validation, display-name derivation, seed config from template defaults,
   write the conventional client dir, staging→rename atomicity. `package.json`
   script + `tsx` devDep.
3. **US2 (P1)** — emit the starter test; wire the scoped `vitest run` validation
   gate; prove a scaffolded client validates and renders unedited.
4. **US3 (P2)** — prove the new client is selectable via `CLIENT` and resolves its
   own assets/domain; existing clients unchanged.
5. **US4 (P3)** — guardrails: collision, unknown template (list available),
   invalid name/domain, domain reuse, partial-failure cleanup.

## Complexity Tracking

No constitution violations — table intentionally empty.
