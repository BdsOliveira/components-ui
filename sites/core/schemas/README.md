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
