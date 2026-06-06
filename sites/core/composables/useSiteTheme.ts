/**
 * useSiteTheme — the provide/inject channel carrying the site-level theme
 * (renderer-contract.md §R11, research Decision 6, data-model "Site Theme Context";
 * FR-015, SC-009).
 *
 * `SiteRenderer` calls `useSiteTheme(theme)` ONCE to provide the validated
 * Phase 3 `ThemeConfig` to every rendered section; a section calls
 * `useSiteTheme()` (no arg) to inject it. One shared visual identity reaches all
 * sections without prop-drilling, and a theme change re-applies across every
 * section with no per-section source edits (FR-015 / SC-009).
 *
 * Reuses the Phase 3 `ThemeConfig` — it defines NO new theme model (R11). Scoped
 * to the rendered site subtree via provide/inject (not a mutable global), so it
 * supports more than one `WebsiteConfig` on a page if ever needed (research D6).
 *
 *   // SiteRenderer (provide):
 *   useSiteTheme(config.theme)
 *   // inside a section (inject):
 *   const theme = useSiteTheme()
 */
import { inject, provide, type InjectionKey } from 'vue'
import type { ThemeConfig } from '~~/sites/core/schemas'

/** The injection key for the site-wide theme (typed, module-private). */
const SiteThemeKey: InjectionKey<ThemeConfig> = Symbol('site-theme')

/** Provide the site theme to all descendant sections (call in SiteRenderer). */
export function useSiteTheme(theme: ThemeConfig): void
/** Inject the provided site theme (call inside a section component). */
export function useSiteTheme(): ThemeConfig
export function useSiteTheme(theme?: ThemeConfig): void | ThemeConfig {
  if (theme !== undefined) {
    provide(SiteThemeKey, theme)
    return
  }
  const injected = inject(SiteThemeKey, undefined)
  if (injected === undefined) {
    throw new Error('[useSiteTheme] called outside a <SiteRenderer> — no theme provided.')
  }
  return injected
}
