# core/types

**Responsibility**: Shared TypeScript types — compile-time type definitions used across `core` and higher layers.

**Allowed**: `type`/`interface` declarations, enums, and type-only utilities. No runtime code.

**Prohibited**: Runtime-validatable schemas (→ `schemas/`), runtime logic, and client-specific shapes.

**Depends on**: Nothing at runtime (type-only). Logically the lowest part of `core`.
