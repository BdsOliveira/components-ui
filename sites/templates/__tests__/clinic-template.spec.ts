/**
 * Clinic template acceptance instrument (contract T5/T6/T7; quickstart "Test").
 *
 * Proves the three-concern split holds end-to-end:
 *   - US1 — the no-override `clinicSite` is a valid, ordered, core-only site.
 *   - US2 — a content override changes only content; structure + theme unchanged.
 *   - US3 — a theme override changes only theme; structure + content unchanged.
 *   - T7  — the same `page.ts` structure reuses across ≥3 distinct clinics.
 *
 * Importing `register` populates the section registries (side effect) before
 * `validateWebsiteConfig` rebuilds the live section union.
 */
import { describe, it, expect } from 'vitest'
import '~~/sites/core/components/sections/register'
import { validateWebsiteConfig } from '~~/sites/core/schemas'
import { clinicSite, createClinicSite } from '../clinic/page'

/** The fixed clinic order — the single source of section ordering (page.ts). */
const ORDER = ['hero', 'services', 'testimonials', 'faq', 'contact', 'footer'] as const

/** The eight registered core block types (block-set B7). */
const CORE_BLOCKS = ['hero', 'about', 'services', 'cta', 'testimonials', 'faq', 'contact', 'footer']

const typesOf = (site: { sections: Array<{ type: string }> }) => site.sections.map((s) => s.type)

describe('clinic template — US1: valid, ordered, core-only site (no override)', () => {
  it('passes whole-site validation with data defined', () => {
    const result = validateWebsiteConfig(clinicSite)
    expect(result.valid).toBe(true)
    expect(result.data).toBeDefined()
  })

  it('renders the six sections in exactly ORDER', () => {
    expect(typesOf(clinicSite)).toEqual([...ORDER])
  })

  it('uses only the eight core block types', () => {
    for (const type of typesOf(clinicSite)) {
      expect(CORE_BLOCKS).toContain(type)
    }
  })

  it('clinicSite === createClinicSite() (defaults, no overrides)', () => {
    expect(clinicSite).toEqual(createClinicSite())
  })
})

describe('clinic template — US2: content override touches only content (FR-008)', () => {
  const overridden = createClinicSite({
    content: { hero: { heading: 'A brand new heading' } },
    company: { name: 'Renamed Clinic' },
  })

  it('applies the overridden content', () => {
    const hero = overridden.sections.find((s) => s.type === 'hero') as Record<string, unknown>
    expect(hero.heading).toBe('A brand new heading')
    expect(overridden.company.name).toBe('Renamed Clinic')
  })

  it('keeps every non-overridden default', () => {
    const hero = overridden.sections.find((s) => s.type === 'hero') as Record<string, unknown>
    // subheading + cta were not overridden -> still the shipped defaults.
    expect(hero.subheading).toBe('Gentle, modern dentistry in the heart of Springfield.')
    expect(overridden.company.tagline).toBe('Modern dental care for the whole family')
  })

  it('leaves section order and theme byte-identical to defaults', () => {
    expect(typesOf(overridden)).toEqual(typesOf(clinicSite))
    expect(overridden.theme).toEqual(clinicSite.theme)
  })

  it('still passes whole-site validation', () => {
    expect(validateWebsiteConfig(overridden).valid).toBe(true)
  })
})

describe('clinic template — US3: theme override touches only theme (FR-009)', () => {
  const themed = createClinicSite({ theme: { colors: { primary: '#10b981' } } })

  it('applies the new theme token', () => {
    expect(themed.theme.colors?.primary).toBe('#10b981')
  })

  it('ships clinicTheme by default (not a bare schema default)', () => {
    expect(clinicSite.theme.mode).toBe('light')
    expect(clinicSite.theme.colors?.primary).toBe('#0ea5e9')
  })

  it('leaves section order and content identical to defaults', () => {
    expect(typesOf(themed)).toEqual(typesOf(clinicSite))
    expect(themed.sections).toEqual(clinicSite.sections)
    expect(themed.company).toEqual(clinicSite.company)
  })

  it('still passes whole-site validation', () => {
    expect(validateWebsiteConfig(themed).valid).toBe(true)
  })
})

describe('clinic template — T7: reuse across ≥3 distinct clinics (SC-004)', () => {
  const clinics: Array<[string, ReturnType<typeof createClinicSite>]> = [
    [
      'Village Dental',
      createClinicSite({
        company: { name: 'Village Dental', contact: { phone: '+1 555 0199' } },
        theme: { colors: { primary: '#10b981' } },
        content: { hero: { heading: 'Your neighborhood dentist' } },
      }),
    ],
    [
      'Harbor Family Clinic',
      createClinicSite({
        company: { name: 'Harbor Family Clinic' },
        theme: { colors: { primary: '#6366f1' } },
        content: { services: { heading: 'How we care for you' } },
      }),
    ],
    [
      'Summit Orthodontics',
      createClinicSite({
        company: { name: 'Summit Orthodontics' },
        content: { faq: { heading: 'Common questions' } },
      }),
    ],
  ]

  it.each(clinics)('%s is valid and preserves ORDER', (_name, site) => {
    expect(validateWebsiteConfig(site).valid).toBe(true)
    expect(typesOf(site)).toEqual([...ORDER])
  })
})
