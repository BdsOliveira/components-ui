<!--
  Client render page (research D3, contract C5; FR-010/FR-012).

  The top-layer loader: import the client's `config.json`, dispatch on its
  `template` discriminator to the matching template factory, build a full
  `WebsiteConfig` from its `{ company, theme, content }` overrides, validate the
  result, and mount <SiteRenderer> ONLY with the validated data. Dispatch lives
  here in the `app` layer — never in `core` (Constitution II/III: core MUST NOT
  import templates). An unknown template or an invalid config never renders a
  site; the failure is surfaced instead (C2.2, C5.2).
-->
<script setup lang="ts">
import { validateWebsiteConfig } from '~~/sites/core/schemas'
import { createClinicSite, type ClinicOverrides } from '~~/sites/templates/clinic/page'
import clientConfig from '~~/sites/clients/clinica-saude/config.json'

// template discriminator -> template factory. Only `clinic` is registered this
// phase; any other value is a reported load error, never a silent default (C2.2).
const templateFactories = { clinic: createClinicSite } as const
type KnownTemplate = keyof typeof templateFactories

const template = clientConfig.template as string
const factory = templateFactories[template as KnownTemplate] as
  | ((overrides: ClinicOverrides) => ReturnType<typeof createClinicSite>)
  | undefined

const overrides = {
  company: clientConfig.company,
  theme: clientConfig.theme,
  content: clientConfig.content,
} as ClinicOverrides

// build -> validate -> render only the validated data (SiteRenderer contract R8).
const raw = factory ? factory(overrides) : undefined
const result = raw ? validateWebsiteConfig(raw) : undefined
</script>

<template>
  <SiteRenderer v-if="result?.valid" :config="result.data!" />
  <pre v-else-if="!factory">Unknown client template: {{ template }}</pre>
  <pre v-else>Invalid client config: {{ result }}</pre>
</template>
