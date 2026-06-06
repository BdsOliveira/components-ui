# Phase 6 Quickstart: Clinic Template

How the clinic template is authored as three separated artifacts and assembled into one validated,
renderable site. Read after `spec.md`, `plan.md`, and `contracts/clinic-template-contract.md`.

## What this phase delivers

- One strong clinic niche template, three files, one concern each:
  - `sites/templates/clinic/page.ts` — section **order** + assembly (composition root).
  - `sites/templates/clinic/defaults.json` — default **content** (company + per-section slices).
  - `sites/templates/clinic/theme.ts` — clinic **theme** (`clinicTheme`).
- `clinicSite: WebsiteConfig` + `createClinicSite(overrides)` factory exported from `page.ts`.
- Removal of the Phase 5 `config.ts`; `verticals.spec.ts` repointed to `../clinic/page`.
- A new `clinic-template.spec.ts` proving concern-separation + valid/ordered output.

## Anatomy

### Theme — `sites/templates/clinic/theme.ts`

```ts
import type { ThemeConfig } from '~~/sites/core/schemas'

/** Clean, trustworthy clinic identity (frontend-design: calm/clinical). */
export const clinicTheme: ThemeConfig = {
  colors: { primary: '#0ea5e9', background: '#ffffff', foreground: '#0f172a' },
  mode: 'light',
  radius: '0.75rem',
  spacing: 'comfortable',
}
```

### Defaults — `sites/templates/clinic/defaults.json`

```jsonc
{
  "company": {
    "name": "Bright Smile Dental",
    "tagline": "Modern dental care for the whole family",
    "contact": { "email": "hello@brightsmile.example", "phone": "+1 555 0100", "address": "12 Park Avenue, Springfield" },
    "social": { "instagram": "https://instagram.com/brightsmile" },
    "legal": { "legalName": "Bright Smile Dental LLC" }
  },
  "sections": {
    "hero": { "variant": "centered", "heading": "Confident smiles start here", "subheading": "Gentle, modern dentistry in the heart of Springfield.", "cta": { "label": "Book a visit", "href": "#contact" } },
    "services": { "heading": "Our services", "items": [ { "title": "Cleanings & check-ups", "description": "Routine care to keep teeth healthy." }, { "title": "Whitening", "description": "Brighten your smile safely." }, { "title": "Implants", "description": "Permanent, natural-looking replacements." } ] },
    "testimonials": { "heading": "What patients say", "items": [ { "quote": "Painless and friendly — best dentist I have had.", "author": "A. Lopez" }, { "quote": "My kids actually look forward to visits now.", "author": "M. Chen", "role": "Parent" } ] },
    "faq": { "heading": "Questions", "items": [ { "question": "Do you take insurance?", "answer": "Yes, most major plans are accepted." }, { "question": "Do you see children?", "answer": "Absolutely — we welcome all ages." } ] },
    "contact": { "heading": "Visit us", "showForm": true, "hours": [ { "label": "Mon–Fri", "value": "9–5" } ] },
    "footer": {}
  }
}
```

> Note: no `type` field inside `sections.*` — `page.ts` supplies it. No order here, no theme here.

### Page (composition root) — `sites/templates/clinic/page.ts`

```ts
import type { WebsiteConfig } from '~~/sites/core/schemas'
import defaults from './defaults.json'
import { clinicTheme } from './theme'

/** The clinic page structure — order IS render order (the single source of ordering). */
const ORDER = ['hero', 'services', 'testimonials', 'faq', 'contact', 'footer'] as const
type SectionType = (typeof ORDER)[number]

export interface ClinicOverrides {
  company?: Partial<WebsiteConfig['company']>
  theme?: Partial<WebsiteConfig['theme']>
  content?: Partial<Record<SectionType, Record<string, unknown>>>
}

/** Build a clinic site: fixed ORDER, defaults + optional content/theme overrides. */
export function createClinicSite(overrides: ClinicOverrides = {}): WebsiteConfig {
  const content = defaults.sections as Record<SectionType, Record<string, unknown>>
  return {
    company: { ...defaults.company, ...overrides.company },
    theme: { ...clinicTheme, ...overrides.theme },
    sections: ORDER.map((type) => ({
      type,
      ...content[type],
      ...(overrides.content?.[type] ?? {}),
    })),
  } as WebsiteConfig
}

/** The clinic site with shipped defaults (no overrides). */
export const clinicSite: WebsiteConfig = createClinicSite()
```

## Assemble & validate

```ts
import '~~/sites/core/components/sections/register'   // populate registries (side effect)
import { validateWebsiteConfig } from '~~/sites/core/schemas'
import { clinicSite } from '~~/sites/templates/clinic/page'

const result = validateWebsiteConfig(clinicSite)
// result.valid === true; result.data renders via <SiteRenderer> in ORDER
```

## Reuse for another clinic (no structure change)

```ts
const villageDental = createClinicSite({
  company: { name: 'Village Dental', contact: { phone: '+1 555 0199' } },
  theme: { colors: { primary: '#10b981' } },
  content: { hero: { heading: 'Your neighborhood dentist' } },
})
// same ORDER, only content/theme differ → still passes validateWebsiteConfig
```

## Test

`sites/templates/__tests__/clinic-template.spec.ts`:
- no-override `clinicSite` passes `validateWebsiteConfig` and renders all 6 sections in `ORDER` (US1, SC-001).
- a content override changes only content; `sections.map(s=>s.type)` and `theme` unchanged (US2, FR-008).
- a theme override changes only `theme`; section types + content unchanged (US3, FR-009).
- three `createClinicSite(...)` sites all valid, all preserving `ORDER` (T7, SC-004).

`sites/templates/__tests__/verticals.spec.ts`: change `import { clinicSite } from '../clinic/config'`
→ `'../clinic/page'`; suite stays green.

Run: `npm run test` (or `npx vitest sites/templates`).

## Done when

All `contracts/clinic-template-contract.md` clauses T1–T7 hold and both spec files pass.
