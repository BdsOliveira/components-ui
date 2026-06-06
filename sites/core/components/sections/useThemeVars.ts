/**
 * useThemeVars — map the injected site `ThemeConfig` to inline CSS custom
 * properties a block applies on its root element (block-set-contract.md B8;
 * FR-009, Constitution X).
 *
 * Blocks stay theme-aware without prop-drilling or per-block token logic: they
 * read the one site theme via `useSiteTheme()` and bind the returned vars as an
 * inline `style`. Tailwind utility classes inside a block can then reference
 * these `--site-*` vars (e.g. `style="color: var(--site-fg)"`), so re-skinning
 * the whole site is a configuration change (theme) with no block-source edits.
 *
 *   const themeVars = useThemeVars()
 *   <section :style="themeVars"> ... </section>
 */
import { computed, type ComputedRef } from 'vue'
import { useSiteTheme } from '~~/sites/core/composables/useSiteTheme'

/** A bindable inline-style object of `--site-*` custom properties. */
export function useThemeVars(): ComputedRef<Record<string, string>> {
  const theme = useSiteTheme()
  return computed(() => {
    const vars: Record<string, string> = {}
    const c = theme.colors
    if (c?.primary) vars['--site-primary'] = c.primary
    if (c?.secondary) vars['--site-secondary'] = c.secondary
    if (c?.accent) vars['--site-accent'] = c.accent
    if (c?.background) vars['--site-bg'] = c.background
    if (c?.foreground) vars['--site-fg'] = c.foreground
    if (theme.typography?.headingFont) vars['--site-heading-font'] = theme.typography.headingFont
    if (theme.typography?.bodyFont) vars['--site-body-font'] = theme.typography.bodyFont
    if (theme.radius) vars['--site-radius'] = theme.radius
    if (theme.spacing) vars['--site-spacing'] = theme.spacing
    return vars
  })
}
