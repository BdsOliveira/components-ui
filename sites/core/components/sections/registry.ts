/**
 * The component registry — one authoritative `type` -> component map
 * (renderer-contract.md §R4, research Decision 2, data-model "Component Registry";
 * FR-003, FR-004, FR-007, FR-018).
 *
 * This is the RUNTIME sibling of the Phase 3 section SCHEMA registry
 * (`sites/core/schemas/section.ts`). A section `type` is FULLY SUPPORTED only
 * when registered in BOTH places: validatable (schema) and renderable
 * (component). The API mirrors the schema registry so the two never drift.
 *
 *   - register a section's component with a single `registerSectionComponent(...)`
 *     call (ideally co-located with its `registerSection(...)` in the section's
 *     own module), and nowhere else (FR-003 / FR-004).
 *   - the renderer resolves a component with `resolveSectionComponent(type)`;
 *     an unregistered `type` resolves to `undefined`, the defined "renderable
 *     gap" handled by the renderer's fallback (R6 / FR-010).
 *
 * Phase 4 ships this registry EMPTY (no concrete sections) — the defined
 * baseline (R13 / FR-018): every resolve returns `undefined`, so a non-empty
 * `sections` list would already have failed Phase 3 validation (empty schema
 * registry) before the renderer is reached, and `sections: []` renders empty.
 *
 *   import { registerSectionComponent } from '~~/sites/core/components/sections/registry'
 *   registerSectionComponent('hero', HeroSection)   // one authoritative call
 */
import type { Component } from 'vue'

/** The single authoritative registry: `type` -> component (FR-003). */
const registry = new Map<string, Component>()

/**
 * Register a section `type`'s component into the single registry (the one place
 * a type is made renderable). Idempotent per `type` — re-registering replaces it
 * (mirrors `registerSection`).
 */
export function registerSectionComponent(type: string, component: Component): void {
  registry.set(type, component)
}

/** Resolve the component for a section `type`; `undefined` if unregistered. */
export function resolveSectionComponent(type: string): Component | undefined {
  return registry.get(type)
}

/** The currently registered section `type` strings, in registration order. */
export function registeredSectionComponents(): string[] {
  return [...registry.keys()]
}

/** Remove all registered component mappings (test/scratch support; not used in prod). */
export function clearSectionComponentRegistry(): void {
  registry.clear()
}
