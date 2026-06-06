/**
 * Clinic composition root — STRUCTURE only (contract T2, FR-002, FR-011;
 * research Decision 1/5). Imports content from `./defaults.json` and identity
 * from `./theme`, fixes the section order, and assembles a validated
 * `WebsiteConfig`. Contains NO section content and NO theme tokens (those live
 * in T3/T4); type-safety of the JSON content is enforced at the boundary by
 * `validateWebsiteConfig` (research Decision 3), not duplicated TS interfaces.
 */
import type { WebsiteConfig } from '~~/sites/core/schemas'
import defaults from './defaults.json'
import { clinicTheme } from './theme'

/** The clinic page structure — order IS render order (the single source of ordering). */
const ORDER = ['hero', 'services', 'testimonials', 'faq', 'contact', 'footer'] as const
type SectionType = (typeof ORDER)[number]

/** Per-concern overrides; `ORDER` is intentionally NOT overridable (Constitution VI). */
export interface ClinicOverrides {
  company?: Partial<WebsiteConfig['company']>
  theme?: Partial<WebsiteConfig['theme']>
  content?: Partial<Record<SectionType, Record<string, unknown>>>
}

const defaultSections = defaults.sections as Record<SectionType, Record<string, unknown>>

/**
 * Build a clinic site: fixed `ORDER`, shipped defaults, plus optional
 * content/theme/company overrides deep-merged per concern (contract T5; FR-008,
 * FR-009, FR-012). A content or company override never touches structure or
 * theme; a theme override never touches structure or content.
 */
export function createClinicSite(overrides: ClinicOverrides = {}): WebsiteConfig {
  return {
    company: { ...defaults.company, ...overrides.company },
    theme: { ...clinicTheme, ...overrides.theme },
    sections: ORDER.map((type) => ({
      type,
      ...defaultSections[type],
      ...(overrides.content?.[type] ?? {}),
    })),
  } as WebsiteConfig
}

/** The clinic site with shipped defaults (no overrides) — `clinicSite === createClinicSite()`. */
export const clinicSite: WebsiteConfig = createClinicSite()
