# core

**Responsibility**: Business-neutral, reusable engine — the technical building blocks every template and client is assembled from.

**Allowed**: Generic, configurable components, composables, theme tokens, SEO helpers, form blocks, shared types, pure utils, and config schemas that work for any niche or client.

**Prohibited**: Client-specific or template-specific content, hardcoded business logic, copy, or branding. Nothing here may reference a particular client or niche.

**Depends on**: Nothing. `core` is the lowest layer; higher layers depend on it, never the reverse.
