/**
 * Clínica Saúde client acceptance instruments (Phase 7; contract C6).
 *
 * Proves the four validation goals by data only, reusing the clinic template:
 *   - US1 (C6.1/C6.5/C6.6) — config parses, builds a `validateWebsiteConfig`-valid
 *     site, section order equals the clinic ORDER, and `domain.txt` is valid.
 *   - US2 (C6.2) — the client theme appears in the built site and the swap touches
 *     ONLY theme (order + content equal the no-theme-override build).
 *   - US3 (C6.3) — the client content appears and the swap touches ONLY content
 *     (theme + order equal the no-content-override build).
 *   - US4 (C6.4) — the client hero image URL appears, alt is non-empty, and the
 *     referenced file exists under `images/` (no broken reference).
 *
 * Importing `register` populates the section registries (side effect) before
 * `validateWebsiteConfig` rebuilds the live section union.
 */
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import '~~/sites/core/components/sections/register'
import { validateWebsiteConfig } from '~~/sites/core/schemas'
import { createClinicSite, type ClinicOverrides } from '~~/sites/templates/clinic/page'
import { clinicTheme } from '~~/sites/templates/clinic/theme'
import config from '../config.json'

/** The fixed clinic order — the single source of section ordering (page.ts). */
const ORDER = ['hero', 'services', 'testimonials', 'faq', 'contact', 'footer'] as const

/** Basic hostname validator: dot-separated labels + a TLD (contract C4.2 / C6.6). */
const HOSTNAME = /^(?=.{1,253}$)([a-z0-9](-?[a-z0-9])*\.)+[a-z]{2,}$/i

/** Client dir, resolved from the repo root (vitest cwd) — happy-dom has no file:// URLs. */
const CLIENT_DIR = resolve(process.cwd(), 'sites/clients/clinica-saude')

const overrides = {
  company: config.company,
  theme: config.theme,
  content: config.content,
} as ClinicOverrides

const typesOf = (site: { sections: Array<{ type: string }> }) => site.sections.map((s) => s.type)
const heroOf = (site: { sections: Array<{ type: string }> }) =>
  site.sections.find((s) => s.type === 'hero') as Record<string, unknown>

describe('clinica-saude — US1: a valid, ordered clinic site exists by config (C6.1/C6.5)', () => {
  it('config.json parses to an object with template "clinic"', () => {
    expect(typeof config).toBe('object')
    expect(config.template).toBe('clinic')
  })

  it('createClinicSite(config) passes whole-site validation with data defined', () => {
    const result = validateWebsiteConfig(createClinicSite(overrides))
    expect(result.valid).toBe(true)
    expect(result.data).toBeDefined()
  })

  it('built section order equals the clinic ORDER (client cannot reorder, FR-008)', () => {
    expect(typesOf(createClinicSite(overrides))).toEqual([...ORDER])
  })

  it('the company name resolves to the client identity', () => {
    expect(createClinicSite(overrides).company.name).toBe('Clínica Saúde')
  })
})

describe('clinica-saude — domain.txt is present and valid (C6.6 / FR-009/FR-012)', () => {
  const domainPath = resolve(CLIENT_DIR, 'domain.txt')

  it('exists', () => {
    expect(existsSync(domainPath)).toBe(true)
  })

  it('is a single trimmed, valid hostname', () => {
    const domain = readFileSync(domainPath, 'utf8').trim()
    expect(domain.length).toBeGreaterThan(0)
    expect(domain).toMatch(HOSTNAME)
  })
})

describe('clinica-saude — US2: theme swap is proven and isolated (C6.2)', () => {
  const built = createClinicSite(overrides)
  const noTheme = createClinicSite({ company: overrides.company, content: overrides.content })

  it('the client primary differs from the clinic default and appears in the build', () => {
    expect(clinicTheme.colors?.primary).toBe('#0ea5e9')
    expect(built.theme.colors?.primary).toBe('#15803d')
  })

  it('the swap touches ONLY theme — order and content equal the no-theme build', () => {
    expect(typesOf(built)).toEqual(typesOf(noTheme))
    expect(built.sections).toEqual(noTheme.sections)
    expect(built.company).toEqual(noTheme.company)
  })
})

describe('clinica-saude — US3: content swap is proven and isolated (C6.3)', () => {
  const built = createClinicSite(overrides)
  const noContent = createClinicSite({ company: overrides.company, theme: overrides.theme })

  it('the client copy appears in the built sections (differs from defaults.json)', () => {
    const hero = heroOf(built)
    expect(hero.heading).toBe('Sua saúde em boas mãos')
    const services = built.sections.find((s: { type: string }) => s.type === 'services') as Record<string, unknown>
    expect(services.heading).toBe('Especialidades')
  })

  it('the swap touches ONLY content — theme and order equal the no-content build', () => {
    expect(built.theme).toEqual(noContent.theme)
    expect(typesOf(built)).toEqual(typesOf(noContent))
  })
})

describe('clinica-saude — US4: image swap is proven, no broken reference (C6.4)', () => {
  const built = createClinicSite(overrides)
  const hero = heroOf(built)
  const media = hero.media as { src: string; alt: string }

  it('the built hero references the served client image URL with non-empty alt', () => {
    expect(hero.variant).toBe('split')
    expect(media.src).toBe('/clients/clinica-saude/images/hero.jpg')
    expect(media.alt.length).toBeGreaterThan(0)
  })

  it('the referenced file exists under images/', () => {
    const file = media.src.replace('/clients/clinica-saude/images/', '')
    const imagePath = resolve(CLIENT_DIR, 'images', file)
    expect(existsSync(imagePath)).toBe(true)
  })
})
