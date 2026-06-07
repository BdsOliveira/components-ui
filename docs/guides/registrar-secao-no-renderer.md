# Como registrar uma seção no renderizador

> **Pré-requisitos**: [Registries](../core/registries.md),
> [motor de renderização](../core/motor-de-renderizacao.md).
> **Tema**: guides

## Explicação

"Registrar no renderizador" significa tornar um `type` **renderável**: mapear
`type → componente Vue` no registry de componente, para o `DynamicSection`
resolvê-lo. É a metade de runtime do par "dois registries" — a outra metade
(schema) é o que torna o `type` **validável**. Sem o registro de componente, a
seção valida mas o renderer cai no fallback "renderiza nada".

## Localização dos arquivos

Fonte: `sites/core/components/sections/registry.ts`, `sites/core/components/sections/register.ts`

```text
sites/core/components/sections/registry.ts   # registerSectionComponent / resolveSectionComponent (API)
sites/core/components/sections/register.ts   # onde o par é chamado (editar)
app/plugins/register-sections.ts             # importa register.ts no boot
```

## Exemplo prático

### 1. A API do registry de componente

Fonte: `sites/core/components/sections/registry.ts`

```ts
export function registerSectionComponent(type: string, component: Component): void {
  registry.set(type, component)
}
export function resolveSectionComponent(type: string): Component | undefined {
  return registry.get(type)
}
```

### 2. Registrar o componente (junto do schema)

Fonte: `sites/core/components/sections/register.ts`

```ts
registerSection(defineSection('gallery', gallerySchema))   // validável (schema)
registerSectionComponent('gallery', GallerySection)        // renderável (componente)
```

### 3. Como o renderer resolve

Fonte: `sites/core/components/render/DynamicSection.vue`

```ts
const resolved = computed(() => resolveSectionComponent(props.section.type))
if (!resolved.value) warnMissing('no registered component')  // fallback: renderiza nada
```

`<component :is="resolved" v-if="resolved && !failed" :data="section" />` — o
componente recebe o slice como `data`.

## Convenções esperadas

- A string `type` é idêntica à usada no `registerSection` correspondente.
- Registre sempre **em par** com o schema, no mesmo bloco de `register.ts`.
- Não registre componentes fora de `register.ts` (uma única fonte autoritativa).
- O boot é via plugin; não chame o registro manualmente em páginas.

## Erros comuns

| Sintoma | Causa | Correção |
|---------|-------|----------|
| seção não aparece, sem erro | `type` validou mas não tem componente | `registerSectionComponent(type, Comp)` |
| warn `no registered component for "x"` | esqueceu o registro de componente | adicione o par em `register.ts` |
| componente errado renderiza | `type` duplicado registrado depois | registry é idempotente — remova o duplicado |
| resolve sempre `undefined` | `register.ts` não importado no boot | confira `app/plugins/register-sections.ts` |

Mais: [troubleshooting](../troubleshooting/problemas-comuns.md).

## Próximos passos

- O par completo: [adicionar um tipo de seção](./adicionar-tipo-de-secao.md).
- Como o render se comporta: [motor de renderização](../core/motor-de-renderizacao.md).
- [Voltar ao índice de guias](./README.md)
