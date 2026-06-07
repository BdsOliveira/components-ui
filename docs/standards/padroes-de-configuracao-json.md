# Padrões de configuração JSON

> **Pré-requisitos**: [config.json](../clients/config-json.md),
> [schemas e validação](../core/schemas-e-validacao.md).
> **Tema**: standards

Regras de validação, estratégia de tipagem e evolução de schema para a
configuração JSON dos sites (FR-013).

## Regras de validação

Fonte: `sites/core/schemas/validate-website.ts`

- Todo `WebsiteConfig` é validado por `validateWebsiteConfig` antes do render —
  **nunca lança** (`safeParse`).
- `company`/`theme` ausentes/parciais recebem **defaults**; não são rejeição
  (exceto `company.name`, obrigatório).
- Cada item de `sections` é validado contra a **união viva** de tipos registrados.
- Qualquer seção inválida (`type` ausente/desconhecido/não registrado, ou slice
  ruim) **rejeita o config inteiro**. Sem saída quebrada silenciosa.
- A ordem de `sections` é preservada; a validação nunca reordena.

## Estratégia de tipagem

Fonte: `sites/core/schemas/base.ts`, `sites/core/schemas/website.ts`

- O **schema Zod é a fonte da verdade**; o tipo TS deriva via `z.infer` —
  nunca declarado em paralelo.
- Um object schema por bloco (`defineBlockSchema`); chaves desconhecidas são
  **removidas** (nunca mescladas silenciosamente).
- Campos com `.default()`/`.optional()` degradam graciosamente.
- Variantes são conjuntos fechados com um default (`blockVariant`).
- O config do cliente é tipado pela forma `TemplateOverrides`
  (`{ company?, theme?, content? }`) — ver `sites/templates/registry.ts`.

## Estratégia de evolução de schema

Fonte: `sites/core/schemas/section.ts`, `sites/core/components/sections/register.ts`

- Adicionar um campo **opcional/defaulted** a um bloco é compatível: configs
  antigos continuam válidos.
- Tornar um campo obrigatório é **breaking**: pode invalidar configs existentes —
  faça com migração de dados dos clientes.
- Adicionar um **tipo de seção** é aditivo: registre o par nos dois registries; não
  afeta tipos existentes (a união é reconstruída por chamada).
- Remover/renomear um `type` é breaking: configs que o usam passam a falhar a
  validação.
- O `registry` é idempotente por `type` (re-registrar substitui), então a evolução
  é localizada em `register.ts` + o schema do bloco.

## Próximos passos

- Pratique: [adicionar uma seção a um site existente](../guides/adicionar-secao-a-site-existente.md).
- Crie um schema: [criar um novo schema JSON](../guides/criar-novo-schema-json.md).
- Padrões de código gerais: [padrões de desenvolvimento](./padroes-de-desenvolvimento.md).
- [Voltar ao índice de padrões](./README.md)
