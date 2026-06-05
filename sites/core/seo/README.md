# core/seo

**Responsibility**: SEO meta utilities and helpers — generic functions for building titles, meta tags, Open Graph, and structured data.

**Allowed**: Reusable, config-driven SEO helpers that any template/client can feed data into.

**Prohibited**: Actual page content or copy, client-specific meta values, and rendering logic.

**Depends on**: `core` only (`types`, `utils`). Never depends on higher layers.
