# Como adicionar um novo tipo de seção

> **Pré-requisitos**: [Registries](../core/registries.md),
> [adicionar um componente](./adicionar-componente.md).
> **Tema**: guides

## Explicação

Um "tipo de seção" é um `type` que pode aparecer em `sections[]` de um site. Para
ser **totalmente suportado**, ele precisa ser registrado nos **DOIS** registries:
schema (validável) e componente (renderável). Este guia cobre o ciclo completo —
schema + componente + o par de registro.

## Localização dos arquivos

Fonte: `sites/core/schemas/`, `sites/core/components/sections/`

```text
sites/core/schemas/<tipo>.ts                       # schema do bloco (criar)
sites/core/components/sections/<Tipo>Section.vue   # componente (criar)
sites/core/components/sections/register.ts         # o par de registro (editar)
```

## Exemplo prático

### 1. Schema do bloco

Fonte: `sites/core/schemas/hero.ts`, `sites/core/schemas/base.ts`

```ts
// sites/core/schemas/gallery.ts
import { z, defineBlockSchema, type BlockConfig } from './base'

const image = z.object({ src: z.string(), alt: z.string() })

export const gallerySchema = defineBlockSchema({
  heading: z.string().optional(),
  images: z.array(image),
})

export type GalleryConfig = BlockConfig<typeof gallerySchema>
```

### 2. Componente

Ver [adicionar um componente](./adicionar-componente.md) para o `GallerySection.vue`.

### 3. O par de registro (a regra de ouro)

Fonte: `sites/core/components/sections/register.ts`

```ts
import { gallerySchema } from '~~/sites/core/schemas/gallery'
import GallerySection from './GallerySection.vue'

registerSection(defineSection('gallery', gallerySchema))   // validável (schema)
registerSectionComponent('gallery', GallerySection)        // renderável (componente)
```

`register.ts` é importado no boot pelo plugin
(`app/plugins/register-sections.ts`), então os dois registries ficam populados
antes de qualquer render. Adicionar um tipo = "criar arquivos + um par aqui".

### 4. Usar em um template/cliente

Agora `gallery` pode entrar na `ORDER` de um template ou no `content` de um
cliente — desde que registrado nos dois lados.

## Convenções esperadas

Fonte: `sites/core/components/sections/register.ts`

- O `type` (string) é o mesmo em `defineSection('x', ...)` e
  `registerSectionComponent('x', ...)`.
- Schema em `schemas/<tipo>.ts`; componente em `sections/<Tipo>Section.vue`.
- O par fica junto, no mesmo bloco de `register.ts`.
- Tipo derivado do schema (`z.infer`); nada de redefinir o shape no componente.

## Erros comuns

| Sintoma | Causa | Correção |
|---------|-------|----------|
| `Invalid client config` | só registrou o componente, faltou o schema | adicione `registerSection(defineSection(...))` |
| seção não renderiza (warn em dev) | só registrou o schema, faltou o componente | adicione `registerSectionComponent(...)` |
| `type` ignorado | `type` divergente entre os dois registros | use a MESMA string nos dois |
| nada acontece após editar | `register.ts` não reimportado | reinicie o dev server |

Detalhe da tabela de falha em [registries](../core/registries.md) e
[troubleshooting](../troubleshooting/problemas-comuns.md).

## Próximos passos

- O outro lado: [registrar uma seção no renderizador](./registrar-secao-no-renderer.md).
- O schema em profundidade: [criar um novo schema JSON](./criar-novo-schema-json.md).
- [Voltar ao índice de guias](./README.md)
