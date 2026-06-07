# Os dois registries

> **Pré-requisitos**: [Schemas e validação](./schemas-e-validacao.md).
> **Tema**: core

O conceito mais importante (e mais fácil de violar) da plataforma: um `type` de
seção só é **totalmente suportado** quando registrado em **DOIS** lugares — o
registry de **schema** (validável) e o registry de **componente** (renderável).

## Registry de schema

Fonte: `sites/core/schemas/section.ts`

Mapeia `type → membro do schema`. Um `Section` é uma **discriminated union**
(união Zod desambiguada pelo campo literal `type`), construída a partir deste
único registry autoritativo:

```ts
const registry = new Map<string, SectionMember>()

export function registerSection(member: SectionMember): void {
  const type = (member.shape.type as z.ZodLiteral<string>).value
  registry.set(type, member)
}

export function buildSectionSchema() {
  const members = [...registry.values()]
  if (members.length === 0) return z.never()  // registry vazio = rejeita tudo
  return z.discriminatedUnion('type', members as ...)
}
```

`defineSection` mescla o `type` literal a um block schema (membro flat):

```ts
export function defineSection<T extends string, S>(type: T, blockSchema: S) {
  return blockSchema.extend({ type: z.literal(type) })
}
```

Sem o registro de schema, `validateWebsiteConfig` rejeita a seção → **config inválido**.

## Registry de componente

Fonte: `sites/core/components/sections/registry.ts`

O irmão de runtime: mapeia `type → componente Vue`. O renderer resolve com
`resolveSectionComponent(type)`; `type` não registrado retorna `undefined`:

```ts
const registry = new Map<string, Component>()

export function registerSectionComponent(type: string, component: Component): void {
  registry.set(type, component)
}

export function resolveSectionComponent(type: string): Component | undefined {
  return registry.get(type)
}
```

Sem o registro de componente, o schema valida mas o renderer cai no fallback
"renderiza nada" → **seção não renderiza**.

## O par autoritativo: `register.ts`

Fonte: `sites/core/components/sections/register.ts`

É o **único** lugar onde os oito blocos são tornados totalmente suportados — cada
um com um par de chamadas:

```ts
registerSection(defineSection('hero', heroSchema))   // validável (schema)
registerSectionComponent('hero', HeroSection)        // renderável (componente)

registerSection(defineSection('about', aboutSchema))
registerSectionComponent('about', AboutSection)
// ... services, cta, testimonials, faq, contact, footer
```

Os oito tipos registrados: `hero`, `about`, `services`, `cta`, `testimonials`,
`faq`, `contact`, `footer`. Adicionar um nono bloco = "criar arquivos + um par aqui".

## Boot via plugin

Fonte: `app/plugins/register-sections.ts`

Importar `register.ts` roda as registragens como **efeito colateral**. Um plugin
Nuxt faz esse import no boot, garantindo os dois registries populados antes de
qualquer página renderizar:

```ts
import '~~/sites/core/components/sections/register'
export default defineNuxtPlugin(() => {})
```

## Tabela de falha por lado faltante

| Registrado | Falta | Sintoma |
|------------|-------|---------|
| componente | schema | `validateWebsiteConfig` rejeita → "Invalid client config" |
| schema | componente | passa a validação, `DynamicSection` renderiza nada + warn em dev |
| ambos | — | totalmente suportado ✅ |

## Próximos passos

- Pratique: [adicionar um novo tipo de seção](../guides/adicionar-tipo-de-secao.md).
- E: [registrar uma seção no renderizador](../guides/registrar-secao-no-renderer.md).
- Quando some: [troubleshooting](../troubleshooting/problemas-comuns.md).
- [Voltar ao índice de core](./README.md)
