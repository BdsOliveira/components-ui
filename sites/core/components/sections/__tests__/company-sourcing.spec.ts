/**
 * Site-level identity sourcing (tasks.md T040/T047; block-set-contract B6,
 * FR-011). Contact and Footer source cross-cutting identity from the injected
 * site `company`; a per-block value overrides the company value; partial
 * channels resolve independently.
 */
import { describe, it, expect } from 'vitest'
import { mountBlock } from './helpers'
import { companySchema, contactSchema, footerSchema } from '~~/sites/core/schemas'
import ContactSection from '../ContactSection.vue'
import FooterSection from '../FooterSection.vue'

const company = companySchema.parse({
  name: 'Acme Co',
  tagline: 'Company tagline',
  contact: { email: 'co@acme.example', phone: '+1 555 9000', address: '1 Acme Plaza' },
  social: { instagram: 'https://instagram.com/acme', linkedin: 'https://linkedin.com/acme' },
  legal: { legalName: 'Acme Co LLC' },
})

describe('Contact sources contact info from company', () => {
  it('renders company.contact channels when the block declares none', () => {
    const w = mountBlock(ContactSection, contactSchema.parse({ type: 'contact' }), { company })
    expect(w.text()).toContain('co@acme.example')
    expect(w.text()).toContain('+1 555 9000')
    expect(w.text()).toContain('1 Acme Plaza')
  })

  it('per-block channels override the company value', () => {
    const data = contactSchema.parse({ type: 'contact', channels: { email: 'override@x.example' } })
    const w = mountBlock(ContactSection, data, { company })
    expect(w.text()).toContain('override@x.example')
    expect(w.text()).not.toContain('co@acme.example')
    // unspecified channels still fall back to company:
    expect(w.text()).toContain('+1 555 9000')
  })

  it('partial channels render only the resolved channels (T047)', () => {
    const bare = companySchema.parse({ name: 'Bare Co', contact: { phone: '+1 555 0000' } })
    const w = mountBlock(ContactSection, contactSchema.parse({ type: 'contact' }), { company: bare })
    expect(w.text()).toContain('+1 555 0000')
    expect(w.find('.contact__channel--email').exists()).toBe(false)
    expect(w.find('.contact__channel--address').exists()).toBe(false)
    expect(w.find('.contact__channel--phone').exists()).toBe(true)
  })
})

describe('Footer sources identity/social from company', () => {
  it('renders company social links when showSocial (default true)', () => {
    const w = mountBlock(FooterSection, footerSchema.parse({ type: 'footer' }), { company })
    expect(w.find('[data-social="instagram"]').exists()).toBe(true)
    expect(w.find('[data-social="linkedin"]').exists()).toBe(true)
  })

  it('hides social when showSocial is false', () => {
    const w = mountBlock(FooterSection, footerSchema.parse({ type: 'footer', showSocial: false }), { company })
    expect(w.find('.footer__social').exists()).toBe(false)
  })

  it('falls back tagline → company.tagline, legal → company.legal.legalName', () => {
    const w = mountBlock(FooterSection, footerSchema.parse({ type: 'footer' }), { company })
    expect(w.text()).toContain('Company tagline')
    expect(w.text()).toContain('Acme Co LLC')
  })

  it('per-block tagline/legal override the company value', () => {
    const data = footerSchema.parse({ type: 'footer', tagline: 'Own tagline', legal: 'Own legal' })
    const w = mountBlock(FooterSection, data, { company })
    expect(w.text()).toContain('Own tagline')
    expect(w.text()).toContain('Own legal')
    expect(w.text()).not.toContain('Company tagline')
  })
})
