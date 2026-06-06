/**
 * Variant switching — hero, about, services, cta (tasks.md T041;
 * block-set-contract B4, FR-006/007). Each declared variant renders its distinct
 * markup (root `data-variant` + `--variant` class); an omitted variant resolves
 * to the single default.
 */
import { describe, it, expect } from 'vitest'
import { mountBlock } from './helpers'
import { heroSchema, aboutSchema, servicesSchema, ctaSchema } from '~~/sites/core/schemas'
import HeroSection from '../HeroSection.vue'
import AboutSection from '../AboutSection.vue'
import ServicesSection from '../ServicesSection.vue'
import CtaSection from '../CtaSection.vue'

/** [name, component, schema, required base, variants, default] */
const blocks: Array<[string, unknown, any, Record<string, unknown>, string[], string]> = [
  ['hero', HeroSection, heroSchema, { heading: 'H' }, ['centered', 'split', 'minimal'], 'centered'],
  ['about', AboutSection, aboutSchema, { heading: 'H', body: 'B' }, ['text', 'media-left', 'media-right'], 'text'],
  ['services', ServicesSection, servicesSchema, { items: [{ title: 'T' }] }, ['grid', 'list'], 'grid'],
  ['cta', CtaSection, ctaSchema, { heading: 'H', cta: { label: 'L', href: '#' } }, ['banner', 'boxed'], 'banner'],
]

describe.each(blocks)('block %s variants', (name, component, schema, base, variants, def) => {
  it.each(variants)('renders the "%s" variant distinctly', (variant) => {
    const data = schema.parse({ type: name, variant, ...base })
    const w = mountBlock(component as never, data)
    const root = w.find(`[data-block="${name}"]`)
    expect(root.attributes('data-variant')).toBe(variant)
    expect(root.classes()).toContain(`${name}--${variant}`)
  })

  it(`omitted variant resolves to the default "${def}"`, () => {
    const data = schema.parse({ type: name, ...base })
    const w = mountBlock(component as never, data)
    expect(w.find(`[data-block="${name}"]`).attributes('data-variant')).toBe(def)
  })
})
