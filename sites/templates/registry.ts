/**
 * Template dispatch registry (research D5; data-model TemplateSource).
 *
 * The single source of truth mapping a `template` discriminator → its factory and
 * its raw defaults. Generalizes the former inline `{ clinic }` map in
 * `app/pages/index.vue`: the render page dispatches through this registry, and the
 * scaffold (`sites/scripts/new-client.ts`) reads `defaults` to seed a new client's
 * `config.json`. The registry keys are the authoritative "available templates" list
 * surfaced by the scaffold's unknown-template error (FR-011).
 *
 * Every template shares one normalized shape (`defaults.json` + `theme.ts` +
 * `page.ts → create<X>Site(overrides)`), so a common override document drives all
 * factories. Factory params are template-specific (their own `SectionType` unions);
 * each is exposed here under the shared `TemplateOverrides` shape.
 */
import type { WebsiteConfig } from '~~/sites/core/schemas'

import { createClinicSite } from './clinic/page'
import clinicDefaults from './clinic/defaults.json'
import { createLawyerSite } from './lawyer/page'
import lawyerDefaults from './lawyer/defaults.json'
import { createRestaurantSite } from './restaurant/page'
import restaurantDefaults from './restaurant/defaults.json'
import { createSchoolSite } from './school/page'
import schoolDefaults from './school/defaults.json'
import { createLocalBusinessSite } from './local-business/page'
import localBusinessDefaults from './local-business/defaults.json'

/** The override document a client `config.json` supplies (per-concern; `ORDER` is template-owned). */
export interface TemplateOverrides {
  company?: Partial<WebsiteConfig['company']>
  theme?: Partial<WebsiteConfig['theme']>
  content?: Record<string, Record<string, unknown>>
}

/** The raw, shipped defaults for a template (content + company), used to seed a new client. */
export interface TemplateDefaults {
  company: Record<string, unknown>
  sections: Record<string, Record<string, unknown>>
}

/** A registered template: build a site from overrides, plus its raw seed defaults. */
export interface TemplateEntry {
  factory: (overrides?: TemplateOverrides) => WebsiteConfig
  defaults: TemplateDefaults
}

/**
 * The five normalized niche templates. The cast bridges each factory's
 * template-specific override union to the shared `TemplateOverrides` shape — safe
 * because every factory deep-merges per concern and ignores unknown content keys.
 */
export const templateRegistry = {
  clinic: { factory: createClinicSite as TemplateEntry['factory'], defaults: clinicDefaults as TemplateDefaults },
  lawyer: { factory: createLawyerSite as TemplateEntry['factory'], defaults: lawyerDefaults as TemplateDefaults },
  restaurant: { factory: createRestaurantSite as TemplateEntry['factory'], defaults: restaurantDefaults as TemplateDefaults },
  school: { factory: createSchoolSite as TemplateEntry['factory'], defaults: schoolDefaults as TemplateDefaults },
  'local-business': { factory: createLocalBusinessSite as TemplateEntry['factory'], defaults: localBusinessDefaults as TemplateDefaults },
} as const satisfies Record<string, TemplateEntry>

/** A known template discriminator (a registry key). */
export type TemplateKey = keyof typeof templateRegistry

/** The authoritative list of available template names (FR-011 error messages). */
export const templateKeys = Object.keys(templateRegistry) as TemplateKey[]

/** Type guard: is `t` a registered template key? */
export function isTemplateKey(t: string): t is TemplateKey {
  return Object.prototype.hasOwnProperty.call(templateRegistry, t)
}
