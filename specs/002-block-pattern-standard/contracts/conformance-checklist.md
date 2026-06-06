# Block Conformance Checklist

**Purpose**: Pass/fail instrument (FR-017) for validating any candidate block against
[`block-contract.md`](./block-contract.md). A block is **accepted only when every applicable
criterion passes** (SC-007). Mark each `✅ pass` / `❌ fail` / `➖ n/a`.

**Block under review**: `__________________`  ·  **Group**: sections / ui / layout  ·  **Reviewer**: `______`

## Single input (C1)

- [ ] **K1** (FR-002) Block has exactly one content prop, `data`, carrying its config slice.
- [ ] **K2** (FR-002) Block renders its content from `data` only.
- [ ] **K3** (FR-003) Block exposes **no** scalar content props (`title`, `subtitle`, …).

## Typing & schema (C2)

- [ ] **K4** (FR-004) `data`'s type is **derived from a Zod schema** (`z.infer`), not declared separately.
- [ ] **K5** (FR-004) Exactly one schema is the source of truth for the block's props.
- [ ] **K6** (FR-015) Config shape, variants, and slots are self-documented (usable without reading source).

## Validation & failure (C3)

- [ ] **K7** (FR-005) Config is validated against the schema **before render**.
- [ ] **K8** (FR-013) Missing/partial/invalid config yields a safe fallback — render never crashes.
- [ ] **K9** (FR-014) Unknown/extra keys are stripped or schema-rejected — never silently merged.

## Variants (C4)

- [ ] **K10** (FR-006) Block declares a **closed** named variant set.
- [ ] **K11** (FR-006) Exactly one **explicit default** variant; used when `variant` is omitted.
- [ ] **K12** (FR-006) Unknown variant → defined behavior (reject/fallback), never undefined state.
- [ ] **K13** (FR-007) Changing variant is **config-only** (no source edit, no new block).

## Slots (C5)

- [ ] **K14** (FR-008) Block renders completely with **zero slots filled**.
- [ ] **K15** (FR-009) Slots are optional + additive; not required for baseline render.
- [ ] **K16** (C5) Slot↔config region precedence is documented (slot overrides).

## Independence (C6)

- [ ] **K17** (FR-010) No dependency on sibling blocks, parent context, or render order.
- [ ] **K18** (FR-010) No read/write of shared mutable global state.
- [ ] **K19** (FR-012) Same config slice → same output, regardless of surrounding blocks.
- [ ] **K20** (FR-011) No client-specific hardcoded content; no client identity from global state.

## Baseline quality (C7)

- [ ] **K21** (FR-016) Responsive by default.
- [ ] **K22** (FR-016) Meets the WCAG accessibility baseline.
- [ ] **K23** (FR-016) Theme-aware (dark/light where applicable).

---

**Result**: ☐ ACCEPTED (all applicable pass) · ☐ REJECTED (≥1 fail — list IDs: `__________`)

**Traceability**: K1–K23 cover FR-002…FR-016; FR-001 (contract exists) and FR-017 (this checklist
exists) are satisfied by the Phase 2 artifacts themselves.
