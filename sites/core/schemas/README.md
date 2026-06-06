# core/schemas

**Responsibility**: Versioned, runtime-validatable config schemas — the source of truth for component/template props and client config shape.

**Allowed**: Runtime schema definitions (validatable), versioned to evolve safely; used to validate config at runtime.

**Prohibited**: Plain compile-time types (→ `types/`), component markup, and client-specific config values.

**Depends on**: `core` only (`types`, `utils`). Never depends on higher layers.

## Block contract conventions

Primitives here implement the [universal block contract](../../../specs/002-block-pattern-standard/contracts/block-contract.md).

### Schema is the single source of truth ([§C2](../../../specs/002-block-pattern-standard/contracts/block-contract.md))

Declare ONE Zod schema per block with `defineBlockSchema` (or `z.object`). The TypeScript type is
**always derived** with `z.infer` (`BlockConfig<typeof schema>`) — **never re-declare it**. Two
sources of truth guarantee drift.

```ts
import { defineBlockSchema, z, blockVariant, type BlockConfig } from '~/sites/core/schemas'

export const heroSchema = defineBlockSchema({
  variant: blockVariant(['centered', 'split', 'minimal'], 'centered'),
  heading: z.string(),
})
export type HeroConfig = BlockConfig<typeof heroSchema> // = z.infer<typeof heroSchema>
```

Emit JSON Schema with `blockJsonSchema(schema)` for editor autocomplete / self-documentation (FR-015).

### Validate before render, fail safe ([§C3](../../../specs/002-block-pattern-standard/contracts/block-contract.md))

Validate every config slice with `validateBlockConfig` **before render**. It uses `safeParse` and
**never throws into the render**:

| Input condition | Behavior |
|-----------------|----------|
| Valid | render normally (`valid: true`) |
| Missing / partial | apply schema defaults → degraded-but-valid |
| Invalid field | caller fallback / schema defaults, never throw |
| Unknown / extra keys | stripped by default (never silently merged) |
| Unknown `variant` | rejected → resolves to default via fallback |

```ts
const { data } = validateBlockConfig(heroSchema, props.data) // always schema-valid
```

A block MAY opt into strict rejection (`schema.strict()`) where a typo must fail loudly.

### Variants — closed set, one default ([§C4](../../../specs/002-block-pattern-standard/contracts/block-contract.md))

`blockVariant([...], default)` builds a `z.enum([...]).default(default)` for the reserved `variant`
key. The set is **closed**; there is **exactly one explicit default** (applied when `variant` is
omitted). Selection is via `data.variant` and is a **config-only** change — no source edit, no new
block. An unknown variant is rejected by the enum and resolves to the default through the safe
fallback above (never an undefined state).

## Central website schema (Phase 3)

Phase 2 fixed the shape of **one block**; Phase 3 fixes **how blocks compose into a whole site**.
The authoritative source of truth is
[`website-schema-contract.md`](../../../specs/003-website-config-schema/contracts/website-schema-contract.md);
the modules below implement it and reuse the Phase 2 primitives unchanged. One import surface:
`~/sites/core/schemas`.

### One canonical site shape — `WebsiteConfig` ([§W1](../../../specs/003-website-config-schema/contracts/website-schema-contract.md))

A website **is exactly one** `WebsiteConfig` object — `company` + `theme` + an **ordered**
`sections` list. **No information about a site is held outside its `WebsiteConfig`, and no layer
defines a private or alternative whole-site shape** (FR-003). `WebsiteConfig` is the single
exported whole-site type; `websiteConfigSchema` is its Zod source of truth (`website.ts`).

```ts
import { websiteConfigSchema, type WebsiteConfig } from '~/sites/core/schemas'
// websiteConfigSchema = z.object({ company, theme, sections: z.array(buildSectionSchema()) })
```

`sections` is ordered and the array order **is** render order — no hidden reordering (FR-006). The
same `type` may repeat; each item is an independent instance (FR-007). An **empty** `sections: []`
is a valid, defined state (an empty page, §W6 / FR-016).

### One schema across every layer ([§W1](../../../specs/003-website-config-schema/contracts/website-schema-contract.md), FR-017)

`WebsiteConfig` is the lingua franca at every boundary: **onboarding produces** it, **templates
consume/merge** it, and the **renderer accepts only** it. There is **no per-layer site shape and no
alternative whole-site representation anywhere in `sites/`** — one shape, one import surface
(`~/sites/core/schemas`). New capability is added via the section registry (below), never by
inventing a competing site type.

### `company` — single source of business identity ([§W8](../../../specs/003-website-config-schema/contracts/website-schema-contract.md), FR-008)

`companySchema` (`company.ts`) is the **site-level** source of cross-cutting business identity
(name, contact, social, legal) that many sections reuse — read once from `company`, **never
duplicated per section**. `name` is the one required field (a real site cannot omit its identity);
everything else is optional so partial input degrades gracefully (FR-013).

### `theme` — site-wide visual tokens ([§W8](../../../specs/003-website-config-schema/contracts/website-schema-contract.md), FR-009)

`themeSchema` (`theme.ts`) holds visual tokens (colors, typography, `mode`, radius/spacing) applied
**uniformly across all sections**. Re-skinning the whole site is a **configuration change** to
`theme` — **no per-section source edit**. Every field is defaulted/optional, so a missing or partial
theme still yields a valid, renderable token set (`colors.primary` and `mode` default; FR-013).

### `Section` — a closed discriminated union from one registry ([§W3](../../../specs/003-website-config-schema/contracts/website-schema-contract.md)/[§W6](../../../specs/003-website-config-schema/contracts/website-schema-contract.md)/[§W7](../../../specs/003-website-config-schema/contracts/website-schema-contract.md))

Each `sections` item is one member of the closed discriminated union `Section`, keyed by the `type`
discriminator. A member is **flat** — the Phase 2 block slice with the discriminator merged in
(`defineSection('hero', heroSchema)` = `heroSchema.extend({ type: z.literal('hero') })`). An
**unknown / unregistered `type` is rejected** (invalid discriminator value, FR-014). The union is
built from **one authoritative registry** (`section.ts`); `buildSectionSchema()` assembles the
current registry into `z.discriminatedUnion('type', …)`, or a **reject-all element schema**
(`z.never()`) when the registry is **empty** — so a non-empty `sections` list is invalid while an
empty list stays valid (§W6). Phase 3 ships the **registry empty** (no concrete sections).

### Whole-site validation ([§W4](../../../specs/003-website-config-schema/contracts/website-schema-contract.md)/[§W5](../../../specs/003-website-config-schema/contracts/website-schema-contract.md))

`validateWebsiteConfig(input)` (`validate-website.ts`) validates a `WebsiteConfig` **as one unit
before render** and **never throws** (build/server-time gate, Constitution IX). Two distinct
failure classes:

| Input condition | Behavior |
|-----------------|----------|
| Missing / partial `company` / `theme` | schema **defaults** applied — **not** a rejection (W4 / FR-013) |
| Any **invalid** section item (unknown `type` or bad slice) | **whole config rejected** (W5 / FR-012 / FR-014); never silent broken output |

It returns a **per-item report** `{ index, type?, valid, issues? }` that attributes failure to the
specific offending item and reports **valid siblings as valid** (FR-015 / SC-006) — the aggregate
gate rejects, the diagnostics localize. `sections` order is preserved (FR-006). It reuses the Phase
2 `validateBlockConfig` (its `safeParse`/never-throw contract) for `company`/`theme`.

```ts
import { validateWebsiteConfig } from '~/sites/core/schemas'
const result = validateWebsiteConfig(input) // never throws
if (result.valid) render(result.data)
else for (const s of result.sections) if (!s.valid) report(s.index, s.type, s.issues)
```

### Extending — the single-registry procedure ([§W7](../../../specs/003-website-config-schema/contracts/website-schema-contract.md), FR-018/FR-019)

New section types are added in **one authoritative place** — never per-template forks, never editing
a hand-written union literal:

1. Author the section's Phase 2 block schema (`blockSchema`, conforming to the block contract).
2. Register it once: `registerSection(defineSection('<type>', blockSchema))`.
3. `buildSectionSchema()` now includes it as a union member automatically.

**Backward compatibility (MUST):** adding a member leaves all existing valid `WebsiteConfig` data
valid (existing data uses other `type`s). **Field additions to `company`/`theme` MUST be
optional/defaulted** so prior data still validates (FR-019).
