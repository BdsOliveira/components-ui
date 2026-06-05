# core/schemas

**Responsibility**: Versioned, runtime-validatable config schemas — the source of truth for component/template props and client config shape.

**Allowed**: Runtime schema definitions (validatable), versioned to evolve safely; used to validate config at runtime.

**Prohibited**: Plain compile-time types (→ `types/`), component markup, and client-specific config values.

**Depends on**: `core` only (`types`, `utils`). Never depends on higher layers.
