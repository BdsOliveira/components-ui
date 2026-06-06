/**
 * Lawyer composition root — STRUCTURE only (factory shape; research D5, FR-004).
 * Imports content from `./defaults.json` and identity from `./theme`, fixes the
 * section order, and assembles a validated `WebsiteConfig`. Mirrors `clinic/page.ts`
 * so every template is seedable and dispatchable through the registry. Contains NO
 * section content and NO theme tokens.
 */
import type { WebsiteConfig } from '~~/sites/core/schemas'
import defaults from './defaults.json'
import { lawyerTheme } from './theme'

/** The lawyer page structure — order IS render order (the single source of ordering). */
const ORDER = ['hero', 'about', 'services', 'cta', 'contact', 'footer'] as const
type SectionType = (typeof ORDER)[number]

/** Per-concern overrides; `ORDER` is intentionally NOT overridable (Constitution VI). */
export interface LawyerOverrides {
  company?: Partial<WebsiteConfig['company']>
  theme?: Partial<WebsiteConfig['theme']>
  content?: Partial<Record<SectionType, Record<string, unknown>>>
}

const defaultSections = defaults.sections as Record<SectionType, Record<string, unknown>>

/** Build a lawyer site: fixed `ORDER`, shipped defaults, plus optional per-concern overrides. */
export function createLawyerSite(overrides: LawyerOverrides = {}): WebsiteConfig {
  return {
    company: { ...defaults.company, ...overrides.company },
    theme: { ...lawyerTheme, ...overrides.theme },
    sections: ORDER.map((type) => ({
      type,
      ...defaultSections[type],
      ...(overrides.content?.[type] ?? {}),
    })),
  } as WebsiteConfig
}

/** The lawyer site with shipped defaults — `lawyerSite === createLawyerSite()`. */
export const lawyerSite: WebsiteConfig = createLawyerSite()
