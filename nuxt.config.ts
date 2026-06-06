// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Phase 4: make the neutral engine components (<SiteRenderer>, <DynamicSection>)
  // resolvable in pages without manual import. Concrete section components are NOT
  // auto-imported — they are referenced only through the explicit type->component
  // registry (sites/core/components/sections/registry.ts) so dispatch stays
  // deterministic and tree-shakeable (research D6).
  components: [
    { path: '~~/sites/core/components', pathPrefix: false },
  ],

  // Phase 7: serve the client's own image assets straight from its isolated
  // directory (Constitution XII) without copying them into `public/`. The
  // client dir maps to the URL base its `config.json` references
  // (`/clients/clinica-saude/images/...`); image swap stays a data change
  // against client-owned files (research D4, contract C3.2).
  nitro: {
    publicAssets: [
      {
        dir: fileURLToPath(new URL('sites/clients/clinica-saude/images', import.meta.url)),
        baseURL: '/clients/clinica-saude/images',
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