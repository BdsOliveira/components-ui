# Implementation Plan: Sistema de Documentação para Desenvolvedores (PT-BR)

**Branch**: `009-developer-docs-system` | **Date**: 2026-06-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-developer-docs-system/spec.md`

## Summary

Produzir o manual de engenharia interno da plataforma — um sistema de
documentação completo em PT-BR sob `docs/` — que permita a qualquer
desenvolvedor entender, usar, manter e escalar o starter-kit Nuxt sem
orientação do autor original. A abordagem técnica: arquivos Markdown
versionados, diagramas em Mermaid (texto versionável, não imagens binárias),
exemplos extraídos diretamente do código real do repositório (schemas Zod,
registries, `SiteRenderer`/`DynamicSection`, templates de nicho, `config.json`
de clientes), e um template reutilizável de documento para garantir
consistência futura. A documentação é o produto; nenhum código de runtime da
plataforma é alterado.

## Technical Context

**Language/Version**: Markdown (CommonMark/GFM) em PT-BR; diagramas em Mermaid.
Exemplos de código referenciam TypeScript 5 / Vue 3 / Nuxt 4 existentes (não
introduz código novo).

**Primary Dependencies**: Nenhuma dependência nova de runtime. Renderização de
Mermaid e Markdown é nativa do GitHub e da maioria dos visualizadores;
opcionalmente Nuxt Content poderia servir os docs no futuro (fora de escopo).

**Storage**: Arquivos no diretório `docs/` na raiz do repositório, versionados
em git. Sem banco de dados.

**Testing**: Validação por inspeção contra critérios de sucesso (SC-001..008) +
verificação de fidelidade dos exemplos ao repositório (FR-021/SC-006). Checagem
manual de links internos (sem becos sem saída, SC-007). Sem testes automatizados
de código (feature é conteúdo, não código executável).

**Target Platform**: Repositório git / leitores de Markdown (GitHub, IDE,
visualizadores locais). Independente de SO.

**Project Type**: Documentação (conteúdo versionado), camada transversal sobre o
projeto web Nuxt existente.

**Performance Goals**: Não aplicável (conteúdo estático). Métricas de sucesso são
de onboarding (tempo até rodar / criar cliente) — ver SC-001/SC-002.

**Constraints**: Todo conteúdo em PT-BR (FR-002); exemplos DEVEM refletir o
estado real do repositório, sem inventar APIs (FR-021); cada documento DEVE
linkar próximos passos (FR-004); diagramas em texto versionável (Assumptions).

**Scale/Scope**: 11 subpastas temáticas sob `docs/`, 1 README/índice principal,
≥13 guias How-To, 5 diagramas obrigatórios, 1 template reutilizável de documento,
e documentos de padrões/troubleshooting. Estimativa ~30–40 arquivos Markdown.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Esta feature é puramente documental — não adiciona componentes, schemas,
templates nem código de cliente. A conformidade é avaliada quanto à coerência da
documentação com cada princípio, e quanto a não violar nenhum.

| Princípio | Avaliação | Status |
|-----------|-----------|--------|
| I. Modular & Composable | A doc ENSINA composição (montar de blocos, nunca do zero) e descreve o modelo Lego. Não altera código. | ✅ PASS |
| II. Layered System Design | A doc documenta explicitamente as 4 camadas e fronteiras (FR-005/FR-006); `docs/` é camada transversal de conteúdo, não código que cruza camadas. | ✅ PASS |
| III. Core Engine Neutrality | A doc descreve a neutralidade do core; não adiciona lógica a `core/`. | ✅ PASS |
| IV. JSON-Driven Rendering | Pilar central documentado em detalhe (FR-009/FR-013). | ✅ PASS |
| V. Reusable Component Philosophy | Padrões de componente "válido" documentados (FR-011/FR-012). | ✅ PASS |
| VI. Niche-Based Templates | Estratégia de template de nicho documentada; guia de criação reforça ordem fixa (não layouts custom). | ✅ PASS |
| VII. Speed-First | A doc REDUZ fricção de onboarding (SC-001/SC-002) — alinhada. | ✅ PASS |
| VIII. Developer Experience | É a própria entrega: DX via documentação + template reutilizável (FR-016/FR-020). | ✅ PASS |
| IX. Performance & Web Vitals | Documentado no contexto de SSR/SSG e deploy; sem impacto de runtime. | ✅ PASS |
| X. UX Consistency | Documentado nos padrões de seção/componente. | ✅ PASS |
| XI. Testing & Reliability | A doc descreve convenções de teste (FR-016) e o gate de validação do scaffold. | ✅ PASS |
| XII. Multi-Client Scalability | Isolamento de cliente documentado (camada clients). | ✅ PASS |
| XIII. Deployment Discipline | Documentado distinguindo "hoje" de "evolução" (deploy ainda não implementado). | ✅ PASS |
| XIV. Anti-Pattern Prohibition | A doc lista anti-padrões por camada (FR-006) — reforça o princípio. | ✅ PASS |
| XV. Long-Term Vision | Seção de escala futura cobre SaaS, builders visuais, IA, CMS, automação (FR-019). | ✅ PASS |

**Resultado**: Sem violações. Nenhuma entrada em Complexity Tracking.

Ponto de disciplina (não-violação): READMEs já existem junto ao código em
`sites/core/*`. A doc em `docs/` é o índice integrado e NÃO duplica conteúdo —
aponta para a fonte da verdade (schemas/registries) e linka aos READMEs próximos
do código, evitando o anti-padrão de duplicação (Princípio XIV).

## Project Structure

### Documentation (this feature)

```text
specs/009-developer-docs-system/
├── plan.md              # Este arquivo (/speckit-plan)
├── research.md          # Fase 0 — decisões de formato/estrutura/diagramas
├── data-model.md        # Fase 1 — modelo de conteúdo (Documento, Guia, Diagrama, Template)
├── quickstart.md        # Fase 1 — como navegar/contribuir com a doc
├── contracts/
│   ├── docs-structure-contract.md   # estrutura de pastas + arquivos obrigatórios
│   └── doc-template-contract.md      # formato padrão de um documento/guia
└── tasks.md             # Fase 2 (/speckit-tasks — NÃO criado aqui)
```

### Source Code (repository root)

A entrega cria um novo diretório `docs/` na raiz, espelhando as 11 subpastas
temáticas exigidas. Documenta — sem modificar — a árvore de runtime existente.

```text
docs/                                # NOVO — sistema de documentação (PT-BR)
├── README.md                        # índice/manual principal (FR-003)
├── _templates/
│   └── documento-modelo.md          # template reutilizável de doc (FR-020)
├── getting-started/                 # instalação, rodar dev, primeiro cliente (US1)
├── architecture/                    # arquitetura em camadas + diagramas (FR-005/FR-006/FR-015)
├── core/                            # motor: schemas, validação, registries, composables
├── templates/                       # estratégia de nicho + composição (FR-015)
├── clients/                         # config.json, isolamento, domínios
├── components/                      # padrões de componente "válido" (FR-011/FR-012)
├── onboarding/                      # fluxo de onboarding (hoje vs futuro)
├── deployment/                      # deploy (hoje vs futuro)
├── guides/                          # ≥13 guias How-To (FR-007/FR-008)
├── standards/                       # padrões de dev + config JSON (FR-013/FR-016)
└── troubleshooting/                 # 7+ sintomas (FR-017)

# ÁRVORE DE RUNTIME EXISTENTE (documentada, NÃO alterada):
sites/
├── core/{schemas,components,composables,seo,forms,theme,types,utils}
├── templates/{clinic,lawyer,local-business,restaurant,school}
├── clients/<name>/{config.json,domain.txt,images/}
├── scripts/new-client.ts
└── onboarding/
app/{app.vue,pages/index.vue,plugins/register-sections.ts}
```

**Structure Decision**: Diretório único `docs/` na raiz (espelhando exatamente
as 11 subpastas do FR-001) como camada transversal de conteúdo sobre o projeto
Nuxt existente. Escolhido por: (1) o FR-001 fixa essa árvore; (2) raiz é o ponto
de entrada natural para um manual de engenharia; (3) mantém os READMEs próximos
ao código intactos como fonte da verdade local, com `docs/` integrando e
linkando. Os artefatos de código real referenciados vivem em `sites/` e `app/`
e são apenas descritos, nunca modificados por esta feature.

## Complexity Tracking

> Sem violações de Constitution Check. Nada a justificar.
