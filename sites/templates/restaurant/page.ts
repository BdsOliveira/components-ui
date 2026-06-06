/**
 * Restaurant composition root — STRUCTURE only (factory shape; research D5, FR-004).
 * Mirrors `clinic/page.ts`: content from `./defaults.json`, identity from `./theme`,
 * fixed section order, assembled into a validated `WebsiteConfig`. No content, no
 * theme tokens here.
 */
import type { WebsiteConfig } from '~~/sites/core/schemas'
import defaults from './defaults.json'
import { restaurantTheme } from './theme'

/** The restaurant page structure — order IS render order. */
const ORDER = ['hero', 'about', 'services', 'testimonials', 'contact', 'footer'] as const
type SectionType = (typeof ORDER)[number]

/** Per-concern overrides; `ORDER` is intentionally NOT overridable (Constitution VI). */
export interface RestaurantOverrides {
  company?: Partial<WebsiteConfig['company']>
  theme?: Partial<WebsiteConfig['theme']>
  content?: Partial<Record<SectionType, Record<string, unknown>>>
}

const defaultSections = defaults.sections as Record<SectionType, Record<string, unknown>>

/** Build a restaurant site: fixed `ORDER`, shipped defaults, plus optional per-concern overrides. */
export function createRestaurantSite(overrides: RestaurantOverrides = {}): WebsiteConfig {
  return {
    company: { ...defaults.company, ...overrides.company },
    theme: { ...restaurantTheme, ...overrides.theme },
    sections: ORDER.map((type) => ({
      type,
      ...defaultSections[type],
      ...(overrides.content?.[type] ?? {}),
    })),
  } as WebsiteConfig
}

/** The restaurant site with shipped defaults — `restaurantSite === createRestaurantSite()`. */
export const restaurantSite: WebsiteConfig = createRestaurantSite()
