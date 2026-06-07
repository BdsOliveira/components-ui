# Escala futura

> **Pré-requisitos**: [Filosofia operacional](../architecture/filosofia-operacional.md).
> **Tema**: standards

Como as decisões atuais preparam a plataforma para crescer, e o que ainda é visão
(FR-019). O alvo de longo prazo: um **sistema operacional de sites comerciais**
capaz de gerar e onboardar com automação e IA, escalando a centenas de clientes com
mínimo overhead (Princípio XV).

## Times com múltiplos desenvolvedores

Fonte: `.specify/memory/constitution.md` (Princípios II, VIII), `eslint.config.mjs`

- As **camadas** com fronteiras claras (e barradas por lint) permitem trabalho
  paralelo sem colisão: um time evolui o `core`, outro adiciona templates/clientes.
- Schemas como fonte da verdade e o template reutilizável de documento
  (`docs/_templates/documento-modelo.md`) mantêm consistência entre pessoas.

## Evolução para SaaS

Fonte: `.specify/memory/constitution.md` (Princípio XII), `app/pages/index.vue`

- O **isolamento por cliente** (`sites/clients/<name>/`) e a descoberta por glob são
  o pré-requisito do white-label e do SaaS — adicionar cliente é zero-edição no app.
- Hoje a seleção é por env `CLIENT` (um build por cliente); a evolução multi-tenant
  (seleção por domínio em runtime) é construída sobre essa mesma isolação.

## Builders visuais

Fonte: `sites/core/schemas/json-schema.ts`, `sites/core/schemas/section.ts`

- O config é **dado tipado e validável**; a emissão de **JSON-Schema**
  (`blockJsonSchema`) habilita editores visuais que produzem `config.json` válido
  sem tocar código.
- O conjunto fechado de variantes e seções registradas dá ao builder um catálogo
  determinístico.

## Sites gerados por IA

Fonte: `sites/core/schemas/json-schema.ts`, `.specify/memory/constitution.md` (Princípios IV, XV)

- Como criar um site é **produzir JSON válido**, um agente de IA pode gerar
  `config.json` a partir de um brief, guiado pelo JSON-Schema dos blocos, e validar
  com `validateWebsiteConfig` antes de publicar.

## Integração com CMS

Fonte: `sites/onboarding/README.md`, `sites/core/schemas/`

- A camada `onboarding/` (dados de intake) é o ponto de acoplamento natural a um
  CMS: o CMS alimenta o onboarding, que vira `config.json` por uma factory de
  template — sem mudar o motor.

## Pipelines de automação

Fonte: `sites/scripts/new-client.ts`, `package.json`, `.specify/memory/constitution.md` (Princípio XIII)

- O scaffold (`npm run new-client`) com portão de validação é o primeiro passo de
  automação; um pipeline pode encadear scaffold → build por cliente
  (`CLIENT=<name> npm run generate`) → deploy.
- O alvo de deploy (Vercel, CI/CD, preview) é disciplina declarada, ainda **não**
  implementada — ver [deployment](../deployment/deploy.md).

## Como não bloquear o futuro

Evite os anti-padrões (hardcode de cliente, layout custom, dependências em excesso):
cada um quebra a isolação e a automação que tornam esses cenários possíveis. Ver
[filosofia operacional](../architecture/filosofia-operacional.md).

## Próximos passos

- O onboarding hoje vs futuro: [fluxo de onboarding](../onboarding/fluxo-de-onboarding.md).
- O deploy hoje vs futuro: [deployment](../deployment/deploy.md).
- [Voltar ao índice de padrões](./README.md)
