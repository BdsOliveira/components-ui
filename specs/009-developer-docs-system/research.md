# Research — Sistema de Documentação para Desenvolvedores (PT-BR)

**Feature**: 009-developer-docs-system | **Date**: 2026-06-06

Consolida as decisões de Fase 0. Não há `NEEDS CLARIFICATION` pendentes — a spec
resolveu as ambiguidades via Assumptions. Este documento registra o PORQUÊ de
cada decisão de formato/estrutura/processo, para que a documentação seja
construída de forma consistente.

---

## D1. Localização e formato dos arquivos

- **Decisão**: Markdown (GFM) sob um novo diretório `docs/` na raiz, com as 11
  subpastas exatas do FR-001. Sem site de documentação publicado nesta entrega.
- **Rationale**: O FR-001 fixa a árvore. Markdown na raiz é legível direto no
  GitHub/IDE, versionável e diffável, e não acopla a doc a nenhuma ferramenta de
  build. Construir um site hospedado é fora de escopo (Assumptions).
- **Alternativas consideradas**:
  - *Nuxt Content servindo `docs/`* — rejeitado por enquanto: adiciona
    dependência/rota e contradiz Princípio XIV (dependências em excesso) sem
    valor imediato. Fica registrado como evolução futura (FR-019).
  - *Wiki do GitHub* — rejeitado: não versiona junto do código nem aparece no
    clone; quebra FR-021 (exemplos acoplados ao estado do repo).

## D2. Idioma e convenção de termos técnicos

- **Decisão**: Todo o conteúdo em PT-BR. Termos técnicos consagrados do
  ecossistema permanecem em inglês (ex.: *composable*, *prop*, *slot*,
  *discriminated union*, *registry*, *hydration*, *layout*), explicados na
  primeira ocorrência de cada documento.
- **Rationale**: FR-002 exige PT-BR; traduzir termos consagrados prejudica a
  busca e a correspondência com o código (que está em inglês). Glossário curto
  no README principal evita repetição.
- **Alternativas**: Tradução total — rejeitada (cria termos artificiais e
  diverge dos identificadores reais do código).

## D3. Formato dos diagramas

- **Decisão**: Diagramas em **Mermaid** embutido em blocos de código nos
  arquivos Markdown (fluxogramas, sequência, e árvores via `graph`).
- **Rationale**: Texto versionável e diffável (Assumptions), renderiza nativo no
  GitHub, editável por qualquer contribuidor sem ferramenta de design. Cobre os
  5 diagramas exigidos (estrutura de pastas, renderização, onboarding, deploy,
  composição de templates — FR-015).
- **Alternativas**:
  - *Imagens PNG/SVG exportadas* — rejeitado: binário, apodrece, exige
    re-exportar a cada mudança.
  - *ASCII art* — aceito como complemento pontual para árvores de pasta simples,
    mas Mermaid é o padrão para fluxos.

## D4. Fonte da verdade e estratégia anti-apodrecimento de exemplos

- **Decisão**: Todo exemplo de código/estrutura é copiado/derivado de arquivos
  reais existentes e cada documento cita o caminho de origem
  (ex.: `sites/clients/clinica-saude/config.json`). A doc aponta para a fonte da
  verdade do runtime (schemas Zod e os dois registries) em vez de reproduzir
  regras que poderiam divergir.
- **Rationale**: FR-021/SC-006 exigem fidelidade ao repo. Citar a origem permite
  auditar divergências por inspeção. As regras de validação vivem nos schemas;
  duplicá-las criaria duas fontes da verdade (anti-padrão).
- **Fontes da verdade mapeadas**:
  | Assunto | Fonte da verdade no repo |
  |---------|--------------------------|
  | Shape do site | `sites/core/schemas/website.ts` (`WebsiteConfig`) |
  | União de seções + registro de schema | `sites/core/schemas/section.ts` |
  | Validação whole-site | `sites/core/schemas/validate-website.ts` |
  | Registro de componente | `sites/core/components/sections/registry.ts` |
  | Iteração da página | `sites/core/components/render/SiteRenderer.vue` |
  | Resolução por `type` + fallback | `sites/core/components/render/DynamicSection.vue` |
  | Registro dos 8 blocos | `sites/core/components/sections/register.ts` |
  | Boot dos registries | `app/plugins/register-sections.ts` |
  | Seleção de cliente/template | `app/pages/index.vue` |
  | Template de nicho (estrutura/tema/conteúdo) | `sites/templates/clinic/{page.ts,theme.ts,defaults.json}` |
  | Config de cliente | `sites/clients/clinica-saude/config.json` |
  | Scaffold | `sites/scripts/new-client.ts` |
  | Tema injetado | `sites/core/composables/useSiteTheme.ts` |

## D5. Pipeline de dados a documentar (cadeia canônica)

- **Decisão**: A documentação descreve UMA cadeia canônica de dados, do
  `config.json` ao DOM, como espinha dorsal da seção de renderização dinâmica:

  ```text
  sites/clients/<name>/config.json   { template, company, theme, content }
        │  import.meta.glob + seleção por env CLIENT
        ▼
  app/pages/index.vue                dispatch via sites/templates/registry.ts
        │  entry.factory(overrides)
        ▼
  template factory (ex. createClinicSite)   defaults.json + theme.ts + overrides
        │  → WebsiteConfig { company, theme, sections[] }  (ordem = ordem de render)
        ▼
  validateWebsiteConfig(raw)         Zod, união de seções da LIVE registry
        │  result.valid ? data : falha exibida (nunca renderiza inválido)
        ▼
  <SiteRenderer :config>             provê theme/company; itera sections em ordem
        │  v-for DynamicSection (key estável)
        ▼
  <DynamicSection :section :index>   resolveSectionComponent(type) → <component :is :data>
        │  type não registrado → renderiza nada + warn (dev); erro de seção → contido
        ▼
  Componente de seção (ex. HeroSection.vue)  lê seu slice via prop `data`
  ```

- **Rationale**: Fixar uma narrativa única evita explicações divergentes e
  cobre FR-009/FR-010 (mapeamento, resolução, fallback, ciclo de vida).
- **Observação crítica para a doc**: o `config.json` do cliente NÃO é o
  `WebsiteConfig` final — é `{ template, company, theme, content }` (conteúdo
  por seção em `content`), transformado pela factory do template no
  `WebsiteConfig` `{ company, theme, sections[] }`. Essa distinção é fonte comum
  de confusão e deve ser explícita (alimenta troubleshooting e padrões JSON).

## D6. "Dois registries" como conceito de primeira classe

- **Decisão**: A doc trata como conceito central que um `type` de seção só é
  **totalmente suportado** quando registrado em DOIS lugares: registro de
  **schema** (`registerSection`/`schemas/section.ts`, validável) e registro de
  **componente** (`registerSectionComponent`/`components/sections/registry.ts`,
  renderável), ambos disparados por `register.ts` no boot via plugin.
- **Rationale**: É a regra arquitetural mais fácil de violar (registrar só um
  lado) e a causa nº 1 de "seção não renderiza" / "config inválido". Reforça
  FR-007 (registrar seção), FR-009, FR-017.
- **Alternativas**: Tratar como detalhe — rejeitado: é justamente o
  conhecimento tribal que a feature deve eliminar.

## D7. Estratégia de testes/validação da documentação

- **Decisão**: Validação por inspeção contra SC-001..008 + auditoria de
  fidelidade (cada snippet rastreável a um arquivo real) + revisão de links
  internos (sem becos sem saída). Sem automação de testes nesta entrega.
- **Rationale**: O artefato é prosa/diagrama, não código executável. Os critérios
  de sucesso já são verificáveis por uma pessoa seguindo os passos.
- **Evolução futura**: um linter de links e um teste que falha se um caminho
  citado não existir poderiam ser adicionados (registrado em escala futura).

## D8. Template reutilizável de documento

- **Decisão**: Um arquivo `docs/_templates/documento-modelo.md` define a
  estrutura padrão (título, pré-requisitos, conteúdo, "erros comuns",
  "próximos passos"/links) e uma variante de Guia How-To (com as 5 seções
  obrigatórias do FR-008). Formalizado no contrato `doc-template-contract.md`.
- **Rationale**: FR-020 exige template reutilizável; padroniza contribuições
  futuras e materializa o "manual de engenharia" (Princípio VIII).

## D9. Disciplina vs. READMEs existentes

- **Decisão**: Os `README.md` em `sites/core/*` permanecem como referência local
  próxima ao código. `docs/` integra e LINKA para eles; não os move nem duplica.
- **Rationale**: Evita duas fontes da verdade (Princípio XIV). `docs/` é o mapa;
  os READMEs são a legenda local.

---

## Decisões resolvidas — resumo

| ID | Decisão | Driver |
|----|---------|--------|
| D1 | Markdown sob `docs/` raiz, sem site publicado | FR-001, escopo |
| D2 | PT-BR + termos técnicos em inglês explicados | FR-002 |
| D3 | Diagramas em Mermaid | FR-015, Assumptions |
| D4 | Exemplos citam fonte real; schemas são a verdade | FR-021, SC-006 |
| D5 | Cadeia canônica config→DOM como espinha dorsal | FR-009/FR-010 |
| D6 | "Dois registries" como conceito de primeira classe | FR-007/FR-017 |
| D7 | Validação por inspeção, sem automação agora | Testing |
| D8 | Template reutilizável de doc + variante How-To | FR-020/FR-008 |
| D9 | `docs/` linka READMEs, não duplica | Princípio XIV |

Nenhum item permanece em aberto. Pronto para Fase 1.
