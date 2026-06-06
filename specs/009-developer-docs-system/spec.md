# Feature Specification: Sistema de Documentação para Desenvolvedores (PT-BR)

**Feature Branch**: `009-developer-docs-system`

**Created**: 2026-06-06

**Status**: Draft

**Input**: User description: "Implement a complete developer documentation system in brazilian portuguese for the Nuxt commercial website starter kit platform."

## User Scenarios & Testing *(mandatory)*

<!--
  As histórias estão priorizadas por jornada. Cada uma é entregável de forma
  independente: implementar apenas uma já produz documentação útil (MVP).
-->

### User Story 1 - Onboarding de um novo desenvolvedor (Priority: P1)

Um desenvolvedor recém-chegado ao time abre o repositório pela primeira vez,
sem nenhum contato prévio com o autor original. Ele precisa, lendo apenas a
documentação, entender o que a plataforma é, como ela gera sites, rodar o
projeto localmente, criar seu primeiro cliente e visualizá-lo em modo de
desenvolvimento — tudo sem perguntar nada a ninguém.

**Why this priority**: É o objetivo central declarado da feature — eliminar a
dependência do autor original e reduzir conhecimento tribal. Sem isso, nenhum
outro valor da documentação se concretiza.

**Independent Test**: Pode ser totalmente testada entregando o repositório e o
`docs/getting-started/` a uma pessoa que nunca o viu e verificando que ela
consegue, sozinha, ter o projeto rodando e um cliente novo renderizando no
navegador seguindo apenas os passos escritos.

**Acceptance Scenarios**:

1. **Given** um desenvolvedor sem contexto prévio, **When** ele segue o README
   principal e o guia de getting-started, **Then** consegue instalar
   dependências, iniciar o modo dev e abrir um site renderizando no navegador
   sem orientação externa.
2. **Given** o getting-started concluído, **When** o desenvolvedor segue o guia
   "criar um novo cliente", **Then** gera um cliente válido e o vê renderizado a
   partir do `config.json`.
3. **Given** qualquer página da documentação, **When** o leitor procura o
   próximo passo, **Then** encontra links de navegação para os documentos
   relacionados (sem becos sem saída).

---

### User Story 2 - Estender a plataforma com segurança (Priority: P1)

Um desenvolvedor precisa adicionar uma nova capacidade — um novo tipo de seção,
um componente reutilizável, um template de nicho ou um schema JSON — sem quebrar
clientes existentes nem violar as fronteiras da arquitetura em camadas. A
documentação deve dizer exatamente onde cada coisa mora, o que NUNCA pertence a
cada camada, e os passos práticos para a extensão.

**Why this priority**: Manutenção e escala são objetivos primários. Extensões
sem guias claros produzem inconsistência arquitetural e regressões — exatamente
o que a feature busca evitar.

**Independent Test**: Pode ser testada pedindo a um desenvolvedor para adicionar
um novo tipo de seção seguindo só o guia correspondente e verificando que a
seção valida (schema) e renderiza (registro de componente) sem alterar arquivos
fora do escopo descrito.

**Acceptance Scenarios**:

1. **Given** o guia "adicionar um novo tipo de seção", **When** o desenvolvedor
   o segue, **Then** entende que um `type` só é totalmente suportado quando
   registrado tanto no registro de schema quanto no registro de componente, e
   completa ambos os passos.
2. **Given** a documentação de arquitetura em camadas, **When** o desenvolvedor
   decide onde colocar um código novo, **Then** identifica corretamente a camada
   (core / componentes / template / cliente) e reconhece o anti-padrão a evitar.
3. **Given** o guia "criar um novo template", **When** seguido, **Then** o
   desenvolvedor produz a estrutura esperada do template (defaults, theme, page)
   condizente com os templates existentes.

---

### User Story 3 - Manter e configurar sites existentes (Priority: P2)

Um desenvolvedor precisa editar um site já no ar: adicionar uma seção ao
`config.json`, trocar cores/tema, ajustar metadados de SEO, incluir imagens e
configurar o domínio. A documentação fornece o formato do `config.json`, campos
obrigatórios/opcionais, regras de validação e exemplos reais.

**Why this priority**: É a tarefa do dia a dia mais frequente, mas depende das
fundações (P1) estarem documentadas primeiro.

**Independent Test**: Pode ser testada pedindo a edição de um `config.json`
existente para adicionar uma seção e customizar o tema seguindo apenas os
padrões de configuração JSON, confirmando que a alteração valida e renderiza.

**Acceptance Scenarios**:

1. **Given** os padrões de configuração JSON, **When** o desenvolvedor adiciona
   uma seção a um cliente existente, **Then** sabe a estrutura exata exigida e a
   alteração passa na validação.
2. **Given** o guia de temas/cores, **When** seguido, **Then** o desenvolvedor
   customiza a paleta sem hardcode dentro de componentes.
3. **Given** o guia de SEO e o de assets/imagens, **When** seguidos, **Then** o
   site passa a expor metadados corretos e referenciar imagens pelo caminho
   convencional.

---

### User Story 4 - Diagnosticar e resolver problemas (Priority: P2)

Quando algo falha — uma seção não renderiza, o `config` é inválido, uma imagem
some, há erro de hidratação/SSR, ou o deploy quebra — o desenvolvedor recorre ao
`troubleshooting/` para sintoma, causa provável e correção, sem precisar
depurar do zero.

**Why this priority**: Reduz drasticamente o tempo perdido e a dependência do
autor, mas é reativo: complementa, não substitui, as histórias P1.

**Independent Test**: Pode ser testada introduzindo deliberadamente uma falha
conhecida (ex.: `type` registrado só no schema, não no componente) e
verificando que a entrada de troubleshooting correspondente leva à correção.

**Acceptance Scenarios**:

1. **Given** uma seção que não aparece, **When** o desenvolvedor consulta o
   troubleshooting, **Then** encontra a causa (ex.: componente não registrado) e
   a correção.
2. **Given** um `config.json` inválido, **When** consulta o troubleshooting,
   **Then** entende como ler o erro de validação e corrigir a estrutura.

---

### User Story 5 - Padrões e escala futura (Priority: P3)

Líderes técnicos e futuros contribuidores consultam os padrões de
desenvolvimento (organização de código, TypeScript, composables, nomenclatura,
testes, commits) e a visão de escalabilidade futura (times múltiplos, evolução
SaaS, builders visuais, geração por IA, integração com CMS, pipelines de
automação) para manter consistência e planejar evolução.

**Why this priority**: Alto valor de longo prazo para consistência e direção,
porém não bloqueia o uso diário da plataforma.

**Independent Test**: Pode ser testada submetendo uma contribuição de exemplo a
uma revisão guiada apenas pelo documento de padrões e confirmando que os
critérios de "componente válido" e convenções são suficientes para aprovar ou
rejeitar de forma objetiva.

**Acceptance Scenarios**:

1. **Given** o documento de padrões de componente, **When** um revisor avalia um
   componente novo, **Then** consegue decidir objetivamente se ele é "válido" na
   plataforma.
2. **Given** o documento de escala futura, **When** lido, **Then** o leitor
   entende quais decisões atuais preparam (ou não) a plataforma para os cenários
   futuros listados.

---

### Edge Cases

- O que acontece quando o código evolui e a documentação fica defasada? A
  documentação precisa apontar onde a "fonte da verdade" vive (schemas,
  registros) para que divergências sejam detectáveis.
- Como a documentação trata recursos ainda não implementados (ex.: deploy,
  onboarding visual)? Deve distinguir claramente "como funciona hoje" de "como
  deve evoluir", sem prometer comportamento inexistente.
- O que acontece quando um leitor entra por um link profundo (ex.: um guia
  específico) sem ter lido o getting-started? Cada documento deve declarar seus
  pré-requisitos e linkar de volta.
- Como evitar exemplos que "apodrecem"? Exemplos devem refletir estruturas reais
  existentes no repositório (clientes/templates atuais) e não invenções.
- Como lidar com termos técnicos sem tradução consagrada em PT-BR? Deve haver
  convenção consistente (manter termo em inglês quando for o uso corrente do
  ecossistema, explicando-o na primeira ocorrência).

## Requirements *(mandatory)*

### Functional Requirements

**Estrutura e cobertura**

- **FR-001**: O sistema de documentação MUST existir sob um diretório dedicado
  `docs/` na raiz do repositório, com as subpastas: `getting-started/`,
  `architecture/`, `core/`, `templates/`, `clients/`, `components/`,
  `onboarding/`, `deployment/`, `guides/`, `standards/`, `troubleshooting/`.
- **FR-002**: Todo o conteúdo da documentação MUST ser escrito em português do
  Brasil (PT-BR), com convenção consistente para termos técnicos sem tradução
  consagrada.
- **FR-003**: A documentação MUST conter um README principal que explique: o que
  a plataforma é, a missão do projeto, como a arquitetura funciona, como sites
  são gerados, a filosofia de renderização orientada a JSON, a arquitetura em
  camadas, como iniciar o projeto localmente, como criar um novo cliente, como
  rodar o modo de desenvolvimento e como funcionam os deployments.
- **FR-004**: Cada documento MUST oferecer navegação para documentos
  relacionados (links internos), de modo que nenhum leitor fique sem próximo
  passo.

**Arquitetura em camadas**

- **FR-005**: A documentação MUST descrever a arquitetura em camadas explicando
  as responsabilidades de cada camada: motor core, componentes reutilizáveis,
  templates e configuração de cliente.
- **FR-006**: Para cada camada, a documentação MUST declarar explicitamente o
  que pertence à camada, o que NUNCA deve pertencer a ela, e os anti-padrões a
  evitar.

**Guias práticos (How-To)**

- **FR-007**: A documentação MUST conter guias passo a passo para, no mínimo:
  criar um novo site/cliente; criar um novo template; adicionar um componente
  reutilizável; adicionar um novo tipo de seção; registrar uma seção no
  renderizador; criar um novo schema JSON; adicionar uma seção a um site
  existente; customizar temas/cores; adicionar metadados de SEO; adicionar
  assets/imagens; configurar domínios; como o deployment funciona; como o fluxo
  de onboarding funciona.
- **FR-008**: Cada guia How-To MUST incluir: explicação, localização dos
  arquivos envolvidos, exemplos práticos, convenções esperadas e erros comuns.

**Sistema de renderização dinâmica**

- **FR-009**: A documentação MUST explicar em detalhe o sistema de renderização
  dinâmica: como o `DynamicSection` funciona, como as seções são mapeadas, como
  o JSON guia a renderização, como os tipos de seção são resolvidos e como o
  motor de renderização se comporta (incluindo o comportamento de fallback para
  tipos não registrados e a contenção de erros por seção).
- **FR-010**: A documentação do renderizador MUST incluir diagramas, exemplos e a
  explicação do ciclo de vida da renderização.

**Padrões de componente**

- **FR-011**: A documentação MUST definir padrões de componente cobrindo:
  convenções de nomenclatura, convenções de pasta, convenções de props,
  acessibilidade, responsividade, compatibilidade com tema, requisitos de
  TypeScript e requisitos de composabilidade.
- **FR-012**: A documentação MUST definir explicitamente o que torna um
  componente "válido" na plataforma (critérios objetivos de aceitação).

**Padrões de configuração JSON**

- **FR-013**: A documentação MUST descrever os padrões de configuração JSON:
  estrutura do `config.json`, campos obrigatórios, campos opcionais, estrutura
  das seções, regras de validação, estratégia de tipagem e estratégia de
  evolução de schema — com exemplos reais retirados do repositório.

**Fluxo de scaffold**

- **FR-014**: A documentação MUST explicar o fluxo de scaffold: como
  `npm run new-client` funciona, como a geração de cliente ocorre, a estrutura
  gerada, as convenções de nomenclatura, o fluxo de seleção de template e como a
  automação futura deve evoluir.

**Documentação visual**

- **FR-015**: A documentação MUST incluir diagramas de arquitetura visual:
  diagrama da estrutura de pastas, diagrama do fluxo de renderização, diagrama do
  fluxo de onboarding, diagrama do fluxo de deployment e diagrama de composição
  de templates.

**Padrões de desenvolvimento**

- **FR-016**: A documentação MUST definir padrões de desenvolvimento cobrindo:
  organização de código, uso de TypeScript, composables, imports, nomenclatura de
  arquivos, nomenclatura de seções, nomenclatura de schemas JSON, convenções de
  teste e convenções de commit.

**Troubleshooting**

- **FR-017**: A documentação MUST conter um guia de troubleshooting cobrindo, no
  mínimo: seção não renderiza, estrutura de config inválida, assets faltando,
  problemas de hidratação, problemas de SSR, problemas de deployment e falhas de
  resolução de template — cada um com sintoma, causa provável e correção.

**Filosofia e escala**

- **FR-018**: A documentação MUST explicar o PORQUÊ das decisões arquiteturais
  (não apenas o "como"), desencorajar implementações hardcoded e incentivar
  consistência, partindo do princípio de que futuros contribuidores existem.
- **FR-019**: A documentação MUST descrever como a plataforma se prepara para
  escala futura: times com múltiplos desenvolvedores, evolução para SaaS,
  builders visuais, sites gerados por IA, integração com CMS e pipelines de
  automação.
- **FR-020**: A documentação MUST incluir um documento de padrões reutilizável
  (template de documento) para que novos documentos futuros sigam estrutura
  consistente, funcionando como um "manual de engenharia interno".
- **FR-021**: Todo exemplo de código, snippet ou estrutura de arquivos citado na
  documentação MUST refletir o estado real do repositório (clientes, templates,
  schemas e registros existentes), sem inventar APIs inexistentes.

### Key Entities *(include if feature involves data)*

- **Documento**: uma página em markdown sob `docs/`, pertencente a exatamente uma
  subpasta temática; possui título, pré-requisitos, conteúdo e links para
  documentos relacionados.
- **Guia How-To**: tipo especializado de documento que sempre contém explicação,
  localização de arquivos, exemplo prático, convenções e erros comuns.
- **Diagrama**: representação visual (estrutura de pastas, renderização,
  onboarding, deployment, composição de templates) embutida em um documento.
- **Template de documento**: artefato reutilizável que define a estrutura padrão
  de novos documentos, garantindo consistência.
- **Camada da arquitetura**: uma das quatro camadas (core, componentes,
  templates, clientes), cada uma com responsabilidades e fronteiras documentadas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um desenvolvedor sem contato prévio com o autor consegue, usando
  apenas a documentação, ter o projeto rodando localmente em modo dev em menos de
  15 minutos.
- **SC-002**: Esse mesmo desenvolvedor cria um novo cliente válido e o vê
  renderizado no navegador em menos de 30 minutos, sem ajuda externa.
- **SC-003**: 100% dos itens de extensão listados (novo cliente, novo template,
  novo componente, novo tipo de seção, registro de seção, novo schema JSON,
  adicionar seção a site existente, temas/cores, SEO, assets, domínios) possuem
  um guia How-To dedicado completo (explicação, arquivos, exemplo, convenções,
  erros comuns).
- **SC-004**: Para cada uma das quatro camadas, o leitor consegue listar, a
  partir da documentação, o que pertence e o que nunca pertence à camada — sem
  ambiguidade.
- **SC-005**: 100% dos sete sintomas de troubleshooting exigidos têm uma entrada
  com sintoma, causa provável e correção.
- **SC-006**: Todos os exemplos de configuração e snippets verificáveis batem com
  estruturas reais existentes no repositório (auditável por inspeção).
- **SC-007**: Nenhum documento é um "beco sem saída": cada página oferece pelo
  menos um link de próximo passo ou retorno ao índice.
- **SC-008**: Um revisor consegue decidir objetivamente, usando só o documento de
  padrões, se um componente proposto é "válido" na plataforma.

## Assumptions

- O público-alvo é desenvolvedor com fluência em PT-BR e familiaridade básica com
  o ecossistema Vue/Nuxt; termos técnicos consagrados podem permanecer em inglês,
  explicados na primeira ocorrência.
- A documentação descreve o estado atual do repositório como fonte da verdade;
  recursos ainda não implementados (ex.: pipeline de deploy, onboarding visual)
  são documentados distinguindo "hoje" de "evolução futura".
- Os diagramas são entregues em formato textual versionável embutido em markdown
  (compatível com renderização no repositório) em vez de imagens binárias, para
  facilitar manutenção — salvo decisão contrária na fase de planejamento.
- A documentação vive em `docs/` na raiz e coexiste com os `README.md` já
  presentes em subpastas de `sites/core/*` (que permanecem como referência
  próxima ao código); `docs/` é o índice de entrada e a visão integrada.
- Não há requisito de internacionalização (i18n) da própria documentação além do
  PT-BR nesta entrega.
- O escopo é a produção do conteúdo da documentação; não inclui construir um site
  de documentação publicado/hospedado nem ferramentas de geração — apenas os
  arquivos markdown, diagramas e templates versionados no repositório.
