# Phase 1 Data Model: Core Structure

This feature has no runtime data. The "entities" are structural: the layers and areas of the
canonical layout and their documented metadata. Modeled here so `/speckit-tasks` can generate
one task per node.

## Entity: Layer

A top-level area under `sites/` with a single responsibility and a dependency direction.

| Field | Description |
|-------|-------------|
| name | `core`, `templates`, `clients`, `onboarding`, `assets`, `scripts` |
| responsibility | One-sentence single responsibility |
| depends_on | Layers this layer may depend on (lower layers only) |
| prohibited | What must never appear here |

**Instances & dependency direction** (higher → lower; `core` depends on nothing):

| Layer | Responsibility | depends_on | Prohibited |
|-------|----------------|-----------|------------|
| `core` | Business-neutral reusable engine | (none) | client/template-specific content, hardcoded business logic |
| `templates` | Niche orchestrations of core sections | `core` | duplicated logic, per-client custom layouts |
| `clients` | Isolated per-client config + assets + domain | `core`, `templates` | shared/global logic, cross-client coupling |
| `onboarding` | Intake form data and onboarding input | `core` | rendering logic |
| `assets` | Shared and client assets | (none) | code/logic |
| `scripts` | Automation, scaffolding, generators | `core` | client-specific one-offs |

## Entity: Core Area

A sub-area of `core/` grouping one kind of reusable building block.

| name | Holds | Boundary vs. neighbors |
|------|-------|------------------------|
| `components` | UI components (see Component Group) | — |
| `composables` | Vue `use*` composables (reactivity/lifecycle) | not pure utils |
| `theme` | Design tokens, dark/light theme system | not component markup |
| `seo` | SEO meta utilities/helpers | not page content |
| `forms` | Form blocks + validation helpers | not full sections |
| `types` | Shared TypeScript types | not runtime schemas |
| `utils` | Pure framework-free functions / data transformers | no Vue reactivity |
| `schemas` | Versioned, runtime-validatable config schemas | not plain types |

## Entity: Component Group

A sub-area of `core/components/` classifying components by role.

| name | Holds | Example |
|------|-------|---------|
| `sections` | Full page sections | HeroSection, ServicesSection, FAQSection, CTASection |
| `ui` | Atomic UI primitives | Button, Input, Card, Badge |
| `layout` | Structural chrome | Header, Footer, Container |

## Entity: Layer Documentation

Per-folder `README.md` content contract.

| Field | Required | Description |
|-------|----------|-------------|
| responsibility | yes | The folder's single responsibility |
| allowed | yes | What belongs here |
| prohibited | yes | What must never go here |
| depends_on | yes (layers) | Dependency direction statement |

## Derived structure (validation target)

17 mandated directories, each with a `README.md`:

```text
sites/core
sites/core/components
sites/core/components/sections
sites/core/components/ui
sites/core/components/layout
sites/core/composables
sites/core/theme
sites/core/seo
sites/core/forms
sites/core/types
sites/core/utils
sites/core/schemas
sites/templates
sites/clients
sites/onboarding
sites/assets
sites/scripts
```
