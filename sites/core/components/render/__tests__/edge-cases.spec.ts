/** Polish (T025/T026) — empty sections + empty-registry baseline (renderer-contract §R9/R13, FR-014/018). */
import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { validateWebsiteConfig } from '~~/sites/core/schemas'
import SiteRenderer from '../SiteRenderer.vue'
import { resetRegistries } from './fixtures'

afterEach(() => resetRegistries())

describe('edge cases', () => {
  it('empty sections renders a valid empty page, no error (R9/FR-014)', () => {
    const w = mount(SiteRenderer, {
      props: { config: { company: { name: 'Acme' }, theme: {}, sections: [] } as never },
    })
    expect(w.findAll('[data-stub]')).toHaveLength(0)
    expect(w.exists()).toBe(true)
  })

  it('empty-registry baseline: empty sections validate & render empty (R13/FR-018)', () => {
    const result = validateWebsiteConfig({ company: { name: 'Acme' }, sections: [] })
    expect(result.valid).toBe(true)
    const w = mount(SiteRenderer, { props: { config: result.data! } })
    expect(w.findAll('[data-stub]')).toHaveLength(0)
  })

  it('empty-registry baseline: a non-empty list is rejected before the renderer (R13)', () => {
    // No sections registered (empty schema registry => reject-all element schema).
    const result = validateWebsiteConfig({ company: { name: 'Acme' }, sections: [{ type: 'hero' }] })
    expect(result.valid).toBe(false)
    // So the renderer is never asked to render an unmapped type in the baseline.
  })
})
