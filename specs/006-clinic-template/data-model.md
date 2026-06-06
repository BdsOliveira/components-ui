# Phase 1 Data Model: Clinic Template

The clinic template introduces **no new schema types**. It composes existing Phase 5 entities (`WebsiteConfig`, `CompanyConfig`, `ThemeConfig`, and the eight section slices) into three separated artifacts. This document describes the artifact shapes and how they assemble.

## Entities

### Clinic Page Order (in `page.ts`)

The ordered list of section types the template renders. Order IS render order (Constitution VI; `WebsiteConfig.sections` order).

| Field | Type | Notes |
|-------|------|-------|
| `ORDER` | `readonly ['hero','services','testimonials','faq','contact','footer']` | Frozen tuple; the single source of section ordering (FR-002, FR-011). |

- **Rules**: every entry MUST be one of the eight registered core block types (FR-001/FR-005). No type appears that lacks a corresponding key in `defaults.sections`.

### Clinic Defaults (in `defaults.json`)

Default content. Cross-cutting identity once under `company`; per-section content under `sections`, keyed by section type.

```jsonc
{
  "company": {            // CompanyConfig-shaped (name required)
    "name": "string",
    "tagline": "string?",
    "contact": { "email": "string?", "phone": "string?", "address": "string?" },
    "social":  { "<platform>": "url" },
    "legal":   { "legalName": "string?" }
  },
  "sections": {
    "hero":         { /* HeroConfig minus `type` */ },
    "services":     { /* ServicesConfig minus `type` */ },
    "testimonials": { /* TestimonialsConfig minus `type` */ },
    "faq":          { /* FaqConfig minus `type` */ },
    "contact":      { /* ContactConfig minus `type` */ },
    "footer":       { /* FooterConfig minus `type` */ }
  }
}
```

- **Rules**:
  - `company.name` is required (CompanyConfig); other identity fields optional (graceful degradation, FR-010).
  - Each `sections[type]` is the block's `data` slice **without** `type` (the type is supplied by `page.ts` during assembly).
  - Every key under `sections` MUST correspond to a member of `ORDER`; every `ORDER` member MUST have a key here (1:1).
  - Content is generic placeholder for a clinic — no real client's private data (FR-007, Constitution XIV).
  - Omitted optional fields → that region renders nothing (FR-010); missing required fields → rejected by validation (FR-010).

### Clinic Theme (in `theme.ts`)

```ts
export const clinicTheme: ThemeConfig
```

- `ThemeConfig` (existing `themeSchema`): `colors.primary` (defaulted), optional secondary/accent/background/foreground, optional `typography`, `mode` (`light|dark|system`), optional `radius`, `spacing`.
- **Rules**: clinic identity = calm/clinical (cool primary, `mode: 'light'`, soft radius, generous spacing). Independently editable (FR-009).

### Produced Clinic Site (assembled in `page.ts`)

```ts
clinicSite: WebsiteConfig = {
  company:  defaults.company,
  theme:    clinicTheme,
  sections: ORDER.map((type) => ({ type, ...defaults.sections[type] })),
}
```

- **Rules**:
  - The assembled object MUST satisfy `WebsiteConfig` and pass `validateWebsiteConfig` (FR-006, SC-001).
  - `sections` order === `ORDER` (FR-002); validation never reorders.
  - Uses ONLY the eight core block types (FR-001, SC-005).

## Relationships & assembly flow

```text
defaults.json ──(company)─────────────┐
defaults.json ──(sections[type])──┐    │
                                  ▼    ▼
page.ts: ORDER.map(type → {type,…}) → { company, theme, sections } : WebsiteConfig
                                  ▲
theme.ts ──(clinicTheme)──────────┘
                                       │
                                       ▼
                          validateWebsiteConfig(site) → renders via <SiteRenderer>
```

## Override model (factory)

`createClinicSite(overrides?)` produces a `WebsiteConfig` by deep-merging over the defaults while preserving `ORDER`:

| Override key | Merges into | Independence guarantee |
|--------------|-------------|------------------------|
| `company` | `defaults.company` | content-only; structure/theme untouched (FR-008) |
| `content` | `defaults.sections` (per type) | content-only; structure/theme untouched (FR-008) |
| `theme` | `clinicTheme` | theme-only; structure/content untouched (FR-009) |

- `clinicSite === createClinicSite()` (no overrides → pure defaults).
- Unspecified fields retain defaults (partial override, edge case in spec).
- `ORDER` is never overridable through the factory (structure is fixed for the niche, Constitution VI).

## Validation rules (inherited, no new logic)

- Whole-site gate: `validateWebsiteConfig` — never throws; applies `company`/`theme` defaults; rejects any invalid/unknown section type (block-set contract, validate-website.ts).
- The template adds **no** validation code; it relies entirely on the existing gate (Constitution IV, block-set B3).
