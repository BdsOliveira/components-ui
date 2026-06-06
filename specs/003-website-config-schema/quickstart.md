# Quickstart: Author & Validate a Website as Data

How a whole site is created and changed by editing **data only** — no source edits (SC-004,
SC-009). The schema modules referenced here are authored in the later implement phase
(`sites/core/schemas/{company,theme,section,website,validate-website}.ts`); this walkthrough is the
intended end-to-end usage of the contract.

---

## 1. Register a section type (one authoritative place — W7)

A concrete section's Phase 2 block schema is registered **once** into the `Section` union. This is
the only place new section types are added (FR-018):

```ts
// sites/core/schemas/sections-registry.ts  (single registration module — illustrative)
import { registerSection, defineSection } from '~/sites/core/schemas'
import { heroSchema } from '~/sites/core/schemas/blocks/hero'   // a Phase 2 block schema (later phase)

registerSection(defineSection('hero', heroSchema))   // type 'hero' is now a valid Section member
```

`buildSectionSchema()` now includes `hero` automatically. Adding another type later is one more
`registerSection(...)` line — existing sites stay valid (FR-019).

## 2. Author a `WebsiteConfig` as JSON (W1, W2, W3)

A whole site is one object: `company` + `theme` + an ordered `sections` list. Section order is
render order; the same `type` may repeat:

```jsonc
{
  "company": {
    "name": "Bright Smile Clinic",
    "tagline": "Modern dental care",
    "contact": { "email": "hi@brightsmile.example", "phone": "+1 555 0100" }
  },
  "theme": {
    "colors": { "primary": "#0ea5e9" },
    "mode": "light"
  },
  "sections": [
    { "type": "hero", "variant": "centered", "heading": "Welcome to Bright Smile" },
    { "type": "hero", "variant": "split",    "heading": "Book your visit" }
  ]
}
```

No source code is touched — the site is fully described by this data.

## 3. Validate the whole site before render (W4, W5)

```ts
import { validateWebsiteConfig } from '~/sites/core/schemas'

const result = validateWebsiteConfig(input)   // never throws

if (result.valid) {
  render(result.data)                          // sections render in list order
} else {
  // per-item diagnostics: which section failed, by index + type
  for (const s of result.sections) {
    if (!s.valid) console.error(`section[${s.index}] type=${s.type ?? '?'}`, s.issues)
  }
  // whole config rejected — no partial/broken site is shipped
}
```

- Missing/partial `company`/`theme` fields → **schema defaults** applied, render does not crash
  (W4 / FR-013).
- Any **invalid** section item → **whole config rejected**, the bad item flagged, valid siblings
  reported valid (W5 / FR-015).

## 4. Verify the defining behaviors

| Check | Expected | Trace |
|-------|----------|-------|
| Two sites, same structure, different values | Both are valid `WebsiteConfig`; differ only in data | SC-001 |
| Section order changed in the array | Render order changes accordingly; no hidden reordering | SC-008 |
| Repeat the same `type` twice | Both render as independent instances | FR-007 |
| Unknown `type` (e.g. `"type": "nope"`) | Whole config rejected; item flagged by index | FR-014, W5 |
| Known `type`, invalid slice (e.g. missing required `heading`) | Whole config rejected; item flagged by index+type; siblings reported valid | FR-015, SC-006 |
| Empty `sections: []` | Valid; renders an empty page | FR-016, W6 |
| Omit `theme` entirely | Defaults applied; valid; no crash | FR-013, W4 |
| Register a new section type | Becomes a valid member; the site above still validates unchanged | FR-018/019, W7 |
| Read only the emitted JSON-Schema | A valid site can be authored without reading source | SC-009, W8 |

## 5. Where each layer plugs in (W1, FR-017)

```text
onboarding  ──produces──▶  WebsiteConfig  ──consumed/merged by──▶  templates
                                  │
                                  └──accepted (validated) by──▶  renderer
```

Every boundary speaks the same `WebsiteConfig`; no layer converts the site into a private shape.
