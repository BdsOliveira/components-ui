# Phase 5 Research: Core Block Set

Resolves the unknowns surfaced while planning the first eight concrete blocks (Hero, About,
Services, CTA, Testimonials, FAQ, Contact, Footer). Each decision is traced to the spec and the
prior-phase contracts it must honor.

---

## Decision 1 — Block config binding: pass the slice as one `data` prop

**Decision**: Bind each section's config slice to its component through a single `data` prop. Change
the Phase 4 `DynamicSection` render from `<component :is="resolved" v-bind="section" />` to
`<component :is="resolved" :data="section" />`, and update the Phase 4 renderer tests/fixtures to
read `props.data` instead of fall-through `attrs`. Every Phase 5 block then declares exactly
`defineProps<BlockProps<XConfig>>()` and reads `data.*`.

**Rationale**: The Phase 2 block contract (`block-contract.md` §C1, "fixed once and inherited by
every block forever") is the higher law: a block MUST receive content through exactly one prop
`data` and MUST NOT expose individual scalar content props. The shipped Phase 4 renderer flat-spread
(`v-bind="section"`) directly contradicts §C1 — a §C1-conforming block would receive `data=undefined`
and its fields as stray attrs. Since the block contract is constitutional and the renderer exists to
serve it, the renderer binding is corrected, not the contract. `data` carries the flat member
`{ type, ...fields }`; the harmless `data.type` discriminator is ignored by the block, which reads
its own schema fields. This is the one sanctioned Phase 4 edit this phase makes (decided with the
user). FR-002, block-contract §C1/§C2.

**Alternatives considered**:
- *Blocks read flat props* (leave renderer untouched): violates §C1 (scalar content props) and would
  require amending the "fixed forever" contract. Rejected.
- *Strip `type` first* (`:data="sliceWithoutType"`): marginally cleaner `data` but adds a per-render
  destructure for no functional gain; the discriminator is inert inside a block. Rejected for
  simplicity.

---

## Decision 2 — Site-level company reaches Contact/Footer via a `useSiteCompany` channel

**Decision**: Add `sites/core/composables/useSiteCompany.ts`, a provide/inject channel mirroring
`useSiteTheme` exactly. `SiteRenderer` provides the validated `CompanyConfig` once; blocks that need
cross-cutting identity (Contact, Footer) inject it. Block schemas do NOT duplicate company contact /
social fields.

**Rationale**: FR-011 requires cross-cutting business info (name, contact, social) held once at site
level to be sourced from there, never duplicated per block. The theme already establishes the
sanctioned "site context via provide/inject from `SiteRenderer`" pattern (Phase 4 §R11); company
identity rides the same rail. Block-contract §C6's "no reading client identity from global state"
targets ambient mutable globals and hardcoded client content — not the validated, scoped site
context the renderer explicitly provides (identical justification already accepted for theme).

**Alternatives considered**:
- *Duplicate contact/social into Contact & Footer slices*: §C6-clean but violates FR-011
  (duplication) and breaks "change once at site level". Rejected.
- *A generic `useSiteConfig()` exposing the whole `WebsiteConfig`*: leaks `sections` and invites
  blocks to read siblings (breaks §C6 independence). Rejected in favor of a narrow company channel.

---

## Decision 3 — One schema + one SFC + co-located registration per block

**Decision**: Each block ships three things: a Zod schema at `sites/core/schemas/<block>.ts`
(source of truth; `type` derived via `z.infer`), a Vue SFC at
`sites/core/components/sections/<Block>Section.vue`, and a single registration that calls BOTH
`registerSection(defineSection('<type>', <schema>))` and `registerSectionComponent('<type>', <SFC>)`.
A central `sites/core/components/sections/register.ts` imports all eight and performs the registers;
a Nuxt plugin imports `register.ts` for its side effect so both registries are populated at app boot.

**Rationale**: Mirrors the dual-registry design the prior phases mandate (a `type` is supported only
when both validatable and renderable — `registry.ts` header) and the block-contract §C2 schema home
(`sites/core/schemas/hero.ts`). One registration site per type keeps the schema and component
registries from drifting (FR-003). The plugin is the production analogue of the tests' manual
`registerStub`. Constitution II (layering: all in neutral `core/`), VIII (add a block = add files +
one registration, no renderer edits).

**Alternatives considered**:
- *Auto-import + auto-register via glob*: opaque ordering, fights the deliberate explicit-registry
  decision (Phase 4 research D6, `nuxt.config` comment). Rejected.
- *Register inside each SFC module*: SFC side effects are awkward to trigger without importing the
  component; centralizing in `register.ts` is explicit and tree-shakeable. Rejected.

---

## Decision 4 — Variants are config-only `blockVariant` enums; ≥2 per block, one default

**Decision**: Every block declares `variant: blockVariant([...], default)` in its schema (closed
enum + exactly one default), with at least two named variants chosen for real layout differences
(e.g. Hero `centered | split | minimal`; Services `grid | list`; Testimonials `grid | carousel`;
FAQ `accordion | list`; Contact `split | stacked`; Footer `columns | minimal`; About `text |
media-left`; CTA `banner | boxed`). The SFC switches presentation on `data.variant`.

**Rationale**: Block-contract §C4 + the existing `blockVariant` helper already encode "closed set,
exactly one explicit default, config-selected, unknown→default via schema fallback". Reusing it
gives FR-006/FR-007 and SC-005 for free with zero new mechanism.

**Alternatives considered**: free-form `variant: z.string()` — loses the closed-set/default guarantee
and §C4 conformance. Rejected.

---

## Decision 5 — Required vs optional fields drive graceful degradation; lists are `z.array`

**Decision**: Each schema marks the minimum a real business cannot omit as required and everything
else `.optional()` (or `.default()`); list blocks (Services, Testimonials, FAQ) model items as
`z.array(itemSchema)`. SFCs render only present optional regions (`v-if`) and iterate arrays with
`v-for`. An empty array renders nothing for that region (spec Assumption).

**Rationale**: FR-008/FR-013, §C3 (missing/partial → defaults → degraded-but-valid; never empty
placeholders). Validation-before-render is already provided by Phase 3 whole-site validation, so
blocks trust the validated slice and never re-validate (§C3 / Phase 4 §R8).

**Alternatives considered**: requiring full content per block — breaks real-world uneven content
(US4) and SC-004 minimal-content rendering. Rejected.

---

## Decision 6 — Theme-aware styling via Tailwind + injected theme tokens; no new theming system

**Decision**: Blocks style with Tailwind utility classes (`@nuxtjs/tailwindcss`, present) for layout
and consume site colors/typography from the injected `ThemeConfig` (`useSiteTheme()`) for brand
tokens (e.g. primary color on CTAs). Blocks are responsive (mobile-first) and WCAG-baseline
accessible (semantic landmarks, alt text from config, focus states). No new theme model is defined.

**Rationale**: Block-contract §C7 (responsive, accessible, theme-aware by default) + Constitution IX
(performance/SSG) and X (UX consistency). Spec Assumption: styling driven by existing site theme, not
re-specified per block. Reuses Phase 3 `ThemeConfig` and the Phase 4 theme channel verbatim.

**Alternatives considered**: per-block CSS-in-JS / scoped design tokens — new system, contradicts the
"no new theming" assumption and Constitution XIV (unnecessary abstraction). Rejected.

---

## Decision 7 — Five sample vertical configs prove coverage; rendered in integration tests

**Decision**: Author one sample `WebsiteConfig` per target vertical (clinic, lawyer, restaurant,
school, local business) under `sites/templates/<niche>/config.ts` (niche orchestration of the eight
blocks), and add an integration test that validates each with `validateWebsiteConfig` and renders it
through `SiteRenderer`, asserting every listed block appears in order.

**Rationale**: SC-002/SC-003 require a complete, config-only site per vertical; Constitution VI
(templates = niche orchestrations of reusable sections, no custom per-client layout). Rendering them
in tests is the rendering-consistency discipline (Constitution XI) and the executable proof of
FR-012/SC-002.

**Alternatives considered**: a single generic demo site — fails to demonstrate the 80%-market
coverage claim across the five named verticals (SC-002). Rejected.

---

## Decision 8 — Testing: per-block unit tests + cross-vertical integration, Vitest + @vue/test-utils

**Decision**: Reuse the existing Vitest + `@vue/test-utils` + happy-dom harness
(`vitest.config.ts`). Per block: schema tests (defaults, required-missing rejected, unknown variant →
default, empty list) and render tests (minimal vs full content, each variant, slice isolation,
theme-awareness). Plus the five-vertical integration test (Decision 7). Tests mount blocks both
directly (`:data` prop) and through `SiteRenderer`.

**Rationale**: Constitution XI (component-level + schema-validation + rendering-consistency tests).
Block-contract conformance checklist is the per-block acceptance instrument. No new test deps.

**Alternatives considered**: snapshot-only tests — brittle, weak on contract semantics. Rejected in
favor of behavior assertions.
