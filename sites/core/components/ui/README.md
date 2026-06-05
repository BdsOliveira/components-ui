# core/components/ui

**Responsibility**: Atomic UI primitives — the smallest reusable building blocks (e.g. Button, Input, Card, Badge).

**Allowed**: Single-purpose, presentational primitives configurable via props; the vocabulary other components are built from.

**Prohibited**: Full page sections (→ `sections/`), structural chrome (→ `layout/`), business logic, and client-specific styling.

**Depends on**: `core` only (`theme`, `types`, `utils`). Primitives should not depend on sections or layout.
