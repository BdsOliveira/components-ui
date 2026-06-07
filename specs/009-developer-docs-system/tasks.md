---
description: "Task list — Sistema de Documentação para Desenvolvedores (PT-BR)"
---

# Tasks: Sistema de Documentação para Desenvolvedores (PT-BR)

**Input**: Design documents from `/specs/009-developer-docs-system/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Não há testes automatizados — a entrega é conteúdo (Markdown/Mermaid).
A validação é por inspeção contra SC-001..008 e CT-1..CT-10 (research D7).

**Organization**: Tarefas agrupadas por user story (P1..P3) para entrega e
verificação independentes. Cada documento cita fonte real do repo (FR-021).

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: pode rodar em paralelo (arquivo diferente, sem dependência pendente)
- **[Story]**: user story a que pertence (US1..US5)
- Caminhos de arquivo exatos em cada descrição

## Path Conventions

Documentação sob `docs/` na raiz (plan.md → Structure Decision). Código real
referenciado vive em `sites/` e `app/` e NÃO é alterado por esta feature.

---

## Phase 1: Setup (infraestrutura compartilhada)

- [X] T001 Criar a árvore de diretórios da documentação: `docs/` com as 11 subpastas (`getting-started/`, `architecture/`, `core/`, `templates/`, `clients/`, `components/`, `onboarding/`, `deployment/`, `guides/`, `standards/`, `troubleshooting/`) e `docs/_templates/`, conforme `contracts/docs-structure-contract.md` §C1

---

## Phase 2: Foundational (PRÉ-REQUISITO BLOQUEANTE de todas as stories)

**Objetivo**: artefatos que todo documento referencia/segue. Concluir antes das stories.

- [X] T002 [P] Criar o template reutilizável `docs/_templates/documento-modelo.md` com o esqueleto de Documento (C1) e a variante de Guia How-To (C2), seguindo `contracts/doc-template-contract.md` (DT-1..DT-4, GT-1..GT-3, FR-020)
- [X] T003 [P] Criar `docs/README.md` (índice/manual principal) cobrindo os 10 tópicos do FR-003 (o que é, missão, arquitetura, geração de sites, filosofia JSON-driven, camadas, rodar local, criar cliente, dev mode, deploy) + glossário PT-BR de termos técnicos (D2/CT-2); fonte: `README.md`, `package.json`
- [X] T004 [P] Criar `docs/guides/README.md` indexando os 13 guias How-To do FR-007 conforme nomes em `contracts/docs-structure-contract.md` §C1

**Checkpoint**: estrutura + template + índices prontos — stories podem começar.

---

## Phase 3: User Story 1 — Onboarding de um novo desenvolvedor (Priority: P1) 🎯 MVP

**Goal**: um dev sem contexto roda o projeto e cria seu primeiro cliente usando
só a documentação (SC-001 <15min rodar dev; SC-002 <30min criar cliente).

**Independent Test**: entregar `docs/getting-started/` a alguém que nunca viu o
repo e confirmar que ele inicia o dev mode e vê um cliente renderizado, sem ajuda.

- [X] T005 [P] [US1] Criar `docs/getting-started/README.md` (índice da seção + pré-requisitos "nenhum")
- [X] T006 [P] [US1] Criar `docs/getting-started/instalacao.md`: clonar, `npm install`, requisitos; fonte: `package.json`, `nuxt.config.ts`
- [X] T007 [P] [US1] Criar `docs/getting-started/rodar-em-dev.md`: `npm run dev`, seleção de cliente via env `CLIENT` (default `clinica-saude`); fonte: `app/pages/index.vue`, `nuxt.config.ts`
- [X] T008 [P] [US1] Criar `docs/getting-started/primeiro-cliente.md`: rodar `npm run new-client`, ver renderizado; fonte: `sites/scripts/new-client.ts`, `package.json`
- [X] T009 [P] [US1] Criar `docs/guides/criar-novo-cliente.md` (5 seções FR-008); fonte: `sites/scripts/new-client.ts`, `sites/clients/clinica-saude/config.json`; linkar de `docs/guides/README.md`

**Checkpoint**: US1 entregável e testável de forma independente (MVP).

---

## Phase 4: User Story 2 — Estender a plataforma com segurança (Priority: P1)

**Goal**: dev adiciona tipo de seção / componente / template / schema sem violar
camadas (SC-003 cobertura de guias; SC-004 fronteiras por camada claras).

**Independent Test**: pedir a adição de um novo tipo de seção seguindo só o guia
e confirmar que valida (schema) e renderiza (componente) sem editar fora do escopo.

### Arquitetura (referência compartilhada da story)

- [X] T010 [P] [US2] Criar `docs/architecture/README.md` (índice da seção)
- [X] T011 [US2] Criar `docs/architecture/arquitetura-em-camadas.md`: tabela das 4 camadas (pertence / NUNCA pertence / anti-padrão) e regra de dependência só-para-baixo (FR-005/FR-006/VR-6, data-model "Camada"); fonte: `sites/core/`, `sites/templates/`, `sites/clients/`, `app/pages/index.vue`
- [X] T012 [P] [US2] Criar `docs/architecture/filosofia-operacional.md`: o PORQUÊ das decisões, anti-hardcode, modelo Lego (FR-018); fonte: `.specify/memory/constitution.md`
- [X] T013 [US2] Criar `docs/architecture/diagramas.md` com diagrama Mermaid de **estrutura de pastas** e de **composição de templates** (FR-015/D3); fonte: árvore `sites/`, `app/`

### Core / motor de renderização

- [X] T014 [P] [US2] Criar `docs/core/README.md` (índice da seção)
- [X] T015 [US2] Criar `docs/core/motor-de-renderizacao.md`: como `SiteRenderer` itera e `DynamicSection` resolve por `type`, fallback (não registrado → nada + warn), contenção de erro por seção, ciclo de vida + diagrama Mermaid de **fluxo de renderização** (cadeia D5, FR-009/FR-010/FR-015); fonte: `sites/core/components/render/SiteRenderer.vue`, `sites/core/components/render/DynamicSection.vue`
- [X] T016 [P] [US2] Criar `docs/core/schemas-e-validacao.md`: Zod, `WebsiteConfig`, `validateWebsiteConfig` (nunca lança, rejeita config inteiro em seção inválida, defaults de company/theme); fonte: `sites/core/schemas/website.ts`, `sites/core/schemas/validate-website.ts`
- [X] T017 [US2] Criar `docs/core/registries.md`: conceito "dois registries" (schema `registerSection` + componente `registerSectionComponent`), boot via plugin (D6); fonte: `sites/core/schemas/section.ts`, `sites/core/components/sections/registry.ts`, `sites/core/components/sections/register.ts`, `app/plugins/register-sections.ts`

### Templates / Componentes

- [X] T018 [P] [US2] Criar `docs/templates/README.md` (índice da seção)
- [X] T019 [US2] Criar `docs/templates/estrategia-de-nicho.md`: template = ordem fixa (`page.ts`) + tema (`theme.ts`) + conteúdo padrão (`defaults.json`) orquestrando seções; ordem NÃO sobrescrevível (Princípio VI); fonte: `sites/templates/clinic/{page.ts,theme.ts,defaults.json}`, `sites/templates/registry.ts`
- [X] T020 [P] [US2] Criar `docs/components/README.md` (índice da seção)
- [X] T021 [US2] Criar `docs/components/padroes-de-componente.md`: o que torna um componente "válido" (nomenclatura, pasta, props, acessibilidade, responsividade, theme-aware, TypeScript, composabilidade) (FR-011/FR-012); fonte: `sites/core/components/sections/HeroSection.vue`, `sites/core/composables/useSiteTheme.ts`

### Guias de extensão (US2)

- [X] T022 [P] [US2] Criar `docs/guides/criar-novo-template.md` (5 seções FR-008); fonte: `sites/templates/clinic/*`, `sites/templates/registry.ts`
- [X] T023 [P] [US2] Criar `docs/guides/adicionar-componente.md` (5 seções FR-008); fonte: `sites/core/components/sections/`
- [X] T024 [P] [US2] Criar `docs/guides/adicionar-tipo-de-secao.md` (5 seções; VR-4/GT-2: AMBOS os registros); fonte: `sites/core/components/sections/register.ts`, `sites/core/schemas/section.ts`
- [X] T025 [P] [US2] Criar `docs/guides/registrar-secao-no-renderer.md` (5 seções; VR-4/GT-2); fonte: `sites/core/components/sections/registry.ts`, `register.ts`
- [X] T026 [P] [US2] Criar `docs/guides/criar-novo-schema-json.md` (5 seções FR-008; `defineBlockSchema`, `blockVariant`, emissão JSON-Schema); fonte: `sites/core/schemas/base.ts`, `sites/core/schemas/hero.ts`, `sites/core/schemas/json-schema.ts`

**Checkpoint**: US2 entregável — extensão segura documentada de ponta a ponta.

---

## Phase 5: User Story 3 — Manter e configurar sites existentes (Priority: P2)

**Goal**: editar `config.json`, tema, SEO, imagens, domínio de um site existente
(SC-003 cobertura de guias).

**Independent Test**: pedir edição de um `config.json` existente (nova seção +
tema) seguindo só os padrões JSON e confirmar que valida e renderiza.

- [X] T027 [P] [US3] Criar `docs/clients/README.md` (índice da seção)
- [X] T028 [US3] Criar `docs/clients/config-json.md`: estrutura `{ template, company, theme, content }`, campos obrigatórios/opcionais, distinção entre config do cliente e `WebsiteConfig` final (FR-013); fonte: `sites/clients/clinica-saude/config.json`, `app/pages/index.vue`
- [X] T029 [P] [US3] Criar `docs/clients/isolamento-e-dominios.md`: diretório isolado por cliente, `domain.txt`, descoberta por glob; fonte: `sites/clients/clinica-saude/{config.json,domain.txt}`, `app/pages/index.vue`
- [X] T030 [P] [US3] Criar `docs/standards/padroes-de-configuracao-json.md`: regras de validação, estratégia de tipagem, evolução de schema (FR-013); fonte: `sites/core/schemas/validate-website.ts`, `sites/core/schemas/section.ts`
- [X] T031 [P] [US3] Criar `docs/guides/adicionar-secao-a-site-existente.md` (5 seções FR-008); fonte: `sites/clients/clinica-saude/config.json`, `sites/templates/clinic/defaults.json`
- [X] T032 [P] [US3] Criar `docs/guides/customizar-tema-cores.md` (5 seções; sem hardcode em componente); fonte: `sites/core/schemas/theme.ts`, `sites/templates/clinic/theme.ts`, `sites/core/composables/useSiteTheme.ts`
- [X] T033 [P] [US3] Criar `docs/guides/adicionar-seo.md` (5 seções FR-008); fonte: `sites/core/seo/README.md`, `nuxt.config.ts`
- [X] T034 [P] [US3] Criar `docs/guides/adicionar-assets-imagens.md` (5 seções; convenção `/clients/<name>/images/...`); fonte: `sites/clients/clinica-saude/config.json`, `public/`
- [X] T035 [P] [US3] Criar `docs/guides/configurar-dominios.md` (5 seções FR-008); fonte: `sites/clients/clinica-saude/domain.txt`

**Checkpoint**: US3 entregável — manutenção/config diária documentada.

---

## Phase 6: User Story 4 — Diagnosticar e resolver problemas (Priority: P2)

**Goal**: sintoma → causa → correção para falhas comuns (SC-005 7 sintomas).

**Independent Test**: introduzir falha conhecida (ex.: `type` só no schema) e
confirmar que a entrada de troubleshooting leva à correção.

- [X] T036 [P] [US4] Criar `docs/troubleshooting/README.md` (índice da seção)
- [X] T037 [US4] Criar `docs/troubleshooting/problemas-comuns.md` cobrindo os 7 sintomas (seção não renderiza, config inválido, assets faltando, hidratação, SSR, deployment, resolução de template), cada um com sintoma/causa/correção (FR-017/CT-8); fonte: `sites/core/components/render/DynamicSection.vue`, `sites/core/schemas/validate-website.ts`, `app/pages/index.vue`

**Checkpoint**: US4 entregável — troubleshooting independente.

---

## Phase 7: User Story 5 — Padrões e escala futura (Priority: P3)

**Goal**: padrões de dev + visão de escala + onboarding/deploy documentados
(SC-008 critério objetivo de componente "válido" já em US2; aqui dev/scale).

**Independent Test**: revisar uma contribuição usando só `docs/standards/` e
decidir objetivamente aprovação.

- [X] T038 [P] [US5] Criar `docs/standards/README.md` (índice da seção)
- [X] T039 [P] [US5] Criar `docs/standards/padroes-de-desenvolvimento.md`: organização de código, TypeScript, composables, imports, nomenclatura de arquivo/seção/schema JSON, convenções de teste e de commit (FR-016); fonte: `eslint.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `sites/core/composables/`
- [X] T040 [P] [US5] Criar `docs/standards/escala-futura.md`: times múltiplos, SaaS, builders visuais, sites por IA, CMS, pipelines de automação (FR-019); fonte: `.specify/memory/constitution.md` (Princípio XV)
- [X] T041 [P] [US5] Criar `docs/onboarding/README.md` (índice da seção)
- [X] T042 [US5] Criar `docs/onboarding/fluxo-de-onboarding.md` + diagrama Mermaid de **fluxo de onboarding** (hoje vs futuro, FR-015); fonte: `sites/onboarding/README.md`, `sites/scripts/new-client.ts`
- [X] T043 [P] [US5] Criar `docs/deployment/README.md` (índice da seção)
- [X] T044 [US5] Criar `docs/deployment/deploy.md` + diagrama Mermaid de **fluxo de deployment** (hoje vs futuro; `nuxt generate`/`build`, alvo Vercel) (FR-015); fonte: `package.json`, `nuxt.config.ts`, `.specify/memory/constitution.md` (Princípio XIII)
- [X] T045 [P] [US5] Criar `docs/guides/como-funciona-deploy.md` (5 seções FR-008); fonte: `package.json`, `docs/deployment/deploy.md`
- [X] T046 [P] [US5] Criar `docs/guides/como-funciona-onboarding.md` (5 seções FR-008); fonte: `sites/scripts/new-client.ts`, `docs/onboarding/fluxo-de-onboarding.md`

**Checkpoint**: US5 entregável — padrões e visão de longo prazo.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T047 [P] Auditar links: todo documento sob `docs/` tem bloco "Próximos passos" com ≥1 link interno e retorno ao índice; nenhum beco sem saída (CT-4/SC-007)
- [X] T048 [P] Auditar fidelidade: todo snippet/estrutura tem `Fonte: <caminho real>` e o caminho existe no repo (CT-10/FR-021/SC-006)
- [X] T049 [P] Auditar idioma: PT-BR em todo conteúdo; termos técnicos em inglês explicados na 1ª ocorrência e presentes no glossário de `docs/README.md` (CT-2/D2)
- [X] T050 Validação final por inspeção contra SC-001..008 (spec) e CT-1..CT-10 (`contracts/docs-structure-contract.md`); confirmar 11 subpastas com README, 13 guias, 5 diagramas Mermaid, 7 sintomas de troubleshooting

---

## Dependencies & Execution Order

### Ordem entre fases
- **Setup (P1: T001)** → bloqueia tudo.
- **Foundational (P2: T002–T004)** → bloqueia todas as stories (template + índices).
- **User Stories (P3–P7)** → todas dependem de Foundational; entre si são
  INDEPENDENTES e podem ser feitas em qualquer ordem ou em paralelo por
  pessoas diferentes. Ordem recomendada = prioridade: US1 → US2 → US3 → US4 → US5.
- **Polish (P8: T047–T050)** → após as stories desejadas estarem prontas.

### Dependências internas relevantes
- T015 (motor) e T011 (camadas) são referência de muitos guias; preferir antes
  dos guias da US2, mas não bloqueiam (guias podem linkar a doc planejada).
- T042/T044 produzem diagramas referenciados por T046/T045 respectivamente.
- Tarefas marcadas `[P]` na mesma story tocam arquivos distintos → paralelizáveis.

### Independência das stories
Cada story entrega valor sozinha: US1 (rodar+criar), US2 (estender), US3
(configurar), US4 (diagnosticar), US5 (padrões/escala). Implementar só US1 já é
um MVP útil.

---

## Parallel Execution Examples

**Foundational** (após T001): T002, T003, T004 juntas.

**US1** (após Foundational): T005, T006, T007, T008, T009 — todas `[P]`, juntas.

**US2** índices em paralelo: T010, T014, T018, T020. Depois conteúdo: T012, T016
em paralelo; os 5 guias T022–T026 todos `[P]` juntos.

**US3**: T031, T032, T033, T034, T035 (5 guias) + T027, T029, T030 em paralelo.

**Cross-story**: com Foundational pronto, US1/US2/US3/US4/US5 podem rodar em
paralelo por times distintos (arquivos disjuntos).

**Polish**: T047, T048, T049 em paralelo; T050 por último (depende das auditorias).

---

## Implementation Strategy

### MVP (entrega mínima)
1. T001 (setup) → T002–T004 (foundational) → US1 (T005–T009).
2. **PARAR e validar**: um revisor frio roda o dev e cria um cliente só com a
   doc (SC-001/SC-002). Se passar, MVP entregue.

### Incremento
3. Adicionar US2 (extensão segura) → maior valor de manutenção/escala.
4. Adicionar US3 (configuração) e US4 (troubleshooting) — operação diária.
5. Adicionar US5 (padrões/escala) — consistência e visão de longo prazo.
6. Polish (T047–T050) antes de considerar a documentação "completa".

---

## Resumo

- **Total**: 50 tarefas (T001–T050).
- **Por story**: Setup 1 · Foundational 3 · US1 5 · US2 17 · US3 9 · US4 2 ·
  US5 9 · Polish 4.
- **Paralelismo**: ~40 tarefas marcadas `[P]` (arquivos disjuntos); 5 stories
  paralelizáveis após Foundational.
- **MVP**: US1 (T001–T009) — dev roda o projeto e cria cliente só com a doc.
- **Sem testes automatizados**: validação por inspeção (SC-001..008, CT-1..CT-10).
- **Formato**: todas as tarefas seguem `- [ ] TID [P?] [Story?] descrição + caminho`.
