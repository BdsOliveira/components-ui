<!--
  DynamicSection — the dynamic section renderer
  (renderer-contract.md §R3/§R5/§R6, research D1/D4/D5, data-model "DynamicSection";
  FR-005, FR-007, FR-008, FR-009, FR-010, FR-011).

  Receives ONE section item, resolves the component for its `type` from the
  component registry, and renders it with that item's config slice via Vue's
  built-in `<component :is>` — no per-type branching (R3). The unit iterated over
  `sections` to render a whole page.

  Resilience (R6):
    - missing component (type has no registered component) -> render nothing +
      dev-only warning naming the type and index; never throw (R6 / FR-010).
    - section runtime error -> contained by `onErrorCaptured` (returns false);
      the item degrades to the same "render nothing" fallback so sibling
      sections are unaffected (R6 / FR-011).

  Vue primitives are imported explicitly (not Nuxt auto-import) so the component
  mounts in plain @vue/test-utils as well as under Nuxt (research D6).
-->
<script setup lang="ts">
import { computed, ref, onErrorCaptured } from 'vue'
import type { Section } from '~~/sites/core/schemas'
import { resolveSectionComponent } from '~~/sites/core/components/sections/registry'

const props = defineProps<{
  /** The single validated section item to render (its config slice). */
  section: Section
  /** This item's position in `sections`, used only for fallback diagnostics. */
  index?: number
}>()

/** O(1) registry lookup for this item's `type` (R3 / research D1). */
const resolved = computed(() => resolveSectionComponent(props.section.type))

/** Set when the resolved component throws at render; hides it (R6 / D5). */
const failed = ref(false)

/** Dev-only diagnostics; suppressed in production builds (R6 / D4). */
function warnMissing(reason: string) {
  if (import.meta.env.DEV) {
    console.warn(
      `[DynamicSection] ${reason} for section type "${props.section.type}"` +
        (props.index !== undefined ? ` at index ${props.index}` : '') +
        ' — rendering nothing.',
    )
  }
}

// Missing component: surface once, render nothing (FR-010).
if (!resolved.value) warnMissing('no registered component')

// Contain a section's runtime throw at this single-section boundary (FR-011 / D5).
onErrorCaptured(() => {
  failed.value = true
  warnMissing('section threw during render')
  return false // stop propagation — siblings are unaffected
})
</script>

<template>
  <!-- Only this item's slice is bound as the single `data` prop (R5 / FR-008 /
       block-contract §C1, Decision 1). `data.type` is ignored by the section
       component, which reads its own block fields (Phase 2/3 flat member). -->
  <component :is="resolved" v-if="resolved && !failed" :data="section" />
  <!-- no resolved component (or contained error) -> render nothing (R6 / FR-010) -->
</template>
