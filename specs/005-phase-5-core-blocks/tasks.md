---
description: "Task list for Phase 5 — Core Block Set"
---

# Tasks: Core Block Set (Phase 5)

**Input**: Design documents from `/specs/005-phase-5-core-blocks/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/block-set-contract.md, quickstart.md

**Tests**: INCLUDED — Constitution XI (component + schema-validation + rendering-consistency tests)
and plan Decision 8 make tests part of this feature's deliverable.

**Organization**: Grouped by user story. US1 builds the eight blocks + sample sites (MVP). US2–US4
add the cross-cutting properties (reusability/identity, variants, graceful degradation) and their
proof. Blocks: hero, about, services, cta, testimonials, faq, contact, footer.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1–US4 (user-story phases only)

## Path Conventions

Schemas: `sites/core/schemas/`. Block SFCs + registration: `sites/core/components/sections/`.
Renderer + composables: `sites/core/components/render/`, `sites/core/composables/`. Sample sites:
`sites/templates/<niche>/`. Nuxt plugin: `app/plugins/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Directory skeleton and shared scaffolding for the eight blocks.

- [X] T001 Create the Phase 5 directory skeleton: `sites/core/components/sections/__tests__/`, `sites/templates/{clinic,lawyer,restaurant,school,local-business}/`, and `sites/templates/__tests__/` (add a short `README.md` or `.gitkeep` in each new dir)
- [X] T002 [P] Confirm zero new deps and that `@nuxtjs/tailwindcss` / `@nuxt/image` / `@nuxt/icon` are usable by section SFCs (no `package.json` change); record the section CSS approach (Tailwind utilities + injected theme vars) in `sites/core/components/sections/README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Renderer amendments + shared block infrastructure every block and test depends on.

**⚠️ CRITICAL**: No user-story work begins until this phase is complete.

- [X] T003 Create `useSiteCompany` provide/inject composable mirroring `useSiteTheme` in `sites/core/composables/useSiteCompany.ts` (overloads: provide `CompanyConfig`, inject `CompanyConfig`; throw if injected outside `<SiteRenderer>`); export it from `sites/core/composables` if a barrel exists
- [X] T004 Amend `sites/core/components/render/SiteRenderer.vue` to call `useSiteCompany(props.config.company)` alongside `useSiteTheme(props.config.theme)` (Decision 2)
- [X] T005 Amend `sites/core/components/render/DynamicSection.vue` binding `<component :is="resolved" v-bind="section" />` → `<component :is="resolved" :data="section" />` (Decision 1)
- [X] T006 Update Phase 4 fixtures in `sites/core/components/render/__tests__/fixtures.ts` so stub sections read `props.data` (declare a `data` prop) instead of fall-through `attrs`; add a company-injecting stub helper
- [X] T007 Update Phase 4 renderer specs (`dynamic-section.spec.ts`, `slice-isolation.spec.ts`, `validated-input.spec.ts`, `edge-cases.spec.ts`, `fallback.spec.ts`, `site-renderer.spec.ts`) to assert the `:data` slice binding and provide a `company` in `SiteRenderer` mounts
- [X] T008 [P] Create a theme→CSS-vars helper in `sites/core/components/sections/useThemeVars.ts` that maps the injected `ThemeConfig` (colors/typography/radius/spacing) to inline CSS custom properties for blocks to consume
- [X] T009 [P] Create a shared section test helper in `sites/core/components/sections/__tests__/helpers.ts` that mounts a block with `useSiteTheme`/`useSiteCompany` providers (direct-mount) and a helper to render a config through `SiteRenderer`
- [X] T010 Create the registration scaffold `sites/core/components/sections/register.ts` (empty, to be filled in T028), export it from `sites/core/components/sections/index.ts`, and create `app/plugins/register-sections.ts` importing `register.ts` for its boot side effect

**Checkpoint**: Renderer binds `:data`, company channel exists, test helpers ready, registration wired.

---

## Phase 3: User Story 1 - Assemble a complete vertical site from configuration (Priority: P1) 🎯 MVP

**Goal**: All eight blocks exist, register in both registries, and five sample vertical sites render
in order from configuration alone.

**Independent Test**: Validate + render each of the five sample `WebsiteConfig`s through
`SiteRenderer`; every listed block appears in the configured order as one coherent page.

### Schemas (source of truth — define full field set incl. variants + optionals)

- [X] T011 [P] [US1] Create `heroSchema` + `HeroConfig` in `sites/core/schemas/hero.ts` (variant `centered|split|minimal` default `centered`; `heading` required; `subheading`/`cta`/`secondaryCta`/`media` optional) per data-model
- [X] T012 [P] [US1] Create `aboutSchema` + `AboutConfig` in `sites/core/schemas/about.ts` (variant `text|media-left|media-right` default `text`; `heading`+`body` required; `media`/`highlights` optional)
- [X] T013 [P] [US1] Create `servicesSchema` + `ServicesConfig` in `sites/core/schemas/services.ts` (variant `grid|list` default `grid`; `items` required array of `{title required, description/icon/media/cta optional}`; `heading` optional)
- [X] T014 [P] [US1] Create `ctaSchema` + `CtaConfig` in `sites/core/schemas/cta.ts` (variant `banner|boxed` default `banner`; `heading`+`cta` required; `body`/`secondaryCta` optional)
- [X] T015 [P] [US1] Create `testimonialsSchema` + `TestimonialsConfig` in `sites/core/schemas/testimonials.ts` (variant `grid|carousel` default `grid`; `items` required array of `{quote+author required, role/avatar/rating optional}`; `heading` optional)
- [X] T016 [P] [US1] Create `faqSchema` + `FaqConfig` in `sites/core/schemas/faq.ts` (variant `accordion|list` default `accordion`; `items` required array of `{question+answer required}`; `heading` optional)
- [X] T017 [P] [US1] Create `contactSchema` + `ContactConfig` in `sites/core/schemas/contact.ts` (variant `split|stacked` default `split`; `showForm` default false; `heading`/`intro`/`hours`/`mapEmbedUrl`/`channels{email,phone,address}` optional)
- [X] T018 [P] [US1] Create `footerSchema` + `FooterConfig` in `sites/core/schemas/footer.ts` (variant `columns|minimal` default `columns`; `showSocial` default true; `tagline`/`linkGroups`/`legal` optional)
- [X] T019 [US1] Re-export all eight schemas + inferred types from `sites/core/schemas/index.ts` (depends on T011–T018)

### Block components (full SFCs: all variants + optional handling; Contact/Footer company wiring deferred to US2)

- [X] T020 [P] [US1] Create `sites/core/components/sections/HeroSection.vue` — `defineProps<BlockProps<HeroConfig>>()`, semantic `<section>`, all variants, optional regions via `v-if`, theme vars via `useThemeVars`
- [X] T021 [P] [US1] Create `sites/core/components/sections/AboutSection.vue` (BlockProps<AboutConfig>, variants + optional media/highlights)
- [X] T022 [P] [US1] Create `sites/core/components/sections/ServicesSection.vue` (BlockProps<ServicesConfig>, grid/list variants, `v-for` items, empty array → nothing)
- [X] T023 [P] [US1] Create `sites/core/components/sections/CtaSection.vue` (BlockProps<CtaConfig>, banner/boxed variants, primary CTA + optional secondary)
- [X] T024 [P] [US1] Create `sites/core/components/sections/TestimonialsSection.vue` (BlockProps<TestimonialsConfig>, grid/carousel variants, `v-for` items)
- [X] T025 [P] [US1] Create `sites/core/components/sections/FaqSection.vue` (BlockProps<FaqConfig>, accordion/list variants, `v-for` items)
- [X] T026 [P] [US1] Create `sites/core/components/sections/ContactSection.vue` (BlockProps<ContactConfig>, split/stacked variants, renders own `channels`/`hours`/`map`/form-structure; company fallback added in US2)
- [X] T027 [P] [US1] Create `sites/core/components/sections/FooterSection.vue` (BlockProps<FooterConfig>, columns/minimal variants, renders own `linkGroups`/`legal`/`tagline`; company fallback added in US2)

### Registration + sample sites + tests

- [X] T028 [US1] Fill `sites/core/components/sections/register.ts` with eight `registerSection(defineSection('<type>', <schema>))` + `registerSectionComponent('<type>', <Section>)` pairs (depends on T011–T018, T020–T027)
- [X] T029 [P] [US1] Create `sites/templates/clinic/config.ts` exporting a `WebsiteConfig` orchestrating hero→services→testimonials→faq→contact→footer with clinic content
- [X] T030 [P] [US1] Create `sites/templates/lawyer/config.ts` (`WebsiteConfig` for a lawyer: hero→about→services→cta→contact→footer)
- [X] T031 [P] [US1] Create `sites/templates/restaurant/config.ts` (`WebsiteConfig`: hero→about→services(menu)→testimonials→contact→footer)
- [X] T032 [P] [US1] Create `sites/templates/school/config.ts` (`WebsiteConfig`: hero→about→services→faq→cta→contact→footer)
- [X] T033 [P] [US1] Create `sites/templates/local-business/config.ts` (`WebsiteConfig`: hero→services→cta→testimonials→contact→footer)
- [X] T034 [US1] Create `sites/templates/__tests__/verticals.spec.ts` — for each of the five configs: `validateWebsiteConfig` passes, render through `SiteRenderer`, assert every section type renders in configured order (depends on T028–T033)
- [X] T035 [US1] Create `sites/core/components/sections/__tests__/registry.spec.ts` asserting all eight types are present in BOTH the schema registry (`registeredSectionTypes`) and component registry (`registeredSectionComponents`) after importing `register.ts`

**Checkpoint**: A complete single-page site renders from config for all five verticals — MVP done.

---

## Phase 4: User Story 2 - Content-driven, reusable, site-level identity (Priority: P1)

**Goal**: The same block serves different businesses from its own content, holds no hardcoded
client/niche content, and Contact/Footer source cross-cutting identity from site-level `company`.

**Independent Test**: Feed one block type two vertical content sets → each renders its own content
(isolation); render blocks with minimal config → no stray business text; Contact/Footer show
`company` info with no per-block duplication.

- [X] T036 [US2] Wire `ContactSection.vue` to `useSiteCompany()` — when `data.channels.{email,phone,address}` absent, fall back to injected `company.contact`; explicit `channels` take precedence (FR-011)
- [X] T037 [US2] Wire `FooterSection.vue` to `useSiteCompany()` — render `company.social` when `showSocial`; fall back `tagline`→`company.tagline`, `legal`→`company.legal.legalName`
- [X] T038 [P] [US2] Create `sites/core/components/sections/__tests__/reuse.spec.ts` — each of the eight blocks rendered with two distinct content sets produces its own output with no cross-leak (slice isolation)
- [X] T039 [P] [US2] Create `sites/core/components/sections/__tests__/neutrality.spec.ts` — each block rendered with only required content contains no hardcoded client/niche strings (output derives solely from config)
- [X] T040 [US2] Create `sites/core/components/sections/__tests__/company-sourcing.spec.ts` — Contact/Footer mounted under a provided `company` render its contact/social; per-block `channels` override the company value (depends on T036, T037)

**Checkpoint**: Blocks proven reusable + neutral; identity sourced once from site level.

---

## Phase 5: User Story 3 - Switch a block's look via configuration variants (Priority: P2)

**Goal**: Each block's visual treatment is selected by `data.variant` (config-only); unselected uses
the single default; unknown variant falls back to default.

**Independent Test**: Render each block with each declared variant, with no variant, and with an
unknown variant value; presentation changes per selection and unselected/unknown use the default.

- [X] T041 [P] [US3] Create `sites/core/components/sections/__tests__/variants-a.spec.ts` — for hero, about, services, cta: each declared variant renders its distinct markup; omitted variant → default
- [X] T042 [P] [US3] Create `sites/core/components/sections/__tests__/variants-b.spec.ts` — for testimonials, faq, contact, footer: each declared variant renders; omitted → default
- [X] T043 [P] [US3] Create `sites/core/components/sections/__tests__/variant-fallback.spec.ts` — an unknown `variant` value is rejected by each schema and resolves to the block's default (never undefined state)

**Checkpoint**: All eight blocks switch presentation by config only.

---

## Phase 6: User Story 4 - Optional content degrades gracefully (Priority: P2)

**Goal**: Blocks render cleanly with only required content; omitted optional regions disappear (no
placeholders); list blocks handle small/empty lists; missing required content is rejected pre-render.

**Independent Test**: Render each block with required-only and with full content; omitted parts are
absent; empty `items` renders nothing; required-missing config fails validation.

- [X] T044 [P] [US4] Create `sites/core/components/sections/__tests__/schemas.spec.ts` — per block: defaults applied (variant + defaulted fields), required-missing rejected by `safeParse`, unknown keys stripped
- [X] T045 [P] [US4] Create `sites/core/components/sections/__tests__/degradation.spec.ts` — each block rendered with required-only vs full content: optional regions absent in minimal case, no empty placeholders
- [X] T046 [P] [US4] Create `sites/core/components/sections/__tests__/empty-lists.spec.ts` — services/testimonials/faq with `items: []` render nothing for the list region (no reserved space)
- [X] T047 [US4] Add partial-channel coverage to `company-sourcing.spec.ts` (or a new `contact-partial.spec.ts`) — Contact with only some of email/phone/address renders only the resolved channels

**Checkpoint**: All eight blocks degrade gracefully; validation gates required content.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T048 [P] Accessibility/responsive pass across the eight SFCs: semantic landmarks, config-driven `alt` text, visible focus states, mobile-first layout (block-set-contract B8)
- [X] T049 [P] Run `quickstart.md` validation — `npm run dev`, visually confirm each of the five vertical sample sites renders coherently
- [X] T050 Run full suite `npm test` green; update `sites/core/components/sections/README.md` and `sites/templates/README.md` to document the eight available blocks and the five sample verticals

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies.
- **Foundational (Phase 2)**: depends on Setup — BLOCKS all user stories (renderer binding + company channel + helpers + registration scaffold).
- **US1 (Phase 3)**: depends on Foundational. MVP.
- **US2 (Phase 4)**: depends on US1 (blocks + sample sites exist). Edits Contact/Footer SFCs.
- **US3 (Phase 5)**: depends on US1 (variants already built in SFCs); pure verification — independent of US2.
- **US4 (Phase 6)**: depends on US1 (optional handling built in SFCs); independent of US2/US3 except T047 references the US2 company spec.
- **Polish (Phase 7)**: depends on all desired stories.

### Within US1

- Schemas (T011–T018) before barrel (T019) and before registration (T028).
- SFCs (T020–T027) before registration (T028).
- Registration (T028) + sample configs (T029–T033) before integration test (T034).

### Parallel Opportunities

- T011–T018 (eight schemas) — all [P], different files.
- T020–T027 (eight SFCs) — all [P], different files (after their schemas exist).
- T029–T033 (five sample configs) — all [P].
- Test specs within US2/US3/US4 marked [P] — different files.
- US3 and US4 can proceed in parallel once US1 is done (different test files; SFCs already complete).

---

## Parallel Example: User Story 1

```bash
# Eight schemas together:
Task: "Create heroSchema in sites/core/schemas/hero.ts"
Task: "Create aboutSchema in sites/core/schemas/about.ts"
# ... services, cta, testimonials, faq, contact, footer

# Then eight SFCs together:
Task: "Create HeroSection.vue"
Task: "Create AboutSection.vue"
# ... etc

# Then five sample configs together:
Task: "Create sites/templates/clinic/config.ts"
Task: "Create sites/templates/lawyer/config.ts"
# ... restaurant, school, local-business
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Phase 1 Setup → Phase 2 Foundational (renderer `:data` + company channel + registration wiring).
2. Phase 3 US1: eight schemas + eight SFCs + registration + five sample sites + integration test.
3. **STOP and VALIDATE**: all five verticals render in order from config alone.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. US1 → five vertical sites render (MVP).
3. US2 → reusability + site-level identity proven; Contact/Footer company-aware.
4. US3 → variant switching proven.
5. US4 → graceful degradation + validation proven.
6. Polish → a11y/responsive, quickstart, docs.

---

## Notes

- [P] = different files, no incomplete-task dependency.
- SFCs are built complete (all variants + optional handling) in US1; US3/US4 are verification phases,
  so they add test files rather than re-editing SFCs (only US2 edits Contact/Footer for company).
- Schemas are the single source of truth; types are always `z.infer` (block-contract §C2).
- Two Phase 4 renderer edits (T004, T005) are the user-approved foundation amendments — see plan
  Complexity Tracking.
- Commit after each task or logical group; stop at any checkpoint to validate a story.
