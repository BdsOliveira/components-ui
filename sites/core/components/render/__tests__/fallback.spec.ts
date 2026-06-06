/** US5 (T016/T017) — safe degradation (renderer-contract §R6, FR-010/011, SC-006). */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SiteRenderer from '../SiteRenderer.vue'
import { registerStub, makeThrowingStub, resetRegistries } from './fixtures'

afterEach(() => {
  resetRegistries()
  vi.restoreAllMocks()
})

function config(sections: Array<Record<string, unknown>>) {
  return { company: { name: 'Acme' }, theme: {}, sections } as never
}

describe('safe degradation', () => {
  it('missing component: renders nothing + dev warning, siblings still render (FR-010/011)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    registerStub('hero')
    registerStub('ghost', null) // schema-registered, NO component
    registerStub('services')

    const w = mount(SiteRenderer, {
      props: { config: config([{ type: 'hero' }, { type: 'ghost' }, { type: 'services' }]) },
    })

    expect(w.find('[data-stub="ghost"]').exists()).toBe(false)
    expect(w.find('[data-stub="hero"]').exists()).toBe(true)
    expect(w.find('[data-stub="services"]').exists()).toBe(true)
    expect(warn).toHaveBeenCalled()
    const msg = warn.mock.calls.map((c) => String(c[0])).join('\n')
    expect(msg).toContain('ghost')
    expect(msg).toContain('index 1')
  })

  it('section throws at render: contained, siblings still render (FR-011/SC-006)', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    registerStub('hero')
    registerStub('boom', makeThrowingStub('boom'))
    registerStub('services')

    const w = mount(SiteRenderer, {
      props: { config: config([{ type: 'hero' }, { type: 'boom' }, { type: 'services' }]) },
    })

    expect(w.find('[data-stub="hero"]').exists()).toBe(true)
    expect(w.find('[data-stub="services"]').exists()).toBe(true)
    expect(w.find('[data-stub="boom"]').exists()).toBe(false)
  })
})
