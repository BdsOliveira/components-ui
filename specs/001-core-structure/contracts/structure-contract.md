# Structure Contract: Canonical `sites/` Layout

This is the single source of truth (FR-011) that later phases reference when placing files.
A change to the canonical structure MUST be a deliberate edit to this contract.

## Canonical tree

```text
sites/
├── core/
│   ├── components/
│   │   ├── sections/
│   │   ├── ui/
│   │   └── layout/
│   ├── composables/
│   ├── theme/
│   ├── seo/
│   ├── forms/
│   ├── types/
│   ├── utils/
│   └── schemas/
├── templates/
├── clients/
├── onboarding/
├── assets/
└── scripts/
```

## Contract rules

1. **Completeness**: All 17 directories above MUST exist in a clean clone (SC-002).
2. **Documentation**: Every directory MUST contain a `README.md` with `responsibility`,
   `allowed`, `prohibited`, and `depends_on` (FR-005, SC-003).
3. **Preservation**: A directory with no functional files MUST still be tracked — via its
   `README.md`, or a `.gitkeep` if no README applies (FR-008).
4. **Dependency direction**: `core` depends on nothing; `templates`/`clients`/`onboarding`/
   `scripts` may depend on `core`; nothing may depend on `clients` (FR-007).
5. **Neutrality**: `core/` MUST NOT contain client- or template-specific content (FR-006).
6. **One home per concern**: each file category has exactly one destination; overlaps are
   disambiguated in the relevant folder READMEs (FR-010).
7. **Non-breaking**: the existing `app/` Nuxt entry point coexists and is unchanged in
   Phase 1 (FR-009).

## Verification checklist (structural test)

- [ ] `sites/` exists with all 6 layers
- [ ] `sites/core/` contains all 8 areas
- [ ] `sites/core/components/` contains `sections/`, `ui/`, `layout/`
- [ ] every mandated directory has a `README.md` with the 4 required fields
- [ ] no directory is missing after a clean `git clone`
- [ ] `app/app.vue` still present and app still builds
- [ ] no files placed outside the canonical structure (SC-004)
