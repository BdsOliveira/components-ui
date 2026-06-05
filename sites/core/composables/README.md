# core/composables

**Responsibility**: Reusable Vue composables — `use*` functions built on Vue reactivity and lifecycle.

**Allowed**: Stateful/reactive logic using `ref`, `computed`, `watch`, lifecycle hooks; shared behavior consumed by components.

**Prohibited**: Pure, framework-free functions (→ `utils/`), component markup, and client-specific logic.

**Depends on**: `core` only (`types`, `utils`). Never depends on higher layers.
