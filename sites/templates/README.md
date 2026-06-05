# templates

**Responsibility**: Niche-specific orchestrations of `core` sections — reusable arrangements of core building blocks for a given niche.

**Allowed**: Composition and configuration of `core` components into niche layouts/page templates, parameterized for reuse across clients in that niche.

**Prohibited**: Duplicated logic that belongs in `core`, per-client custom layouts (→ `clients/`), and client-specific data.

**Depends on**: `core`. Never depends on `clients`.
