# templates

**Responsibility**: Niche-specific orchestrations of `core` sections — reusable arrangements of core building blocks for a given niche.

**Allowed**: Composition and configuration of `core` components into niche layouts/page templates, parameterized for reuse across clients in that niche.

**Prohibited**: Duplicated logic that belongs in `core`, per-client custom layouts (→ `clients/`), and client-specific data.

**Depends on**: `core`. Never depends on `clients`.

## Phase 5 — sample vertical sites

Five sample `WebsiteConfig`s prove config-only assembly from the eight core blocks — each is pure
orchestration (block order + content), no custom layout or block-source edits:

| Vertical | File | Section order |
|----------|------|---------------|
| Clinic | `clinic/config.ts` | hero → services → testimonials → faq → contact → footer |
| Lawyer | `lawyer/config.ts` | hero → about → services → cta → contact → footer |
| Restaurant | `restaurant/config.ts` | hero → about → services → testimonials → contact → footer |
| School | `school/config.ts` | hero → about → services → faq → cta → contact → footer |
| Local business | `local-business/config.ts` | hero → services → cta → testimonials → contact → footer |

Each `{ company, theme, sections }` passes `validateWebsiteConfig` and renders in order through
`<SiteRenderer>` (`__tests__/verticals.spec.ts`). Cross-cutting contact/social live once on
`company`; the Contact/Footer blocks source them.
