<!--
  AboutSection — narrative/identity (block-set-contract B1–B8; FR-002/008/013).
  Variants text|media-left|media-right; media + highlights are optional.
-->
<script setup lang="ts">
import type { BlockProps } from '../../types'
import type { AboutConfig } from '../../schemas/about'
import { useThemeVars } from './useThemeVars'

const { data } = defineProps<BlockProps<AboutConfig>>()
const themeVars = useThemeVars()
</script>

<template>
  <section
    class="about w-full px-4 py-12 sm:px-6 lg:px-8"
    :class="`about--${data.variant}`"
    data-block="about"
    :data-variant="data.variant"
    :style="themeVars"
  >
    <div v-if="data.variant !== 'text' && data.media" class="about__media">
      <img :src="data.media.src" :alt="data.media.alt" />
    </div>

    <div class="about__body">
      <h2 class="about__heading">{{ data.heading }}</h2>
      <p class="about__text">{{ data.body }}</p>

      <ul v-if="data.highlights && data.highlights.length" class="about__highlights">
        <li v-for="(h, i) in data.highlights" :key="i" class="about__highlight">
          <span class="about__highlight-label">{{ h.label }}</span>
          <span v-if="h.value" class="about__highlight-value">{{ h.value }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
