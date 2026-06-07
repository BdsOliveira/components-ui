# Padrões de componente — o que torna um componente "válido"

> **Pré-requisitos**: [Componentes](./README.md), [registries](../core/registries.md).
> **Tema**: components

Critérios **objetivos** para decidir se um componente de seção é aceitável na
plataforma (FR-011/FR-012). Um revisor consegue aprovar/rejeitar usando só esta
lista (SC-008).

## Critérios de "componente válido"

Fonte: `sites/core/components/sections/HeroSection.vue`, `sites/core/components/sections/useThemeVars.ts`, `.specify/memory/constitution.md` (Princípio V)

| # | Critério | Como verificar | Fonte/regra |
|---|----------|----------------|-------------|
| 1 | **Um único prop `data`** tipado pelo schema do bloco | `defineProps<BlockProps<HeroConfig>>()` | `HeroSection.vue` |
| 2 | **Client-neutro**: todo texto/imagem vem de `data` | nenhuma string fixa de cliente no template | `eslint.config.mjs` (lint barra import de `clients/`) |
| 3 | **Theme-aware**: usa `useThemeVars()`, sem cor hardcoded | `:style="themeVars"` no root | `useThemeVars.ts` |
| 4 | **Acessível (a11y)**: alt em imagens, foco visível, semântica | `:alt`, `focus-visible:ring-*`, `<h1>/<section>` | `HeroSection.vue` |
| 5 | **Responsivo**: mobile-first com utilitários Tailwind | classes `sm:`/`lg:` | `HeroSection.vue` |
| 6 | **Configurável por variantes** (conjunto fechado + default) | `data.variant` via `blockVariant` | `schemas/variant.ts` |
| 7 | **Regiões opcionais degradam** via `v-if` | `v-if="data.subheading"` etc. | `HeroSection.vue` |
| 8 | **TypeScript estrito**: tipo derivado do schema (`z.infer`) | nenhum `any`; `HeroConfig = z.infer<...>` | `schemas/base.ts` |
| 9 | **Componível**: registrado nos dois registries | par em `register.ts` | `register.ts` |

## Anatomia de um bloco válido (referência)

Fonte: `sites/core/components/sections/HeroSection.vue`

```vue
<script setup lang="ts">
import type { BlockProps } from '../../types'
import type { HeroConfig } from '../../schemas/hero'
import { useThemeVars } from './useThemeVars'

const { data } = defineProps<BlockProps<HeroConfig>>()
const themeVars = useThemeVars()
</script>

<template>
  <section class="hero w-full px-4 py-12 sm:px-6 lg:px-8"
           :class="`hero--${data.variant}`" :style="themeVars">
    <div v-if="data.variant === 'split' && data.media" class="hero__media">
      <img :src="data.media.src" :alt="data.media.alt" />
    </div>
    <div class="hero__body">
      <h1 class="hero__heading">{{ data.heading }}</h1>
      <p v-if="data.subheading">{{ data.subheading }}</p>
      <a v-if="data.cta" class="... focus-visible:ring-2" :href="data.cta.href">{{ data.cta.label }}</a>
    </div>
  </section>
</template>
```

## Convenções de nomenclatura e pasta

Fonte: `sites/core/components/sections/`

- **Pasta**: blocos de seção vivem em `sites/core/components/sections/`.
- **Arquivo/componente**: PascalCase + sufixo `Section` (ex.: `HeroSection.vue`).
- **Tipo do `data`**: `<Nome>Config`, derivado do schema homônimo em `schemas/`.
- **Theme vars**: prefixo `--site-*` (ex.: `--site-primary`), via `useThemeVars`.

## Theme-aware sem prop-drilling

Fonte: `sites/core/components/sections/useThemeVars.ts`

O bloco lê o tema injetado e o expõe como CSS custom properties no root; re-skin do
site inteiro é uma mudança de configuração (tema), sem editar o bloco:

```ts
export function useThemeVars(): ComputedRef<Record<string, string>> {
  const theme = useSiteTheme()
  return computed(() => {
    const vars: Record<string, string> = {}
    if (theme.colors?.primary) vars['--site-primary'] = theme.colors.primary
    // ...
    return vars
  })
}
```

## Próximos passos

- Passo a passo: [adicionar um componente](../guides/adicionar-componente.md).
- Como ele é registrado: [registries](../core/registries.md).
- Padrões de código gerais: [padrões de desenvolvimento](../standards/padroes-de-desenvolvimento.md).
- [Voltar ao índice de componentes](./README.md)
