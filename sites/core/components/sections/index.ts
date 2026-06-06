// core/components/sections — barrel for the section component registry (Phase 4).
// The runtime sibling of sites/core/schemas/section.ts: the single authoritative
// `type` -> component map. Concrete sections (later phases) self-register here.
export {
  registerSectionComponent,
  resolveSectionComponent,
  registeredSectionComponents,
  clearSectionComponentRegistry,
} from './registry'
