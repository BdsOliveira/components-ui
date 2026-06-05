# core/forms

**Responsibility**: Form building blocks and validation helpers — reusable field components and validation logic.

**Allowed**: Generic form controls, field wrappers, and framework-agnostic-to-Vue validation helpers, configurable via props/schema.

**Prohibited**: Full page sections (→ `components/sections/`), client-specific forms, and submission/business logic tied to a client.

**Depends on**: `core` only (`components/ui`, `composables`, `schemas`, `types`, `utils`).
