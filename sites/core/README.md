# core

**Responsibility**: Business-neutral, reusable engine — the technical building blocks every template and client is assembled from.

**Allowed**: Generic, configurable components, composables, theme tokens, SEO helpers, form blocks, shared types, pure utils, and config schemas that work for any niche or client.

**Prohibited**: Client-specific or template-specific content, hardcoded business logic, copy, or branding. Nothing here may reference a particular client or niche.

**Depends on**: Nothing. `core` is the lowest layer; higher layers depend on it, never the reverse.

## The universal block standard

Every block in `components/{sections,ui,layout}/` MUST satisfy the **universal block contract** —
the authoritative single source of truth for block authoring:

- [`block-contract.md`](../../specs/002-block-pattern-standard/contracts/block-contract.md) — the contract (C1–C7).
- [`conformance-checklist.md`](../../specs/002-block-pattern-standard/contracts/conformance-checklist.md) — the pass/fail instrument (K1–K23); a block is accepted only when every applicable criterion passes.
- [`quickstart.md`](../../specs/002-block-pattern-standard/quickstart.md) — author a conforming block step by step.

Code-level primitives live in [`types/`](./types) (`BlockProps<T>`, `BlockSlots<Names>`) and
[`schemas/`](./schemas) (`defineBlockSchema`, `validateBlockConfig`, `blockVariant`, `blockJsonSchema`).
