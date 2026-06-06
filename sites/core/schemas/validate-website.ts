/**
 * Whole-site validation — validate a `WebsiteConfig` as one unit before render
 * (website-schema-contract.md §W4/§W5, research Decision 5, data-model
 * "Whole-Site Validation"; FR-006, FR-011, FR-012, FR-013, FR-014, FR-015).
 *
 * Extends the Phase 2 per-block `validateBlockConfig` to the full site. The
 * contract:
 *
 *   - NEVER throws (build/server-time gate, Constitution IX) — uses `safeParse`.
 *   - `company` / `theme`: missing or partial input applies schema DEFAULTS and
 *     is NOT a rejection (W4 / FR-013). (`company.name` is required, so an
 *     entirely-absent `company` still fails — it is missing required identity.)
 *   - Each `sections` item is validated against the LIVE section union, rebuilt
 *     from the registry per call so registrations after import are honored.
 *   - Any INVALID section item — missing/unknown/unregistered `type`, or a known
 *     `type` with a bad slice — REJECTS THE WHOLE CONFIG (W5 / FR-012 / FR-014);
 *     never silent broken output.
 *   - Diagnostics still ATTRIBUTE failure per item (index + `type`) and report
 *     valid siblings as valid (FR-015 / SC-006) — the aggregate gate rejects,
 *     the per-item report localizes.
 *   - `sections` order is preserved; validation never reorders (FR-006).
 */
import { z } from 'zod'
import { companySchema } from './company'
import { themeSchema } from './theme'
import { buildSectionSchema } from './section'
import { validateBlockConfig } from './validate'
import type { WebsiteConfig } from './website'

/** Per-section diagnostic: which item, its `type`, whether it passed, why not. */
export interface SectionValidation {
  index: number
  type?: string
  valid: boolean
  issues?: z.ZodIssue[]
}

/** The result of validating a whole `WebsiteConfig`. */
export interface WebsiteValidationResult {
  /** `true` only when company, theme, and every section item are valid. */
  valid: boolean
  /** The schema-valid whole-site config — present ONLY when `valid` is true. */
  data?: WebsiteConfig
  /** Per-item section diagnostics, in original (render) order. */
  sections: SectionValidation[]
  /** `company` / `theme`-level issues, when any. */
  issues?: z.ZodIssue[]
}

/**
 * Validate a `WebsiteConfig` as a whole before render. Never throws.
 * Rejects the whole config on any invalid section item, with per-item
 * diagnostics and defaults applied to missing/partial `company`/`theme`.
 */
export function validateWebsiteConfig(input: unknown): WebsiteValidationResult {
  const obj =
    input && typeof input === 'object' ? (input as Record<string, unknown>) : {}

  // company / theme: apply schema defaults to missing/partial input (W4/FR-013).
  // Passing `?? {}` lets an omitted `theme` resolve to its defaults (valid),
  // while an invalid value still fails. `company` has a required `name`, so an
  // absent `company` correctly fails as missing required identity.
  const company = validateBlockConfig(companySchema, obj.company)
  const theme = validateBlockConfig(themeSchema, obj.theme ?? {})

  const configIssues = [...(company.issues ?? []), ...(theme.issues ?? [])]

  // sections: validate each item against the live registry union (W5).
  const element = buildSectionSchema()
  const sectionsIsArray = Array.isArray(obj.sections)
  const rawSections: unknown[] = sectionsIsArray ? (obj.sections as unknown[]) : []
  const parsedSections: unknown[] = []

  const sections: SectionValidation[] = rawSections.map((item, index) => {
    const type =
      item && typeof item === 'object' && typeof (item as Record<string, unknown>).type === 'string'
        ? ((item as Record<string, unknown>).type as string)
        : undefined
    const parsed = element.safeParse(item)
    if (parsed.success) {
      parsedSections.push(parsed.data)
      return { index, type, valid: true }
    }
    return { index, type, valid: false, issues: parsed.error.issues }
  })

  // `sections`, when present, MUST be an array; absent is an empty list (W6).
  const sectionsShapeValid = obj.sections === undefined || sectionsIsArray
  const allSectionsValid = sections.every((s) => s.valid)
  const valid = company.valid && theme.valid && sectionsShapeValid && allSectionsValid

  const result: WebsiteValidationResult = { valid, sections }
  if (configIssues.length > 0) result.issues = configIssues
  if (valid) {
    result.data = {
      company: company.data,
      theme: theme.data,
      sections: parsedSections,
    } as WebsiteConfig
  }
  return result
}
