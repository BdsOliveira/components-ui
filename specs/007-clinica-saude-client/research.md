# Phase 0 Research: First Real Client — Clínica Saúde (Phase 7)

Resolves every NEEDS CLARIFICATION from Technical Context. Each decision is the minimum that
proves the four validation goals (theme/content/image swap + responsiveness) while obeying the
constitution (II layering, III core neutrality, IV JSON-driven, VI niche reuse, XII isolation, XIV
anti-patterns).

## Decision 1 — Client config shape: per-concern overrides, not a full WebsiteConfig

**Decision**: `sites/clients/clinica-saude/config.json` is a **client override document** keyed by a
`template` discriminator plus the three overridable concerns the clinic factory already accepts:

```jsonc
{
  "template": "clinic",
  "company": { /* Partial<CompanyConfig> */ },
  "theme":   { /* Partial<ThemeConfig>   */ },
  "content": { "hero": { /* slice */ }, "services": { /* slice */ }, ... }
}
```

It is fed to `createClinicSite({ company, theme, content })` (Phase 6) to produce a full
`WebsiteConfig`, which is then `validateWebsiteConfig`-checked before render.

**Rationale**: Phase 6 already exposes `createClinicSite(overrides)` with exactly
`{ company, theme, content }` and a fixed, non-overridable `ORDER`. Reusing it means the client adds
**data only** (Constitution IV) and reuses the niche template's structure (VI). A full
`WebsiteConfig` in the client would duplicate section order/content the template already owns
(Anti-pattern XIV: duplicated layouts).

**Alternatives considered**:
- *Full `WebsiteConfig` in config.json* — rejected: duplicates template structure, breaks "templates
  orchestrate" (VI), and lets a client reorder sections (violates FR-008 / Constitution VI).
- *Two files (content vs theme)* — rejected: one `config.json` is the constitution's named unit (IV,
  XII); concern isolation is already enforced by the factory's per-concern merge.

## Decision 2 — `template` discriminator + dispatch lives in the app layer, not core

**Decision**: A small loader maps `config.template` → the matching template factory
(`"clinic"` → `createClinicSite`). This dispatch lives in the **app composition layer**
(`app/pages` / a tiny `app/` helper), NOT in `sites/core`.

**Rationale**: `core` MUST NOT depend on `templates` (Constitution II: higher layers depend on lower,
never the reverse; III core neutrality). A loader that imports template factories is therefore a
top-layer concern. `core` keeps only the business-neutral `validateWebsiteConfig`.

**Alternatives considered**:
- *Loader in `core`* — rejected: would make core import `sites/templates/*`, inverting the
  dependency direction (II violation).
- *Loader in the client dir* — rejected: client dir holds data + assets only; shared dispatch logic
  another client would reuse must not live there (clients README "Prohibited"; promote to higher
  composition instead).

## Decision 3 — Rendering route: add `app/pages/index.vue`, switch `app.vue` to `<NuxtPage>`

**Decision**: Render the client by adding `app/pages/index.vue` that imports the client config, builds
+ validates the site, and mounts `<SiteRenderer :config>` only when valid. `app/app.vue` changes from
the `<NuxtWelcome>` scaffold to `<NuxtPage />` (+ `<NuxtRouteAnnouncer />`).

**Rationale**: No route renders a site today (`app.vue` shows `NuxtWelcome`, no `pages/`). The four
validation goals require an actually-rendered page. `SiteRenderer` already documents the exact
integration contract (`validateWebsiteConfig(raw)` → render only `result.data` when valid). One index
page is the smallest thing that proves the pipeline for one fake client.

**Alternatives considered**:
- *`app/pages/[client].vue` registry route* — deferred: real multi-client routing/domain resolution is
  a later phase; Phase 7 needs one client rendered, not a routing system (avoid overengineering, XIV).
- *Render inside `app.vue` directly* — rejected: bypasses Nuxt routing/SSG and the page conventions
  later clients need.

## Decision 4 — Client images: kept in the client dir, served via Nitro public assets

**Decision**: Images stay in `sites/clients/clinica-saude/images/` (Constitution XII: client owns its
assets). They are exposed to the browser by a Nitro `publicAssets` entry mapping that directory to the
URL base `/clients/clinica-saude/images`. The hero references them as
`media.src: "/clients/clinica-saude/images/<file>"` (the existing `HeroSection` `split` variant renders
`<img :src="data.media.src">`).

**Rationale**: Image swap must be a config change against client-owned assets without copying files into
`public/` (which would break per-client isolation and duplicate assets — XII/XIV). A `nitro.publicAssets`
mapping adds **no runtime dependency** (XIV) and serves the client dir as-is. The hero already consumes
`{ src, alt }` (alt required → a11y, Constitution V/X).

**Alternatives considered**:
- *Copy images into `public/clients/...`* — rejected: duplicates assets, splits the client's source of
  truth (XII isolation).
- *Vite/`@nuxt/image` static import* — rejected for now: `config.json` is static JSON and cannot carry
  ES imports; image optimization is a perf concern for a later phase, not needed to prove the swap.

## Decision 5 — Image swap requires the `split` hero variant

**Decision**: The client hero uses `variant: "split"` with a `media` slice, because
`HeroSection.vue` only renders `<img>` for `variant === 'split' && data.media`.

**Rationale**: Proving "image swap" needs a section that actually renders an image; the hero split
variant is the existing image surface. This is a content-override detail, fully data-driven.

**Alternatives considered**: *Centered hero with a background image* — rejected: no background-image
surface exists in the current block; would require a component change (out of scope, the client adds
data only).

## Decision 6 — Domain definition: single-line domain string in `domain.txt`, validated

**Decision**: `domain.txt` holds one trimmed domain string (e.g. `clinica-saude.example.com`). A
validator asserts it is non-empty and matches a basic hostname pattern; multi-domain, DNS, and
provisioning are out of scope (per spec Assumptions).

**Rationale**: The phase only needs the domain *associated and validatable* (FR-009/FR-012). A plain
text file is the simplest isolated, white-label-friendly domain unit (Constitution XII "domains
abstracted").

**Alternatives considered**: *Domain inside `config.json`* — rejected: the user's structure names a
dedicated `domain.txt`, and keeping routing/identity separate from render config aids future
domain→client resolution.

## Decision 7 — Validation strategy for the four goals

**Decision**:
- **Theme/content/image swap + config parsing** → Vitest unit tests in
  `sites/clients/clinica-saude/__tests__/` (mirrors `sites/templates/__tests__`): assert
  `config.json` parses, `createClinicSite(config)` yields a `validateWebsiteConfig`-valid site, the
  client's theme/content/image override the clinic defaults, and order is unchanged.
- **Domain** → a unit test asserting `domain.txt` is present and passes the domain validator.
- **Responsiveness** → manual visual check at phone/tablet/desktop widths documented in
  `quickstart.md`; the underlying section components are already responsive by constitution (V/X), so
  no new responsive code is introduced — only verification.

**Rationale**: Constitution XI mandates config-parsing + rendering-consistency tests for any feature
touching config parsing/template rendering. Responsiveness is a layout property of existing components,
best verified visually rather than asserted in a headless unit test (avoids brittle pixel tests, XIV).

**Alternatives considered**: *Automated viewport/screenshot tests* — deferred: heavier tooling than the
phase needs to prove one client renders responsively.
