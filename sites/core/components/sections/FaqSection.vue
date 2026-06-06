<!--
  FaqSection — common questions (block-set-contract B1–B8; FR-002/013).
  Variants accordion|list; `items` via v-for; empty array → nothing. The
  accordion variant uses native <details>/<summary> (no JS, SSG-friendly).
-->
<script setup lang="ts">
import type { BlockProps } from '../../types'
import type { FaqConfig } from '../../schemas/faq'
import { useThemeVars } from './useThemeVars'

const { data } = defineProps<BlockProps<FaqConfig>>()
const themeVars = useThemeVars()
</script>

<template>
  <section
    class="faq w-full px-4 py-12 sm:px-6 lg:px-8"
    :class="`faq--${data.variant}`"
    data-block="faq"
    :data-variant="data.variant"
    :style="themeVars"
  >
    <h2 v-if="data.heading" class="faq__heading">{{ data.heading }}</h2>

    <dl v-if="data.items.length" class="faq__items">
      <template v-for="(item, i) in data.items" :key="i">
        <details v-if="data.variant === 'accordion'" class="faq__item">
          <summary class="faq__question">{{ item.question }}</summary>
          <p class="faq__answer">{{ item.answer }}</p>
        </details>
        <div v-else class="faq__item">
          <dt class="faq__question">{{ item.question }}</dt>
          <dd class="faq__answer">{{ item.answer }}</dd>
        </div>
      </template>
    </dl>
  </section>
</template>
