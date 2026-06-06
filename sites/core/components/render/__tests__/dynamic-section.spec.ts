/** US2 (T009) — DynamicSection dispatch (renderer-contract §R3, FR-005/007). */
import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DynamicSection from '../DynamicSection.vue'
import { registerStub, resetRegistries } from './fixtures'

afterEach(() => resetRegistries())

describe('DynamicSection', () => {
  it('renders the component mapped to the section type', () => {
    registerStub('hero')
    const w = mount(DynamicSection, {
      props: { section: { type: 'hero', heading: 'Hi' } as never },
    })
    expect(w.find('[data-stub="hero"]').exists()).toBe(true)
    expect(w.text()).toContain('hero')
  })

  it('renders a newly registered type with no change to its own source (FR-007)', () => {
    registerStub('services')
    const w = mount(DynamicSection, {
      props: { section: { type: 'services', items: [] } as never },
    })
    expect(w.find('[data-stub="services"]').exists()).toBe(true)
  })
})
