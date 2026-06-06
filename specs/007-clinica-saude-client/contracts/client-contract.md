# Contract: Clínica Saúde Client (Phase 7)

The interface this phase exposes: the **client directory layout**, the **`config.json` document
shape**, the **domain file format**, and the **render integration contract**. Stable surface that a
later multi-client/onboarding phase will generate against.

Contract IDs are referenced by tasks and tests.

## C1 — Client directory layout

```text
sites/clients/clinica-saude/
├── config.json        # ClientConfig override document (C2)
├── domain.txt         # single-line domain string (C4)
├── images/            # client-owned image assets (C3)
│   └── <files…>
└── __tests__/         # validation instruments (C6)
```

- **C1.1** The directory MUST contain `config.json`, `domain.txt`, and `images/`.
- **C1.2** The directory MUST NOT contain shared/template/core logic — data, assets, and its own
  tests only (clients README "Prohibited"; Constitution II/XIV).
- **C1.3** Nothing outside this directory may import another client; this client may depend only on
  `sites/templates/*` and `sites/core/*` (Constitution II).

## C2 — `config.json` shape (ClientConfig)

- **C2.1** `config.json` MUST be valid JSON parsing to an object.
- **C2.2** `template` MUST be present and equal `"clinic"` (the only template registered this phase);
  any other value MUST cause a reported load error, never a silent default.
- **C2.3** `company` (optional) MUST be a partial `CompanyConfig`; after merge over the clinic
  defaults, `company.name` MUST be resolvable.
- **C2.4** `theme` (optional) MUST be a partial `ThemeConfig`; `mode` (if present) ∈
  `light|dark|system`; tokens are validated by `themeSchema` after merge.
- **C2.5** `content` (optional) keys MUST be a subset of the clinic `ORDER`
  (`hero, services, testimonials, faq, contact, footer`); each slice after merge MUST satisfy its
  block schema.
- **C2.6** `config.json` MUST NOT contain a section-order field; order is owned by the template and is
  NOT client-overridable (FR-008).
- **C2.7** Building the site from `config.json` via the template factory MUST yield a `WebsiteConfig`
  that passes `validateWebsiteConfig` (`valid === true`).

## C3 — Images

- **C3.1** Image files MUST reside under `sites/clients/clinica-saude/images/`.
- **C3.2** Images MUST be served at base URL `/clients/clinica-saude/images/` (Nitro public assets;
  research D4) — no copies under `public/`.
- **C3.3** Each image reference in `config.json` (`content.hero.media`) MUST provide both `src` (the
  served URL) and a non-empty `alt` (a11y, Constitution V/X).
- **C3.4** Every `src` referenced in `config.json` MUST correspond to a file that exists in `images/`
  (missing file is detectable, FR-012).

## C4 — `domain.txt`

- **C4.1** `domain.txt` MUST contain exactly one trimmed domain string.
- **C4.2** The value MUST be non-empty and match a basic hostname pattern (dot-separated labels + a
  TLD); an empty or malformed value MUST be reported (FR-012).

## C5 — Render integration

- **C5.1** A top-layer loader (`app/`) MUST map `config.template` → the matching template factory and
  build the site from `{ company, theme, content }` — dispatch MUST NOT live in `sites/core`
  (Constitution II/III).
- **C5.2** The page MUST validate via `validateWebsiteConfig(raw)` and render `<SiteRenderer :config>`
  ONLY with `result.data` when `result.valid` (SiteRenderer input contract R8); an invalid config MUST
  NOT render a site.
- **C5.3** `app/app.vue` MUST render `<NuxtPage />` so the client page route mounts.

## C6 — Validation instruments (acceptance)

Each maps to a spec acceptance scenario / success criterion:

- **C6.1 (US1, SC-001/SC-002)** `config.json` parses and `createClinicSite(config)` →
  `validateWebsiteConfig.valid === true`, producing a distinct site reusing the clinic order.
- **C6.2 (US2, SC-003)** A client theme differing from `clinicTheme` appears in the built site
  (`site.theme.colors.primary === client primary`) while section order and content equal the
  no-theme-override build → theme swap isolated.
- **C6.3 (US3, SC-003)** Client content overrides appear in the built sections while
  `site.theme` and order equal the no-content-override build → content swap isolated.
- **C6.4 (US4, SC-003)** The client hero `media.src` (served image URL) appears in the built site and
  the referenced file exists in `images/` → image swap proven, no broken reference.
- **C6.5 (US1)** The built section order equals the clinic `ORDER` (client cannot reorder, FR-008).
- **C6.6 (domain, FR-009/FR-012)** `domain.txt` exists and passes the domain validator.
- **C6.7 (US5, SC-004)** Documented manual check: the rendered page is readable with no horizontal
  overflow at phone/tablet/desktop widths (quickstart).

## Non-goals (explicit)

- Multi-client routing / domain→client resolution (single index render this phase).
- Image optimization pipeline; DNS/SSL/deployment; onboarding generation of `config.json`.
- Any change to `core` schemas or the clinic template structure.
