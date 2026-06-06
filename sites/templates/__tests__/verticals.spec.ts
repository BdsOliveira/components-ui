/**
 * Five-vertical integration (tasks.md T034; block-set-contract B1, FR-012, SC-002).
 *
 * The end-to-end acceptance of the kit: each sample `WebsiteConfig` passes
 * whole-site validation and renders through `SiteRenderer` with every configured
 * section appearing, in the configured order, as one coherent page — proving
 * config-only assembly from the eight neutral blocks.
 *
 * Importing `register` populates both registries (side effect) before validation.
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import '~~/sites/core/components/sections/register'
import { validateWebsiteConfig, type WebsiteConfig } from '~~/sites/core/schemas'
import SiteRenderer from '~~/sites/core/components/render/SiteRenderer.vue'
import { clinicSite } from '../clinic/page'
import { lawyerSite } from '../lawyer/config'
import { restaurantSite } from '../restaurant/config'
import { schoolSite } from '../school/config'
import { localBusinessSite } from '../local-business/config'

const verticals: Array<[string, WebsiteConfig]> = [
  ['clinic', clinicSite],
  ['lawyer', lawyerSite],
  ['restaurant', restaurantSite],
  ['school', schoolSite],
  ['local-business', localBusinessSite],
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
