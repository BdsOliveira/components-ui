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

## Dynamic renderer ([renderer-contract.md](../../../specs/004-dynamic-renderer/contracts/renderer-contract.md))

Phase 4 adds the engine that turns a validated `WebsiteConfig` into a page:

- `render/SiteRenderer.vue` — iterates `DynamicSection` over `config.sections` in list order
  (= render order), keys each item `id ?? `${index}:${type}``, and provides the site theme via
  [`useSiteTheme`](../composables/README.md). Input MUST be a Phase-3-validated `WebsiteConfig`
  (`validateWebsiteConfig`); it is not re-validated here (R8).
- `render/DynamicSection.vue` — resolves one section item's `type` to a component via the registry
  and renders it with `<component :is>` (no per-type branching). A missing component or a section
  runtime error degrades safely (render nothing + dev warning, siblings unaffected — R6).
- `sections/registry.ts` — the single authoritative `type` → component map, the runtime sibling of
  [`schemas/section.ts`](../schemas/README.md). A type is fully supported when registered in BOTH
  the schema registry (`registerSection`) and this component registry (`registerSectionComponent`).
  Ships empty; concrete sections self-register in later phases.

`SiteRenderer` / `DynamicSection` are auto-imported via `nuxt.config.ts` `components.dirs`; section
components are referenced ONLY through the registry (not auto-imported) so dispatch stays explicit
and tree-shakeable. Tests: `render/__tests__/`, `sections/__tests__/` (`npm test`).
