# Phase 5 Data Model: Core Block Set

The eight concrete block config schemas, their variants, and the site-context channels they consume.
Every schema is authored under `sites/core/schemas/<block>.ts`, is the single source of truth for its
block's `data` prop (`type = z.infer<schema>`, block-contract §C2), declares variants via
`blockVariant` (§C4), and marks required vs optional fields for graceful degradation (§C5/Decision 5).
Each block is registered as a flat section member `{ type, ...fields }` (Phase 3 `defineSection`).

Conventions: **R** = required, **O** = optional (`.optional()`), **D** = defaulted. Every block also
carries `variant` (D) and MAY accept an optional `id` (O, framework concern per §C1).

---

## Block: Hero — `type: "hero"`

The opening banner; the one block almost every vertical leads with.

| Field | Type | Req | Notes |
|-------|------|-----|-------|
| `variant` | enum `centered` \| `split` \| `minimal` | D=`centered` | §C4 |
| `heading` | string | **R** | the one thing a hero cannot omit |
| `subheading` | string | O | supporting line |
| `cta` | `{ label, href }` | O | primary action |
| `secondaryCta` | `{ label, href }` | O | omitted cleanly when absent (US4) |
| `media` | `{ src, alt }` | O | banner image; `split` variant features it |

- **Home**: `sites/core/schemas/hero.ts`. Trace: FR-002, FR-006, FR-008.

---

## Block: About — `type: "about"`

Narrative/identity section.

| Field | Type | Req | Notes |
|-------|------|-----|-------|
| `variant` | enum `text` \| `media-left` \| `media-right` | D=`text` | |
| `heading` | string | **R** | |
| `body` | string | **R** | descriptive paragraph(s) |
| `media` | `{ src, alt }` | O | required only by media-* variants visually; absent → text layout |
| `highlights` | array `{ label, value? }` | O | optional stat/feature points; empty → none |

- **Home**: `sites/core/schemas/about.ts`. Trace: FR-002, FR-008, FR-013.

---

## Block: Services — `type: "services"`

The "what we do" list; core across all five verticals.

| Field | Type | Req | Notes |
|-------|------|-----|-------|
| `variant` | enum `grid` \| `list` | D=`grid` | |
| `heading` | string | O | section title |
| `items` | array `ServiceItem` | **R** | variable count, no per-count code (FR-013) |

`ServiceItem`: `{ title (R), description (O), icon (O), media {src,alt} (O), cta {label,href} (O) }`.

- **Home**: `sites/core/schemas/services.ts`. Trace: FR-002, FR-013, edge: empty `items` → renders nothing.

---

## Block: CTA — `type: "cta"`

Focused conversion prompt (Book / Quote / Reserve).

| Field | Type | Req | Notes |
|-------|------|-----|-------|
| `variant` | enum `banner` \| `boxed` | D=`banner` | |
| `heading` | string | **R** | the prompt |
| `body` | string | O | supporting line |
| `cta` | `{ label, href }` | **R** | the action — a CTA without an action is meaningless |
| `secondaryCta` | `{ label, href }` | O | |

- **Home**: `sites/core/schemas/cta.ts`. Trace: FR-002, FR-006.

---

## Block: Testimonials — `type: "testimonials"`

Social proof list.

| Field | Type | Req | Notes |
|-------|------|-----|-------|
| `variant` | enum `grid` \| `carousel` | D=`grid` | |
| `heading` | string | O | |
| `items` | array `Testimonial` | **R** | variable count |

`Testimonial`: `{ quote (R), author (R), role (O), avatar {src,alt} (O), rating number (O) }`.

- **Home**: `sites/core/schemas/testimonials.ts`. Trace: FR-002, FR-013.

---

## Block: FAQ — `type: "faq"`

Common questions.

| Field | Type | Req | Notes |
|-------|------|-----|-------|
| `variant` | enum `accordion` \| `list` | D=`accordion` | |
| `heading` | string | O | |
| `items` | array `{ question (R), answer (R) }` | **R** | variable count |

- **Home**: `sites/core/schemas/faq.ts`. Trace: FR-002, FR-013.

---

## Block: Contact — `type: "contact"`

Ways to reach the business; sources cross-cutting contact info from site-level `company` (Decision 2).

| Field | Type | Req | Notes |
|-------|------|-----|-------|
| `variant` | enum `split` \| `stacked` | D=`split` | |
| `heading` | string | O | |
| `intro` | string | O | |
| `showForm` | boolean | D=`false` | renders a contact-form *structure* only (no delivery, spec Assumption) |
| `hours` | array `{ label, value }` | O | opening hours |
| `mapEmbedUrl` | string | O | optional map |
| `channels` | `{ email?, phone?, address? }` | O | per-block override; when absent, fall back to injected `company.contact` (FR-011) |

- **Home**: `sites/core/schemas/contact.ts`. Consumes `useSiteCompany()`. Trace: FR-002, FR-011.
- Edge: partial channels (only some of email/phone/address) render only what resolves.

---

## Block: Footer — `type: "footer"`

Page closer; sources identity/social from site-level `company` (Decision 2).

| Field | Type | Req | Notes |
|-------|------|-----|-------|
| `variant` | enum `columns` \| `minimal` | D=`columns` | |
| `tagline` | string | O | falls back to `company.tagline` |
| `linkGroups` | array `{ title?, links: [{label, href}] }` | O | nav columns; empty → none |
| `legal` | string | O | legal line; falls back to `company.legal.legalName` |
| `showSocial` | boolean | D=`true` | renders `company.social` links when present (FR-011) |

- **Home**: `sites/core/schemas/footer.ts`. Consumes `useSiteCompany()`. Trace: FR-002, FR-011.

---

## Shared: Block input contract

Every block component:

```ts
import type { BlockProps } from '~~/sites/core/types'
defineProps<BlockProps<HeroConfig>>()   // exactly one content input: data
```

bound by the renderer as `:data="section"` (Decision 1). `data.type` is present but unread.

## Shared: Site context channels (provide/inject from `SiteRenderer`)

| Channel | Provided value | Consumed by | Home |
|---------|----------------|-------------|------|
| `useSiteTheme()` | validated `ThemeConfig` | any block (brand tokens) | existing `composables/useSiteTheme.ts` |
| `useSiteCompany()` | validated `CompanyConfig` | Contact, Footer | new `composables/useSiteCompany.ts` (Decision 2) |

## Shared: Registration

| Registry | Call (per block, in `sections/register.ts`) |
|----------|---------------------------------------------|
| schema (Phase 3) | `registerSection(defineSection('<type>', <schema>))` |
| component (Phase 4) | `registerSectionComponent('<type>', <Section>.vue)` |

A Nuxt plugin imports `register.ts` for its side effect so both registries are populated at app boot.

## Sample vertical configs (Decision 7)

One `WebsiteConfig` per vertical orchestrating a subset/order of the eight blocks, under
`sites/templates/<niche>/config.ts`: `clinic`, `lawyer`, `restaurant`, `school`, `local-business`.
Each is `{ company, theme, sections: [...] }` and MUST pass `validateWebsiteConfig`.
