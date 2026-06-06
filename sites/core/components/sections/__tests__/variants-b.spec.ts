/**
 * Variant switching — testimonials, faq, contact, footer (tasks.md T042;
 * block-set-contract B4, FR-006/007). Each declared variant renders distinctly;
 * an omitted variant resolves to the single default.
 */
import { describe, it, expect } from 'vitest'
import { mountBlock } from './helpers'
import { testimonialsSchema, faqSchema, contactSchema, footerSchema } from '~~/sites/core/schemas'
import TestimonialsSection from '../TestimonialsSection.vue'
import FaqSection from '../FaqSection.vue'
import ContactSection from '../ContactSection.vue'
import FooterSection from '../FooterSection.vue'

const blocks: Array<[string, unknown, any, Record<string, unknown>, string[], string]> = [
  ['testimonials', TestimonialsSection, testimonialsSchema, { items: [{ quote: 'Q', author: 'A' }] }, ['grid', 'carousel'], 'grid'],
  ['faq', FaqSection, faqSchema, { items: [{ question: 'Q', answer: 'A' }] }, ['accordion', 'list'], 'accordion'],
  ['contact', ContactSection, contactSchema, {}, ['split', 'stacked'], 'split'],
  ['footer', FooterSection, footerSchema, {}, ['columns', 'minimal'], 'columns'],
]

describe.each(blocks)('block %s variants', (name, component, schema, base, variants, def) => {
  it.each(variants)('renders the "%s" variant distinctly', (variant) => {
    const data = schema.parse({ type: name, variant, ...base })
    const w = mountBlock(component as never, data)
    const root = w.find(`[data-block="${name}"]`)
    expect(root.attributes('data-variant')).toBe(variant)
    expect(root.classes()).toContain(`${name}--${variant}`)
  })

  it(`omitted variant resolves to the default "${def}"`, () => {
    const data = schema.parse({ type: name, ...base })
    const w = mountBlock(component as never, data)
    expect(w.find(`[data-block="${name}"]`).attributes('data-variant')).toBe(def)
  })
})
