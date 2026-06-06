import type { Config } from 'tailwindcss'

/**
 * Tailwind content globs. The default @nuxtjs/tailwindcss globs scan app-level
 * dirs only; the neutral engine + the eight core blocks live under `sites/`, so
 * those paths are added here to ensure their utility classes are generated
 * (block-set-contract B8 — blocks are styled with Tailwind utilities + injected
 * `--site-*` theme vars).
 */
export default <Partial<Config>>{
  content: [
    './sites/**/*.{vue,ts}',
    './app/**/*.{vue,ts}',
  ],
}
