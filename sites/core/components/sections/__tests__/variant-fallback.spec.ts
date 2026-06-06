/**
 * Variant safe-fallback (tasks.md T043; block-set-contract B4, FR-006/007).
 *
 * An unknown `variant` value is REJECTED by each block schema (closed enum), so
 * whole-site validation rejects the config — never a silent undefined state. An
 * OMITTED variant resolves to the block's single default via `.default(...)`.
 */
import { describe, it, expect } from 'vitest'
import {
  heroSchema,
  aboutSchema,
  servicesSchema,
  ctaSchema,
  testimonialsSchema,
  faqSchema,
  contactSchema,
  footerSchema,
} from '~~/sites/core/schemas'

/** [name, schema, required base, default variant] */
const blocks: Array<[string, any, Record<string, unknown>, string]> = [
  ['hero', heroSchema, { heading: 'H' }, 'centered'],
  ['about', aboutSchema, { heading: 'H', body: 'B' }, 'text'],
  ['services', servicesSchema, { items: [{ title: 'T' }] }, 'grid'],
  ['cta', ctaSchema, { heading: 'H', cta: { label: 'L', href: '#' } }, 'banner'],
  ['testimonials', testimonialsSchema, { items: [{ quote: 'Q', author: 'A' }] }, 'grid'],
  ['faq', faqSchema, { items: [{ question: 'Q', answer: 'A' }] }, 'accordion'],
  ['contact', contactSchema, {}, 'split'],
  ['footer', footerSchema, {}, 'columns'],
]

describe.each(blocks)('block %s variant fallback', (name, schema, base, def) => {
  it('rejects an unknown variant value', () => {
    const parsed = schema.safeParse({ type: name, variant: 'no-such-variant', ...base })
    expect(parsed.success).toBe(false)
  })

  it(`applies the default "${def}" when variant is omitted`, () => {
    const parsed = schema.parse({ type: name, ...base })
    expect(parsed.variant).toBe(def)
  })
})
