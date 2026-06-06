# Phase 0 Research: Dynamic Renderer

Decisions that resolve the renderer's open questions. Each builds on the Phase 3 schema layer
(`sites/core/schemas/`) and the constitution. No Technical Context item remained as
NEEDS CLARIFICATION — every choice is grounded in the existing repo.

---

## Decision 1 — Render dispatch primitive: Vue `<component :is>` over a static map

**Decision**: `DynamicSection` resolves a section item's `type` to a component via the registry and
renders it with Vue 3's built-in dynamic component: `<component :is="resolved" v-bind="slice" />`.
No third-party renderer, no `eval`, no per-type `v-if` chain.

**Rationale**: `<component :is>` is the idiomatic Vue mechanism for "render a component chosen at
runtime", works in SSR/SSG, and keeps the page-building code constant-size as the catalog grows
(FR-005, FR-007). Resolution is one `Map.get(type)` — O(1), mirroring the O(1) discriminated-union
dispatch in `section.ts`. Zero new dependency (Constitution XIV; matches Phase 3's zero-dep stance).

**Alternatives considered**:
- *Per-type `v-if`/`switch` in the caller* — rejected: reintroduces per-type branching the phase
  exists to remove (FR-005), edits grow with every new type.
- *Nuxt auto-import by component name* (`<component :is="pascalCase(type)">`) — rejected: implicit,
  not tree-shakeable, ties the render contract to a naming convention and Nuxt's scan rather than an
  explicit, inspectable registry (FR-003).
- *Async `defineAsyncComponent` per type by default* — rejected as the default: adds a hydration
  boundary and loading state to every section; kept as an *opt-in* a section may choose at
  registration time (a registry value may be an async component) without changing the renderer.

---

## Decision 2 — Component registry mirrors the Phase 3 schema registry

**Decision**: A single module `sites/core/components/sections/registry.ts` holds a
`Map<string, Component>` with `registerSectionComponent(type, component)`,
`resolveSectionComponent(type)`, `registeredSectionComponents()`, and `clearSectionComponentRegistry()`
(test support) — the exact runtime sibling of `section.ts`'s schema registry API. A concrete section
registers in **both** places (one `registerSection(...)` for schema, one
`registerSectionComponent(...)` for the component), ideally co-located in the section's own module so
the two never drift.

**Rationale**: One authoritative type→component place (FR-003, FR-004) with an API shaped like the
existing schema registry keeps DX predictable (Constitution VIII) and makes "validatable but not
renderable" an explicit, detectable state (Decision 4). Idempotent-per-`type` set mirrors
`registerSection`'s replace-on-re-register behavior.

**Alternatives considered**:
- *Fold component into the schema registry* (`registerSection(schema, component)`) — rejected:
  couples the pure schema/validation layer (build/server, no Vue) to Vue components; Phase 3 schema
  registry must stay renderer-agnostic so it is usable in non-render contexts (validation, codegen).
- *A static object literal `{ hero: HeroSection }`* — rejected as the authored form: a function
  registry gives idempotency, introspection, and test reset, and lets each section self-register in
  its own module instead of a central file every new section must edit.

---

## Decision 3 — Per-section render key derivation

**Decision**: `SiteRenderer` keys each `DynamicSection` by a stable composite **`${index}:${type}`**
by default, and honors an explicit `id` field on the section item when present
(`section.id ?? `${index}:${type}``). Section item identity is otherwise its list position (which is
canonical and never reordered, Phase 3 FR-006 / §W2).

**Rationale**: Phase 3 section members are *flat block schemas extended with `type`* and do **not**
mandate an `id` field, so the renderer cannot assume one (FR-016). List order is the authoritative
identity, so index is stable; pairing it with `type` keeps keys readable and avoids cross-type key
collisions when items are inserted. Honoring an optional `id` lets later phases opt into
content-stable keys (e.g. for fine-grained diffing) without a schema change.

**Alternatives considered**:
- *Index alone* — rejected: works but a bare integer key is opaque and collides conceptually across
  re-orders; composite is clearer at no cost.
- *Require `id` on every section* — rejected: would force a Phase 3 schema change (every block gains
  `id`) for a render concern; violates "Phase 4 does not redefine block/section internals."
- *Random/UUID key* — rejected: unstable across renders, defeats Vue's reconciliation.

---

## Decision 4 — Fallback for an unrenderable `type` (validatable but no component)

**Decision**: When `resolveSectionComponent(type)` returns nothing, `DynamicSection`:
1. renders **nothing visible** for that item (no broken/undefined markup, FR-010),
2. emits a **dev-only warning** naming the missing `type` and its index (surfaced, not silent),
3. lets every sibling section render normally (per-section isolation, FR-011).
In production builds the warning is suppressed (no console noise / no layout artifact). This is
distinct from validation: an unknown/unregistered *schema* type is already rejected at the Phase 3
gate (US6); this fallback covers the narrow "schema-registered but component missing" gap and any
defensive call on unvalidated input.

**Rationale**: One engine renders many client sites; a missing component must never crash a page or
take down sibling sections (Constitution XI, XIV; FR-010/011). Dev warning makes the gap detectable
during development (DX); production silence keeps client pages clean. Rendering nothing (vs. a
visible placeholder) avoids shipping engine-debug UI to end users; the surfaced signal lives in
logs/build, not the page.

**Alternatives considered**:
- *Throw on missing component* — rejected: one bad item would collapse the whole page (violates
  FR-011).
- *Visible placeholder box in production* — rejected: ships engine-internal UI to a commercial
  client site (Constitution X). Kept as a possible *dev*-only visual aid, not production output.

---

## Decision 5 — Per-section error isolation

**Decision**: `DynamicSection` wraps its rendered section in an error boundary
(`onErrorCaptured` returning `false` to stop propagation) so a runtime error thrown *inside* one
section component is contained: that section falls back to the Decision-4 behavior (nothing visible +
dev warning), and `SiteRenderer`'s other `DynamicSection` instances render unaffected (FR-011,
SC-006).

**Rationale**: Resilience is a platform requirement (Constitution XI). Containing failure at the
single-section boundary keeps the blast radius to one block rather than the whole page. `SiteRenderer`
renders an *independent* `DynamicSection` per item, so isolation is structural, not just caught.

**Alternatives considered**:
- *No boundary (rely on validation)* — rejected: validation guarantees data shape, not that a
  component never throws at runtime (e.g. a downstream image/service error).
- *One boundary around the whole `SiteRenderer`* — rejected: a single throw would blank the entire
  page; boundary must be per section (FR-011).

---

## Decision 6 — Theme propagation + component wiring (provide/inject + Nuxt `components.dirs`)

**Decision**:
- **Theme**: `SiteRenderer` calls a `useSiteTheme(theme)` composable that `provide()`s the validated
  `WebsiteConfig.theme` (Phase 3 `ThemeConfig`) on an injection key; sections read it via
  `useSiteTheme()` (inject). One shared visual identity reaches every section without prop-drilling
  and re-applies when `theme` changes (FR-015, SC-009).
- **Wiring**: add `sites/core/components` to Nuxt's `components.dirs` (with `pathPrefix: false`) so
  the infra components `<SiteRenderer>` / `<DynamicSection>` resolve in pages without manual import.
  Concrete **section** components are **not** consumed via auto-import — they are referenced only
  through the explicit registry (Decision 2), keeping dispatch deterministic and tree-shakeable.

**Rationale**: provide/inject is Vue's standard for cross-cutting context shared by an arbitrary,
data-driven set of descendants — exactly the theme's role (Constitution V/X). Reusing the Phase 3
`ThemeConfig` (not a new theme model) honors "wire it through, don't redefine it." Registering the
`core/components` dir is the minimal Nuxt config change to make the engine components usable
(Constitution VIII) while the registry keeps section dispatch explicit.

**Alternatives considered**:
- *Prop-drill theme through every section* — rejected: couples each section signature to the theme
  and grows with nesting; provide/inject is the decoupled idiom.
- *Global Nuxt `useState` for theme* — rejected: implies one mutable global theme; provide/inject
  scopes the theme to the rendered site subtree, supporting multiple `WebsiteConfig`s if ever needed.
- *Auto-import all section components by name* — rejected: see Decision 1 alternatives; defeats the
  explicit registry and tree-shaking.

---

## Decision 7 — Input contract: render path runs `validateWebsiteConfig` first

**Decision**: The renderer's typed input is a **validated** `WebsiteConfig`. The integration entry
point (the page/route that builds a site, later phase) calls Phase 3 `validateWebsiteConfig(raw)`
and renders `SiteRenderer` only with `result.data` when `result.valid`. On invalid input the Phase 3
defined failure behavior applies (the whole config is rejected; no broken page). `SiteRenderer`
itself trusts the validated shape and does **not** re-validate (FR-012, FR-013).

**Rationale**: Phase 3 already owns whole-site validation (`company`/`theme` defaulting, reject-on-
invalid-section, per-item diagnostics). Re-validating in the renderer would duplicate and risk
contradicting that contract (FR-012). Validating once, at the boundary, keeps the JSON-driven
pipeline safe end to end (Constitution IV) and the renderer fast (no per-render parse, Performance
Goals).

**Alternatives considered**:
- *Renderer validates internally* — rejected: duplicates Phase 3, couples render to Zod at runtime,
  and risks divergence (FR-012 forbids contradicting Phase 3 rules).
- *No validation, trust callers* — rejected: violates Constitution IV (validated before render) and
  US6.

---

## Resolved unknowns summary

| Unknown | Resolution |
|---------|-----------|
| Render dispatch primitive | Vue `<component :is>` + O(1) registry map (D1) |
| Where type→component lives | `sites/core/components/sections/registry.ts`, mirrors schema registry (D2) |
| Per-section key | `section.id ?? `${index}:${type}`` (D3) |
| Missing-component behavior | Render nothing + dev warning, siblings unaffected (D4) |
| Section runtime errors | Per-section `onErrorCaptured` boundary (D5) |
| Theme to all sections | `useSiteTheme` provide/inject of Phase 3 `ThemeConfig` (D6) |
| Engine component wiring | `components.dirs` += `sites/core/components`; sections stay registry-only (D6) |
| Validation responsibility | Phase 3 `validateWebsiteConfig` at the boundary; renderer trusts it (D7) |
| New dependencies | None — Vue built-in dispatch, Zod already present |
</content>
