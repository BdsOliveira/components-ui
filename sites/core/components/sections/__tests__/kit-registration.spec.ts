/**
 * Kit registration (tasks.md T035; block-set-contract B1/B7, FR-001/003/014).
 *
 * After importing `register`, all eight core types are present in BOTH the schema
 * registry (validatable) and the component registry (renderable) — and exactly
 * those eight, no others. Importing `register` runs the registrations as a side
 * effect.
 */
import { describe, it, expect } from 'vitest'
import '../register'
import { registeredSectionTypes } from '~~/sites/core/schemas'
import { registeredSectionComponents } from '../registry'

const EIGHT = ['hero', 'about', 'services', 'cta', 'testimonials', 'faq', 'contact', 'footer']

describe('core block set registration', () => {
  it('registers all eight types in the schema registry', () => {
    expect([...registeredSectionTypes()].sort()).toEqual([...EIGHT].sort())
  })

  it('registers all eight types in the component registry', () => {
    expect([...registeredSectionComponents()].sort()).toEqual([...EIGHT].sort())
  })

  it('a type is fully supported only when in BOTH registries', () => {
    const schema = new Set(registeredSectionTypes())
    const component = new Set(registeredSectionComponents())
    for (const type of EIGHT) {
      expect(schema.has(type)).toBe(true)
      expect(component.has(type)).toBe(true)
    }
  })
})
