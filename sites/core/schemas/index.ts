// core/schemas — barrel re-export hub for Zod config conventions.
// Phase 2: per-block schema helpers, the pre-render validation helper, the
// variant factory, and JSON-Schema emission. Phase 3: the central website
// schema (company, theme, the section registry/union, the WebsiteConfig
// composition root, and whole-site validation) — the single import surface
// for the whole-site contract.
export { z, defineBlockSchema, type BlockConfig } from './base'
export { validateBlockConfig, type ValidationResult } from './validate'
export { blockJsonSchema } from './json-schema'
export { blockVariant } from './variant'

// Phase 3 — central website schema (website-schema-contract.md).
export { companySchema, type CompanyConfig } from './company'
export { themeSchema, type ThemeConfig } from './theme'
export {
  defineSection,
  registerSection,
  buildSectionSchema,
  clearSectionRegistry,
  registeredSectionTypes,
  type Section,
  type SectionMember,
} from './section'
export { websiteConfigSchema, type WebsiteConfig } from './website'
export {
  validateWebsiteConfig,
  type WebsiteValidationResult,
  type SectionValidation,
} from './validate-website'
