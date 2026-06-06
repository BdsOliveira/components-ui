# scripts

**Responsibility**: Automation, scaffolding, and generators — tooling that builds, validates, or generates platform artifacts.

**Allowed**: Generic scripts and generators (e.g. scaffold a client, validate structure, generate config) reusable across the platform.

**Prohibited**: Client-specific one-offs, and runtime application logic (→ `core`).

**Depends on**: `core` (may read its types/schemas). Never depended on by lower layers.

## `new-client` — automatic client scaffold (Phase 8)

One command writes a complete, valid, deploy-ready client directory from a niche
template — no file created by hand.

```bash
# Non-interactive (CI-safe — all three flags supplied):
npm run new-client -- --name acme-dental --template clinic --domain acmedental.example.com

# Interactive (prompts for anything omitted):
npm run new-client
```

**Inputs** (no silent defaults; missing ones are prompted — FR-002):

| Flag | Rule |
|------|------|
| `--name` | kebab slug `^[a-z0-9]+(-[a-z0-9]+)*$`; must not collide with an existing client |
| `--template` | a known template: `clinic`, `lawyer`, `restaurant`, `school`, `local-business` |
| `--domain` | a hostname (e.g. `acme.example.com`); must not be reused by another client |

**Output**: `sites/clients/<name>/` with `config.json` (seeded from the template's
`defaults.json` + `theme.ts`, identity injected), `domain.txt`, `images/hero.jpg`
(placeholder — swap later), `README.md`, and `__tests__/<name>.spec.ts`.

**Guarantees**: the script stages under `.new-client-tmp-<name>/`, runs a scoped
`vitest` gate over the staged spec, then **atomically renames** on success. Any
failure (bad name/template/domain, collision, domain reuse, gate failure) removes
the staging dir and exits non-zero — nothing partial is left behind (FR-012). A run
writes ONLY the new client directory; shared/template/core source is untouched (FR-009).

## Build-target selection (`CLIENT`)

Any client is selectable as the static-build target by the `CLIENT` env var
(default `clinica-saude` when unset). Adding a client directory makes it selectable
with zero edits to `nuxt.config.ts` / `app/pages/index.vue` (auto-discovered via
`import.meta.glob`).

```bash
CLIENT=acme-dental npm run dev        # preview
CLIENT=acme-dental npm run generate   # static site → ship .output/public
npm run generate                      # CLIENT unset ⇒ defaults to clinica-saude
```
