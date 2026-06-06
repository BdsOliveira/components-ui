# Phase 0 Research: Central Website Schema

All Technical Context unknowns are resolved here. Phase 3 reuses the Phase 2 schema toolkit
(`sites/core/schemas/`), so most decisions are about **composition** (how blocks become a site),
not tooling. No `NEEDS CLARIFICATION` markers remain.

---

## Decision 1 — Discriminator key is `type`

**Decision**: Each `Section` union member carries a literal string discriminator under the key
**`type`** (e.g. `type: 'hero'`).

**Rationale**: The spec's user description and assumptions name the discriminator `type`; it reads
naturally in JSON authored by hand or by onboarding (`{ "type": "hero", ... }`), and `z.discrimi`
`natedUnion('type', ...)` keys on it directly. It does not collide with any Phase 2 block config
field (blocks use `variant`, content fields).

**Alternatives considered**:
- `kind` / `_type` / `__typename` — functionally equivalent; rejected for being less idiomatic in
  this codebase and (for `_`-prefixed names) implying an internal/system field authors should not
  set, when here it is author-facing.

---

## Decision 2 — Flat section shape (discriminator merged into the block slice)

**Decision**: A section item **is** the Phase 2 block config slice with the discriminator merged
in, built by `blockSchema.extend({ type: z.literal('<name>') })`. Example:

```jsonc
{ "type": "hero", "variant": "centered", "heading": "Welcome", "subheading": "..." }
```

**Rationale**:
- `z.discriminatedUnion('type', [...])` requires the discriminator to be a **top-level key** of
  each member object. A flat member satisfies this directly; the union dispatches in O(1) on `type`.
- Reuses each Phase 2 block schema **unchanged** — `.extend({ type })` adds only the discriminator,
  so the block's variant/fields and its `z.infer` type stay authoritative (Constitution V; no block
  redefinition in Phase 3).
- Keeps authored JSON shallow and readable.

**Alternatives considered**:
- **Nested wrapper** `{ type: 'hero', data: { ...slice } }` — mirrors the block's `:data` prop more
  literally. Rejected: `z.discriminatedUnion` cannot key on a nested field, forcing a manual
  `z.union` + custom dispatch; adds a level of indirection in every authored config for no schema
  benefit. (User-confirmed: flat.)

**Consequence for the renderer (later phase)**: it reads `section.type` to choose the component and
passes the slice as the block's `data` prop. The flat→`data` mapping is a one-line concern at the
render boundary, not a schema concern.

---

## Decision 3 — `z.discriminatedUnion` over a plain `z.union`

**Decision**: Build `Section` with `z.discriminatedUnion('type', members)`.

**Rationale**: Discriminated unions give a single, precise error keyed on `type` (an unknown/
unregistered `type` is reported as "invalid discriminator value", FR-014) and skip trying every
member. A plain `z.union` reports the union failure against **all** members (O(n) noise) and cannot
cleanly distinguish "unknown type" from "known type, bad slice".

**Alternatives considered**: `z.union` (rejected — noisy errors, no discriminator dispatch);
manual `switch (type)` validation (rejected — re-implements what `discriminatedUnion` provides,
contradicts DX, Constitution VIII).

---

## Decision 4 — Registry-built union with defined empty-registry behavior

**Decision**: A single **section registry** maps `type → member schema`. Concrete sections register
via one authoritative call (`registerSection`/`defineSection`); `buildSectionSchema()` constructs
`z.discriminatedUnion('type', [...registered])` from the registry. Phase 3 ships the **mechanism
with an empty registry** (no concrete sections authored), so:

- **≥1 registered type** → `Section` is the discriminated union of registered members.
- **Empty registry** → there is no valid section type, so **any non-empty `sections` list is
  invalid** and an **empty `sections` list is valid** (Decision 5 / FR-016). `buildSectionSchema()`
  returns a schema that rejects all section items in this state (e.g. an array element schema that
  never matches), with a clear message; it does not throw at module load.

**Rationale**: FR-018 mandates **one authoritative place** to register section types (no
per-template forks) and FR-019 mandates backward compatibility. A registry is that single place;
adding a member is additive and leaves existing data (which uses other `type`s) valid. Deferring
concrete sections to later phases (the spec's stated scope) means the union must be defined as a
**pattern over a registry**, not a hardcoded enum.

**Alternatives considered**:
- **Hardcoded `z.discriminatedUnion('type', [heroMember, ...])`** — rejected: requires concrete
  sections now (out of scope), and editing the union literal per new section invites per-template
  forks (violates FR-018).
- **Throw when the registry is empty** — rejected: makes the schema unusable for an empty-`sections`
  site (a valid state per FR-016) and crashes at import; a reject-all element schema is the defined,
  non-crashing behavior.

---

## Decision 5 — Whole-site validation: reject the whole config on any invalid section item

**Decision**: `validateWebsiteConfig` validates `company`, `theme`, and **every** `sections` item.
If **any** section item is invalid — unknown/unregistered `type`, or known `type` with an invalid
slice — **whole-`WebsiteConfig` validation fails** (no partial or silent render). The result still
carries a **per-item report** attributing the failure to the specific offending item(s) and marking
valid siblings as valid (User-confirmed: reject whole config).

**Reconciling FR-012 / FR-013 / FR-015** (these are not in conflict once scoped):
- **FR-012** allows "rejection **or** safe fallback" as the defined failure behavior. We choose
  **rejection** for invalid section items — an explicit, defined behavior, never silent broken
  output.
- **FR-013** governs **missing / partial** `company`/`theme` (and optional fields): these apply
  **schema defaults / graceful degradation** and never crash. Rejection (this decision) applies to
  **invalid section items**, a distinct case from absent optional config.
- **FR-015 / SC-006** require an invalid item be **flagged specifically without invalidating valid
  siblings**. Satisfied by the **per-item report**: each section is validated independently and its
  result attributed to it; valid siblings are reported valid (not cross-contaminated). The
  *aggregate gate* is reject, but the *diagnostics* preserve per-item attribution — so an operator
  sees exactly which item failed and that the rest were fine.

**Rationale**: A whole site shipped with a silently dropped or degraded section is a worse failure
mode for a commercial site than a clear build-time rejection that names the bad item. Fail-fast on
malformed sections aligns with "never silent broken output" (FR-012) and with build/server-time
validation (no broken site reaches users).

**Alternatives considered**:
- **Drop invalid items / safe-fallback degraded sections** — rejected by the user; would let a
  malformed config still produce a (partial) site.
- **Reject only on unknown type, fallback on bad slice** — rejected: two policies for one failure
  class; harder to reason about than a single reject gate with per-item diagnostics.

---

## Decision 6 — Minimum `company` / `theme` field sets, defaulted for graceful degradation

**Decision**: Define the **minimum cross-cutting** identity needed by baseline sections, with
optional/defaulted fields so partial input degrades gracefully (FR-013). Concrete field lists are
finalized in `data-model.md`:

- **`CompanyConfig`**: `name` (required — a site's single business identity), plus optional
  `tagline`, `contact { email?, phone?, address? }`, `social?` (record of platform → URL),
  `legal? { legalName?, taxId? }`.
- **`ThemeConfig`**: `colors { primary, secondary?, accent?, background?, foreground? }` (primary
  defaulted), `typography { headingFont?, bodyFont? }`, `mode: 'light' | 'dark' | 'system'`
  (default `'system'`), optional `radius` / `spacing` scale. All defaulted so a missing/partial
  theme still yields a valid, renderable token set.

**Rationale**: Centralizing identity once at the site level prevents per-section duplication
(FR-008) and lets a whole site be re-skinned via `theme` data alone (FR-009). Defaults keep
missing/partial portions non-crashing (FR-013) while `company.name` stays required as the one piece
of identity a real site cannot omit.

**Alternatives considered**: A large exhaustive field set — rejected: over-specifies before
concrete sections exist; the minimum set plus the backward-compatible extension procedure (Decision
4) lets fields grow additively without breaking existing data (FR-019).

---

## Summary of decisions

| # | Decision | Key FRs |
|---|----------|---------|
| 1 | Discriminator key `type` | FR-004, FR-005 |
| 2 | Flat section member via `.extend({ type })` | FR-005, FR-007 |
| 3 | `z.discriminatedUnion` for `Section` | FR-004, FR-014 |
| 4 | Single registry builds the union; defined empty-registry behavior | FR-016, FR-018, FR-019 |
| 5 | Whole-site validation, reject on any invalid section, per-item report | FR-011, FR-012, FR-013, FR-015 |
| 6 | Minimum defaulted `company` / `theme` shapes | FR-008, FR-009, FR-013 |
