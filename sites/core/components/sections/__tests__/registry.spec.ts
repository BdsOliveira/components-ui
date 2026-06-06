/** US3 (T007) — the type->component registry (renderer-contract §R4, FR-003/004/018). */
import { describe, it, expect, afterEach } from 'vitest'
import { defineComponent } from 'vue'
import {
  registerSectionComponent,
  resolveSectionComponent,
  registeredSectionComponents,
  clearSectionComponentRegistry,
} from '../registry'

const Stub = defineComponent({ name: 'Stub', render: () => null })
const Stub2 = defineComponent({ name: 'Stub2', render: () => null })

afterEach(() => clearSectionComponentRegistry())

describe('component registry', () => {
  it('resolves a registered type to its component', () => {
    registerSectionComponent('hero', Stub)
    expect(resolveSectionComponent('hero')).toBe(Stub)
  })

  it('resolves an unregistered type to undefined', () => {
    expect(resolveSectionComponent('missing')).toBeUndefined()
  })

  it('replaces the component when a type is re-registered (idempotent per type)', () => {
    registerSectionComponent('hero', Stub)
    registerSectionComponent('hero', Stub2)
    expect(resolveSectionComponent('hero')).toBe(Stub2)
    expect(registeredSectionComponents().filter((t) => t === 'hero')).toHaveLength(1)
  })

  it('lists registered types and clears them', () => {
    registerSectionComponent('hero', Stub)
    registerSectionComponent('services', Stub2)
    expect(registeredSectionComponents()).toEqual(['hero', 'services'])
    clearSectionComponentRegistry()
    expect(registeredSectionComponents()).toEqual([])
  })

  it('empty baseline: resolves nothing when nothing is registered (R13)', () => {
    expect(resolveSectionComponent('hero')).toBeUndefined()
    expect(registeredSectionComponents()).toEqual([])
  })
})
