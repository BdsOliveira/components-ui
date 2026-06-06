/**
 * Empty-list handling (tasks.md T046; block-set-contract B5, FR-013).
 *
 * services / testimonials / faq with `items: []` render NOTHING for the list
 * region — no reserved space, no empty placeholder.
 */
import { describe, it, expect } from 'vitest'
import { mountBlock } from './helpers'
import { servicesSchema, testimonialsSchema, faqSchema } from '~~/sites/core/schemas'
import ServicesSection from '../ServicesSection.vue'
import TestimonialsSection from '../TestimonialsSection.vue'
import FaqSection from '../FaqSection.vue'

const cases: Array<[string, unknown, any, string]> = [
  ['services', ServicesSection, servicesSchema, '.services__items'],
  ['testimonials', TestimonialsSection, testimonialsSchema, '.testimonials__items'],
  ['faq', FaqSection, faqSchema, '.faq__items'],
]

describe.each(cases)('block %s with empty items', (name, component, schema, listSelector) => {
  it('renders nothing for the list region', () => {
    const w = mountBlock(component as never, schema.parse({ type: name, items: [] }))
    expect(w.find(listSelector).exists()).toBe(false)
    // the block root still renders (it is a valid, present section):
    expect(w.find(`[data-block="${name}"]`).exists()).toBe(true)
  })

  it('renders the list region when items are present', () => {
    const items =
      name === 'services'
        ? [{ title: 'T' }]
        : name === 'testimonials'
          ? [{ quote: 'Q', author: 'A' }]
          : [{ question: 'Q', answer: 'A' }]
    const w = mountBlock(component as never, schema.parse({ type: name, items }))
    expect(w.find(listSelector).exists()).toBe(true)
  })
})
