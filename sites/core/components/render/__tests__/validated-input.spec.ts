/** US6 (T020) — renders only Phase-3-validated config (renderer-contract §R8, FR-012/013). */
import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { validateWebsiteConfig } from '~~/sites/core/schemas'
import SiteRenderer from '../SiteRenderer.vue'
import { registerStub, resetRegistries } from './fixtures'

afterEach(() => resetRegistries())

describe('validated input gate', () => {
  it('valid config: validateWebsiteConfig passes, SiteRenderer renders result.data', () => {
    registerStub('hero')
    const result = validateWebsiteConfig({
      company: { name: 'Acme' },
      sections: [{ type: 'hero', heading: 'Hi' }],
    })
    expect(result.valid).toBe(true)
    const w = mount(SiteRenderer, { props: { config: result.data! } })
    expect(w.find('[data-stub="hero"]').exists()).toBe(true)
  })

  it('invalid config (unregistered section type): rejected, nothing rendered', () => {
    registerStub('hero')
    const result = validateWebsiteConfig({
      company: { name: 'Acme' },
      sections: [{ type: 'nope' }],
    })
    expect(result.valid).toBe(false)
    expect(result.data).toBeUndefined()
    // The integration page would not render; no broken page is produced (FR-013).
  })
})
