# Core — o motor

> **Pré-requisitos**: [Arquitetura em camadas](../architecture/arquitetura-em-camadas.md).
> **Tema**: core

O `core` (`sites/core/`) é o motor neutro de negócio: schemas, validação,
registries, renderer, composables, SEO e theme. Esta seção explica como ele
transforma `config.json` em DOM.

## Documentos

- [Motor de renderização](./motor-de-renderizacao.md) — `SiteRenderer`,
  `DynamicSection`, resolução por `type`, fallback, contenção de erro, ciclo de vida.
- [Schemas e validação](./schemas-e-validacao.md) — Zod, `WebsiteConfig`,
  `validateWebsiteConfig`.
- [Registries](./registries.md) — o conceito "dois registries" (schema + componente).

## A cadeia canônica (resumo)

Fonte: `app/pages/index.vue`, `sites/core/schemas/validate-website.ts`, `sites/core/components/render/`

`config.json` → seleção por `CLIENT` → dispatch por `template` → factory →
`WebsiteConfig` → `validateWebsiteConfig` → `<SiteRenderer>` → `<DynamicSection>` →
componente da seção. Diagrama completo em [motor de renderização](./motor-de-renderizacao.md).

## Próximos passos

- Entenda o render: [motor de renderização](./motor-de-renderizacao.md).
- Entenda a validação: [schemas e validação](./schemas-e-validacao.md).
- [Voltar ao índice principal](../README.md)
