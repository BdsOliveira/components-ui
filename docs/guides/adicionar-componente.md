# Como adicionar um componente reutilizável

> **Pré-requisitos**: [Padrões de componente](../components/padroes-de-componente.md).
> **Tema**: guides

## Explicação

Adicione um componente de seção quando nenhum bloco existente cobre a UI que você
precisa. O componente deve ser **genérico** (dirigido por `data`), reutilizável por
qualquer template/cliente. Antes de criar, confira se um bloco existente já serve
(composição sobre criação).

## Localização dos arquivos

Fonte: `sites/core/components/sections/`

```text
sites/core/components/sections/
├── <Nome>Section.vue     # o componente (criar)
├── register.ts           # registrar o par (editar)
└── ...                   # blocos existentes
sites/core/schemas/
└── <nome>.ts             # o schema do bloco (criar) — ver guia de schema
```

## Exemplo prático

### 1. Criar o componente (`data` único, theme-aware)

Fonte: `sites/core/components/sections/HeroSection.vue`

```vue
<script setup lang="ts">
import type { BlockProps } from '../../types'
import type { GalleryConfig } from '../../schemas/gallery'
import { useThemeVars } from './useThemeVars'

const { data } = defineProps<BlockProps<GalleryConfig>>()
const themeVars = useThemeVars()
</script>

<template>
  <section class="gallery w-full px-4 py-12 sm:px-6 lg:px-8" :style="themeVars" data-block="gallery">
    <h2 v-if="data.heading">{{ data.heading }}</h2>
    <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <li v-for="(img, i) in data.images" :key="i">
        <img :src="img.src" :alt="img.alt" />
      </li>
    </ul>
  </section>
</template>
```

### 2. Registrar o par (dois registries)

Fonte: `sites/core/components/sections/register.ts`

```ts
import { gallerySchema } from '~~/sites/core/schemas/gallery'
import GallerySection from './GallerySection.vue'

registerSection(defineSection('gallery', gallerySchema))   // validável (schema)
registerSectionComponent('gallery', GallerySection)        // renderável (componente)
```

## Convenções esperadas

Fonte: `sites/core/components/sections/HeroSection.vue`, `eslint.config.mjs`

- Arquivo PascalCase com sufixo `Section`; tipo `data` = `<Nome>Config`.
- **Único** prop `data`; toda string vem de `data` (client-neutro — o lint barra
  import de `clients/`/`onboarding/` no `core`).
- Theme-aware via `useThemeVars()`; sem cor hardcoded.
- Mobile-first, acessível (alt, foco visível, semântica), TS estrito.
- Cheque todos os critérios em [padrões de componente](../components/padroes-de-componente.md).

## Erros comuns

| Sintoma | Causa | Correção |
|---------|-------|----------|
| lint `no-restricted-imports` | importou de `clients/`/`onboarding/` no core | passe dados via `data`, não import |
| seção não renderiza | faltou `registerSectionComponent` | adicione o par em `register.ts` |
| `Invalid client config` | faltou `registerSection` (schema) | adicione o par completo |
| `useSiteTheme called outside <SiteRenderer>` | componente montado fora do renderer | renderize via `SiteRenderer`/`DynamicSection` |

Mais: [troubleshooting](../troubleshooting/problemas-comuns.md).

## Próximos passos

- Crie o schema do bloco: [criar um novo schema JSON](./criar-novo-schema-json.md).
- Registre como tipo de seção: [adicionar um tipo de seção](./adicionar-tipo-de-secao.md).
- [Voltar ao índice de guias](./README.md)
