<!--
  TestimonialsSection — social proof (block-set-contract B1–B8; FR-002/013).
  Variants grid|carousel; `items` via v-for; empty array → nothing.
-->
<script setup lang="ts">
import type { BlockProps } from '../../types'
import type { TestimonialsConfig } from '../../schemas/testimonials'
import { useThemeVars } from './useThemeVars'

const { data } = defineProps<BlockProps<TestimonialsConfig>>()
const themeVars = useThemeVars()
</script>

<template>
  <section
    class="testimonials w-full px-4 py-12 sm:px-6 lg:px-8"
    :class="`testimonials--${data.variant}`"
    data-block="testimonials"
    :data-variant="data.variant"
    :style="themeVars"
  >
    <h2 v-if="data.heading" class="testimonials__heading">{{ data.heading }}</h2>

    <ul v-if="data.items.length" class="testimonials__items">
      <li v-for="(t, i) in data.items" :key="i" class="testimonials__item">
        <blockquote class="testimonials__quote">{{ t.quote }}</blockquote>
        <img
          v-if="t.avatar"
          class="testimonials__avatar"
          :src="t.avatar.src"
          :alt="t.avatar.alt"
        />
        <p class="testimonials__author">
          <span class="testimonials__name">{{ t.author }}</span>
          <span v-if="t.role" class="testimonials__role">{{ t.role }}</span>
        </p>
        <p v-if="t.rating !== undefined" class="testimonials__rating" :data-rating="t.rating">
          {{ t.rating }}
        </p>
      </li>
    </ul>
  </section>
</template>
