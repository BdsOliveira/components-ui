/**
 * register.ts — the ONE place the eight Phase 5 blocks are made fully supported
 * (block-set-contract.md B7; FR-003, FR-014).
 *
 * Each block is registered with a single pair of calls performing both halves of
 * "fully supported": validatable (schema registry, Phase 3 `registerSection`) and
 * renderable (component registry, Phase 4 `registerSectionComponent`). Importing
 * this module runs the registrations as a side effect; a Nuxt plugin
 * (`app/plugins/register-sections.ts`) imports it so both registries are
 * populated at app boot. Adding a ninth block later is "add files + one pair here".
 */
import { registerSection, defineSection } from '~~/sites/core/schemas'
import { registerSectionComponent } from './registry'

import { heroSchema } from '~~/sites/core/schemas/hero'
import { aboutSchema } from '~~/sites/core/schemas/about'
import { servicesSchema } from '~~/sites/core/schemas/services'
import { ctaSchema } from '~~/sites/core/schemas/cta'
import { testimonialsSchema } from '~~/sites/core/schemas/testimonials'
import { faqSchema } from '~~/sites/core/schemas/faq'
import { contactSchema } from '~~/sites/core/schemas/contact'
import { footerSchema } from '~~/sites/core/schemas/footer'

import HeroSection from './HeroSection.vue'
import AboutSection from './AboutSection.vue'
import ServicesSection from './ServicesSection.vue'
import CtaSection from './CtaSection.vue'
import TestimonialsSection from './TestimonialsSection.vue'
import FaqSection from './FaqSection.vue'
import ContactSection from './ContactSection.vue'
import FooterSection from './FooterSection.vue'

registerSection(defineSection('hero', heroSchema))
registerSectionComponent('hero', HeroSection)

registerSection(defineSection('about', aboutSchema))
registerSectionComponent('about', AboutSection)

registerSection(defineSection('services', servicesSchema))
registerSectionComponent('services', ServicesSection)

registerSection(defineSection('cta', ctaSchema))
registerSectionComponent('cta', CtaSection)

registerSection(defineSection('testimonials', testimonialsSchema))
registerSectionComponent('testimonials', TestimonialsSection)

registerSection(defineSection('faq', faqSchema))
registerSectionComponent('faq', FaqSection)

registerSection(defineSection('contact', contactSchema))
registerSectionComponent('contact', ContactSection)

registerSection(defineSection('footer', footerSchema))
registerSectionComponent('footer', FooterSection)

export {}
