# Phase 1 Data Model: Central Website Schema

Entities are the conceptual pieces of the **whole-site schema** built on the Phase 2 block
contract. They define the single canonical shape of a website-as-data. Validation rules trace to
the spec's functional requirements. Code homes (authored in the later implement phase) are named
per entity; they reuse the Phase 2 primitives in `sites/core/schemas/`.

---

## Entity: WebsiteConfig

The single canonical structure representing an entire website as data — the source of truth for
site representation and the contract shared across onboarding, templates, and renderer (FR-001,
FR-003, FR-017).

| Aspect | Rule | Trace |
|--------|------|-------|
| Composition | Exactly `{ company, theme, sections }` | FR-002 |
| Uniqueness | The only permitted whole-site representation; no layer-specific shape | FR-003, FR-017 |
| Typing | Strongly typed + Zod schema-backed | FR-010 |
| Self-documentation | Shape discoverable (JSON-Schema emission) without reading source | FR-020 |
| Neutrality | Lives in `core/`; no client/niche hardcoded content | FR-021 |
| Validation | Validated as a whole before render | FR-011 |

- **Shape**:
  ```ts
  websiteConfigSchema = z.object({
    company:  companySchema,
    theme:    themeSchema,
    sections: z.array(buildSectionSchema()),   // ordered; empty allowed (FR-016)
  })
  export type WebsiteConfig = z.infer<typeof websiteConfigSchema>
  ```
- **Home**: `sites/core/schemas/website.ts`.

---

## Entity: CompanyConfig

The typed `company` portion holding the client's business identity — the single site-level source
for cross-cutting information many sections reuse, never duplicated per section (FR-008).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | **yes** | The one piece of identity a real site cannot omit |
| `tagline` | string | no | Short positioning line |
| `contact` | `{ email?, phone?, address? }` | no | All sub-fields optional/defaulted |
| `social` | record `string → url` | no | platform → profile URL |
| `legal` | `{ legalName?, taxId? }` | no | Legal essentials |

- **Validation**: missing/partial optional fields apply defaults / omit → never crash (FR-013).
  `name` absent → validation failure (it is required identity).
- **Home**: `sites/core/schemas/company.ts` (`companySchema`, `CompanyConfig`).

---

## Entity: ThemeConfig

The typed `theme` portion holding the site's visual identity tokens, applied uniformly across all
sections so appearance changes through configuration, not per-section styling (FR-009).

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `colors.primary` | string (color) | defaulted | Brand primary |
| `colors.secondary` / `accent` / `background` / `foreground` | string (color) | optional | Derived/defaulted where omitted |
| `typography.headingFont` / `bodyFont` | string | optional | Font family tokens |
| `mode` | `'light' \| 'dark' \| 'system'` | `'system'` | Site-wide color mode |
| `radius` / `spacing` | scale | optional | Optional design scales |

- **Validation**: every field defaulted or optional so a missing/partial theme still yields a
  valid, renderable token set (FR-013). Changing a value re-skins the whole site with no
  per-section source edit (FR-009).
- **Home**: `sites/core/schemas/theme.ts` (`themeSchema`, `ThemeConfig`).

---

## Entity: Section (discriminated union)

A **closed discriminated union** of named section types, keyed by the `type` discriminator. Each
member reuses a Phase 2 block schema for its config slice, flat-merged with the discriminator
(research Decision 2).

| Aspect | Rule | Trace |
|--------|------|-------|
| Discriminator | Each member has `type: z.literal('<name>')` | FR-004, FR-005 |
| Member shape | `<blockSchema>.extend({ type })` — flat slice + discriminator | FR-005 |
| Closedness | Built from the registry; unknown `type` rejected | FR-004, FR-014 |
| Slice source | The Phase 2 block config slice (variant/fields), unchanged | FR-005 |

- **Shape** (per member, illustrative — no concrete section authored in Phase 3):
  ```ts
  const heroMember = defineSection('hero', heroSchema)   // heroSchema.extend({ type: z.literal('hero') })
  ```
- **Union**: `buildSectionSchema()` → `z.discriminatedUnion('type', [...registeredMembers])`.
- **Home**: `sites/core/schemas/section.ts` (`Section` type = `z.infer<ReturnType<typeof buildSectionSchema>>`).

---

## Entity: Section Item

One element of the `sections` list — a concrete instance of a `Section` member.

| Aspect | Rule | Trace |
|--------|------|-------|
| Identity | Carries its `type` discriminator + its typed slice | FR-005 |
| Order | List position **is** render order; no hidden reordering | FR-006 |
| Repetition | Same `type` may appear multiple times; each is independent | FR-007 |
| Validation | Validated against its member schema; invalid item rejects whole config | FR-014, FR-015 |

---

## Entity: Section Type Registry

The single authoritative place where section types are registered into the `Section` union —
governing extension (FR-018) and backward compatibility (FR-019).

| Aspect | Rule | Trace |
|--------|------|-------|
| Authority | **One** registration point; no per-template forks | FR-018 |
| Mapping | `type (string) → member schema` | FR-004 |
| Extension | `registerSection`/`defineSection` adds a member additively | FR-018 |
| Backward compat | Adding a member leaves existing valid data valid | FR-019 |
| Empty state | No registered types → non-empty `sections` invalid, empty valid | FR-016 |

- **API** (illustrative):
  ```ts
  defineSection(type, blockSchema)   // = blockSchema.extend({ type: z.literal(type) })
  registerSection(member)            // adds to the single registry
  buildSectionSchema()               // discriminatedUnion('type', [...registry]) | reject-all if empty
  ```
- **Home**: `sites/core/schemas/section.ts`.

---

## Entity: Whole-Site Validation

The instrument that validates a `WebsiteConfig` as one unit before render, extending the Phase 2
per-block validation (`validateBlockConfig`) to the full site.

| Aspect | Rule | Trace |
|--------|------|-------|
| Scope | Validates `company`, `theme`, and **every** section item | FR-011 |
| Partial config | Missing/partial `company`/`theme` → schema defaults, no crash | FR-013 |
| Invalid section | Any invalid item → **whole config rejected**, never silent output | FR-012, FR-014 |
| Diagnostics | Per-item report attributes failure to the offending item; valid siblings reported valid | FR-015, SC-006 |
| Order preserved | Validation never reorders `sections` | FR-006 |

- **Result shape** (illustrative):
  ```ts
  interface WebsiteValidationResult {
    valid: boolean
    data?: WebsiteConfig                 // present only when valid
    sections: { index: number; type?: string; valid: boolean; issues?: ZodIssue[] }[]
    issues?: ZodIssue[]                  // company/theme-level issues
  }
  ```
- **Home**: `sites/core/schemas/validate-website.ts` (`validateWebsiteConfig`), reusing
  `validateBlockConfig` from `sites/core/schemas/validate.ts`.

---

## Relationships

```text
WebsiteConfig
├── company : CompanyConfig            (one, required)
├── theme   : ThemeConfig             (one, defaulted)
└── sections: SectionItem[]           (ordered, empty allowed)
                  └── each is one member of Section (discriminated union by `type`)
                            └── member = <Phase 2 blockSchema>.extend({ type })   ← built/registered via Section Type Registry
```

## Traceability (FR → entity)

| FR | Entity / rule |
|----|---------------|
| FR-001/002/003 | WebsiteConfig composition + uniqueness |
| FR-004/005 | Section union, discriminator, flat member from block schema |
| FR-006 | Section Item order = render order |
| FR-007 | Section Item repetition allowed |
| FR-008 | CompanyConfig single-source identity |
| FR-009 | ThemeConfig site-wide tokens |
| FR-010/020 | All entities typed, schema-backed, self-documenting |
| FR-011/012/015 | Whole-Site Validation scope + reject policy + per-item report |
| FR-013 | Defaults on partial company/theme |
| FR-014 | Unknown `type` rejected by discriminated union |
| FR-016 | Empty `sections` valid; empty-registry behavior |
| FR-017 | WebsiteConfig is the cross-layer contract |
| FR-018/019 | Section Type Registry: one authority, backward-compatible |
| FR-021 | All schema modules in neutral `core/` |
