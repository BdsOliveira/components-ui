// core/schemas — barrel re-export hub for Zod block-config conventions.
// Base schema helpers, the pre-render validation helper, the variant factory,
// and JSON-Schema emission are re-exported from here.
export { z, defineBlockSchema, type BlockConfig } from './base'
export { validateBlockConfig, type ValidationResult } from './validate'
export { blockJsonSchema } from './json-schema'
export { blockVariant } from './variant'
