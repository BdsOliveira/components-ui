# Phase 5 Quickstart: Core Block Set

How the eight blocks are authored, registered, and assembled into a site. Read after `spec.md` and
`contracts/block-set-contract.md`.

## What this phase delivers

- Eight section blocks: **hero, about, services, cta, testimonials, faq, contact, footer**.
- Each = a Zod schema (`sites/core/schemas/<block>.ts`) + a Vue SFC
  (`sites/core/components/sections/<Block>Section.vue`) + one dual-registration.
- `sites/core/components/sections/register.ts` + a Nuxt plugin that populates both registries at boot.
- A new `useSiteCompany()` site-context channel; two one-line Phase 4 renderer amendments.
- Five sample vertical configs proving config-only assembly.

## Anatomy of a block (Hero)

**Schema** — `sites/core/schemas/hero.ts`:

```ts
import { z, defineBlockSchema, blockVariant, type BlockConfig } from '~~/sites/core/schemas'

export const heroSchema = defineBlockSchema({
  variant: blockVariant(['centered', 'split', 'minimal'], 'centered'),
  heading: z.string(),
  subheading: z.string().optional(),
  cta: z.object({ label: z.string(), href: z.string() }).optional(),
  media: z.object({ src: z.string(), alt: z.string() }).optional(),
})
export type HeroConfig = BlockConfig<typeof heroSchema>
```

**Component** — `sites/core/components/sections/HeroSection.vue`:

```vue
<script setup lang="ts">
import type { BlockProps } from '~~/sites/core/types'
import type { HeroConfig } from '~~/sites/core/schemas/hero'
import { useSiteTheme } from '~~/sites/core/composables/useSiteTheme'

const { data } = defineProps<BlockProps<HeroConfig>>()
const theme = useSiteTheme()   // brand tokens; never client identity
</script>

<template>
  <section :class="`hero hero--${data.variant}`">
    <h1>{{ data.heading }}</h1>
    <p v-if="data.subheading">{{ data.subheading }}</p>
    <a v-if="data.cta" :href="data.cta.href">{{ data.cta.label }}</a>
  </section>
</template>
```

**Registration** — in `sites/core/components/sections/register.ts`:

```ts
registerSection(defineSection('hero', heroSchema))
registerSectionComponent('hero', HeroSection)
```

## Renderer amendments this phase makes

`DynamicSection.vue` — bind the slice as one prop:

```diff
- <component :is="resolved" v-bind="section" />
+ <component :is="resolved" :data="section" />
```

`SiteRenderer.vue` — provide company alongside theme:

```diff
  useSiteTheme(props.config.theme)
+ useSiteCompany(props.config.company)
```

(Phase 4 renderer tests/fixtures update from reading `attrs` to reading `props.data`.)

## Assembling a vertical site (config only)

`sites/templates/clinic/config.ts`:

```ts
import type { WebsiteConfig } from '~~/sites/core/schemas'

export const clinicSite: WebsiteConfig = {
  company: { name: 'Bright Smile Clinic', contact: { phone: '...', email: '...' } },
  theme: { colors: { primary: '#0ea5e9' } },
  sections: [
    { type: 'hero', heading: 'Modern dental care', cta: { label: 'Book a visit', href: '#contact' } },
    { type: 'services', items: [{ title: 'Cleanings' }, { title: 'Implants' }] },
    { type: 'testimonials', items: [{ quote: 'Great!', author: 'A. Lopez' }] },
    { type: 'faq', items: [{ question: 'Insurance?', answer: 'Yes.' }] },
    { type: 'contact', showForm: true },
    { type: 'footer' },
  ],
}
```

Render it (any page):

```vue
<script setup lang="ts">
import { validateWebsiteConfig } from '~~/sites/core/schemas'
import { clinicSite } from '~~/sites/templates/clinic/config'
const result = validateWebsiteConfig(clinicSite)
</script>
<template>
  <SiteRenderer v-if="result.valid" :config="result.data!" />
</template>
```

## Verify

```bash
npm test          # per-block schema + render tests, five-vertical integration
npm run dev       # visually check each sample vertical renders coherently
```

Acceptance: all eight `type`s registered and renderable; each renders with minimal and full content;
each variant switchable via config; five vertical sample sites render in order with zero block-code
changes.
