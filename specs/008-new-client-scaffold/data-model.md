# Phase 1 Data Model: Automatic Client Scaffold (Phase 8)

Entities, fields, validation rules, and the scaffold state flow. Derived from the
spec's Key Entities and Functional Requirements; grounded in the existing
`config.json` / `domain.txt` / template-factory shapes in the repo.

---

## Entity: ScaffoldInput

The three identifying values for one run (FR-002). Collected from flags, then
prompts for any missing value.

| Field | Type | Required | Source | Validation |
|-------|------|----------|--------|------------|
| `name` | string (slug) | yes | `--name` / prompt | `^[a-z0-9]+(-[a-z0-9]+)*$`; must not collide with an existing `clients/<name>/` (FR-010) |
| `template` | string | yes | `--template` / prompt | MUST be a key of the template registry; else reject + list available (FR-011) |
| `domain` | string (hostname) | yes | `--domain` / prompt | `^(?=.{1,253}$)([a-z0-9](-?[a-z0-9])*\.)+[a-z]{2,}$`, trimmed; surface reuse if already in another client's `domain.txt` |

**Derived**: `displayName` = title-cased slug words (`clinica-saude` → `Clinica
Saude`); accents are later content refinements (research D8).

**Run mode**: all three present as flags → non-interactive; otherwise prompt only
for the missing ones (FR-002).

---

## Entity: TemplateSource (read-only input)

An existing niche template whose defaults seed the new client. After
normalization (research D5) every template shares one shape.

| Member | File | Role |
|--------|------|------|
| defaults (content + company) | `sites/templates/<t>/defaults.json` | seed for `company` + section `content` |
| theme | `sites/templates/<t>/theme.ts` | seed for `theme` |
| factory | `sites/templates/<t>/page.ts` → `create<X>Site(overrides)` | builds the validated `WebsiteConfig` from defaults + overrides; owns section ORDER |
| registry entry | `sites/templates/registry.ts` | `template` discriminator → { factory, defaults } |

**Known templates**: `clinic`, `lawyer`, `restaurant`, `school`,
`local-business`. The registry's keys are the authoritative "available templates"
list used by error messages (FR-011). The command never creates templates.

---

## Entity: ClientScaffold (the output directory)

Written to `sites/clients/<name>/`, matching the Phase-7 conventional shape
exactly (US1 scenario 2).

| File | Type | Content | Requirement |
|------|------|---------|-------------|
| `config.json` | JSON | `{ template, company:{name=displayName, …seeded}, theme:{…seeded}, content:{…seeded sections} }` | FR-003/FR-004/FR-005 |
| `domain.txt` | text | single trimmed hostname | FR-003 |
| `images/` | dir | placeholder asset (e.g. `hero.<ext>`) referenced by the seeded config | FR-003/FR-006 |
| `README.md` | md | client README in the Phase-7 shape (responsibility/allowed/prohibited/layout/render-flow) | FR-003 |
| `__tests__/<name>.spec.ts` | TS | starter test (parse → build → `validateWebsiteConfig` valid → identity/domain/image checks) | FR-014 |

**config.json validation rule**: `create<X>Site({company,theme,content})` →
`validateWebsiteConfig(...)` MUST return `valid: true` (FR-005). Enforced by the
staged validation gate (research D7).

**Isolation rule**: the directory references only its own assets
(`/clients/<name>/images/...`); no cross-client references; no `sections`/order
field (order owned by the template, FR-008).

---

## Entity: BuildTargetSelection (convention, not a per-client file)

How one client is chosen at static-generate time and resolved by convention
(FR-007). Additive per client; **no shared-file edit per client**.

| Aspect | Mechanism |
|--------|-----------|
| selection | `CLIENT` env var (default `clinica-saude`) |
| config resolution | `import.meta.glob('~~/sites/clients/*/config.json')` keyed by `CLIENT` in `app/pages/index.vue` |
| asset resolution | `nuxt.config.ts` `nitro.publicAssets` dir/baseURL computed from `sites/clients/${CLIENT}/images` |
| domain record | the selected client's own `domain.txt` |

This is the **one-time infra wiring** (research D3/D4); it replaces today's
hardcoded single-client wiring and is touched once, not per client.

---

## State Flow: one scaffold run

```text
parse flags ─▶ prompt missing ─▶ VALIDATE INPUTS (name slug, template known, domain host)
   │                                      │ fail ▶ report rule / list templates ▶ exit≠0, nothing written
   ▼                                      ▼
CHECK GUARDS (collision FR-010, domain reuse) ── fail ▶ report ▶ exit≠0, nothing written
   │
   ▼
STAGE  sites/clients/.new-client-tmp-<name>/      (write config.json, domain.txt, images/, README, __tests__)
   │
   ▼
VALIDATE GATE: vitest run (staged spec) ── fail ▶ remove staging ▶ exit≠0
   │ pass
   ▼
RENAME staging ─▶ sites/clients/<name>/           (atomic)
   │
   ▼
REPORT success: path + how to select (CLIENT=<name>) + how to generate (FR-013)
```

Every failure branch leaves the workspace unchanged (FR-012, SC-005). The command
writes only the new client directory (FR-009); the one-time infra wiring above is
not part of a per-run write.

---

## Validation Rules (consolidated)

1. **Name** — kebab slug; unique among `clients/*` (FR-010/FR-011).
2. **Template** — must exist in the registry; else list available (FR-011).
3. **Domain** — valid hostname; reuse surfaced (FR-011 / edge case).
4. **Generated config** — passes `validateWebsiteConfig` (FR-005).
5. **Atomicity** — no partial output on any failure (FR-012).
6. **Isolation** — existing clients unchanged & still selectable (FR-008).
7. **No shared edits per run** — only `clients/<name>/` written (FR-009).
