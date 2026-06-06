# Contract: Build-Target Selection (one-time dynamic wiring)

The convention that makes any client independently selectable as the static-build
target with **no per-client edit to shared files** (FR-007/FR-008/FR-009). This is
the one-time infra change that replaces today's hardcoded single-client wiring.

## C-BT-1 — Selection channel

- The build target is the `CLIENT` environment variable.
  ```bash
  CLIENT=<name> npm run generate   # static site for <name>
  CLIENT=<name> npm run dev        # preview <name>
  ```
- When `CLIENT` is unset, it defaults to `clinica-saude` (preserves current
  behavior; existing scripts/tests unaffected — FR-008).

## C-BT-2 — Config resolution (`app/pages/index.vue`)

- Client configs are discovered by convention:
  `import.meta.glob('~~/sites/clients/*/config.json', { eager: true })`.
- The entry whose directory segment equals `useRuntimeConfig().public.client`
  (sourced from `CLIENT`) is selected.
- Dispatch goes through `sites/templates/registry.ts` (discriminator → factory),
  NOT an inline per-template map.
- An unknown/absent client or template surfaces an error (existing failure path);
  it never renders a silent wrong/empty site.

## C-BT-3 — Asset resolution (`nuxt.config.ts`)

- `nitro.publicAssets` `dir`/`baseURL` are computed from the selected client:
  `sites/clients/${CLIENT}/images` → `/clients/${CLIENT}/images`.
- A client's images resolve from its own directory at its own path (US3
  scenario 1); no copy into `public/`.

## C-BT-4 — Domain record

- The selected client's domain is read from its own `sites/clients/<name>/domain.txt`
  (US3 scenario 3). No shared domain registry.

## C-BT-5 — Isolation guarantee

- Adding a new client directory makes it selectable with **zero** edits to
  `nuxt.config.ts`, `app/pages/index.vue`, the template layer, or core (FR-009).
- Every previously scaffolded client remains selectable and generates an
  unchanged static site (FR-008, SC-004).

## C-BT-6 — Scope boundary

- This wiring is implemented **once** in this phase. The per-run scaffold command
  (scaffold-cli-contract) never edits these shared files; it only adds a client
  directory that this convention auto-discovers.
