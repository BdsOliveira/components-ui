# The Core Block Set Contract (Phase 5)

**Status**: Authoritative for the eight Phase 5 blocks · **Phase**: 5 · **Builds on**:
`002-block-pattern-standard/contracts/block-contract.md` (§C1–C7) and
`004-dynamic-renderer/contracts/renderer-contract.md`.

This contract fixes the public surface Phase 5 adds: which section `type`s exist, how each is
bound and registered, and the two amendments to the Phase 4 renderer that this phase makes. Every
block additionally satisfies the unchanged universal block contract §C1–C7.

---

## B1 — The available set is exactly eight (FR-001, FR-012)

After Phase 5, the section schema registry and component registry each contain exactly these
`type`s and no others:

```text
hero · about · services · cta · testimonials · faq · contact · footer
```

A configuration naming any other `type` is invalid (Phase 3 discriminated-union rejection). These
eight MUST suffice to assemble a complete single-page site for clinic, lawyer, restaurant, school,
and local-business verticals.

## B2 — Single `data` prop binding (FR-002; block-contract §C1)

Every block declares exactly one content input and reads its slice from it:

```ts
defineProps<BlockProps<HeroConfig>>()   // data: HeroConfig (= z.infer<heroSchema>)
```

**Renderer amendment (Decision 1)**: `DynamicSection` binds the slice as `:data="section"` (was
`v-bind="section"`). `data` is the flat member `{ type, ...fields }`; `data.type` is inert inside the
block. No block exposes scalar content props.

## B3 — Schema is the source of truth (FR-010; block-contract §C2)

Each block's `data` type is `z.infer` of a Zod schema at `sites/core/schemas/<block>.ts`. Field
shapes, requiredness, defaults, and variants are defined there and nowhere else. Whole-site
validation (Phase 3 `validateWebsiteConfig`) is the single pre-render gate; blocks trust the
validated slice and never re-validate.

## B4 — Closed variants, one default, config-selected (FR-006, FR-007; block-contract §C4)

Each block declares `variant: blockVariant([...values], default)` with ≥2 values and exactly one
default. Variant selection is configuration-only. An unknown variant resolves to the default via the
schema (never an undefined state).

## B5 — Required vs optional; graceful degradation (FR-008, FR-013; block-contract §C3/§C5)

Each schema marks the business-essential minimum required and all else optional/defaulted. Omitted
optional regions render nothing (no empty placeholders). List blocks (`services`, `testimonials`,
`faq`) take `z.array(...)`; an empty array renders nothing for that region. Missing required content
is rejected at validation, before render.

## B6 — Client-neutral; cross-cutting identity from site level (FR-005, FR-011; block-contract §C6)

No block contains business- or niche-specific hardcoded content. Blocks needing cross-cutting
identity (Contact, Footer) read it from the site-level `company` via a sanctioned site-context
channel, not from their own duplicated config.

**Renderer amendment (Decision 2)**: add `useSiteCompany()` — a provide/inject channel mirroring
`useSiteTheme()`. `SiteRenderer` provides the validated `CompanyConfig` once; Contact/Footer inject
it. A per-block `channels` override, when present, takes precedence over the injected company value.

## B7 — Registration in both registries (FR-003, FR-014)

Each block is made fully supported by ONE registration performing both:

```ts
registerSection(defineSection('<type>', <schema>))          // validatable (Phase 3)
registerSectionComponent('<type>', <Block>Section)          // renderable (Phase 4)
```

All eight registrations live in `sites/core/components/sections/register.ts`; a Nuxt plugin imports
it for its side effect so both registries are populated at app boot. Blocks are independent: adding
or omitting one MUST NOT affect another's rendering.

## B8 — Baseline quality (block-contract §C7; Constitution IX/X)

Every block is responsive (mobile-first), WCAG-baseline accessible (semantic landmarks, config-driven
alt text, visible focus), and theme-aware via the injected `ThemeConfig`. Blocks render server-side
(SSG-first) with minimal hydration.

---

## Acceptance instrument

Each block is accepted only when it passes the Phase 2
[`conformance-checklist.md`](../../002-block-pattern-standard/contracts/conformance-checklist.md)
**and** every clause B1–B8 above. The five-vertical sample configs
(`sites/templates/<niche>/config.ts`) rendering coherently through `SiteRenderer` is the
end-to-end acceptance of B1/FR-012/SC-002.
