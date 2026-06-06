# The Dynamic Renderer Contract

**Status**: Authoritative (single source of truth) · **Phase**: 4 · **Applies to**: every layer that
renders a website — the renderer engine, templates, and client pages.

> This contract fixes how a validated `WebsiteConfig` becomes a rendered page. A renderer or render
> path that does not satisfy every MUST clause below is **non-conforming**. New renderable section
> types are added by the registration procedure in **R7**, never by editing the renderer or adding
> per-type branching. It builds on, and never redefines, the Phase 3
> [website schema contract](../../003-website-config-schema/contracts/website-schema-contract.md)
> and the Phase 2 block contract.

---

## R1 — A page is its `sections` rendered (FR-001, FR-006)

A page MUST be produced by rendering each item of `WebsiteConfig.sections` with the component bound
to that item's `type`. The page IS the data rendered — no page is hand-authored per client.

```text
page  =  for each section in config.sections (in order):  render( componentFor(section.type), section )
```

## R2 — Render order is `sections` order (FR-002, FR-006)

Rendered sections MUST appear in the exact array order of `sections`. No layer in the render path may
reorder them. (Consistent with Phase 3 §W2.)

## R3 — One dynamic section renderer, no per-type branching (FR-005, FR-007)

Dispatch MUST go through a single dynamic section renderer (`DynamicSection`) that resolves the
component for a section item's `type` from the component registry and renders it. Callers MUST NOT
hand-map types or branch per type (`v-if`/`switch` on `type` is non-conforming). Adding a new type
MUST require **no** change to the renderer or to page-building callers.

```vue
<!-- CONFORMING: single dynamic renderer over the list -->
<DynamicSection
  v-for="(section, index) in config.sections"
  :key="section.id ?? `${index}:${section.type}`"
  :section="section"
/>
```

```vue
<!-- NON-CONFORMING: per-type branching in the caller -->
<HeroSection v-if="section.type === 'hero'" v-bind="section" />
<ServicesSection v-else-if="section.type === 'services'" v-bind="section" />
```

## R4 — One authoritative component registry (FR-003, FR-004)

There MUST be exactly one `type` → component registry — the runtime sibling of the Phase 3 section
schema registry. It MUST expose registration/resolution shaped like the schema registry. No
per-template or per-client copy of the mapping is permitted.

```ts
// sites/core/components/sections/registry.ts
registerSectionComponent(type: string, component: Component): void
resolveSectionComponent(type: string): Component | undefined
registeredSectionComponents(): string[]
clearSectionComponentRegistry(): void   // test support
```

A section `type` is **fully supported** only when registered in **both** the schema registry
(`registerSection`) and the component registry (`registerSectionComponent`).

## R5 — Each section receives only its own config slice (FR-008, FR-009)

The renderer MUST pass a section component only that section item's own config slice (the item
itself). A section component MUST NOT receive sibling items' data, and MUST be content-driven from
the passed slice — no client/niche hardcoded content.

```vue
<component :is="resolved" v-bind="section" />   <!-- only this item's fields -->
```

The same `type` MAY appear multiple times; each instance renders independently with its own slice
(Phase 3 §W2).

## R6 — Safe degradation, never a crash (FR-010, FR-011)

The render path MUST NOT crash or emit broken/undefined markup. Specifically:

- **Missing component** — if `resolveSectionComponent(type)` returns nothing, the item MUST render
  nothing visible and MUST surface the condition as a **dev-only** warning (naming `type` + index).
  It MUST NOT throw and MUST NOT block sibling sections.
- **Section runtime error** — a throw inside one section component MUST be contained at the
  single-section boundary (`onErrorCaptured`); that section degrades per the missing-component
  behavior and every sibling section MUST still render.

> Validation note: an *unknown/unregistered schema* `type` is already rejected at the Phase 3 gate
> (R8). R6 covers the narrow "schema-registered but component missing" gap and any runtime throw.

## R7 — Extension procedure: register, don't edit (FR-007, FR-019)

A new renderable section type is added by:

1. registering its Phase 2 block schema into the section union — `registerSection(defineSection(type, schema))` (Phase 3 §W7); **and**
2. registering its component — `registerSectionComponent(type, Component)` (R4).

Both registrations SHOULD live in the section's own module so schema and component never drift.
Adding a type MUST NOT change the renderer, `DynamicSection`, `SiteRenderer`, or any unrelated
section. Existing valid `WebsiteConfig` data MUST remain renderable (backward compatible).

## R8 — Render only validated configuration (FR-012, FR-013)

The renderer's input MUST be a `WebsiteConfig` that has passed Phase 3 `validateWebsiteConfig`. The
render path MUST validate before rendering:

```ts
const result = validateWebsiteConfig(raw)
if (result.valid) renderSite(result.data)   // SiteRenderer trusts result.data
else /* Phase 3 defined failure behavior — no broken page */
```

`SiteRenderer` MUST trust the validated shape and MUST NOT re-derive or contradict Phase 3 validation
rules.

## R9 — Empty `sections` renders an empty page (FR-014)

A `WebsiteConfig` with `sections: []` MUST render a valid empty page — no error, no undefined state
(consistent with Phase 3 §W6 / FR-016).

## R10 — Stable per-section key (FR-016)

Each rendered section MUST be keyed by a stable identity derived from the section item:
`section.id ?? `${index}:${type}``. Keys MUST be stable across re-renders so reconciliation updates
correctly.

## R11 — One shared theme across all sections (FR-015)

The renderer MUST make `WebsiteConfig.theme` (Phase 3 `ThemeConfig`) available to every rendered
section through one channel (provide/inject via `useSiteTheme`), so a theme change applies across all
sections with no per-section source edits. The renderer MUST reuse the Phase 3 theme model, not
define a new one.

## R12 — Neutral, reusable, JSON-driven (FR-017, FR-019, FR-020)

The renderer and registry MUST live in the neutral `core/` layer with no client/niche content, MUST
be reusable across all templates and clients **without modification** (one renderer, many sites), and
MUST be JSON-driven: producing or changing a page MUST require only changing `WebsiteConfig` data —
never editing the renderer or the section-mapping source.

## R13 — Empty-registry baseline behaves (FR-018)

Phase 4 ships the component registry **empty**. With an empty registry: a `WebsiteConfig` with
`sections: []` renders an empty page (R9), and any non-empty `sections` would already have failed the
Phase 3 validation gate (the empty *schema* registry rejects all section items, Phase 3 §W6) — so the
renderer is never asked to render an unmapped type in the baseline state. The mechanism is complete
without any concrete section.

---

## Conformance summary

| Clause | MUST | Trace |
|--------|------|-------|
| R1 | Page = sections rendered by their type's component | FR-001, FR-006 |
| R2 | Render order = list order, no reordering | FR-002, FR-006 |
| R3 | Single dynamic renderer, no per-type branching | FR-005, FR-007 |
| R4 | One authoritative type→component registry | FR-003, FR-004 |
| R5 | Each section gets only its own slice; content-driven | FR-008, FR-009 |
| R6 | Safe degradation (missing component / runtime error), siblings unaffected | FR-010, FR-011 |
| R7 | Add a type by registering schema + component; no renderer edits | FR-007, FR-019 |
| R8 | Render only Phase-3-validated config; trust it | FR-012, FR-013 |
| R9 | Empty `sections` → valid empty page | FR-014 |
| R10 | Stable per-section key from the item | FR-016 |
| R11 | One shared theme to all sections, reuse Phase 3 model | FR-015 |
| R12 | Neutral, reusable unchanged, JSON-driven | FR-017, FR-019, FR-020 |
| R13 | Empty-registry baseline is complete and safe | FR-018 |
</content>
