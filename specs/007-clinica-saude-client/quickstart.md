# Phase 7 Quickstart: Clínica Saúde — the first real client

How one fake client becomes a live, distinct clinic site by **data only**, and how to verify the four
validation goals: theme swap, content swap, image swap, responsiveness. Read after `spec.md`,
`plan.md`, `research.md`, `data-model.md`, `contracts/client-contract.md`.

## What this phase delivers

- A self-contained client directory `sites/clients/clinica-saude/`:
  - `config.json` — clinic override document (template + company/theme/content).
  - `images/` — client-owned image(s), served at `/clients/clinica-saude/images/…`.
  - `domain.txt` — one domain string.
  - `__tests__/` — config-parse + override-isolation + domain tests.
- App wiring so the client renders: `app/pages/index.vue` (load → validate → `<SiteRenderer>`),
  `app/app.vue` switched to `<NuxtPage />`, and a Nitro `publicAssets` entry for client images.
- No change to `core` schemas or the clinic template.

## Anatomy

### Client config — `sites/clients/clinica-saude/config.json`

```jsonc
{
  "template": "clinic",
  "company": {
    "name": "Clínica Saúde",
    "tagline": "Cuidado de saúde moderno para toda a família",
    "contact": { "email": "contato@clinicasaude.example", "phone": "+55 11 4000 0000", "address": "Av. Paulista, 1000 — São Paulo" }
  },
  "theme": {
    "colors": { "primary": "#15803d", "background": "#ffffff", "foreground": "#0f172a" },
    "mode": "light"
  },
  "content": {
    "hero": {
      "variant": "split",
      "heading": "Sua saúde em boas mãos",
      "subheading": "Atendimento humano e moderno no coração de São Paulo.",
      "cta": { "label": "Agendar consulta", "href": "#contact" },
      "media": { "src": "/clients/clinica-saude/images/hero.jpg", "alt": "Equipe da Clínica Saúde recebendo um paciente" }
    },
    "services": { "heading": "Especialidades", "items": [ /* … */ ] }
  }
}
```

> `theme.colors.primary` differs from the clinic default `#0ea5e9` → proves theme swap. `content.*`
> differs from `defaults.json` → proves content swap. `hero.variant: "split"` + `media` → proves image
> swap (the hero split variant is the surface that renders `<img>`). No `order` field — the template
> owns order (FR-008).

### Render page — `app/pages/index.vue` (shape)

```vue
<script setup lang="ts">
import { validateWebsiteConfig } from '~~/sites/core/schemas'
import { createClinicSite } from '~~/sites/templates/clinic/page'
import config from '~~/sites/clients/clinica-saude/config.json'

// dispatch on config.template (clinic only this phase) → build → validate
const raw = createClinicSite({ company: config.company, theme: config.theme, content: config.content })
const result = validateWebsiteConfig(raw)
</script>

<template>
  <SiteRenderer v-if="result.valid" :config="result.data!" />
  <pre v-else>Invalid client config: {{ result }}</pre>
</template>
```

### Images served — `nuxt.config.ts`

```ts
nitro: {
  publicAssets: [
    { dir: 'sites/clients/clinica-saude/images', baseURL: '/clients/clinica-saude/images' },
  ],
},
```

### Domain — `sites/clients/clinica-saude/domain.txt`

```text
clinica-saude.example.com
```

## Verify the four goals

Run the unit instruments:

```bash
npx vitest run sites/clients/clinica-saude
```

Expected:

- **Theme swap** — built `site.theme.colors.primary === "#15803d"`; section order + content equal the
  no-theme-override build (C6.2).
- **Content swap** — client hero/services copy present in built sections; `site.theme` + order equal the
  no-content-override build (C6.3).
- **Image swap** — built hero `media.src === "/clients/clinica-saude/images/hero.jpg"` AND that file
  exists in `images/` (C6.4); no broken reference.
- **Config validity / order** — `createClinicSite(config)` → `validateWebsiteConfig.valid === true`;
  built order === clinic `ORDER` (C6.1/C6.5).
- **Domain** — `domain.txt` present and passes the domain validator (C6.6).

Then check responsiveness in the browser:

```bash
npm run dev   # open the served page
```

- **Responsiveness** — at phone (~375px), tablet (~768px), desktop (~1280px) widths: every section is
  readable, no horizontal overflow, no overlapping content (C6.7 / SC-004).

## Guardrails

- Client dir holds **data + assets + its own tests only** — no shared logic (C1.2; Constitution XIV).
- Dispatch/loader lives in `app/`, never in `core` (core MUST NOT import templates — Constitution II/III).
- `config.json` MUST NOT carry a section-order field; order stays template-owned (FR-008 / C2.6).
- Images stay in the client dir and are served via Nitro — not copied into `public/` (C3.2 / XII).
