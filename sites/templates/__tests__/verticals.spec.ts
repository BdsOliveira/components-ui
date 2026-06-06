/**
 * Five-vertical integration (block-set-contract B1, FR-012, SC-002) + build-target
 * regression (Phase 8; build-target-contract C-BT-5).
 *
 * The end-to-end acceptance of the kit: each sample `WebsiteConfig` — now built via
 * its normalized template FACTORY (research D5) — passes whole-site validation and
 * renders through `SiteRenderer` with every configured section appearing, in the
 * configured order, as one coherent page.
 *
 * The build-target block proves the existing `clinica-saude` client still validates
 * through the registry dispatch with `CLIENT` unset (default) and set (FR-008,
 * SC-004) — the one-time dynamic wiring breaks no existing client.
 *
 * Importing `register` populates both registries (side effect) before validation.
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import '~~/sites/core/components/sections/register'
import { validateWebsiteConfig, type WebsiteConfig } from '~~/sites/core/schemas'
import SiteRenderer from '~~/sites/core/components/render/SiteRenderer.vue'
import { templateRegistry, type TemplateOverrides } from '../registry'
import { createClinicSite } from '../clinic/page'
import { createLawyerSite } from '../lawyer/page'
import { createRestaurantSite } from '../restaurant/page'
import { createSchoolSite } from '../school/page'
import { createLocalBusinessSite } from '../local-business/page'
import clinicaSaude from '~~/sites/clients/clinica-saude/config.json'

// Built via each template's factory — the normalized, dispatchable shape.
const verticals: Array<[string, WebsiteConfig]> = [
  ['clinic', createClinicSite()],
  ['lawyer', createLawyerSite()],
  ['restaurant', createRestaurantSite()],
  ['school', createSchoolSite()],
  ['local-business', createLocalBusinessSite()],
]

describe.each(verticals)('vertical: %s', (name, site) => {
  it('passes whole-site validation', () => {
    const result = validateWebsiteConfig(site)
    expect(result.valid).toBe(true)
    expect(result.data).toBeDefined()
  })

  it('renders every section in the configured order', () => {
    const result = validateWebsiteConfig(site)
    const w = mount(SiteRenderer, { props: { config: result.data! } })
    const rendered = w.findAll('[data-block]').map((el) => el.attributes('data-block'))
    const expected = site.sections.map((s) => (s as { type: string }).type)
    expect(rendered).toEqual(expected)
  })
})

describe('every registered template is dispatchable and seedable', () => {
  it('exposes all five known templates with a factory and defaults', () => {
    expect(Object.keys(templateRegistry).sort()).toEqual(
      ['clinic', 'lawyer', 'local-business', 'restaurant', 'school'],
    )
    for (const entry of Object.values(templateRegistry)) {
      expect(typeof entry.factory).toBe('function')
      expect(entry.defaults.company.name).toBeDefined()
      expect(Object.keys(entry.defaults.sections).length).toBeGreaterThan(0)
    }
  })
})

describe('build-target: clinica-saude validates with CLIENT default and set (FR-008, SC-004)', () => {
  // Replicates the render-page dispatch (index.vue) WITHOUT Nuxt: select the client,
  // dispatch on its template through the registry, build, validate.
  const dispatch = (client: string) => {
    const config = client === 'clinica-saude' ? (clinicaSaude as { template: string } & TemplateOverrides) : undefined
    if (!config) return undefined
    const entry = templateRegistry[config.template as keyof typeof templateRegistry]
    if (!entry) return undefined
    return validateWebsiteConfig(
      entry.factory({ company: config.company, theme: config.theme, content: config.content }),
    )
  }

  // CLIENT unset ⇒ default 'clinica-saude' (nuxt.config: process.env.CLIENT || 'clinica-saude').
  const defaultClient = process.env.CLIENT || 'clinica-saude'

  it('the default client (CLIENT unset) selects and validates', () => {
    expect(defaultClient).toBe('clinica-saude')
    const result = dispatch(defaultClient)
    expect(result?.valid).toBe(true)
  })

  it('the explicitly-set client (CLIENT=clinica-saude) selects and validates', () => {
    const result = dispatch('clinica-saude')
    expect(result?.valid).toBe(true)
    expect(result?.data).toBeDefined()
  })
})
