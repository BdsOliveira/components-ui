# Quickstart: Render a Website from Data

How a validated `WebsiteConfig` becomes a live page, and how a new section type becomes renderable —
**by registering, never by editing the renderer** (SC-002, SC-003). The renderer modules referenced
here are authored in the implement phase
(`sites/core/components/render/*`, `sites/core/components/sections/registry.ts`,
`sites/core/composables/useSiteTheme.ts`); this walkthrough is the intended end-to-end usage of the
contract.

---

## 1. Register a section's schema AND component (one place per section — R7)

A concrete section (added in a later phase) registers in **both** registries — ideally in its own
module so schema and component never drift:

```ts
// sites/core/components/sections/hero/index.ts   (later phase — illustrative)
import { registerSection, defineSection } from '~/sites/core/schemas'
import { registerSectionComponent } from '~/sites/core/components/sections/registry'
import { heroSchema } from './hero.schema'        // a Phase 2 block schema
import HeroSection from './HeroSection.vue'

registerSection(defineSection('hero', heroSchema))      // schema: 'hero' is a valid Section member
registerSectionComponent('hero', HeroSection)           // component: 'hero' is now renderable
```

After this, `'hero'` is **fully supported**: validatable (Phase 3) and renderable (Phase 4). Adding
`'services'` later is the same two lines in its own module — the renderer is never touched (SC-002).

## 2. Author a `WebsiteConfig` as JSON (Phase 3)

A whole site is one object: `company` + `theme` + an ordered `sections` list. Order is render order;
the same `type` may repeat:

```jsonc
{
  "company": { "name": "Bright Smile Clinic" },
  "theme": { "colors": { "primary": "#0ea5e9" }, "mode": "light" },
  "sections": [
    { "type": "hero",     "variant": "centered", "heading": "Modern dental care" },
    { "type": "services", "variant": "grid",     "items": [ /* ... */ ] }
  ]
}
```

## 3. Validate, then render (R8 → R1)

The page/route validates with Phase 3, then renders the validated config — the renderer trusts it:

```vue
<!-- a client page (later phase) -->
<script setup lang="ts">
import { validateWebsiteConfig } from '~/sites/core/schemas'
import raw from '~/sites/clients/bright-smile/config.json'

const result = validateWebsiteConfig(raw)
// result.valid === false -> Phase 3 failure behavior; do not render a broken page
</script>

<template>
  <SiteRenderer v-if="result.valid" :config="result.data!" />
</template>
```

`SiteRenderer` iterates `DynamicSection` over `sections` in order (R2), keys each item by
`section.id ?? `${index}:${type}`` (R10), and provides the theme to every section (R11). Each section
renders via `<component :is>` resolved from the registry (R3) with only its own slice (R5).

## 4. Read the shared theme inside a section (R11)

Any section reads the one site-wide theme via inject — no prop-drilling:

```vue
<!-- inside HeroSection.vue (later phase) -->
<script setup lang="ts">
import { useSiteTheme } from '~/sites/core/composables/useSiteTheme'
const theme = useSiteTheme()            // the provided ThemeConfig
</script>
```

Change `WebsiteConfig.theme` → the new visual identity applies across all sections, no section edits
(SC-009).

## 5. What happens at the edges (R6, R9, R13)

- **Empty site** — `"sections": []` renders a valid empty page, no error (R9).
- **Unknown type** — a section `type` with no registered *schema* is rejected at step 3 by Phase 3
  validation (never reaches the renderer).
- **Registered schema, missing component** — `DynamicSection` renders nothing for that item + emits a
  dev-only warning; sibling sections render normally (R6).
- **A section throws at runtime** — contained at that section's boundary; the rest of the page renders
  (R6).
- **Phase 4 baseline (empty component registry)** — the mechanism is complete: `sections: []` renders
  empty, and any non-empty list already failed Phase 3 validation (empty schema registry), so no
  unmapped type ever reaches the renderer (R13).

---

## Conformance check (what "done" means for Phase 4)

| Check | Clause |
|-------|--------|
| Sections render in list order via their type's component | R1, R2 |
| One `DynamicSection`, zero per-type branching in callers | R3 |
| One `type`→component registry, mirrors schema registry | R4 |
| Each section gets only its own slice | R5 |
| Missing component / section throw → safe, siblings render | R6 |
| New type = register schema + component, no renderer edits | R7 |
| Renders only Phase-3-validated config | R8 |
| Empty `sections` → empty page | R9 |
| Stable per-section key from the item | R10 |
| One theme provided to all sections (Phase 3 model) | R11 |
| Renderer neutral, reusable unchanged, JSON-driven | R12 |
| Empty-registry baseline complete and safe | R13 |
</content>
