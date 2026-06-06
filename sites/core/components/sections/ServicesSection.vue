<!--
  ServicesSection — the "what we do" list (block-set-contract B1–B8; FR-002/013).
  Variants grid|list; `items` renders via v-for; an empty array renders nothing
  for the list region (no reserved space).
-->
<script setup lang="ts">
import type { BlockProps } from '../../types'
import type { ServicesConfig } from '../../schemas/services'
import { useThemeVars } from './useThemeVars'

const { data } = defineProps<BlockProps<ServicesConfig>>()
const themeVars = useThemeVars()
</script>

<template>
  <section
    class="services w-full px-4 py-12 sm:px-6 lg:px-8"
    :class="`services--${data.variant}`"
    data-block="services"
    :data-variant="data.variant"
    :style="themeVars"
  >
    <h2 v-if="data.heading" class="services__heading">{{ data.heading }}</h2>

    <ul v-if="data.items.length" class="services__items">
      <li v-for="(item, i) in data.items" :key="i" class="services__item">
        <span v-if="item.icon" class="services__icon" :data-icon="item.icon" aria-hidden="true" />
        <img v-if="item.media" class="services__media" :src="item.media.src" :alt="item.media.alt" />
        <h3 class="services__title">{{ item.title }}</h3>
        <p v-if="item.description" class="services__desc">{{ item.description }}</p>
        <a v-if="item.cta" class="services__cta" :href="item.cta.href">{{ item.cta.label }}</a>
      </li>
    </ul>
  </section>
</template>
