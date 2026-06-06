<!--
  FooterSection — the page closer (block-set-contract B1–B8; FR-002/011).
  Variants columns|minimal. Sources identity/social from site-level `company`
  via useSiteCompany(): `tagline` → company.tagline, `legal` →
  company.legal.legalName, and company.social links render when `showSocial`.
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { BlockProps } from '../../types'
import type { FooterConfig } from '../../schemas/footer'
import { useSiteCompany } from '~~/sites/core/composables/useSiteCompany'
import { useThemeVars } from './useThemeVars'

const { data } = defineProps<BlockProps<FooterConfig>>()
const themeVars = useThemeVars()
const company = useSiteCompany()

const tagline = computed(() => data.tagline ?? company.tagline)
const legal = computed(() => data.legal ?? company.legal?.legalName)
/** platform -> url pairs, rendered only when showSocial and the company has any. */
const social = computed(() => (data.showSocial ? Object.entries(company.social ?? {}) : []))
</script>

<template>
  <footer
    class="footer w-full px-4 py-10 sm:px-6 lg:px-8"
    :class="`footer--${data.variant}`"
    data-block="footer"
    :data-variant="data.variant"
    :style="themeVars"
  >
    <p v-if="tagline" class="footer__tagline">{{ tagline }}</p>

    <div
      v-if="data.variant === 'columns' && data.linkGroups && data.linkGroups.length"
      class="footer__groups"
    >
      <nav v-for="(group, gi) in data.linkGroups" :key="gi" class="footer__group">
        <h2 v-if="group.title" class="footer__group-title">{{ group.title }}</h2>
        <ul class="footer__links">
          <li v-for="(link, li) in group.links" :key="li" class="footer__link">
            <a :href="link.href">{{ link.label }}</a>
          </li>
        </ul>
      </nav>
    </div>

    <ul v-if="social.length" class="footer__social">
      <li v-for="[platform, url] in social" :key="platform" class="footer__social-item">
        <a :href="url" class="footer__social-link" :data-social="platform">{{ platform }}</a>
      </li>
    </ul>

    <p v-if="legal" class="footer__legal">{{ legal }}</p>
  </footer>
</template>
