<!--
  Client render page (research D3/D4, build-target-contract C-BT-2; FR-007/FR-009).

  The top-layer loader, now CLIENT-driven and auto-discovering:
  - Discover every client's `config.json` by convention with
    `import.meta.glob('~~/sites/clients/*/config.json')` — adding a client dir makes
    it selectable with ZERO edits here (FR-009).
  - Select the entry whose directory segment equals `useRuntimeConfig().public.client`
    (sourced from the `CLIENT` env var; default `clinica-saude`).
  - Dispatch on the config's `template` discriminator through
    `sites/templates/registry.ts` (not an inline per-template map), build a full
    `WebsiteConfig` from its `{ company, theme, content }` overrides, validate, and
    mount <SiteRenderer> ONLY with the validated data.

  Dispatch lives in the `app` layer — never in `core` (Constitution II/III). An
  unknown client, unknown template, or invalid config never renders a site; the
  failure is surfaced instead (C-BT-2).
-->
<script setup lang="ts">
import { validateWebsiteConfig } from '~~/sites/core/schemas'
import { templateRegistry, type TemplateOverrides } from '~~/sites/templates/registry'

interface ClientConfig extends TemplateOverrides {
  template: string
}

// Build-time discovery of all client configs, keyed by directory segment.
const modules = import.meta.glob('~~/sites/clients/*/config.json', {
  eager: true,
  import: 'default',
}) as Record<string, ClientConfig>

const byClient: Record<string, ClientConfig> = {}
for (const [path, config] of Object.entries(modules)) {
  // ".../sites/clients/<name>/config.json" -> "<name>"
  const segment = path.split('/').slice(-2, -1)[0]
  if (segment) byClient[segment] = config
}

const client = useRuntimeConfig().public.client as string
const clientConfig = byClient[client]

const template = clientConfig?.template
const entry = template && template in templateRegistry
  ? templateRegistry[template as keyof typeof templateRegistry]
  : undefined

const overrides: TemplateOverrides | undefined = clientConfig
  ? { company: clientConfig.company, theme: clientConfig.theme, content: clientConfig.content }
  : undefined

// build -> validate -> render only the validated data (SiteRenderer contract R8).
const raw = entry && overrides ? entry.factory(overrides) : undefined
const result = raw ? validateWebsiteConfig(raw) : undefined
</script>

<template>
  <SiteRenderer v-if="result?.valid" :config="result.data!" />
  <pre v-else-if="!clientConfig">Unknown client: {{ client }}</pre>
  <pre v-else-if="!entry">Unknown client template: {{ template }}</pre>
  <pre v-else>Invalid client config: {{ result }}</pre>
</template>
