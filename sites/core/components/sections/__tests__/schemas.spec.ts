/**
 * Per-block schema behavior (tasks.md T044; block-set-contract B3/B5, FR-008/010/013).
 *
 * For each block: defaults are applied (variant + defaulted fields),
 * required-missing input is rejected by `safeParse`, and unknown keys are
 * stripped (never merged).
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

describe('variant + field defaults', () => {
  it('applies the variant default per block', () => {
    expect(heroSchema.parse({ type: 'hero', heading: 'H' }).variant).toBe('centered')
    expect(aboutSchema.parse({ type: 'about', heading: 'H', body: 'B' }).variant).toBe('text')
    expect(servicesSchema.parse({ type: 'services', items: [] }).variant).toBe('grid')
    expect(ctaSchema.parse({ type: 'cta', heading: 'H', cta: { label: 'L', href: '#' } }).variant).toBe('banner')
    expect(testimonialsSchema.parse({ type: 'testimonials', items: [] }).variant).toBe('grid')
    expect(faqSchema.parse({ type: 'faq', items: [] }).variant).toBe('accordion')
    expect(contactSchema.parse({ type: 'contact' }).variant).toBe('split')
    expect(footerSchema.parse({ type: 'footer' }).variant).toBe('columns')
  })

  it('applies non-variant field defaults (contact.showForm, footer.showSocial)', () => {
    expect(contactSchema.parse({ type: 'contact' }).showForm).toBe(false)
    expect(footerSchema.parse({ type: 'footer' }).showSocial).toBe(true)
  })
})

describe('required-missing is rejected', () => {
  it.each([
    ['hero (no heading)', heroSchema, { type: 'hero' }],
    ['about (no body)', aboutSchema, { type: 'about', heading: 'H' }],
    ['services (no items)', servicesSchema, { type: 'services' }],
    ['cta (no cta)', ctaSchema, { type: 'cta', heading: 'H' }],
    ['testimonials (no items)', testimonialsSchema, { type: 'testimonials' }],
    ['faq (no items)', faqSchema, { type: 'faq' }],
    ['testimonial item (no author)', testimonialsSchema, { type: 'testimonials', items: [{ quote: 'Q' }] }],
    ['faq item (no answer)', faqSchema, { type: 'faq', items: [{ question: 'Q' }] }],
  ])('%s', (_label, schema, input) => {
    expect((schema as { safeParse: (v: unknown) => { success: boolean } }).safeParse(input).success).toBe(false)
  })
})

describe('unknown keys are stripped', () => {
  it('drops keys not in the schema', () => {
    const parsed = heroSchema.parse({ type: 'hero', heading: 'H', bogus: 'x', extra: 1 } as never)
    expect(parsed).not.toHaveProperty('bogus')
    expect(parsed).not.toHaveProperty('extra')
  })
})
