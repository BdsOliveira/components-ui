<!--
  HeroSection — the opening banner (block-set-contract B1–B8; FR-002/006/008).
  One `data` prop (HeroConfig), theme-aware via useThemeVars, variants
  centered|split|minimal, optional regions degrade via v-if. Client-neutral:
  every string comes from `data`.
-->
<script setup lang="ts">
import type { BlockProps } from '../../types'
import type { HeroConfig } from '../../schemas/hero'
import { useThemeVars } from './useThemeVars'

const { data } = defineProps<BlockProps<HeroConfig>>()
const themeVars = useThemeVars()
</script>

<template>
  <section
    class="hero w-full px-4 py-12 sm:px-6 lg:px-8"
    :class="`hero--${data.variant}`"
    data-block="hero"
    :data-variant="data.variant"
    :style="themeVars"
  >
    <div v-if="data.variant === 'split' && data.media" class="hero__media">
      <img :src="data.media.src" :alt="data.media.alt" />
    </div>

    <div class="hero__body">
      <h1 class="hero__heading">{{ data.heading }}</h1>
      <p v-if="data.subheading" class="hero__subheading">{{ data.subheading }}</p>

      <div v-if="data.cta || data.secondaryCta" class="hero__actions">
        <a
          v-if="data.cta"
          class="hero__cta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          :href="data.cta.href"
          >{{ data.cta.label }}</a
        >
        <a
          v-if="data.secondaryCta"
          class="hero__cta hero__cta--secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          :href="data.secondaryCta.href"
          >{{ data.secondaryCta.label }}</a
        >
      </div>
    </div>
  </section>
</template>
