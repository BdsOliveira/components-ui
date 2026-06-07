# Como adicionar metadados de SEO

> **Pré-requisitos**: [config.json](../clients/config-json.md).
> **Tema**: guides

## Explicação

SEO (Search Engine Optimization) define os metadados que buscadores e redes sociais
leem: título, descrição, Open Graph. Este guia distingue **como funciona hoje** de
**como deve evoluir** — a camada de helpers de SEO ainda não está implementada.

> **Hoje vs futuro**: `sites/core/seo/` é a casa reservada para utilitários de SEO
> config-driven, mas hoje contém **apenas o README** (responsabilidade declarada).
> Os helpers genéricos (título/meta/OG/structured data a partir de `company`/config)
> são evolução futura. Hoje, SEO se faz com as APIs nativas do Nuxt/unhead.

## Localização dos arquivos

Fonte: `sites/core/seo/README.md`, `nuxt.config.ts`, `package.json`

```text
sites/core/seo/README.md   # responsabilidade da camada SEO (helpers = futuro)
nuxt.config.ts             # módulos (@nuxt/image, fonts, scripts) e config global
```

A responsabilidade declarada da camada:

Fonte: `sites/core/seo/README.md`

```text
**Responsibility**: SEO meta utilities and helpers — generic functions for building
titles, meta tags, Open Graph, and structured data.
**Allowed**: Reusable, config-driven SEO helpers that any template/client can feed data into.
**Prohibited**: Actual page content or copy, client-specific meta values, and rendering logic.
```

## Exemplo prático (hoje)

O projeto inclui `@unhead/vue` (dependência em `package.json`); o Nuxt
disponibiliza `useSeoMeta`/`useHead` por auto-import. Para definir meta numa
página/seção:

Fonte: `package.json` (`@unhead/vue`), Nuxt meta APIs

```ts
useSeoMeta({
  title: company.name,
  description: company.tagline,
  ogTitle: company.name,
  ogDescription: company.tagline,
})
```

Os valores devem vir do `config.json` do cliente (ex.: `company.name`,
`company.tagline`), nunca hardcoded — coerente com a regra "config-driven".

## Convenções esperadas (incl. o alvo futuro)

Fonte: `sites/core/seo/README.md`, `.specify/memory/constitution.md` (Princípio IX)

- Helpers de SEO, quando existirem, vivem em `sites/core/seo/`, são **genéricos** e
  **config-driven** (recebem dados, não os contêm).
- **Proibido** em `core/seo`: copy/conteúdo real, valores meta de um cliente
  específico, lógica de render.
- Valores de SEO derivam do `config.json` (identidade em `company`).
- SEO é deliverable de performance (Princípio IX), não um extra.

## Erros comuns

| Sintoma | Causa | Correção |
|---------|-------|----------|
| meta fixo igual em todos os clientes | valor hardcoded | derive de `company`/config |
| esperar um helper em `core/seo` | helpers ainda não implementados | use `useSeoMeta`/`useHead` por ora |
| OG sem imagem | asset não referenciado | use caminho `/clients/<name>/images/...` |

Mais: [troubleshooting](../troubleshooting/problemas-comuns.md).

## Próximos passos

- Imagens para OG: [adicionar assets/imagens](./adicionar-assets-imagens.md).
- Visão de evolução: [escala futura](../standards/escala-futura.md).
- [Voltar ao índice de guias](./README.md)
