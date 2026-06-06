/**
 * Graceful degradation (tasks.md T045; block-set-contract B5, FR-008/013).
 *
 * Each block rendered with required-only content omits its optional regions
 * entirely (no empty placeholders); the same block with full content renders
 * those regions. Verified per block on a representative optional region.
 */
import { describe, it, expect } from 'vitest'
import { mountBlock } from './helpers'
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
import HeroSection from '../HeroSection.vue'
import AboutSection from '../AboutSection.vue'
import ServicesSection from '../ServicesSection.vue'
import CtaSection from '../CtaSection.vue'
import TestimonialsSection from '../TestimonialsSection.vue'
import FaqSection from '../FaqSection.vue'
import ContactSection from '../ContactSection.vue'
import FooterSection from '../FooterSection.vue'

/** [name, component, schema, minimal slice, full slice, optional selector] */
const cases: Array<[string, unknown, any, Record<string, unknown>, Record<string, unknown>, string]> = [
  ['hero subheading', HeroSection, heroSchema, { heading: 'H' }, { heading: 'H', subheading: 'S' }, '.hero__subheading'],
  ['hero cta', HeroSection, heroSchema, { heading: 'H' }, { heading: 'H', cta: { label: 'L', href: '#' } }, '.hero__cta'],
  ['about highlights', AboutSection, aboutSchema, { heading: 'H', body: 'B' }, { heading: 'H', body: 'B', highlights: [{ label: 'X' }] }, '.about__highlights'],
  ['services heading', ServicesSection, servicesSchema, { items: [{ title: 'T' }] }, { heading: 'Svc', items: [{ title: 'T' }] }, '.services__heading'],
  ['cta body', CtaSection, ctaSchema, { heading: 'H', cta: { label: 'L', href: '#' } }, { heading: 'H', body: 'B', cta: { label: 'L', href: '#' } }, '.cta__body'],
  ['cta secondary', CtaSection, ctaSchema, { heading: 'H', cta: { label: 'L', href: '#' } }, { heading: 'H', cta: { label: 'L', href: '#' }, secondaryCta: { label: 'S', href: '#' } }, '.cta__secondary'],
  ['testimonials heading', TestimonialsSection, testimonialsSchema, { items: [{ quote: 'Q', author: 'A' }] }, { heading: 'T', items: [{ quote: 'Q', author: 'A' }] }, '.testimonials__heading'],
  ['faq heading', FaqSection, faqSchema, { items: [{ question: 'Q', answer: 'A' }] }, { heading: 'F', items: [{ question: 'Q', answer: 'A' }] }, '.faq__heading'],
  ['contact hours', ContactSection, contactSchema, {}, { hours: [{ label: 'Mon', value: '9-5' }] }, '.contact__hours'],
  ['contact form', ContactSection, contactSchema, {}, { showForm: true }, '.contact__form'],
  ['footer links', FooterSection, footerSchema, {}, { linkGroups: [{ links: [{ label: 'L', href: '#' }] }] }, '.footer__groups'],
]

describe.each(cases)('%s degrades gracefully', (label, component, schema, minimal, full, selector) => {
  it('omits the optional region when absent, renders it when present', () => {
    const type = label.split(' ')[0]
    const min = mountBlock(component as never, schema.parse({ type, ...minimal }))
    expect(min.find(selector).exists()).toBe(false)

    const max = mountBlock(component as never, schema.parse({ type, ...full }))
    expect(max.find(selector).exists()).toBe(true)
  })
})
