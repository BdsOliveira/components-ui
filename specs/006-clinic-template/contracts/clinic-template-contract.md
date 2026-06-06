# The Clinic Template Contract (Phase 6)

**Status**: Authoritative for the clinic template · **Phase**: 6 · **Builds on**:
`005-phase-5-core-blocks/contracts/block-set-contract.md` (B1–B8) and the central
`WebsiteConfig` schema (Phase 3).

Fixes the public surface Phase 6 adds: the three template artifacts, the exported site object and
factory, and the order/defaults/theme separation guarantees. Adds no new block, schema, or renderer
surface — it consumes the Phase 5 contract unchanged.

---

## T1 — Three artifacts, one per concern (FR-005)

The clinic template directory `sites/templates/clinic/` contains exactly three source files, each
owning one concern and nothing else:

```text
page.ts        # STRUCTURE: section order + assembly (composition root)
defaults.json  # CONTENT: company identity + per-section data slices
theme.ts       # IDENTITY: clinicTheme: ThemeConfig
```

No fourth source file. The Phase 5 `config.ts` is removed. Tests live under
`sites/templates/__tests__/`.

## T2 — `page.ts` is the composition root (FR-002, FR-011)

`page.ts` MUST:
- declare the section order as a frozen tuple, the SINGLE source of ordering:
  ```ts
  const ORDER = ['hero','services','testimonials','faq','contact','footer'] as const
  ```
- import content from `./defaults.json` and identity from `./theme.ts`;
- assemble and export `clinicSite: WebsiteConfig` whose `sections` are `ORDER.map(type => ({ type, ...defaults.sections[type] }))`;
- export the factory `createClinicSite(overrides?)` (T5), with `clinicSite === createClinicSite()`.

`page.ts` MUST NOT contain section content or theme tokens (those live in T3/T4).

## T3 — `defaults.json` owns content only, keyed by type (FR-003, FR-007)

`defaults.json` MUST be a JSON object `{ company, sections }` where `sections` maps each section
type to its block `data` slice **without** the `type` field. It MUST:
- provide content for every member of `ORDER` (1:1 with T2), and no other keys;
- carry `company.name` (required) plus generic clinic identity; contain NO real client private data;
- be the ONLY place section content lives.

`defaults.json` MUST NOT encode order (order is `ORDER` in `page.ts`) or theme tokens.

## T4 — `theme.ts` owns identity only (FR-004, FR-009)

`theme.ts` MUST export `clinicTheme: ThemeConfig` — a valid `themeSchema` value applied by default,
giving a clean clinic look (not a bare default). It MUST NOT contain structure or content.

## T5 — Concern independence (FR-005, FR-008, FR-009)

The factory `createClinicSite(overrides?)` MUST deep-merge `overrides.company` / `overrides.content` /
`overrides.theme` over the defaults while preserving `ORDER`, returning a `WebsiteConfig`. It MUST
guarantee:
- a content override changes only content; structure and theme are byte-identical to defaults (FR-008);
- a theme override changes only theme; structure and content are byte-identical to defaults (FR-009);
- a partial override keeps all unspecified fields at their defaults;
- `ORDER` is NOT overridable via the factory (niche structure is fixed, Constitution VI).

## T6 — Valid, ordered, core-only output (FR-001, FR-006, FR-010, FR-012)

The produced site MUST:
- pass `validateWebsiteConfig(clinicSite).valid === true` with `data` defined (no override case, SC-001);
- render every section via `<SiteRenderer>` in exactly `ORDER` (SC-001);
- use ONLY the eight core block types — zero new types (SC-005);
- degrade gracefully: omitted optional regions render nothing; missing required content is rejected by
  the existing gate before render (FR-010). The template adds NO validation code of its own.

## T7 — Reuse across clinics (FR-012, SC-004)

The same `page.ts` structure MUST produce valid sites for ≥3 distinct clinics that differ only by
`createClinicSite` content/theme overrides — no edit to `page.ts` structure, no per-client custom
layout, no client data baked into the template artifacts.

---

## Acceptance instrument

The clinic template is accepted only when:
1. `sites/templates/__tests__/clinic-template.spec.ts` proves T5 (override independence) and T6
   (valid + ordered + core-only) for the no-override site and for content-only/theme-only overrides.
2. `sites/templates/__tests__/verticals.spec.ts` (repointed to `../clinic/page`) still passes — the
   clinic vertical validates and renders in order through `<SiteRenderer>`.
3. A ≥3-clinic reuse check (T7) builds three sites via `createClinicSite(...)` overrides, each valid
   and each preserving `ORDER`.
