/**
 * Shared test helpers for the eight Phase 5 blocks (tasks.md T009).
 *
 * Two ways to exercise a block:
 *   - `mountBlock(Component, data, opts)` — DIRECT mount: wraps the block in a
 *     tiny component that provides `useSiteTheme` / `useSiteCompany` (a block
 *     calls these in setup, so it cannot mount bare). Use for per-block schema /
 *     render / variant / degradation tests.
 *   - `renderSite(config)` — mount a whole `WebsiteConfig` through `SiteRenderer`
 *     (which provides theme + company and dispatches via the registry). Use for
 *     the five-vertical integration test. The caller must have imported
 *     `register.ts` so the eight types are registered.
 */
import { defineComponent, h, type Component } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { useSiteTheme } from '~~/sites/core/composables/useSiteTheme'
import { useSiteCompany } from '~~/sites/core/composables/useSiteCompany'
import {
  themeSchema,
  companySchema,
  type ThemeConfig,
  type CompanyConfig,
  type WebsiteConfig,
} from '~~/sites/core/schemas'
import SiteRenderer from '~~/sites/core/components/render/SiteRenderer.vue'

/** A valid, fully-defaulted theme for blocks that don't care about brand tokens. */
export const defaultTheme: ThemeConfig = themeSchema.parse({})
/** A minimal valid company (only the required `name`). */
export const defaultCompany: CompanyConfig = companySchema.parse({ name: 'Test Co' })

export interface MountBlockOptions {
  theme?: ThemeConfig
  company?: CompanyConfig
}

/**
 * Direct-mount a block with the site-context channels it depends on. `data` is
 * the block's already-valid config slice ({ type, ...fields }).
 */
export function mountBlock(
  component: Component,
  data: Record<string, unknown>,
  opts: MountBlockOptions = {},
): VueWrapper {
  const theme = opts.theme ?? defaultTheme
  const company = opts.company ?? defaultCompany
  const Wrapper = defineComponent({
    name: 'BlockHarness',
    setup() {
      useSiteTheme(theme)
      useSiteCompany(company)
      return () => h(component, { data })
    },
  })
  return mount(Wrapper)
}

/** Render a whole (already-valid) WebsiteConfig through SiteRenderer. */
export function renderSite(config: WebsiteConfig): VueWrapper {
  return mount(SiteRenderer, { props: { config } })
}
