<!--
  CtaSection — a focused conversion prompt (block-set-contract B1–B8; FR-002/006).
  Variants banner|boxed; primary `cta` always present, `body`/`secondaryCta` optional.
-->
<script setup lang="ts">
import type { BlockProps } from '../../types'
import type { CtaConfig } from '../../schemas/cta'
import { useThemeVars } from './useThemeVars'

const { data } = defineProps<BlockProps<CtaConfig>>()
const themeVars = useThemeVars()
</script>

<template>
  <section
    class="cta w-full px-4 py-12 sm:px-6 lg:px-8"
    :class="`cta--${data.variant}`"
    data-block="cta"
    :data-variant="data.variant"
    :style="themeVars"
  >
    <div class="cta__inner">
      <h2 class="cta__heading">{{ data.heading }}</h2>
      <p v-if="data.body" class="cta__body">{{ data.body }}</p>

      <div class="cta__actions">
        <a
          class="cta__primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          :href="data.cta.href"
          >{{ data.cta.label }}</a
        >
        <a
          v-if="data.secondaryCta"
          class="cta__secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          :href="data.secondaryCta.href"
          >{{ data.secondaryCta.label }}</a
        >
      </div>
    </div>
  </section>
</template>
