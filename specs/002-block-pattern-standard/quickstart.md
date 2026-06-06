# Quickstart: Authoring a Contract-Conforming Block

This walks an author from zero to a block that passes the
[conformance checklist](./contracts/conformance-checklist.md). Phase 2 ships the **standard**; no
concrete blocks are committed yet — this is the recipe every future block follows. Read
[`block-contract.md`](./contracts/block-contract.md) first.

## 1. Define the schema (source of truth)

`sites/core/schemas/<block>.ts`:

```ts
import { z } from 'zod'

export const heroSchema = z.object({
  variant: z.enum(['centered', 'split', 'minimal']).default('centered'), // C4: closed set + default
  heading: z.string(),
  subheading: z.string().optional(),
  cta: z.object({ label: z.string(), href: z.string() }).optional(),
})

export type HeroConfig = z.infer<typeof heroSchema> // C2: type derived, never re-declared
```

## 2. Type the single input

`sites/core/components/sections/HeroSection.vue`:

```vue
<script setup lang="ts">
import { heroSchema, type HeroConfig } from '~/sites/core/schemas/hero'
import type { BlockProps } from '~/sites/core/types' // { data: T }

const props = defineProps<BlockProps<HeroConfig>>() // C1: exactly one content prop `data`

// C3: validate before render, fail safe — never throw into the template
const parsed = heroSchema.safeParse(props.data)
const data = parsed.success ? parsed.data : heroSchema.parse({ heading: '' }) // schema defaults
</script>

<template>
  <!-- C5: renders fully from `data`; slot is an optional additive override -->
  <section :data-variant="data.variant">
    <slot name="heading"><h1>{{ data.heading }}</h1></slot>
    <p v-if="data.subheading">{{ data.subheading }}</p>
    <a v-if="data.cta" :href="data.cta.href">{{ data.cta.label }}</a>
  </section>
</template>
```

## 3. Render JSON-driven

```vue
<HeroSection :data="config.hero" />
```

`config.hero` is a plain slice of the client's `config.json`. Switching variant = editing
`config.hero.variant`. No source change (C4/C7).

## 4. Verify against the checklist

Run every block through [`conformance-checklist.md`](./contracts/conformance-checklist.md). The
block is accepted only when all applicable K-criteria pass (SC-007).

## Conformance at a glance

| Step | Contract clause | Checklist |
|------|-----------------|-----------|
| One `data` prop, no scalar content props | C1 | K1–K3 |
| `z.infer` type from one schema | C2 | K4–K6 |
| `safeParse` before render, safe fallback | C3 | K7–K9 |
| Closed variants + explicit default via `data.variant` | C4 | K10–K13 |
| Optional additive slots, full baseline without them | C5 | K14–K16 |
| Independent, isolated, client-neutral | C6 | K17–K20 |
| Responsive / accessible / theme-aware | C7 | K21–K23 |

## Anti-patterns (auto-reject)

- `<HeroSection title="..." subtitle="..." />` — prop-drilled content (fails K3).
- TS interface declared **and** a separate schema — two sources of truth (fails K4/K5).
- Reading another block's output or a global client object (fails K17/K18/K20).
- A block that needs a slot filled to render at all (fails K14/K15).
- `throw` on invalid config — crashes the render (fails K8).
