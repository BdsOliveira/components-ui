// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'

// Phase 8: the static-build target is selected by the `CLIENT` env var
// (build-target-contract C-BT-1; research D3). Unset ⇒ default `clinica-saude`,
// preserving existing behavior so current scripts/tests are unaffected (FR-008).
// One build per client: `CLIENT=<name> npm run generate`.
const CLIENT = process.env.CLIENT || 'clinica-saude'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Expose the selected client to the render page (read via useRuntimeConfig().public.client).
  runtimeConfig: {
    public: { client: CLIENT },
  },

  // Phase 4: make the neutral engine components (<SiteRenderer>, <DynamicSection>)
  // resolvable in pages without manual import. Concrete section components are NOT
  // auto-imported — they are referenced only through the explicit type->component
  // registry (sites/core/components/sections/registry.ts) so dispatch stays
  // deterministic and tree-shakeable (research D6).
  components: [
    { path: '~~/sites/core/components', pathPrefix: false },
  ],

  // Phase 7/8: serve the SELECTED client's own image assets straight from its
  // isolated directory (Constitution XII) without copying them into `public/`.
  // The dir/baseURL are computed from `CLIENT` (build-target-contract C-BT-3), so
  // every client resolves its own images at `/clients/<name>/images/...` with no
  // per-client edit here; image swap stays a data change against client-owned files.
  nitro: {
    publicAssets: [
      {
        dir: fileURLToPath(new URL(`sites/clients/${CLIENT}/images`, import.meta.url)),
        baseURL: `/clients/${CLIENT}/images`,
      },
    ],
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxtjs/tailwindcss'
  ]
})