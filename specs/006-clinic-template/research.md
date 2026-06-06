# Phase 0 Research: Clinic Template

All Technical Context items were resolvable from the existing codebase (Phases 2–5). No outstanding NEEDS CLARIFICATION. Decisions below fix the small set of choices the three-file split forces.

## Decision 1 — `page.ts` is the composition root (clinic entry point)

**Decision**: `page.ts` imports `defaults.json` and `theme.ts`, fixes the section order, assembles the `WebsiteConfig`, and exports `clinicSite` (+ `createClinicSite`). The Phase 5 `config.ts` is removed; the only importer (`verticals.spec.ts`) repoints to `../clinic/page`.

**Rationale**: The user asked for exactly three files (`page.ts`, `defaults.json`, `theme.ts`) and "nada mais". Making `page.ts` the root keeps the directory at three source files while preserving a single importable site object. `page` is the natural name for the artifact that owns section order (the page structure).

**Alternatives considered**:
- *Keep `config.ts` as assembler* — adds a fourth file, violates "nada mais"; `config.ts` was the monolith we are splitting.
- *`index.ts` barrel* — extra file, no benefit over naming the root `page.ts`.

## Decision 2 — `defaults.json` holds content keyed by section type; `page.ts` owns order

**Decision**: `defaults.json` shape:
```json
{ "company": { ... }, "sections": { "hero": {...}, "services": {...}, "testimonials": {...}, "faq": {...}, "contact": {...}, "footer": {...} } }
```
`page.ts` declares `const ORDER = ['hero','services','testimonials','faq','contact','footer'] as const` and assembles `sections` by mapping `ORDER` to `{ type, ...defaults.sections[type] }`.

**Rationale**: Cleanly separates the two concerns the spec demands (FR-005): order lives only in `page.ts`, content lives only in `defaults.json`. A type-keyed object (not an ordered array) makes content overrides addressable by section without re-stating order — supporting US2/US3 independence. Company identity (cross-cutting, sourced by Contact/Footer via `useSiteCompany`) lives once under `company` (Constitution III, block-set B6).

**Alternatives considered**:
- *Ordered array of full sections in JSON* — re-couples order with content (the monolith we are removing).
- *Defaults inside `page.ts` as TS objects* — defeats the JSON-driven content concern (Constitution IV) and the spec's content/structure split.

## Decision 3 — JSON import + runtime validation as the type gate

**Decision**: Import `defaults.json` directly (`import defaults from './defaults.json'`). Type-safety is enforced at the boundary by `validateWebsiteConfig` (the canonical pre-render gate), not by hand-writing duplicate TS types. `page.ts` annotates the assembled object as `WebsiteConfig` and exposes a validated accessor in tests.

**Rationale**: Nuxt 4's generated tsconfig enables `resolveJsonModule`/`esModuleInterop`, so JSON import + `import defaults from './defaults.json'` works in app/server/test contexts. Per Constitution IV, the schema (via `validateWebsiteConfig`) is the source of truth; re-declaring TS interfaces for the JSON would duplicate the schema and risk drift (Constitution XIV — unnecessary abstraction). The Zod gate already rejects malformed defaults (FR-006, FR-010).

**Alternatives considered**:
- *`.ts` defaults with `satisfies WebsiteConfig['sections']`* — gives compile-time checking but abandons the JSON content artifact the user requested.
- *Generate TS types from Zod for the JSON* — over-engineering for one template; validation already guards it.

**Verification task**: confirm `resolveJsonModule` is active in `.nuxt/tsconfig.*.json` during implementation; if absent, enable it in `nuxt.config` `typescript` options (one-line, no new dependency).

## Decision 4 — `theme.ts` exports a typed `clinicTheme: ThemeConfig`

**Decision**: `theme.ts`:
```ts
import type { ThemeConfig } from '~~/sites/core/schemas'
export const clinicTheme: ThemeConfig = { colors: { primary: '#0ea5e9', /* ... */ }, mode: 'light', /* radius, spacing, typography */ }
```

**Rationale**: Theme is the smallest, most-typed concern; keeping it as TS (not JSON) gives full `ThemeConfig` type-checking and lets `mode`/enum fields be statically verified. Independent file satisfies FR-005/FR-009 (theme editable without touching structure or content). Clinic visual direction follows `.agents/skills/frontend-design/SKILL.md`: a clean, trustworthy, calm clinical aesthetic (cool primary, light mode, generous spacing, soft radius) — intentional, not generic.

**Alternatives considered**:
- *Theme in `defaults.json`* — mixes visual identity into the content artifact; breaks the three-way split.
- *Inline theme in `page.ts`* — couples identity to structure.

## Decision 5 — `createClinicSite(overrides)` factory for cross-clinic reuse

**Decision**: Export `createClinicSite(overrides?: { company?; theme?; content?; })` that deep-merges overrides over the defaults while preserving `ORDER`, returning a `WebsiteConfig`. `clinicSite` = `createClinicSite()`.

**Rationale**: Directly serves FR-012 / SC-004 (same structure reused across ≥3 clinics by content/theme only) and US2/US3 (override one concern without touching others). It is light orchestration — no new blocks or layout — so it stays within "the template only organizes/orders/defaults". Keeps per-client data OUT of the template (Constitution XII/XIV): clinics pass overrides; the template ships generic placeholders only.

**Alternatives considered**:
- *No factory, edit defaults directly* — forces copy-editing the template per clinic, reintroducing manual work (Constitution VII) and per-client coupling.
- *Full client-config layer* — out of scope for Phase 6 (that is the `clients/` layer, a later phase).

## Decision 6 — Section order and content fidelity

**Decision**: Keep the Phase 5 clinic order `hero → services → testimonials → faq → contact → footer` (FR-011). Carry the Phase 5 sample content forward as the defaults, lightly polished for tone. `contact` keeps `showForm: true` + hours; `footer` sources identity from `company`.

**Rationale**: The order already validated and rendered coherently in Phase 5 (`verticals.spec.ts`); it embodies the clinic conversion journey (introduce → services → trust → answer → contact). Reusing proven content minimizes risk and keeps the change a structural refactor + factory, not a content rewrite.

**Alternatives considered**:
- *Add `about`/`cta`* — broadens scope; clinic journey is already complete and "visual simples" per the request.

## Resolved unknowns summary

| Item | Resolution |
|------|------------|
| Where does section order live? | `page.ts` only (Decision 1/2) |
| Where does content live? | `defaults.json`, keyed by section type (Decision 2) |
| Where does theme live? | `theme.ts` as typed `clinicTheme` (Decision 4) |
| How is type-safety enforced for JSON? | runtime `validateWebsiteConfig` gate (Decision 3) |
| How are clinics reused? | `createClinicSite(overrides)` (Decision 5) |
| What happens to `config.ts`? | removed; `verticals.spec.ts` repointed to `page.ts` (Decision 1) |
| Section order/content? | Phase 5 clinic order + polished defaults (Decision 6) |
