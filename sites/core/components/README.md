# core/components

**Responsibility**: Reusable UI components, grouped by role into `sections/`, `ui/`, and `layout/`.

**Allowed**: Vue components that are business-neutral and configurable via props. Place each by role: full page sections, atomic primitives, or structural chrome.

**Prohibited**: Client/template-specific markup or copy; components that do not belong to one of the three role groups.

**Depends on**: `core` only (theme, types, composables, utils). Never depends on `templates`, `clients`, `onboarding`, `assets`, or `scripts`.

## Block independence & isolation ([block-contract.md §C6](../../../specs/002-block-pattern-standard/contracts/block-contract.md))

Every block in `sections/`, `ui/`, and `layout/` MUST satisfy the [universal block contract](../../../specs/002-block-pattern-standard/contracts/block-contract.md).
A block renders standalone given only its config slice. It MUST NOT:

- depend on sibling blocks, parent context, or render order (FR-010);
- read or mutate shared mutable global state (FR-010);
- contain client-specific hardcoded content or read client identity from global state (FR-011).

The same config slice MUST produce the **same output regardless of surrounding blocks** —
predictable, same-input → same-output rendering (FR-012). This independence is lint-guarded: blocks
under `sites/core/components/**` may not import client identity / global client state (see
`eslint.config.mjs` `no-restricted-imports`).

Measure any block against [`conformance-checklist.md`](../../../specs/002-block-pattern-standard/contracts/conformance-checklist.md) (K1–K23).
