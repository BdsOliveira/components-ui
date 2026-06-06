# core/composables

**Responsibility**: Reusable Vue composables — `use*` functions built on Vue reactivity and lifecycle.

**Allowed**: Stateful/reactive logic using `ref`, `computed`, `watch`, lifecycle hooks; shared behavior consumed by components.

**Prohibited**: Pure, framework-free functions (→ `utils/`), component markup, and client-specific logic.

**Depends on**: `core` only (`types`, `utils`). Never depends on higher layers.

## `useSiteTheme` ([renderer-contract.md §R11](../../../specs/004-dynamic-renderer/contracts/renderer-contract.md))

The provide/inject channel for the site-level theme (Phase 4). `SiteRenderer` calls
`useSiteTheme(config.theme)` once to provide the validated Phase 3 `ThemeConfig`; a section calls
`useSiteTheme()` to inject it — one shared visual identity across all sections, no prop-drilling
(FR-015). Reuses the Phase 3 theme model; defines no new one. Tests: `__tests__/use-site-theme.spec.ts`.
