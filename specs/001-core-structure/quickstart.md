# Quickstart: Core Structure (Phase 1)

How to create and verify the canonical `sites/` skeleton. Structure + docs only — no app code.

## Create the structure

From the repository root:

```bash
mkdir -p \
  sites/core/components/sections \
  sites/core/components/ui \
  sites/core/components/layout \
  sites/core/composables \
  sites/core/theme \
  sites/core/seo \
  sites/core/forms \
  sites/core/types \
  sites/core/utils \
  sites/core/schemas \
  sites/templates \
  sites/clients \
  sites/onboarding \
  sites/assets \
  sites/scripts
```

## Document each folder

Add a `README.md` to every mandated directory using this template:

```markdown
# <folder name>

**Responsibility**: <single responsibility>

**Allowed**: <what belongs here>

**Prohibited**: <what must never go here>

**Depends on**: <lower layers only, or "nothing">
```

Fill `allowed`/`prohibited`/`depends_on` from `data-model.md` (Layer / Core Area / Component
Group tables). The `README.md` keeps the folder in version control; add `.gitkeep` only if a
folder has no README.

## Verify

```bash
# All 17 mandated directories present
find sites -type d | sort

# Every mandated directory has a README.md
find sites -type d ! -path '*/.*' -exec sh -c \
  '[ -f "$1/README.md" ] || echo "MISSING README: $1"' _ {} \;

# Existing Nuxt entry point untouched and app still builds
test -f app/app.vue && echo "entry point OK"
npm run build
```

## Done when

- `find sites -type d` lists all 17 directories from `contracts/structure-contract.md`.
- No "MISSING README" output.
- `app/app.vue` present; `npm run build` succeeds.
- A teammate can place each of the 10 SC-001 sample files in the right folder on first try.
