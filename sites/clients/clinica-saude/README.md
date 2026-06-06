# clinica-saude

**Responsibility**: The platform's first real client — a self-contained directory that produces a
distinct clinic site by **configuration only**, reusing the `clinic` template and `core` blocks with no
source changes to lower layers.

**Allowed**: This client's own `config.json` (template + company/theme/content overrides), client-owned
`images/`, `domain.txt`, and its own `__tests__/`.

**Prohibited**: Shared/template/core logic, cross-client references, a section-order field (order is owned
by the template, FR-008), and copying images into `public/` (they are served from here via Nitro).

**Depends on**: `sites/templates/clinic` (`createClinicSite`) and `sites/core` (`validateWebsiteConfig`,
`SiteRenderer`). Nothing depends on this client — it is the highest layer.

## Layout

```text
sites/clients/clinica-saude/
├── config.json   # ClientConfig override document — template + company/theme/content (C2)
├── domain.txt    # single-line domain string (C4)
├── images/       # client-owned assets, served at /clients/clinica-saude/images/ (C3)
│   └── hero.jpg
└── __tests__/    # config-parse + override-isolation + domain instruments (C6)
```

## Render flow

`config.json` → `app/pages/index.vue` (dispatch `template` → `createClinicSite({ company, theme,
content })`) → `validateWebsiteConfig` → `<SiteRenderer :config>`. Images map to
`/clients/clinica-saude/images/` via `nitro.publicAssets` in `nuxt.config.ts`.
