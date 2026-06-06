/** US4 (T014) — each section receives only its own slice (renderer-contract §R5, FR-008/009). */
import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SiteRenderer from '../SiteRenderer.vue'
import { registerStub, resetRegistries } from './fixtures'

afterEach(() => resetRegistries())

describe('slice isolation', () => {
  it('each section component receives only its own item, no sibling fields', () => {
    registerStub('hero')
    registerStub('services')
    const w = mount(SiteRenderer, {
      props: {
        config: {
          company: { name: 'Acme' },
          theme: {},
          sections: [
            { type: 'hero', heading: 'HERO_ONLY' },
            { type: 'services', label: 'SERVICES_ONLY' },
          ],
        } as never,
      },
    })
    const hero = JSON.parse(w.find('[data-stub="hero"]').attributes('data-props')!)
    const services = JSON.parse(w.find('[data-stub="services"]').attributes('data-props')!)

    expect(hero).toEqual({ type: 'hero', heading: 'HERO_ONLY' })
    expect(hero).not.toHaveProperty('label')
    expect(services).toEqual({ type: 'services', label: 'SERVICES_ONLY' })
    expect(services).not.toHaveProperty('heading')
    // index is a DynamicSection prop, NOT leaked into the section's slice:
    expect(hero).not.toHaveProperty('index')
  })
})
