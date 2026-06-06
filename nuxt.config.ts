// https://nuxt.com/docs/api/configuration/nuxt-config
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

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxtjs/tailwindcss'
  ]
})