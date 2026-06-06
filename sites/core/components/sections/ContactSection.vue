<!--
  ContactSection — ways to reach the business (block-set-contract B1–B8;
  FR-002/011). Variants split|stacked. Cross-cutting contact info is sourced
  once from site-level `company` via useSiteCompany(): a per-block `channels`
  value (or an individual channel within it) takes precedence; otherwise the
  injected `company.contact` is used. Only resolved channels render (partial
  channels degrade gracefully). `showForm` renders a form STRUCTURE only.
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { BlockProps } from '../../types'
import type { ContactConfig } from '../../schemas/contact'
import { useSiteCompany } from '~~/sites/core/composables/useSiteCompany'
import { useThemeVars } from './useThemeVars'

const { data } = defineProps<BlockProps<ContactConfig>>()
const themeVars = useThemeVars()
const company = useSiteCompany()

/** Per-block channels override site company; each channel resolves independently (FR-011). */
const channels = computed(() => {
  const own = data.channels ?? {}
  const fallback = company.contact ?? {}
  return {
    email: own.email ?? fallback.email,
    phone: own.phone ?? fallback.phone,
    address: own.address ?? fallback.address,
  }
})
const hasChannels = computed(
  () => !!(channels.value.email || channels.value.phone || channels.value.address),
)
</script>

<template>
  <section
    class="contact w-full px-4 py-12 sm:px-6 lg:px-8"
    :class="`contact--${data.variant}`"
    data-block="contact"
    :data-variant="data.variant"
    :style="themeVars"
  >
    <div class="contact__intro">
      <h2 v-if="data.heading" class="contact__heading">{{ data.heading }}</h2>
      <p v-if="data.intro" class="contact__lead">{{ data.intro }}</p>
    </div>

    <ul v-if="hasChannels" class="contact__channels">
      <li v-if="channels.email" class="contact__channel contact__channel--email">
        <a :href="`mailto:${channels.email}`">{{ channels.email }}</a>
      </li>
      <li v-if="channels.phone" class="contact__channel contact__channel--phone">
        <a :href="`tel:${channels.phone}`">{{ channels.phone }}</a>
      </li>
      <li v-if="channels.address" class="contact__channel contact__channel--address">
        {{ channels.address }}
      </li>
    </ul>

    <ul v-if="data.hours && data.hours.length" class="contact__hours">
      <li v-for="(h, i) in data.hours" :key="i" class="contact__hours-row">
        <span class="contact__hours-label">{{ h.label }}</span>
        <span class="contact__hours-value">{{ h.value }}</span>
      </li>
    </ul>

    <form v-if="data.showForm" class="contact__form" data-contact-form @submit.prevent>
      <label class="contact__field">
        <span>Name</span>
        <input type="text" name="name" />
      </label>
      <label class="contact__field">
        <span>Email</span>
        <input type="email" name="email" />
      </label>
      <label class="contact__field">
        <span>Message</span>
        <textarea name="message" />
      </label>
      <button
        type="submit"
        class="contact__submit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        Send
      </button>
    </form>

    <iframe
      v-if="data.mapEmbedUrl"
      class="contact__map"
      :src="data.mapEmbedUrl"
      title="Map"
      loading="lazy"
    />
  </section>
</template>
