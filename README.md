# components-ui

Multi-client commercial website starter-kit built on **Nuxt 4 / Vue 3 / Nitro**.

**Mission:** publish a complete commercial site in under 2 hours by assembling
reusable UI blocks — orchestrated by niche templates and driven by validated JSON
config — instead of custom-coding each site.

A new site is **not** a new project. It is one client folder with a `config.json`.

---

## How it works

The project is organized in 4 layers. Dependencies only point **downward** — a
lower layer never imports an upper one.

| Layer | Path | Role |
|-------|------|------|
| **Core** (engine) | `sites/core/` | Schemas, Zod validation, registries, renderer, composables, SEO, theme |
| **Components** | `sites/core/components/` | Generic, prop-driven, theme-aware sections |
| **Templates** (niche) | `sites/templates/<niche>/` | Fixed section order + theme + default content |
| **Clients** | `sites/clients/<name>/` | `config.json`, `domain.txt`, `images/` |

### Render chain

```
config.json
  → app/pages/index.vue   (pick client by CLIENT env, dispatch by `template`)
    → template factory     (sites/templates/registry.ts)
      → WebsiteConfig
        → validateWebsiteConfig   (Zod — invalid config never renders)
          → <SiteRenderer>
            → <DynamicSection>     (resolve component by section `type`)
              → section component
```

### The "two registries" rule

A section `type` only works when registered in **both** places, in
`sites/core/components/sections/register.ts`:

1. **Schema** — `registerSection` (validation knows the type)
2. **Component** — `registerSectionComponent` (renderer can mount it)

Register one without the other → the section is rejected or won't render.

---

## Project structure

```
sites/
├── core/                  # Engine — schemas, validation, registries, renderer, theme, SEO
│   ├── components/         #   Generic section + UI + layout + render components
│   │   └── sections/register.ts   # The two registries live here
│   ├── composables/
│   ├── schemas/            # Zod schemas + validateWebsiteConfig
│   ├── seo/  theme/  types/  utils/  forms/
├── templates/             # Niche templates (fixed section order + defaults)
│   ├── registry.ts         # template discriminator → factory
│   ├── clinic/  lawyer/  local-business/  restaurant/  school/
├── clients/               # One folder per client site
│   ├── README.md
│   └── clinica-saude/
│       ├── config.json     # The whole site, as data
│       ├── domain.txt      # Production domain
│       └── images/
├── scripts/new-client.ts  # Scaffolds a new client folder
└── onboarding/

app/pages/index.vue        # Top-layer loader: select client, dispatch template
docs/                      # Full PT-BR engineering manual (start at docs/README.md)
specs/                     # Feature specs (spec-kit)
```

---

## Getting started

Install dependencies:

```bash
npm install
```

Run the dev server. Pick which client renders with the `CLIENT` env var
(defaults to `clinica-saude`):

```bash
# default client
npm run dev

# specific client
CLIENT=clinica-saude npm run dev
```

Open `http://localhost:3000`.

### Create a new client

```bash
npm run new-client
```

Scaffolds `sites/clients/<name>/` with a `config.json`, `domain.txt`, and
`images/`. Clients are **auto-discovered** — `app/pages/index.vue` globs
`sites/clients/*/config.json`, so adding a folder makes it selectable with zero
code edits.

### Tests

```bash
npm test          # vitest run
```

### Build

```bash
npm run build     # production build
npm run preview   # preview the production build locally
npm run generate  # static generation
```

---

## Documentation

Full engineering manual (PT-BR) lives under [`docs/`](./docs/README.md). Start at
[`docs/README.md`](./docs/README.md) — main index, 10-topic overview, glossary,
and 5 Mermaid diagrams. Highlights:

- [`docs/getting-started/`](./docs/getting-started/) — install, run dev, first client
- [`docs/architecture/`](./docs/architecture/) — the 4 layers + diagrams
- [`docs/core/`](./docs/core/) — render engine, schemas/validation, the two registries
- [`docs/templates/`](./docs/templates/) · [`docs/clients/`](./docs/clients/) · [`docs/components/`](./docs/components/)
- [`docs/guides/`](./docs/guides/) — 13 how-to guides
- [`docs/troubleshooting/`](./docs/troubleshooting/) — symptom → cause → fix

Project rules are governed by `.specify/memory/constitution.md`. The **source of
truth is always the code** — docs link to it, never duplicate it.
```