# Data Model — Conteúdo da Documentação

**Feature**: 009-developer-docs-system | **Date**: 2026-06-06

A feature não tem dados de runtime; o "modelo de dados" aqui é o **modelo de
conteúdo** da documentação — as entidades que estruturam os arquivos a produzir,
seus campos e regras. Derivado das Key Entities da spec.

---

## Entidade: Documento

Uma página Markdown sob `docs/`, pertencente a exatamente uma subpasta temática.

| Campo | Tipo | Obrigatório | Regra |
|-------|------|-------------|-------|
| `titulo` | string (H1) | sim | Primeiro `#` do arquivo, em PT-BR |
| `subpasta` | enum (11 temas) | sim | Uma de: getting-started, architecture, core, templates, clients, components, onboarding, deployment, guides, standards, troubleshooting |
| `pre_requisitos` | lista de links | sim* | *Pode ser "nenhum" no README/getting-started; senão lista docs a ler antes |
| `conteudo` | Markdown | sim | PT-BR; termos técnicos em inglês explicados na 1ª ocorrência (D2) |
| `proximos_passos` | lista de links | sim | ≥1 link de navegação (FR-004/SC-007) — nunca beco sem saída |
| `fontes` | lista de caminhos | condicional | Quando cita código/estrutura, lista o(s) caminho(s) reais de origem (FR-021/D4) |

**Regras de validação**
- VR-1: Todo Documento tem exatamente um H1 e ≥1 link em `proximos_passos`.
- VR-2: Nenhum snippet de código sem um caminho de origem real correspondente.
- VR-3: Idioma PT-BR; exceções de termo técnico documentadas no glossário do README.

---

## Entidade: Guia How-To (especialização de Documento)

Vive em `docs/guides/`. Além dos campos de Documento, é obrigatório conter as 5
seções do FR-008, nesta ordem:

| Seção | Conteúdo |
|-------|----------|
| `Explicação` | O que o guia resolve e quando usá-lo |
| `Localização dos arquivos` | Caminhos reais que serão criados/editados |
| `Exemplo prático` | Passo a passo com código/JSON real |
| `Convenções esperadas` | Nomenclatura, ordem, fronteiras de camada |
| `Erros comuns` | Armadilhas conhecidas + sintoma + correção |

**Conjunto obrigatório de Guias (FR-007)** — 13 guias:
1. Criar um novo site/cliente
2. Criar um novo template
3. Adicionar um componente reutilizável
4. Adicionar um novo tipo de seção
5. Registrar uma seção no renderizador
6. Criar um novo schema JSON
7. Adicionar uma seção a um site existente
8. Customizar temas/cores
9. Adicionar metadados de SEO
10. Adicionar assets/imagens
11. Configurar domínios
12. Como o deployment funciona
13. Como o fluxo de onboarding funciona

**Regra**: VR-4 — guias 4 e 5 DEVEM enfatizar o conceito "dois registries" (D6):
schema (`registerSection`) + componente (`registerSectionComponent`).

---

## Entidade: Diagrama

Bloco Mermaid (D3) embutido em um Documento. 5 diagramas obrigatórios (FR-015):

| Diagrama | Documento hospedeiro | Representa |
|----------|----------------------|------------|
| Estrutura de pastas | `architecture/` | Árvore `sites/` + `app/` + camadas |
| Fluxo de renderização | `core/` ou `architecture/` | Cadeia canônica D5 (config → DOM) |
| Fluxo de onboarding | `onboarding/` | Intake → config → site (hoje vs futuro) |
| Fluxo de deployment | `deployment/` | Build/generate → publicação (hoje vs futuro) |
| Composição de templates | `templates/` | Template = ordem fixa + tema + defaults orquestrando seções |

**Regra**: VR-5 — diagrama de fluxo de renderização DEVE refletir os nós reais da
cadeia D5 (index.vue → factory → validateWebsiteConfig → SiteRenderer →
DynamicSection → componente).

---

## Entidade: Template de documento

Artefato reutilizável em `docs/_templates/documento-modelo.md` (FR-020). Define o
esqueleto de Documento e a variante Guia How-To. É a base para novos docs.

| Campo | Regra |
|-------|-------|
| `esqueleto_documento` | H1, pré-requisitos, conteúdo, próximos passos |
| `esqueleto_guia` | Acrescenta as 5 seções obrigatórias do FR-008 |
| `instrucoes_de_uso` | Comentário no topo explicando como copiar/preencher |

---

## Entidade: Camada da arquitetura

Conceito documentado (não arquivo). Quatro camadas, cada uma com fronteiras
explícitas (FR-005/FR-006). Tabela canônica a reproduzir na doc de arquitetura:

| Camada | Caminho real | Pertence | NUNCA pertence | Anti-padrão |
|--------|--------------|----------|----------------|-------------|
| Core (motor) | `sites/core/` | schemas, validação, registries, renderer, composables, SEO utils, theme system, tipos | conteúdo de cliente, lógica de negócio específica, layouts de um cliente | hardcode de cliente no core |
| Componentes reutilizáveis | `sites/core/components/` | seções genéricas, UI, layout; configuráveis por props, theme-aware, acessíveis | texto/imagens fixos de um cliente, acoplamento a um nicho | componente acoplado/duplicado |
| Templates (nicho) | `sites/templates/<nicho>/` | ordem fixa de seções (`page.ts`), tema (`theme.ts`), conteúdo padrão (`defaults.json`) | lógica duplicada, layout custom por cliente | template monolítico/custom one-off |
| Configuração de cliente | `sites/clients/<name>/` | `config.json`, `domain.txt`, `images/` | código, lógica, schemas | lógica hardcoded no cliente |

**Regra**: VR-6 — dependências só apontam para baixo (templates/clients → core;
nunca o inverso). O dispatch cliente→template vive no `app/`, nunca no `core`.

---

## Relações entre entidades

```text
Template de documento ──molda──▶ Documento ──especializa──▶ Guia How-To
                                    │
                                    ├──contém──▶ Diagrama
                                    └──descreve──▶ Camada da arquitetura
```

## Estados de um Documento (ciclo de produção)

```text
rascunho ──preenche template──▶ conteúdo ──audita fontes (VR-2)──▶ revisado
   ──checa links (VR-1)──▶ publicado (commitado em docs/)
```

Sem transições de runtime — é o fluxo de autoria. A "publicação" é o commit do
arquivo no repositório.
