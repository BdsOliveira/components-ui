/**
 * Reusability / slice isolation (tasks.md T038; block-set-contract B6, FR-005).
 *
 * Each of the eight blocks, rendered with two distinct content sets, produces its
 * own output with no cross-leak — proving a block is content-driven and holds no
 * state between renders.
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

/** [name, component, build a valid slice carrying a visible sentinel string] */
const blocks: Array<[string, unknown, (s: string) => Record<string, unknown>]> = [
  ['hero', HeroSection, (s) => heroSchema.parse({ type: 'hero', heading: s })],
  ['about', AboutSection, (s) => aboutSchema.parse({ type: 'about', heading: s, body: s })],
  ['services', ServicesSection, (s) => servicesSchema.parse({ type: 'services', items: [{ title: s }] })],
  ['cta', CtaSection, (s) => ctaSchema.parse({ type: 'cta', heading: s, cta: { label: s, href: '#' } })],
  ['testimonials', TestimonialsSection, (s) => testimonialsSchema.parse({ type: 'testimonials', items: [{ quote: s, author: s }] })],
  ['faq', FaqSection, (s) => faqSchema.parse({ type: 'faq', items: [{ question: s, answer: s }] })],
  ['contact', ContactSection, (s) => contactSchema.parse({ type: 'contact', heading: s })],
  ['footer', FooterSection, (s) => footerSchema.parse({ type: 'footer', tagline: s })],
]

describe.each(blocks)('block %s is reusable', (name, component, make) => {
  it('renders its own content for two distinct content sets, no cross-leak', () => {
    const a = mountBlock(component as never, make('ALPHA_ONE') as never)
    const b = mountBlock(component as never, make('BETA_TWO') as never)

    expect(a.text()).toContain('ALPHA_ONE')
    expect(a.text()).not.toContain('BETA_TWO')
    expect(b.text()).toContain('BETA_TWO')
    expect(b.text()).not.toContain('ALPHA_ONE')
  })
})
