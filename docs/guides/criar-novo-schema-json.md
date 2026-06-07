# Como criar um novo schema JSON

> **Pré-requisitos**: [Schemas e validação](../core/schemas-e-validacao.md).
> **Tema**: guides

## Explicação

O schema Zod de um bloco é a **fonte da verdade**: define a forma do `data`, valida
antes do render e deriva o tipo TypeScript. Crie um schema novo ao introduzir um
bloco/seção. Ele também pode emitir JSON-Schema para autocomplete e autoria por IA.

## Localização dos arquivos

Fonte: `sites/core/schemas/`

```text
sites/core/schemas/<nome>.ts     # o schema do bloco (criar)
sites/core/schemas/base.ts       # defineBlockSchema, BlockConfig (reusar)
sites/core/schemas/variant.ts    # blockVariant (reusar, se houver variantes)
sites/core/schemas/index.ts      # barrel — exportar o novo schema (editar)
```

## Exemplo prático

### 1. Declarar o schema com `defineBlockSchema`

Fonte: `sites/core/schemas/hero.ts`, `sites/core/schemas/base.ts`

```ts
import { z, defineBlockSchema, type BlockConfig } from './base'
import { blockVariant } from './variant'

const image = z.object({ src: z.string(), alt: z.string() })

export const gallerySchema = defineBlockSchema({
  variant: blockVariant(['grid', 'masonry'], 'grid'),  // conjunto fechado + default
  heading: z.string().optional(),                       // opcional degrada
  images: z.array(image),                               // obrigatório
})

export type GalleryConfig = BlockConfig<typeof gallerySchema>
```

Regras seguidas: um object schema por bloco; chaves desconhecidas são removidas;
tipo derivado via `z.infer` (`BlockConfig`), nunca declarado em paralelo.

### 2. `blockVariant` — variantes fechadas

Fonte: `sites/core/schemas/variant.ts`

```ts
variant: blockVariant(['centered', 'split', 'minimal'], 'centered')
// z.enum(...).default('centered'); variante desconhecida resolve ao default
```

### 3. Exportar no barrel

Fonte: `sites/core/schemas/index.ts`

```ts
export { gallerySchema, type GalleryConfig } from './gallery'
```

### 4. (Opcional) Emitir JSON-Schema

Fonte: `sites/core/schemas/json-schema.ts`

```ts
import { blockJsonSchema } from '~~/sites/core/schemas/json-schema'
const json = blockJsonSchema(gallerySchema, 'gallery')
```

## Convenções esperadas

Fonte: `sites/core/schemas/hero.ts`

- Arquivo `schemas/<nome>.ts`; export `<nome>Schema` e tipo `<Nome>Config`.
- Importe `z` de `./base` (toolkit único); use `defineBlockSchema`.
- Campos obrigatórios mínimos; resto `.optional()` ou `.default()` para degradar.
- Variantes sempre via `blockVariant` (conjunto fechado + um default).
- Tipo sempre `z.infer` via `BlockConfig`.

## Erros comuns

| Sintoma | Causa | Correção |
|---------|-------|----------|
| campo "some" do `data` | chave não está no schema (stripada) | adicione o campo ao schema |
| `Invalid client config` | dado do cliente viola o schema | ajuste o dado OU torne o campo opcional |
| variante ignorada | valor fora do enum | use um membro do conjunto, ou aceite o default |
| tipo TS divergente | tipo declarado à mão | derive com `z.infer`/`BlockConfig` |

Mais: [troubleshooting](../troubleshooting/problemas-comuns.md).

## Próximos passos

- Registre o tipo: [adicionar um tipo de seção](./adicionar-tipo-de-secao.md).
- Como a validação usa o schema: [schemas e validação](../core/schemas-e-validacao.md).
- [Voltar ao índice de guias](./README.md)
