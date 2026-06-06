/**
 * Client neutrality (tasks.md T039; block-set-contract B6, FR-005).
 *
 * Each block, rendered with ONLY required content (sentinel strings in every
 * required visible field), emits no hardcoded client/niche text: after removing
 * the config-supplied sentinels, no alphabetic content remains. Output derives
 * solely from config.
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

const S = 'Sentinelword'

/** [name, component, required-only slice, count of sentinel occurrences in the text] */
const blocks: Array<[string, unknown, Record<string, unknown>, number]> = [
  ['hero', HeroSection, heroSchema.parse({ type: 'hero', heading: S }), 1],
  ['about', AboutSection, aboutSchema.parse({ type: 'about', heading: S, body: S }), 2],
  ['services', ServicesSection, servicesSchema.parse({ type: 'services', items: [{ title: S }] }), 1],
  ['cta', CtaSection, ctaSchema.parse({ type: 'cta', heading: S, cta: { label: S, href: '#' } }), 2],
  ['testimonials', TestimonialsSection, testimonialsSchema.parse({ type: 'testimonials', items: [{ quote: S, author: S }] }), 2],
  ['faq', FaqSection, faqSchema.parse({ type: 'faq', items: [{ question: S, answer: S }] }), 2],
  ['contact', ContactSection, contactSchema.parse({ type: 'contact' }), 0],
  ['footer', FooterSection, footerSchema.parse({ type: 'footer' }), 0],
]

describe.each(blocks)('block %s is client-neutral', (name, component, data, _count) => {
  it('emits no hardcoded text beyond the config-supplied sentinels', () => {
    const w = mountBlock(component as never, data as never)
    // Strip every sentinel occurrence, then any non-letter; nothing should remain.
    const residue = w.text().split(S).join('').replace(/[^A-Za-z]/g, '')
    expect(residue).toBe('')
  })
})
