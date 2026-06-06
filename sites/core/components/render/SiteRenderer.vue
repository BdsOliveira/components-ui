<!--
  SiteRenderer — the page iterator
  (renderer-contract.md §R1/§R2/§R8/§R9/§R10/§R11, research D3/D6/D7,
  data-model "SiteRenderer"; FR-001, FR-002, FR-006, FR-012, FR-013, FR-014,
  FR-015, FR-016).

  Renders a whole page by iterating `DynamicSection` over `config.sections` in
  LIST ORDER (= render order, no reordering — R2), keyed by a stable per-item
  identity (R10), and provides the site-level theme to every section (R11).

  INPUT CONTRACT (R8 / FR-012 / FR-013): `config` MUST be a `WebsiteConfig` that
  has already passed Phase 3 whole-site validation. The integration page does:

      const result = validateWebsiteConfig(raw)
      // render only when valid; otherwise apply Phase 3 failure behavior
      <SiteRenderer v-if="result.valid" :config="result.data!" />

  SiteRenderer TRUSTS the validated shape and performs NO internal validation —
  it never re-derives or contradicts the Phase 3 rules (research D7).

  Vue primitives + DynamicSection are imported explicitly (not Nuxt auto-import)
  so this mounts in plain @vue/test-utils as well as under Nuxt (research D6).
-->
<script setup lang="ts">
import type { WebsiteConfig } from '~~/sites/core/schemas'
import { useSiteTheme } from '~~/sites/core/composables/useSiteTheme'
import { useSiteCompany } from '~~/sites/core/composables/useSiteCompany'
import DynamicSection from './DynamicSection.vue'

const props = defineProps<{
  /** A Phase-3-validated WebsiteConfig (R8). Not re-validated here. */
  config: WebsiteConfig
}>()

/** Provide the validated theme to every rendered section (R11 / FR-015). */
useSiteTheme(props.config.theme)
/** Provide the validated company identity once at site level (Decision 2 / FR-011). */
useSiteCompany(props.config.company)

/**
 * Stable per-section key (R10 / FR-016 / research D3): honor an explicit `id`
 * on the item when present, else `${index}:${type}`. Phase 3 section members are
 * flat block schemas + `type` and do not currently carry `id`, so this resolves
 * to the index-based key today; the `id` branch is the defined opt-in for later.
 */
function sectionKey(section: WebsiteConfig['sections'][number], index: number): string | number {
  const id = (section as { id?: string | number }).id
  return id ?? `${index}:${section.type}`
}
</script>

<template>
  <!-- Order IS render order; no reordering (R1 / R2). Empty list -> empty page (R9). -->
  <DynamicSection
    v-for="(section, index) in config.sections"
    :key="sectionKey(section, index)"
    :section="section"
    :index="index"
  />
</template>
