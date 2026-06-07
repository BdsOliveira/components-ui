# Manual de Engenharia — Plataforma de Sites Comerciais (Nuxt)

> **Pré-requisitos**: Nenhum. Este é o ponto de entrada da documentação.
> **Tema**: índice principal

Este é o manual de engenharia interno da plataforma. Ele permite que qualquer
desenvolvedor entenda, use, mantenha e escale o starter-kit sem depender do autor
original. Tudo em português do Brasil (PT-BR); termos técnicos consagrados do
ecossistema permanecem em inglês e são explicados na primeira ocorrência.

> A **fonte da verdade** é sempre o código. Esta documentação aponta para os
> arquivos reais (schemas Zod, registries, renderer) em vez de duplicar regras —
> quando o código evolui, os caminhos citados são onde conferir.

## 1. O que é a plataforma

Um starter-kit **multi-cliente** em Nuxt 4 (Vue 3, Nitro) para publicar sites
comerciais completos montando **blocos reutilizáveis** orquestrados por
**templates de nicho** e dirigidos por **dados JSON** — não por código sob medida.
Um site novo é uma pasta de cliente com um `config.json`, não um projeto novo.

Fonte: `.specify/memory/constitution.md`, `nuxt.config.ts`

## 2. Missão do projeto

Publicar sites comerciais em menos de 2 horas usando blocos de UI reutilizáveis,
dados de onboarding estruturados e templates de nicho predefinidos. Otimiza para
entrega ultrarrápida, manutenibilidade, escala e arquitetura orientada a JSON
(`Constitution`, Mission + Princípios I, IV, VII).

## 3. Como a arquitetura funciona

Quatro camadas, com dependência só-para-baixo (templates/clients → core, nunca o
inverso). O dispatch cliente→template vive no `app/`, jamais no `core`.

Fonte: `.specify/memory/constitution.md` (Princípio II), `sites/`, `app/`

| Camada | Caminho | Papel |
|--------|---------|-------|
| Core (motor) | `sites/core/` | schemas, validação, registries, renderer, composables, SEO, theme |
| Componentes | `sites/core/components/` | seções genéricas, configuráveis por props, theme-aware |
| Templates (nicho) | `sites/templates/<nicho>/` | ordem fixa de seções + tema + conteúdo padrão |
| Clientes | `sites/clients/<name>/` | `config.json`, `domain.txt`, `images/` |

Detalhe completo: [arquitetura em camadas](./architecture/arquitetura-em-camadas.md).

## 4. Como sites são gerados

A cadeia canônica vai do `config.json` ao DOM:

Fonte: `app/pages/index.vue`, `sites/templates/registry.ts`, `sites/core/schemas/validate-website.ts`, `sites/core/components/render/SiteRenderer.vue`

1. `app/pages/index.vue` descobre todo `sites/clients/*/config.json` por glob e
   seleciona o cliente pela env `CLIENT` (default `clinica-saude`).
2. Despacha pelo discriminador `template` via `sites/templates/registry.ts`.
3. A factory do template (ex.: `createClinicSite`) mescla `defaults.json` +
   `theme.ts` + overrides do cliente, produzindo um `WebsiteConfig`.
4. `validateWebsiteConfig` valida o site inteiro (Zod). Inválido nunca renderiza.
5. `<SiteRenderer>` itera as seções em ordem; cada `<DynamicSection>` resolve o
   componente pelo `type` e o renderiza com seu slice de dados.

Aprofunde em [motor de renderização](./core/motor-de-renderizacao.md).

## 5. Filosofia JSON-driven

Todo site é dirigido por configuração tipada e validada antes do render. Criar um
site **não** exige editar código-fonte: é dado. O `config.json` do cliente é
`{ template, company, theme, content }` — **não** é o `WebsiteConfig` final
`{ company, theme, sections[] }`; a factory do template faz a transformação.

Fonte: `.specify/memory/constitution.md` (Princípio IV), `sites/clients/clinica-saude/config.json`, `sites/templates/clinic/page.ts`

Detalhe: [padrões de configuração JSON](./standards/padroes-de-configuracao-json.md).

## 6. Arquitetura em camadas

Cada camada declara o que pertence, o que NUNCA pertence e o anti-padrão a evitar.
Veja a tabela canônica em
[arquitetura em camadas](./architecture/arquitetura-em-camadas.md) (FR-005/FR-006).

## 7. Rodar o projeto localmente

Fonte: `README.md`, `package.json`

```bash
npm install      # instala dependências (postinstall roda `nuxt prepare`)
npm run dev      # sobe o dev server em http://localhost:3000
```

Passo a passo: [getting-started](./getting-started/README.md).

## 8. Criar um novo cliente

Fonte: `package.json`, `sites/scripts/new-client.ts`

```bash
npm run new-client   # pergunta nome (kebab-case), template e domínio
```

O comando escreve uma pasta `sites/clients/<name>/` completa e validada. Guia:
[criar um novo cliente](./guides/criar-novo-cliente.md).

## 9. Modo de desenvolvimento

Fonte: `nuxt.config.ts`, `app/pages/index.vue`

O cliente renderizado é escolhido pela env `CLIENT`:

```bash
npm run dev                       # default: clinica-saude
CLIENT=<name> npm run dev         # qualquer cliente existente
```

Detalhe: [rodar em dev](./getting-started/rodar-em-dev.md).

## 10. Como funcionam os deployments

Hoje o build é estático por cliente (`CLIENT=<name> npm run generate`); o alvo de
deploy automatizado (Vercel, CI/CD) é visão de evolução, ainda não implementada —
a doc distingue "hoje" de "futuro".

Fonte: `package.json`, `.specify/memory/constitution.md` (Princípio XIII)

Detalhe: [deployment](./deployment/deploy.md).

---

## Mapa da documentação

- [getting-started/](./getting-started/README.md) — instalar, rodar dev, primeiro cliente
- [architecture/](./architecture/README.md) — camadas, filosofia, diagramas
- [core/](./core/README.md) — motor de render, schemas/validação, registries
- [templates/](./templates/README.md) — estratégia de nicho e composição
- [clients/](./clients/README.md) — `config.json`, isolamento, domínios
- [components/](./components/README.md) — padrões de componente "válido"
- [onboarding/](./onboarding/README.md) — fluxo de onboarding (hoje vs futuro)
- [deployment/](./deployment/README.md) — deploy (hoje vs futuro)
- [guides/](./guides/README.md) — 13 guias How-To
- [standards/](./standards/README.md) — padrões de dev, JSON, escala futura
- [troubleshooting/](./troubleshooting/README.md) — sintoma → causa → correção

## Glossário (termos técnicos em inglês)

| Termo | Significado nesta plataforma |
|-------|------------------------------|
| **composable** | Função Vue reutilizável (`useX`) que encapsula lógica com estado/contexto; ex.: `useSiteTheme`. |
| **prop** | Entrada tipada de um componente Vue; aqui as seções recebem um único `data`. |
| **slot** | Ponto de extensão de markup de um componente Vue. |
| **registry** | Mapa autoritativo `type → algo`. Há dois: schema (`section.ts`) e componente (`registry.ts`). |
| **discriminated union** | União Zod/TS desambiguada por um campo literal — aqui `type` da seção. |
| **schema** | Definição Zod que valida e tipa um dado; é a fonte da verdade dos props. |
| **hydration** | Processo de "religar" o HTML renderizado no servidor com a interatividade no cliente. |
| **SSR / SSG** | Server-Side Rendering / Static Site Generation (Nuxt/Nitro). |
| **fallback** | Comportamento de degradação seguro (ex.: `type` não registrado → renderiza nada). |
| **factory** | Função do template que constrói um `WebsiteConfig` a partir de overrides. |
| **slug** | Identificador em kebab-case, seguro como pasta e segmento de URL. |
| **glob** | Padrão de caminho (`*`) usado para descobrir arquivos (ex.: `clients/*/config.json`). |

## Próximos passos

- Comece por [getting-started](./getting-started/README.md).
- Entenda o todo em [arquitetura em camadas](./architecture/arquitetura-em-camadas.md).
- Vá direto a um [guia How-To](./guides/README.md).
