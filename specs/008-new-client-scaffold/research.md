# Phase 0 Research: Automatic Client Scaffold (Phase 8)

All NEEDS CLARIFICATION from Technical Context are resolved below. Each decision
records what was chosen, why, and the alternatives rejected. Findings are grounded
in the actual repo state inspected during planning (Nuxt 4, Zod, Vitest; the
Phase-7 `clinica-saude` client; the `clinic` template factory; the hardcoded
build wiring in `nuxt.config.ts` and `app/pages/index.vue`).

---

## Decision 1 — Scaffold script language & runner

**Decision**: Write the command as TypeScript at `sites/scripts/new-client.ts`,
executed by `tsx` (added as a **devDependency**), wired as `"new-client": "tsx
sites/scripts/new-client.ts"` in `package.json`. The script uses **only Node
builtins** (`node:fs/promises`, `node:path`, `node:url`, `node:readline/promises`)
for its own logic.

**Rationale**: Constitution VIII mandates strict TypeScript across all layers, so a
plain `.mjs` script is non-compliant. `tsx` is the minimal, standard,
zero-config TS runner for the Nuxt ecosystem and adds no runtime dependency. The
script needs no `~~` alias resolution (see Decision 7), so a heavy runner or a
build step is unnecessary.

**Alternatives rejected**:
- *Plain `.mjs`* — violates Constitution VIII (strict TS everywhere).
- *`ts-node`* — heavier, ESM/loader friction with `"type": "module"`; `tsx` is simpler.
- *Precompile with `tsc` then run JS* — adds a build step, contradicts Speed-First (VII).

---

## Decision 2 — Input model: flags + interactive prompts

**Decision**: Parse `--name`, `--template`, `--domain` from `process.argv` (no
arg-parser dependency — a tiny hand-rolled `--key value` / `--key=value` reader).
For any of the three not supplied, prompt interactively with
`node:readline/promises`. When all three are supplied as flags, run fully
non-interactively (no prompts, CI-safe). This satisfies FR-002.

**Rationale**: Three flags is below the threshold where a parser library earns its
keep; a dependency here trips Constitution XIV (excessive dependencies).
`readline/promises` is a stable Node builtin giving human-friendly prompts with
zero install.

**Alternatives rejected**:
- *`commander` / `yargs` / `prompts` / `inquirer`* — new runtime deps for a 3-field CLI (XIV).
- *Flags-only (no prompts)* — fails FR-002's "prompt for missing" and SC-006 (usable without reading conventions).

---

## Decision 3 — Build-target selection mechanism

**Decision**: A single environment variable, **`CLIENT`**, selects the static
build target (e.g. `CLIENT=clinica-saude npm run generate`). It is read in two
places, both by convention, with **no per-client edits**:
1. `nuxt.config.ts` resolves `nitro.publicAssets` `dir`/`baseURL` from
   `sites/clients/${CLIENT}/images` → `/clients/${CLIENT}/images`.
2. `runtimeConfig.public.client = process.env.CLIENT` exposes the selection to
   the render page.
A documented default (`clinica-saude`) keeps existing behavior when `CLIENT` is
unset, so existing scripts/tests do not break (FR-008).

**Rationale**: Env-var selection is the spec's chosen model (Clarifications:
"selected at build time via an env var / CLI flag"), is CI-scriptable, and keeps
selection additive and convention-based (FR-007/FR-009). One build per client
(`nuxt generate`) matches the static, no-runtime-router clarification.

**Alternatives rejected**:
- *Runtime multi-tenant router* — explicitly out of scope (spec Assumptions).
- *Per-client edit to shared config to register* — violates FR-009.
- *CLI flag passed to `nuxt generate`* — Nuxt has no first-class custom build flag; env var is the idiomatic, portable channel.

---

## Decision 4 — Dynamic client-config load in the render page

**Decision**: Replace the static `import clientConfig from
'~~/sites/clients/clinica-saude/config.json'` in `app/pages/index.vue` with a
convention glob — `import.meta.glob('~~/sites/clients/*/config.json', { eager:
true, import: 'default' })` — and select the entry whose directory equals
`useRuntimeConfig().public.client`. An unmatched/absent client renders the same
surfaced error path already present (never a silent wrong site).

**Rationale**: `import.meta.glob` is Vite's first-class build-time mechanism;
adding a new client directory makes it selectable with zero edits to this page
(FR-009, auto-discovery). Eager glob keeps SSG static and tree-shakeable per
build.

**Alternatives rejected**:
- *Dynamic `import()` of a computed path* — fragile under SSG/prerender, Vite cannot statically analyze it.
- *Keeping the static single import* — the hardcoding this phase exists to remove.

---

## Decision 5 — Template factory dispatch + normalizing the four flat templates

**Decision**: Introduce a central template registry (`sites/templates/registry.ts`)
mapping `template` discriminator → factory `(overrides) => WebsiteConfig` and →
its raw defaults, generalizing the inline `templateFactories = { clinic }` in
`index.vue`. **Normalize** `lawyer`, `restaurant`, `school`, `local-business`
from their current flat sample `config.ts` to the `clinic` factory shape
(`defaults.json` for content, `theme.ts` for identity, `page.ts` exporting
`create<X>Site(overrides)` + an `<X>Overrides` type), then register all five.

**Rationale**: FR-004 requires seeding a client config from a template's
**defaults** and **injecting identity via override merge** — only the factory
shape supports this. Today only `clinic` has it. Making all five "selectable
sources" (spec Assumption "templates already exist") requires they share one
shape. This is a **one-time infra/template-layer change**, explicitly permitted
by the spec's "One-time dynamic wiring" assumption; FR-009 only forbids the
*scaffold command* from editing templates **per run**, not this phase's setup.

**Alternatives rejected**:
- *Scaffold only supports `clinic`* — contradicts the spec's five selectable templates and FR-011 (list available templates).
- *Dispatch handles both flat and factory shapes* — two code paths, no clean override-merge for flat configs; violates "composition over duplication" (I/XIV).

---

## Decision 6 — Atomicity & rollback

**Decision**: Build the client into a **staging path** first
(`sites/clients/.new-client-tmp-<name>/`), write every file there, run the
validation gate (Decision 7) against staging, and only on success **atomically
rename** it to `sites/clients/<name>/`. On any error (validation, collision
detected late, I/O), remove the staging dir and exit non-zero, leaving the
workspace untouched. Collision and domain-reuse are also checked **up front**
before any write.

**Rationale**: FR-012 / SC-005 require "no partial client left behind." A
stage-then-rename within the same filesystem is effectively atomic and simple;
up-front guards (Decision/US4) catch the common cases before any work.

**Alternatives rejected**:
- *Write in place + delete on failure* — a crash between writes can orphan files; staging is safer.
- *OS tmpdir staging* — cross-device `rename` can fail (EXDEV); staging under `sites/clients/` guarantees same device.

---

## Decision 7 — Validating generated config (the "ready to build" gate)

**Decision**: The scaffold emits a **starter test** modeled on
`clinica-saude/__tests__/clinica-saude.spec.ts` (parse config → `create<X>Site`
→ `validateWebsiteConfig` valid → order/identity/domain/image assertions). The
command's validation gate runs `vitest run` **scoped to the staged client's
spec**; a green run is the FR-005/FR-006 guarantee. The scaffold script itself
does **not** import core schemas.

**Rationale**: `validateWebsiteConfig` and templates import via the `~~` alias,
which resolves under Vitest/Nuxt but not bare `tsx`. Delegating to Vitest reuses
the exact existing validation path (the same one Phase 7 proved) instead of
re-implementing alias resolution in the script. The starter test also satisfies
FR-014 (suite discovers the new client's test) — one artifact, two requirements.

**Alternatives rejected**:
- *Re-implement Zod validation inside the script* — duplicates the contract, drifts from `core` (DRY / XIV).
- *Resolve `~~` in `tsx` via tsconfig-paths* — extra dep + config to do what Vitest already does.
- *No inline gate (trust the test exists)* — weaker "ready to build" promise; running it closes the loop.

---

## Decision 8 — Display-name derivation from the slug

**Decision**: Derive the display name by splitting the slug on `-`/`_` and
title-casing each word (`clinica-saude` → `Clinica Saude`). Inject it as
`company.name` in the seeded `config.json`. Accents/diacritics (the spec's
"Clínica Saúde") are **not** derivable from an ASCII slug and are treated as a
later content refinement against the client's own `config.json`, consistent with
the placeholder-content model (FR-004, spec Assumptions).

**Rationale**: A slug is ASCII by the naming rule (Decision 9); reconstructing
locale-specific accents is impossible without external data. Title-cased ASCII is
deterministic, renders immediately, and is trivially refined. This is called out
explicitly so the derived name is not mistaken for a defect.

**Alternatives rejected**:
- *Accent lookup table per locale* — unbounded, locale-guessing, fragile (XIV).
- *Prompt separately for display name* — adds a fourth required input; FR-002 fixes the inputs at name/template/domain.

---

## Decision 9 — Client-name (slug) & domain validation rules

**Decision**:
- **Name**: must match `^[a-z0-9]+(-[a-z0-9]+)*$` (lowercase kebab slug — a safe
  directory **and** URL segment). Reject empty/whitespace/uppercase/illegal chars
  with the rule stated (FR-011).
- **Domain**: must match the hostname regex already used by the Phase-7 test
  (`^(?=.{1,253}$)([a-z0-9](-?[a-z0-9])*\.)+[a-z]{2,}$`), trimmed, single line →
  written to `domain.txt`.
- **Collision**: refuse if `sites/clients/<name>/` exists (FR-010).
- **Domain reuse**: warn/surface if any existing `clients/*/domain.txt` already
  holds the requested domain (Edge Case: domain reuse).

**Rationale**: Reuses conventions already proven in the repo (the Phase-7
hostname regex; the kebab client-dir names), so generated clients match existing
ones exactly (US1 scenario 2) and pass the same checks.

**Alternatives rejected**:
- *Allow uppercase/underscores* — breaks URL-segment safety and convention consistency.
- *Invent a new domain validator* — needless divergence from the existing one.

---

## Resolved Technical Context

| Item | Resolution |
|------|------------|
| Language/Version | TypeScript (strict), Node ≥ 20 (project), ESM |
| Script runner | `tsx` (new devDependency) |
| Prompts | `node:readline/promises` (builtin, no dep) |
| Build-target selection | `CLIENT` env var; default `clinica-saude` |
| Config auto-discovery | `import.meta.glob('~~/sites/clients/*/config.json')` |
| Template dispatch | `sites/templates/registry.ts`; all five normalized to factory shape |
| Atomicity | stage dir → validate → rename; cleanup on failure |
| Validation gate | scoped `vitest run` on the staged client spec |
| Testing | Vitest (existing `sites/**/__tests__/**/*.spec.ts`) |
| New runtime deps | none (only `tsx` devDep) |
