/** US1 (T011/T012) — SiteRenderer order + keying (renderer-contract §R1/R2/R10, FR-002/006/016). */
import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SiteRenderer from '../SiteRenderer.vue'
import DynamicSection from '../DynamicSection.vue'
import { registerStub, resetRegistries } from './fixtures'

afterEach(() => resetRegistries())

function config(sections: Array<Record<string, unknown>>) {
  return { company: { name: 'Acme' }, theme: {}, sections } as never
}

describe('SiteRenderer', () => {
  it('renders one section per item, in list order, each by its mapped component (R1/R2)', () => {
    registerStub('hero')
    registerStub('services')
    const w = mount(SiteRenderer, {
      props: {
        config: config([
          { type: 'hero', heading: 'A' },
          { type: 'services', heading: 'B' },
          { type: 'hero', heading: 'C' },
        ]),
      },
    })
    const stubs = w.findAll('[data-stub]')
    expect(stubs.map((s) => s.attributes('data-stub'))).toEqual(['hero', 'services', 'hero'])
  })

  it('renders a repeated type independently with its own slice (R5/FR-007)', () => {
    registerStub('hero')
    const w = mount(SiteRenderer, {
      props: {
        config: config([
          { type: 'hero', heading: 'first' },
          { type: 'hero', heading: 'second' },
        ]),
      },
    })
    const props = w.findAll('[data-stub="hero"]').map((s) => JSON.parse(s.attributes('data-props')!))
    expect(props[0].heading).toBe('first')
    expect(props[1].heading).toBe('second')
  })

  it('keys each item by `${index}:${type}` by default, honoring an explicit id (R10/FR-016)', () => {
    registerStub('hero')
    registerStub('services')
    const w = mount(SiteRenderer, {
      props: {
        config: config([
          { type: 'hero' },
          { type: 'services', id: 'cta-1' },
        ]),
      },
    })
    const keys = w.findAllComponents(DynamicSection).map((c) => c.vm.$.vnode.key)
    expect(keys).toEqual(['0:hero', 'cta-1'])
  })
})
