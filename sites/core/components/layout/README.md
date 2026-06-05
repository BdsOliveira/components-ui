# core/components/layout

**Responsibility**: Structural layout chrome — the frame around page content (e.g. Header, Footer, Container).

**Allowed**: Components that define page structure and positioning, configurable via props/slots.

**Prohibited**: Page sections (→ `sections/`), atomic primitives (→ `ui/`), and any client- or template-specific content.

**Depends on**: `core` only (may compose `ui/` primitives, `theme`, `composables`).
