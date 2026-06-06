# The Central Website Schema Contract

**Status**: Authoritative (single source of truth) · **Phase**: 3 · **Applies to**: every layer
that produces, consumes, or renders a website — onboarding, templates, renderer.

> This contract fixes how Phase 2 blocks compose into a whole site. A site that is not expressed as
> a single `WebsiteConfig` satisfying every MUST clause below is **non-conforming**. New capability
> (new section types, new fields) is added by the registration/extension procedure in **W7**, never
> by inventing an alternative site shape. It builds on, and never redefines, the Phase 2
> [block contract](../../002-block-pattern-standard/contracts/block-contract.md).

---

## W1 — One canonical site shape (FR-001, FR-002, FR-003)

A website MUST be represented as **exactly one** `WebsiteConfig` object:

```ts
// sites/core/schemas/website.ts
export const websiteConfigSchema = z.object({
  company:  companySchema,
  theme:    themeSchema,
  sections: z.array(buildSectionSchema()),
})
export type WebsiteConfig = z.infer<typeof websiteConfigSchema>
```

No information about a site may be held outside its `WebsiteConfig`. No layer may define a private
or alternative whole-site shape.

## W2 — `sections` is an ordered list; order is render order (FR-006, FR-007)

`sections` is an **ordered array**. The array order **is** the page render order — no hidden
reordering anywhere in the pipeline. The same section `type` MAY appear multiple times; each item is
an independent instance with its own config slice.

## W3 — `Section` is a closed discriminated union keyed by `type` (FR-004, FR-005)

Each item of `sections` MUST be one member of the closed discriminated union `Section`, keyed by the
`type` discriminator. Each member is a **flat** object: the Phase 2 block config slice for that
block, with the discriminator merged in.

```ts
// a member = the block's Phase 2 schema, extended with its literal `type`
const heroMember = defineSection('hero', heroSchema)   // = heroSchema.extend({ type: z.literal('hero') })
// authored data:  { "type": "hero", "variant": "centered", "heading": "..." }
```

```jsonc
// CONFORMING — discriminator + flat Phase 2 slice
{ "type": "hero", "variant": "centered", "heading": "Welcome" }

// NON-CONFORMING — no discriminator (cannot map to a block)
{ "variant": "centered", "heading": "Welcome" }

// NON-CONFORMING — nested wrapper (does not key the discriminated union)
{ "type": "hero", "data": { "heading": "Welcome" } }
```

The slice MUST be exactly the Phase 2 block slice (its `variant`/fields/slot conventions). Phase 3
does not redefine block internals.

## W4 — Whole-site validation before render (FR-011, FR-013)

A `WebsiteConfig` MUST be validated **as a whole before render**: `company`, `theme`, and **every**
`sections` item against its member schema. Validation runs at build/server time (Constitution IX)
and MUST NOT crash the render. Missing/partial `company`/`theme` portions MUST apply schema
**defaults / graceful degradation** (never a crash).

```ts
// sites/core/schemas/validate-website.ts
const result = validateWebsiteConfig(input)   // never throws
if (result.valid) render(result.data)
else reportAndAbort(result.sections, result.issues)
```

## W5 — Invalid section item rejects the whole config, with per-item diagnostics (FR-012, FR-014, FR-015)

If **any** section item is invalid — a missing/unknown/unregistered `type`, or a known `type` whose
slice fails its schema — whole-`WebsiteConfig` validation MUST **fail** (defined behavior:
rejection; never silent broken output).

The validation result MUST still **attribute** the failure to the specific offending item(s) by
index and `type`, and MUST report valid siblings as valid (siblings are not invalidated). This
preserves "flag the specific failing item" (SC-006) while the aggregate gate rejects.

| Input condition | Required behavior |
|-----------------|-------------------|
| All sections valid | Whole config valid → render |
| Section with missing/unknown `type` | Whole config **rejected**; item flagged by index | 
| Known `type`, invalid slice | Whole config **rejected**; item flagged by index + `type` |
| Missing/partial `company`/`theme` | Schema defaults applied; not a rejection (W4) |

> Distinction: **W4** defaults govern *absent/partial* config; **W5** rejection governs *invalid*
> section items. They are different failure classes.

## W6 — Empty `sections` is valid (FR-016)

An **empty** `sections` list is a **valid, defined state** (an empty page; the renderer renders no
sections). There is no undefined/ambiguous empty state. When the section registry has **no
registered types**, a non-empty `sections` list is invalid (no `type` can match) while an empty list
remains valid.

## W7 — Single-registry extension procedure (FR-018, FR-019)

There MUST be **one authoritative place** to register a section type into the `Section` union. New
section types are added there and nowhere else — no per-template forks, no editing a hand-written
union literal.

**To add a new section type:**

1. Author its Phase 2 block (its `blockSchema`, conforming to the block contract) — later phase.
2. Register it once: `registerSection(defineSection('<type>', <blockSchema>))`.
3. `buildSectionSchema()` now includes it as a union member automatically.

**Backward compatibility (MUST):** adding a member MUST leave all existing valid `WebsiteConfig`
data valid — existing data uses other `type`s and is unaffected. Field additions to `company`/
`theme` MUST be optional/defaulted so prior data still validates (FR-019).

## W8 — Neutral core, self-documenting (FR-010, FR-020, FR-021)

`WebsiteConfig`, `CompanyConfig`, `ThemeConfig`, and `Section` MUST be **strongly typed and Zod
schema-backed** (types derived via `z.infer`, never declared separately) and MUST live in the
neutral `core/` layer with **no client-specific or niche-specific hardcoded content**. The whole
schema MUST be self-documenting (JSON-Schema emission via `blockJsonSchema`) so a site can be
authored from the schema alone, without reading source.

---

## Conformance summary

A conforming website:

1. is one `WebsiteConfig` of `{ company, theme, sections }`; nothing held outside it (W1);
2. has an ordered `sections` list whose order is render order; repeats allowed (W2);
3. has each section as a flat member of the `type`-keyed discriminated union, reusing the Phase 2
   slice (W3);
4. is validated whole before render, with defaults for partial `company`/`theme` (W4);
5. rejects the whole config on any invalid section item, with per-item diagnostics (W5);
6. treats an empty `sections` list as a valid, defined state (W6);
7. grows only through the single section registry, backward-compatibly (W7);
8. is typed, schema-backed, neutral, and self-documenting in `core/` (W8).
