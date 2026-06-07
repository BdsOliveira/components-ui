# Padrões de desenvolvimento

> **Pré-requisitos**: [Padrões](./README.md),
> [arquitetura em camadas](../architecture/arquitetura-em-camadas.md).
> **Tema**: standards

Convenções de código que mantêm a plataforma consistente conforme contribuidores e
clientes crescem (FR-016). Parte-se de TypeScript estrito e composição.

## Organização de código

Fonte: `sites/`, `.specify/memory/constitution.md` (Princípios II, VIII)

- Quatro camadas com responsabilidade única (`core`, `components`, `templates`,
  `clients`); dependência só-para-baixo. Ver
  [arquitetura em camadas](../architecture/arquitetura-em-camadas.md).
- Barrels (`index.ts`) re-exportam de cada área (`schemas/index.ts`,
  `types/index.ts`) — importe do barrel, não de caminhos profundos.

## TypeScript

Fonte: `.specify/memory/constitution.md` (Technology Constraints), `tsconfig.json`, `sites/core/schemas/base.ts`

- **Strict mode** em todas as camadas; sem `any` implícito.
- Tipos de dado são **derivados do schema Zod** (`z.infer`), nunca declarados em
  paralelo. O schema é a fonte da verdade.
- `tsconfig.json` referencia os projetos gerados pelo Nuxt em `.nuxt/`.

## Composables

Fonte: `sites/core/composables/`

- Composables (`useX`) encapsulam lógica com estado/contexto; vivem em
  `sites/core/composables/` (ex.: `useSiteTheme`, `useSiteCompany`).
- Padrão provide/inject para contexto de site (tema/empresa), sem prop-drilling e
  sem estado global mutável.

## Imports

Fonte: `nuxt.config.ts`, `eslint.config.mjs`, `app/pages/index.vue`

- Alias `~~` = raiz do repo (ex.: `~~/sites/core/schemas`); `~` = `app/`.
- Componentes do **motor** (`SiteRenderer`, `DynamicSection`) são auto-importáveis;
  os componentes de seção concretos **não** — chegam só via registry (dispatch
  determinístico e tree-shakeable).
- **Lint barra** imports de `clients/`/`onboarding/` dentro de
  `sites/core/components/**` (blocos client-neutros).

## Nomenclatura

Fonte: `sites/core/components/sections/`, `sites/core/schemas/`, `sites/templates/registry.ts`

| Item | Convenção | Exemplo |
|------|-----------|---------|
| Componente de seção | PascalCase + `Section` | `HeroSection.vue` |
| Schema de bloco | `<nome>Schema` em `schemas/<nome>.ts` | `heroSchema` |
| Tipo de config | `<Nome>Config` (via `z.infer`) | `HeroConfig` |
| `type` de seção | string minúscula | `'hero'`, `'services'` |
| Template (registry key) | kebab-case | `'local-business'` |
| Factory de template | `create<Pascal>Site` | `createClinicSite` |
| Composable | `use<Nome>` | `useSiteTheme` |
| Cliente (slug) | kebab-case | `clinica-saude` |

## Convenções de teste

Fonte: `vitest.config.ts`, `package.json`, `.specify/memory/constitution.md` (Princípio XI)

- **Vitest**; rode com `npm run test` (`vitest run`).
- Specs em `sites/**/__tests__/**/*.spec.ts` (padrão de `include`).
- Ambiente `happy-dom`; componentes Vue montam com `@vue/test-utils` sem Nuxt
  completo (os componentes do motor importam suas primitivas Vue explicitamente).
- Fluxos críticos validados: render de onboarding/template, SEO, geração de deploy,
  parsing de config (Princípio XI). O scaffold roda um portão `vitest` antes de
  promover um cliente novo.

## Convenções de commit

Fonte: `.git` (histórico), `.specify/memory/constitution.md` (Governance)

- O histórico usa **Conventional Commits** (`feat:`, `fix:`, ...). Ex.:
  `feat: add task list for Automatic Client Scaffold`.
- Mensagem no imperativo, escopo claro; mudanças que afetam clientes/schemas/
  templates incluem nota de migração quando aplicável (Governance).

## Próximos passos

- Critérios de componente: [padrões de componente](../components/padroes-de-componente.md).
- Regras de JSON: [padrões de configuração JSON](./padroes-de-configuracao-json.md).
- Visão de longo prazo: [escala futura](./escala-futura.md).
- [Voltar ao índice de padrões](./README.md)
