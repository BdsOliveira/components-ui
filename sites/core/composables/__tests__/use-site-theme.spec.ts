/** US7 (T022) — theme propagation (renderer-contract §R11, FR-015, SC-009). */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SiteRenderer from '~~/sites/core/components/render/SiteRenderer.vue'
import {
  registerStub,
  makeThemeStub,
  resetRegistries,
} from '~~/sites/core/components/render/__tests__/fixtures'
import { useSiteTheme } from '../useSiteTheme'
import { defineComponent } from 'vue'

afterEach(() => {
  resetRegistries()
  vi.restoreAllMocks()
})

function siteWith(theme: Record<string, unknown>) {
  registerStub('a', makeThemeStub('a'))
  registerStub('b', makeThemeStub('b'))
  return mount(SiteRenderer, {
    props: {
      config: { company: { name: 'Acme' }, theme, sections: [{ type: 'a' }, { type: 'b' }] } as never,
    },
  })
}

describe('useSiteTheme', () => {
  it('provides one shared theme to every rendered section (FR-015)', () => {
    const theme = { colors: { primary: '#abc' }, mode: 'dark' }
    const w = siteWith(theme)
    const seen = w.findAll('[data-stub]').map((s) => JSON.parse(s.attributes('data-theme')!))
    expect(seen).toHaveLength(2)
    expect(seen[0]).toEqual(theme)
    expect(seen[1]).toEqual(theme)
  })

  it('a different theme value propagates to all sections (SC-009)', () => {
    const w = siteWith({ colors: { primary: '#111' }, mode: 'light' })
    const seen = w.findAll('[data-stub]').map((s) => JSON.parse(s.attributes('data-theme')!))
    expect(seen[0]).toEqual({ colors: { primary: '#111' }, mode: 'light' })
    expect(seen[1]).toEqual(seen[0])
  })

  it('throws when injected outside a <SiteRenderer> (no theme provided)', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const Bare = defineComponent({ setup() { useSiteTheme(); return () => null } })
    expect(() => mount(Bare)).toThrow(/outside a <SiteRenderer>/)
  })
})
