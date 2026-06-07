<!-- SPECKIT START -->
Active plan: specs/009-developer-docs-system/plan.md

For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan. Key
references for the active feature: spec.md, research.md, data-model.md,
contracts/docs-structure-contract.md, contracts/doc-template-contract.md, quickstart.md
(all under specs/009-developer-docs-system/).
<!-- SPECKIT END -->

## Project objective

Multi-client commercial website starter-kit (Nuxt 4 / Vue 3 / Nitro). Mission:
publish complete commercial sites in under 2 hours by assembling reusable UI
blocks orchestrated by niche templates and driven by validated JSON config — not
custom-coded sites. A new site = a client folder with a `config.json`, not a new
project. Optimizes for speed, maintainability, multi-client scale, and a
JSON-driven, layered architecture. Governed by `.specify/memory/constitution.md`.

### Architecture (4 layers, dependency only-downward)

| Layer | Path | Role |
|-------|------|------|
| Core (engine) | `sites/core/` | schemas, validation, registries, renderer, composables, SEO, theme |
| Components | `sites/core/components/` | generic, prop-driven, theme-aware sections |
| Templates (niche) | `sites/templates/<niche>/` | fixed section order + theme + default content |
| Clients | `sites/clients/<name>/` | `config.json`, `domain.txt`, `images/` |

Canonical chain: `config.json` → `app/pages/index.vue` (select by `CLIENT` env,
dispatch by `template`) → template factory → `WebsiteConfig` →
`validateWebsiteConfig` (Zod) → `<SiteRenderer>` → `<DynamicSection>` (resolve by
`type`) → section component. "Two registries" rule: a section `type` works only
when registered in BOTH schema (`registerSection`) and component
(`registerSectionComponent`) in `sites/core/components/sections/register.ts`.

## Developer documentation (`docs/`)

Complete PT-BR engineering manual generated under `docs/` (feature
009-developer-docs-system). 44 Markdown docs + 1 reusable template; every snippet
cites a real repo path. Validation is by inspection (no automated tests — content
deliverable).

- **Entry point**: `docs/README.md` — main index, 10-topic overview, PT-BR glossary.
- **11 themed subfolders** (each with `README.md` index):
  - `getting-started/` — install, run dev (`CLIENT` env), first client
  - `architecture/` — 4 layers, operational philosophy, Mermaid diagrams
  - `core/` — render engine, schemas/validation, the two registries
  - `templates/` — niche strategy + composition
  - `clients/` — `config.json` shape, isolation, domains
  - `components/` — objective "valid component" criteria
  - `onboarding/` + `deployment/` — today vs future flows
  - `guides/` — 13 How-To guides (FR-008: explanation/files/example/conventions/errors)
  - `standards/` — dev standards, JSON config rules, future scale
  - `troubleshooting/` — 7 symptoms (symptom → cause → fix)
- **Reusable doc template**: `docs/_templates/documento-modelo.md`.
- **5 Mermaid diagrams**: folder structure, template composition, render flow,
  onboarding flow, deployment flow.
- **Convention**: PT-BR content; English tech terms explained on first use; every
  doc ends with "Próximos passos" (≥1 internal link — no dead ends); source of
  truth is the code (docs link to it, never duplicate rules).
