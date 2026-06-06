import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'

// Resolve the Nuxt-style `~~` (repo root) and `~` (app/) aliases so the renderer
// source — which imports via `~~/sites/...` — loads under vitest without Nuxt.
const rootDir = fileURLToPath(new URL('.', import.meta.url))
const appDir = fileURLToPath(new URL('./app', import.meta.url))

// Phase 4 renderer tests: mount Vue SFCs (DynamicSection / SiteRenderer) with
// @vue/test-utils in a happy-dom environment. The renderer components import
// their Vue primitives explicitly (no Nuxt auto-import) so they mount here
// without a full Nuxt runtime (plan.md Testing; research D6).
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '~~': rootDir,
      '~': appDir,
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['sites/**/__tests__/**/*.spec.ts'],
  },
})
