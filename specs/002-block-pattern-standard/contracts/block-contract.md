# The Universal Block Contract

**Status**: Authoritative (single source of truth) · **Phase**: 2 · **Applies to**: every block in
`sites/core/components/{sections,ui,layout}/`.

> This contract is fixed once and inherited by every block forever. A block that does not satisfy
> every MUST clause below is **non-conforming** and MUST NOT be accepted. Capabilities the contract
> does not cover are added by amending this document, never by bypassing it per block.

---

## C1 — Single structured data input (FR-002, FR-003)

A block MUST receive its content through **exactly one prop, `data`**, carrying that block's config
slice, and MUST render its content from that input.

```vue
<!-- CONFORMING -->
<HeroSection :data="config.hero" />

<!-- NON-CONFORMING — prop-drilled scalar content -->
<HeroSection title="..." subtitle="..." cta-label="..." />
```

A block MUST NOT expose individual scalar content props. The only permitted non-`data` inputs are
framework/runtime concerns that are not content (e.g. an HTML `id`); when in doubt, it goes in
`data`.

## C2 — Typed, schema-backed config (FR-004, FR-015)

The `data` input MUST be strongly typed, and its type MUST be **derived from a Zod schema** (the
source of truth), not declared separately.

```ts
// sites/core/schemas/hero.ts
import { z } from 'zod'
export const heroSchema = z.object({
  variant: z.enum(['centered', 'split', 'minimal']).default('centered'),
  heading: z.string(),
  subheading: z.string().optional(),
  cta: z.object({ label: z.string(), href: z.string() }).optional(),
})
export type HeroConfig = z.infer<typeof heroSchema>
```

```ts
// in the block
defineProps<BlockProps<HeroConfig>>()
```

The block MUST self-document its config shape, variants, and slots so it is usable without reading
its source (schema export + JSON-Schema emission satisfies this).

## C3 — Validation before render, safe failure (FR-005, FR-013, FR-014)

A config slice MUST be validated against its schema **before render** using `safeParse`. Behavior is
defined for every outcome and MUST never crash the render:

| Input condition | Required behavior |
|-----------------|-------------------|
| Valid | Render normally |
| Missing / partial | Apply schema defaults → render degraded-but-valid state |
| Invalid field | Safe fallback (defaults / graceful degradation), never throw into render |
| Unknown / extra keys | Stripped by default (never silently merged); MAY opt into strict rejection |
| Unknown `variant` | Rejected by schema → resolve to default via fallback, never undefined state |

## C4 — Named, config-selected variants (FR-006, FR-007)

A block MUST declare a **closed set** of named variants and **exactly one explicit default**.
Variant is selected through `data.variant`. Selecting or changing a variant MUST be a
**configuration-only** change — no source edit, no new block.

## C5 — Optional additive slots (FR-008, FR-009)

A block MAY expose **optional named slots** (Vue named slots). A block MUST render **completely and
correctly with zero slots filled**. Slots are additive escape hatches for content the config cannot
express; they MUST NOT be required for the baseline render and MUST NOT replace the typed config as
the primary content path. When a slot and a config value target the same region, **the slot
overrides** that region (precedence MUST be documented per slot).

## C6 — Independence & isolation (FR-010, FR-011, FR-012)

A block MUST render standalone given only its config slice. A block MUST NOT:

- depend on sibling blocks, parent context, or render order;
- read or mutate shared global state;
- contain client-specific hardcoded content or read client identity from global state.

The same config slice MUST produce the same output regardless of surrounding blocks (predictable
render).

## C7 — Baseline quality (FR-016)

Every block MUST be **responsive**, **accessible to the WCAG baseline**, and **theme-aware**
(dark/light where applicable) by default. These are inherited from the constitution, not optional.

---

## Authoring summary

A conforming block:

1. has one prop `data: T` and nothing else for content (C1);
2. derives `T` from a Zod schema that is the source of truth (C2);
3. is validated pre-render and fails safe (C3);
4. declares a closed variant set with one default, selected via `data.variant` (C4);
5. renders fully without slots; slots are optional additive overrides (C5);
6. is independent, isolated, and client-neutral (C6);
7. is responsive, accessible, and theme-aware (C7).

Measure any candidate block with [`conformance-checklist.md`](./conformance-checklist.md).
