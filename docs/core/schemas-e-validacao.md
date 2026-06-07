# Schemas e validação

> **Pré-requisitos**: [Core](./README.md).
> **Tema**: core

Os schemas Zod (biblioteca de validação por schema, em TypeScript) são a **fonte
da verdade** dos dados do site: definem a forma, validam antes do render e derivam
os tipos. Esta página cobre o `WebsiteConfig` e a validação whole-site.

## WebsiteConfig — a forma canônica do site

Fonte: `sites/core/schemas/website.ts`

Um site É exatamente um `WebsiteConfig = { company, theme, sections }`:

```ts
export const websiteConfigSchema = z.object({
  company: companySchema,
  theme: themeSchema.default({}),        // omitir theme -> defaults aplicados
  sections: z.array(buildSectionSchema()),  // ordem do array = ordem de render
})

export type WebsiteConfig = z.infer<typeof websiteConfigSchema>
```

- `company` — identidade do negócio; `name` é o único campo obrigatório
  (`sites/core/schemas/company.ts`). Os demais são opcionais e degradam.
- `theme` — tokens visuais defaulted; `colors.primary` default `#0ea5e9`,
  `mode` default `system` (`sites/core/schemas/theme.ts`).
- `sections` — lista ordenada; lista vazia é um estado válido.

O tipo é **sempre derivado** do schema via `z.infer` — nunca declarado em paralelo.

## Validação whole-site: `validateWebsiteConfig`

Fonte: `sites/core/schemas/validate-website.ts`

Valida o site inteiro como uma unidade, antes do render. Contrato:

- **Nunca lança** — usa `safeParse` (portão de build/server).
- `company`/`theme` ausentes ou parciais aplicam **defaults** e não são rejeição
  (mas `company.name` é obrigatório, então `company` totalmente ausente falha).
- Cada item de `sections` é validado contra a **união viva** (live registry),
  reconstruída a cada chamada — registros feitos após o import são honrados.
- Qualquer item de seção inválido (`type` ausente/desconhecido/não registrado, ou
  `type` conhecido com slice ruim) **rejeita o config inteiro** — nunca saída
  quebrada silenciosa.
- Diagnósticos atribuem a falha por item (índice + `type`) e reportam irmãs válidas.
- A ordem de `sections` é preservada; a validação nunca reordena.

```ts
export function validateWebsiteConfig(input: unknown): WebsiteValidationResult {
  // company/theme: defaults para entrada ausente/parcial
  const company = validateBlockConfig(companySchema, obj.company)
  const theme = validateBlockConfig(themeSchema, obj.theme ?? {})
  // sections: cada item contra a união viva
  const element = buildSectionSchema()
  // ...
  const valid = company.valid && theme.valid && sectionsShapeValid && allSectionsValid
}
```

O resultado é `{ valid, data?, sections[], issues? }`. `data` só existe quando
`valid` é `true` — é o que `SiteRenderer` recebe.

## Como um bloco declara seu schema

Fonte: `sites/core/schemas/base.ts`, `sites/core/schemas/hero.ts`

Um bloco declara **um** schema Zod; o tipo deriva dele. `defineBlockSchema` é um
wrapper fino sobre `z.object` que fixa "um object schema por bloco" e remove chaves
desconhecidas:

```ts
// base.ts
export function defineBlockSchema<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape)
}

// hero.ts
export const heroSchema = defineBlockSchema({
  variant: blockVariant(['centered', 'split', 'minimal'], 'centered'),
  heading: z.string(),
  subheading: z.string().optional(),
  cta: link.optional(),
  media: media.optional(),
})
export type HeroConfig = BlockConfig<typeof heroSchema>
```

`blockVariant` cria um `z.enum(...).default(...)`: conjunto fechado de variantes
com exatamente um default; variante desconhecida resolve para o default
(`sites/core/schemas/variant.ts`).

## Emissão de JSON-Schema

Fonte: `sites/core/schemas/json-schema.ts`

Cada schema Zod pode emitir um JSON Schema (via `zod-to-json-schema`), habilitando
autocomplete de editor, autodocumentação do config e futura autoria de config por
IA:

```ts
export function blockJsonSchema(schema: z.ZodTypeAny, name?: string): JsonSchema {
  return zodToJsonSchema(schema as never, name) as JsonSchema
}
```

## Próximos passos

- Onde os tipos viram render: [motor de renderização](./motor-de-renderizacao.md).
- Por que precisa registrar nos dois lados: [registries](./registries.md).
- Regras de config para clientes: [padrões de configuração JSON](../standards/padroes-de-configuracao-json.md).
- [Voltar ao índice de core](./README.md)
