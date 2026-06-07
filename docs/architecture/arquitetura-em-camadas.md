# Arquitetura em camadas

> **Pré-requisitos**: [Índice de arquitetura](./README.md).
> **Tema**: architecture

A plataforma é dividida em quatro camadas com responsabilidade única. Entender as
fronteiras é o que evita regressões e acoplamento. Para cada camada, abaixo está o
que **pertence**, o que **NUNCA pertence** e o **anti-padrão** a evitar.

## As quatro camadas

Fonte: `.specify/memory/constitution.md` (Princípio II), `sites/`, `app/`

| Camada | Caminho real | Pertence | NUNCA pertence | Anti-padrão |
|--------|--------------|----------|----------------|-------------|
| **Core (motor)** | `sites/core/` | schemas, validação, registries, renderer, composables, SEO utils, theme system, tipos | conteúdo de cliente, lógica de negócio específica, layouts de um cliente | hardcode de cliente no core |
| **Componentes reutilizáveis** | `sites/core/components/` | seções genéricas, UI, layout; configuráveis por props, theme-aware, acessíveis | texto/imagens fixos de um cliente, acoplamento a um nicho | componente acoplado/duplicado |
| **Templates (nicho)** | `sites/templates/<nicho>/` | ordem fixa de seções (`page.ts`), tema (`theme.ts`), conteúdo padrão (`defaults.json`) | lógica duplicada, layout custom por cliente | template monolítico/custom one-off |
| **Configuração de cliente** | `sites/clients/<name>/` | `config.json`, `domain.txt`, `images/` | código, lógica, schemas | lógica hardcoded no cliente |

## A regra de dependência (só-para-baixo)

Fonte: `.specify/memory/constitution.md` (Princípio II), `sites/templates/clinic/page.ts`

Dependências só apontam **para baixo**: templates e clients dependem de `core`,
**nunca o inverso**. O `core` jamais importa de `templates`, `clients` ou
`onboarding`. Vazamento entre camadas é violação.

O dispatch que liga um cliente ao seu template vive no `app/` (`app/pages/index.vue`),
**nunca no `core`** — assim o motor permanece neutro (Princípios II/III).

Fonte: `app/pages/index.vue`

```ts
import { validateWebsiteConfig } from '~~/sites/core/schemas'
import { templateRegistry } from '~~/sites/templates/registry'
// app conhece core E templates; core não conhece nenhum dos dois.
```

Essa regra é **garantida por lint**: blocos sob `sites/core/components/**` não
podem importar de `clients/` nem `onboarding/`.

Fonte: `eslint.config.mjs`

```js
{
  files: ['sites/core/components/**'],
  rules: {
    'no-restricted-imports': ['error', { patterns: [{
      group: ['**/clients/**', '~/sites/clients/**', '@/sites/clients/**', '**/onboarding/**'],
      message: 'Blocks must be client-neutral and isolated ...',
    }]}],
  },
}
```

## Como a camada decide "onde coloco isto?"

- É uma regra de validação ou um tipo compartilhado? → `core/schemas`.
- É um pedaço de UI genérico, dirigido por `data`? → `core/components`.
- É a ordem/identidade visual de um nicho? → `templates/<nicho>`.
- É texto, cor ou imagem de UM negócio? → `clients/<name>/config.json`.
- É o "qual cliente/template renderizar"? → `app/`, nunca `core`.

## Próximos passos

- O PORQUÊ disso tudo: [filosofia operacional](./filosofia-operacional.md).
- Veja as fronteiras desenhadas: [diagramas](./diagramas.md).
- Estenda com segurança: [adicionar um componente](../guides/adicionar-componente.md).
- [Voltar ao índice principal](../README.md)
