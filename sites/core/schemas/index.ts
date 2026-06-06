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

// Phase 5 — the eight concrete block schemas (source of truth for each block's
// `data` type). Registered into the section union via `register.ts`.
export { heroSchema, type HeroConfig } from './hero'
export { aboutSchema, type AboutConfig } from './about'
export { servicesSchema, type ServicesConfig } from './services'
export { ctaSchema, type CtaConfig } from './cta'
export { testimonialsSchema, type TestimonialsConfig } from './testimonials'
export { faqSchema, type FaqConfig } from './faq'
export { contactSchema, type ContactConfig } from './contact'
export { footerSchema, type FooterConfig } from './footer'
