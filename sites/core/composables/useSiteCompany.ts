/**
 * useSiteCompany — the provide/inject channel carrying the site-level company
 * identity (block-set-contract.md B6, plan Decision 2; FR-011).
 *
 * Mirrors `useSiteTheme`: `SiteRenderer` calls `useSiteCompany(company)` ONCE to
 * provide the validated Phase 3 `CompanyConfig` to every rendered section;
 * cross-cutting blocks (Contact, Footer) call `useSiteCompany()` (no arg) to
 * inject it. Site-level identity (contact, social, legal, tagline) reaches the
 * blocks that need it without per-block duplication — change it once at site
 * level and every consuming block follows (FR-011).
 *
 * Reuses the Phase 3 `CompanyConfig` — it defines NO new identity model. Scoped
 * to the rendered site subtree via provide/inject (not a mutable global), so it
 * supports more than one `WebsiteConfig` on a page if ever needed.
 *
 *   // SiteRenderer (provide):
 *   useSiteCompany(config.company)
 *   // inside Contact / Footer (inject):
 *   const company = useSiteCompany()
 */
import { inject, provide, type InjectionKey } from 'vue'
import type { CompanyConfig } from '~~/sites/core/schemas'

/** The injection key for the site-wide company identity (typed, module-private). */
const SiteCompanyKey: InjectionKey<CompanyConfig> = Symbol('site-company')

/** Provide the site company to all descendant sections (call in SiteRenderer). */
export function useSiteCompany(company: CompanyConfig): void
/** Inject the provided site company (call inside a section component). */
export function useSiteCompany(): CompanyConfig
export function useSiteCompany(company?: CompanyConfig): void | CompanyConfig {
  if (company !== undefined) {
    provide(SiteCompanyKey, company)
    return
  }
  const injected = inject(SiteCompanyKey, undefined)
  if (injected === undefined) {
    throw new Error('[useSiteCompany] called outside a <SiteRenderer> — no company provided.')
  }
  return injected
}
