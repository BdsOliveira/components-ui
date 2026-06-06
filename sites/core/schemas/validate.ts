/**
 * Pre-render validation with safe-fallback policy
 * (block-contract.md §C3, Decision 6; FR-005, FR-013, FR-014).
 *
 * A config slice MUST be validated against its schema BEFORE render using
 * `safeParse`, and MUST NEVER throw into the render tree. Behavior per outcome:
 *
 *   | Input condition      | Result                                          |
 *   |----------------------|-------------------------------------------------|
 *   | Valid                | parsed data, `valid: true`                      |
 *   | Missing / partial    | schema defaults applied, `valid: ...`           |
 *   | Invalid field        | caller fallback / schema defaults, `valid:false`|
 *   | Unknown / extra keys  | stripped by default (never merged)             |
 *   | Unknown `variant`    | rejected → resolves to default via fallback     |
 */
import { z } from 'zod'

export interface ValidationResult<T> {
  /** The config to render from — always schema-valid, never undefined-state. */
  data: T
  /** `true` only when the original input passed validation untouched. */
  valid: boolean
  /** Issues from the original input when a fallback was used (for logging). */
  issues?: z.ZodIssue[]
}

/**
 * Validate a config slice before render. Never throws.
 *
 * On failure the fallback order is:
 *   1. caller-supplied `fallback` (re-validated so the output always conforms),
 *   2. schema defaults (parsing `{}` — applies `.default()`s),
 *   3. the raw `fallback` as a last resort.
 */
export function validateBlockConfig<S extends z.ZodTypeAny>(
  schema: S,
  input: unknown,
  fallback?: z.infer<S>,
): ValidationResult<z.infer<S>> {
  const parsed = schema.safeParse(input)
  if (parsed.success) {
    return { data: parsed.data, valid: true }
  }

  const issues = parsed.error.issues

  if (fallback !== undefined) {
    const fb = schema.safeParse(fallback)
    if (fb.success) {
      return { data: fb.data, valid: false, issues }
    }
  }

  const defaults = schema.safeParse({})
  if (defaults.success) {
    return { data: defaults.data, valid: false, issues }
  }

  return { data: fallback as z.infer<S>, valid: false, issues }
}
