# Phase 1 Data Model: Dynamic Renderer

The renderer's pieces are runtime entities (a registry, two components, a composable) built on the
Phase 3 whole-site schema. They hold **no schema of their own** — the data shapes are Phase 3's
(`WebsiteConfig`, `Section`, `ThemeConfig`). Validation rules trace to the spec's functional
requirements. Code homes (authored in the implement phase) reuse `sites/core/`.

---

## Entity: Component Registry

The single authoritative `type` → component map — the runtime sibling of the Phase 3 section schema
registry (`sites/core/schemas/section.ts`). A section `type` is renderable only if registered here
(FR-003, FR-004).

| Aspect | Rule | Trace |
|--------|------|-------|
| Authority | The only place a `type` is mapped to a component; no per-template/client forks | FR-003, FR-004 |
| Keying | Keyed by the same `type` discriminator as the schema registry | FR-003 |
| Idempotency | Re-registering a `type` replaces it (mirrors `registerSection`) | research D2 |
| Lockstep | A fully-supported type is registered in BOTH schema and component registries | FR-007, research D2 |
| Empty baseline | Ships empty; resolve returns nothing for every type (FR-018) | FR-018 |
| Neutrality | Lives in `core/`; holds no client/niche content | FR-017 |

- **API** (mirrors `section.ts`):
  ```ts
  // sites/core/components/sections/registry.ts
  import type { Component } from 'vue'

  export function registerSectionComponent(type: string, component: Component): void
  export function resolveSectionComponent(type: string): Component | undefined
  export function registeredSectionComponents(): string[]
  export function clearSectionComponentRegistry(): void   // test/scratch support
  ```
- **Home**: `sites/core/components/sections/registry.ts`.

---

## Entity: DynamicSection (the dynamic section renderer)

One Vue component that renders a single section item by resolving its component from the registry and
binding the item's config slice — the unit iterated to render a page (FR-005, FR-001).

| Aspect | Rule | Trace |
|--------|------|-------|
| Input | One section item (a validated `Section` union member) | FR-005, FR-012 |
| Dispatch | `resolveSectionComponent(section.type)` → `<component :is>`; no per-type branching | FR-005, research D1 |
| Slice props | Binds ONLY this item's config slice (not siblings') | FR-008 |
| Missing component | Renders nothing visible + dev warning; never crashes/broken markup | FR-010, research D4 |
| Error isolation | `onErrorCaptured` boundary contains a section's runtime throw | FR-011, research D5 |
| Reusability | Renderer logic unchanged when new types are registered | FR-007, FR-019 |

- **Shape**:
  ```vue
  <!-- sites/core/components/render/DynamicSection.vue -->
  <script setup lang="ts">
  import type { Section } from '~/sites/core/schemas'
  import { resolveSectionComponent } from '~/sites/core/components/sections/registry'

  const props = defineProps<{ section: Section }>()
  const resolved = computed(() => resolveSectionComponent(props.section.type))
  // onErrorCaptured -> contain + dev-warn (research D5); dev-warn on !resolved (D4)
  </script>

  <template>
    <component :is="resolved" v-if="resolved" v-bind="section" />
    <!-- no resolved component -> render nothing (D4) -->
  </template>
  ```
  *(The full config slice IS the section item; `v-bind="section"` passes its fields. `type` is
  ignored by the section component, which reads its own block fields — Phase 2/3 flat-member shape.)*
- **Home**: `sites/core/components/render/DynamicSection.vue`.

---

## Entity: SiteRenderer (the page iterator)

The thin wrapper that renders a whole page by iterating `DynamicSection` over `WebsiteConfig.sections`
in order, and provides the site theme to all sections.

| Aspect | Rule | Trace |
|--------|------|-------|
| Input | A validated `WebsiteConfig` (Phase 3); trusts it, does not re-validate | FR-012, research D7 |
| Order | Iterates `sections` in array order = render order; no reordering | FR-002, FR-006 |
| Keying | Keys each item by `section.id ?? `${index}:${type}`` | FR-016, research D3 |
| Empty list | `sections: []` → a valid empty page, no error | FR-014 |
| Theme | Calls `useSiteTheme(config.theme)` to provide the theme to all sections | FR-015 |
| Repetition | Same `type` repeated → each item rendered independently | FR-008 (per-item slice) |

- **Shape**:
  ```vue
  <!-- sites/core/components/render/SiteRenderer.vue -->
  <script setup lang="ts">
  import type { WebsiteConfig } from '~/sites/core/schemas'
  import { useSiteTheme } from '~/sites/core/composables/useSiteTheme'

  const props = defineProps<{ config: WebsiteConfig }>()
  useSiteTheme(props.config.theme)   // provide theme to all sections (FR-015)
  </script>

  <template>
    <DynamicSection
      v-for="(section, index) in config.sections"
      :key="(section as any).id ?? `${index}:${section.type}`"
      :section="section"
    />
  </template>
  ```
- **Home**: `sites/core/components/render/SiteRenderer.vue`.

---

## Entity: Site Theme Context (useSiteTheme)

The provide/inject channel carrying the Phase 3 `ThemeConfig` from `SiteRenderer` to every rendered
section, so one visual identity applies site-wide via configuration (FR-015).

| Aspect | Rule | Trace |
|--------|------|-------|
| Source | Reuses Phase 3 `ThemeConfig`; defines no new theme model | FR-015, research D6 |
| Provide | `useSiteTheme(theme)` provides on a typed injection key (call in SiteRenderer) | FR-015 |
| Inject | `useSiteTheme()` (no arg) returns the provided theme for a section | FR-015 |
| Scope | Scoped to the rendered site subtree (not a mutable global) | research D6 |
| Reactivity | Theme change re-applies across all sections, no per-section edits | FR-015, SC-009 |

- **Shape**:
  ```ts
  // sites/core/composables/useSiteTheme.ts
  import type { ThemeConfig } from '~/sites/core/schemas'

  export function useSiteTheme(theme: ThemeConfig): void          // provide (SiteRenderer)
  export function useSiteTheme(): ThemeConfig                      // inject (sections)
  ```
- **Home**: `sites/core/composables/useSiteTheme.ts`.

---

## Entity: Render Input (validated `WebsiteConfig`)

Not a new shape — the Phase 3 `WebsiteConfig` after `validateWebsiteConfig` passes. Recorded here as
the renderer's input contract.

| Aspect | Rule | Trace |
|--------|------|-------|
| Origin | `validateWebsiteConfig(raw).data` when `result.valid` (Phase 3) | FR-012, research D7 |
| Failure | Invalid → Phase 3 reject behavior; renderer not invoked | FR-013 |
| Trust | Renderer assumes validated shape; no internal re-validation | FR-012 |
| Carries | `company` (available to sections), `theme` (propagated), ordered `sections` | FR-015, FR-002 |

- **Home**: type from `sites/core/schemas/website.ts`; gate from `sites/core/schemas/validate-website.ts`.

---

## Relationships

```text
validateWebsiteConfig(raw)  ──valid──▶  WebsiteConfig
                                            │
                                            ▼
                                       SiteRenderer(config)
                                       │            │
                            useSiteTheme(theme)     │ v-for section in sections (order = render order)
                            provides ThemeConfig    ▼
                                  │            DynamicSection(section)
                                  │                 │ resolveSectionComponent(section.type)
                                  │                 ▼
                                  └── inject ──▶  <section component>  ◀── v-bind section slice
                                                  (registered in component registry,
                                                   mirroring schemas/section.ts)
```

- **Component Registry** ↔ **schemas/section.ts**: lockstep per `type` (register in both).
- **SiteRenderer** → **DynamicSection**: one per section item, keyed, in order.
- **DynamicSection** → **Component Registry**: resolves component by `type`.
- **useSiteTheme**: provided once by SiteRenderer, injected by each section.
</content>
