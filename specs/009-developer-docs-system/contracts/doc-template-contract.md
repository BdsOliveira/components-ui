# Contract — Formato padrão de Documento e Guia How-To

**Feature**: 009-developer-docs-system

Define a forma reutilizável que todo documento da doc DEVE seguir (FR-020/FR-008).
Materializado em `docs/_templates/documento-modelo.md`.

## C1 — Esqueleto de Documento (todos os docs)

```markdown
# <Título em PT-BR>

> **Pré-requisitos**: <links para docs a ler antes, ou "Nenhum">
> **Camada/Tema**: <getting-started | architecture | core | ...>

<Parágrafo de abertura: o que este documento responde e para quem.>

## <Seções de conteúdo>

<Corpo. Termos técnicos em inglês explicados na 1ª ocorrência.
Snippets sempre com o caminho real de origem acima do bloco:
`Fonte: sites/core/schemas/website.ts`>

## Próximos passos

- [<Doc relacionado 1>](<caminho>)
- [<Doc relacionado 2>](<caminho>)
- [Voltar ao índice](../README.md)
```

**Regras**
- DT-1: Exatamente um H1.
- DT-2: Bloco de pré-requisitos no topo (FR-004).
- DT-3: Seção final "Próximos passos" com ≥1 link (CT-4/SC-007).
- DT-4: Todo snippet precedido de `Fonte: <caminho real>` (CT-10/FR-021).

## C2 — Esqueleto de Guia How-To (docs em `guides/`)

Estende C1 com as 5 seções obrigatórias do FR-008, nesta ordem:

```markdown
# Como <fazer X>

> **Pré-requisitos**: <links>
> **Tema**: guides

## Explicação
<O que resolve e quando usar.>

## Localização dos arquivos
<Caminhos reais que serão criados/editados, em lista.>

## Exemplo prático
<Passo a passo numerado com código/JSON real e citação de fonte.>

## Convenções esperadas
<Nomenclatura, ordem de seções, fronteiras de camada a respeitar.>

## Erros comuns
<Tabela: Sintoma | Causa | Correção — linkando troubleshooting quando aplicável.>

## Próximos passos
- [...](...)
```

**Regras**
- GT-1: As 5 seções presentes e na ordem dada.
- GT-2: Guias de seção (adicionar tipo de seção / registrar no renderer) DEVEM
  mostrar AMBOS os registros: `registerSection(defineSection('x', xSchema))` e
  `registerSectionComponent('x', XSection)` em `register.ts` (VR-4/D6).
  Fonte: `sites/core/components/sections/register.ts`.
- GT-3: "Erros comuns" referencia entradas reais de `troubleshooting/`.

## C3 — Critério de aceitação

Um documento está conforme quando satisfaz DT-1..DT-4; um guia, adicionalmente,
GT-1..GT-3. O `documento-modelo.md` DEVE conter ambos os esqueletos (C1 e C2) com
instruções de uso no topo.
