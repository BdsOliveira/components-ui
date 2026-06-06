/**
 * School composition root — STRUCTURE only (factory shape; research D5, FR-004).
 * Mirrors `clinic/page.ts`: content from `./defaults.json`, identity from `./theme`,
 * fixed section order, assembled into a validated `WebsiteConfig`. No content, no
 * theme tokens here.
 */
import type { WebsiteConfig } from '~~/sites/core/schemas'
import defaults from './defaults.json'
import { schoolTheme } from './theme'

/** The school page structure — order IS render order. */
const ORDER = ['hero', 'about', 'services', 'faq', 'cta', 'contact', 'footer'] as const
type SectionType = (typeof ORDER)[number]

/** Per-concern overrides; `ORDER` is intentionally NOT overridable (Constitution VI). */
export interface SchoolOverrides {
  company?: Partial<WebsiteConfig['company']>
  theme?: Partial<WebsiteConfig['theme']>
  content?: Partial<Record<SectionType, Record<string, unknown>>>
}

const defaultSections = defaults.sections as Record<SectionType, Record<string, unknown>>

/** Build a school site: fixed `ORDER`, shipped defaults, plus optional per-concern overrides. */
export function createSchoolSite(overrides: SchoolOverrides = {}): WebsiteConfig {
  return {
    company: { ...defaults.company, ...overrides.company },
    theme: { ...schoolTheme, ...overrides.theme },
    sections: ORDER.map((type) => ({
      type,
      ...defaultSections[type],
      ...(overrides.content?.[type] ?? {}),
    })),
  } as WebsiteConfig
}

/** The school site with shipped defaults — `schoolSite === createSchoolSite()`. */
export const schoolSite: WebsiteConfig = createSchoolSite()
