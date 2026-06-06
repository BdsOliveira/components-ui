# core/types

**Responsibility**: Shared TypeScript types — compile-time type definitions used across `core` and higher layers.

**Allowed**: `type`/`interface` declarations, enums, and type-only utilities. No runtime code.

**Prohibited**: Runtime-validatable schemas (→ `schemas/`), runtime logic, and client-specific shapes.

**Depends on**: Nothing at runtime (type-only). Logically the lowest part of `core`.

## Block contract types

### `BlockProps<T>` — single structured input ([block-contract.md §C1](../../../specs/002-block-pattern-standard/contracts/block-contract.md))

Every block receives its content through **exactly one prop, `data`**, carrying that block's
config slice. No scalar content props.

```vue
<!-- CONFORMING -->
<HeroSection :data="config.hero" />

<!-- NON-CONFORMING — prop-drilled scalar content -->
<HeroSection title="..." subtitle="..." cta-label="..." />
```

A block is typed with `defineProps<BlockProps<HeroConfig>>()`, where `HeroConfig` is the inferred
schema type (`z.infer`). This structurally enforces FR-002/FR-003: one `data` input, nothing else
for content. The only permitted non-`data` inputs are framework/runtime concerns that are not
content (e.g. an HTML `id`); when in doubt, it goes in `data`.

### `BlockSlots<Names>` — optional additive slots ([block-contract.md §C5](../../../specs/002-block-pattern-standard/contracts/block-contract.md))

A block MAY expose **optional named slots** (Vue named slots). Every slot in `BlockSlots<Names>` is
optional by construction, enforcing the rule that a block **renders completely and correctly with
zero slots filled** (FR-008/FR-009). Slots are additive escape hatches — never required for the
baseline render, never the primary content path (config is).

```vue
defineSlots<BlockSlots<'heading' | 'cta'>>()
```

**Precedence**: when a slot and a config value target the same region, the **slot overrides** the
config-derived default for that region (`SlotOverridesConfig`). Document the overridden region per
slot.
