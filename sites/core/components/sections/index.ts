// core/components/sections — barrel for the section component registry (Phase 4).
// The runtime sibling of sites/core/schemas/section.ts: the single authoritative
// `type` -> component map. Concrete sections (later phases) self-register here.
export {
  registerSectionComponent,
  resolveSectionComponent,
  registeredSectionComponents,
  clearSectionComponentRegistry,
} from './registry'

// Phase 5: import for the side effect that registers the eight core blocks into
// BOTH registries (schema + component). Re-exported so a Nuxt plugin / app code
// can `import '~~/sites/core/components/sections'` to populate the kit at boot.
import './register'
