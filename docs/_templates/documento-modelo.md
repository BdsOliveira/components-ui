<!--
  TEMPLATE REUTILIZÁVEL DE DOCUMENTO (FR-020 / doc-template-contract.md).

  Como usar:
  1. Copie este arquivo para a subpasta temática correta sob `docs/`.
  2. Apague esta seção de comentário e o esqueleto que NÃO for usar
     (Documento comum OU Guia How-To).
  3. Preencha: H1, bloco de pré-requisitos, conteúdo, "Próximos passos".
  4. Todo snippet de código/estrutura precisa de uma linha `Fonte: <caminho real>`
     logo acima do bloco — nada inventado (FR-021 / CT-10).
  5. Linke o novo documento a partir do README da sua subpasta.

  Regras (doc-template-contract §C3):
  - DT-1: exatamente um H1.
  - DT-2: bloco de pré-requisitos no topo.
  - DT-3: seção final "Próximos passos" com ≥1 link (nunca beco sem saída).
  - DT-4: todo snippet precedido de `Fonte: <caminho real>`.
  - Guias (em `docs/guides/`) adicionam as 5 seções obrigatórias na ordem dada
    (GT-1) e, se forem sobre seções, mostram AMBOS os registros (GT-2).
-->

# ESQUELETO A — Documento comum

```markdown
# <Título em PT-BR>

> **Pré-requisitos**: <links para docs a ler antes, ou "Nenhum">
> **Tema**: <getting-started | architecture | core | templates | clients | components | onboarding | deployment | guides | standards | troubleshooting>

<Parágrafo de abertura: o que este documento responde e para quem.>

## <Seção de conteúdo>

<Corpo. Termos técnicos em inglês (composable, prop, slot, registry, hydration,
discriminated union) explicados na 1ª ocorrência. Todo snippet com a fonte real
logo acima:>

Fonte: `sites/core/schemas/website.ts`

```ts
// trecho real copiado/derivado do arquivo citado
```

## Próximos passos

- [<Doc relacionado 1>](<caminho>)
- [<Doc relacionado 2>](<caminho>)
- [Voltar ao índice](../README.md)
```

# ESQUELETO B — Guia How-To (somente em `docs/guides/`)

Estende o Esqueleto A com as 5 seções obrigatórias do FR-008, nesta ordem:

```markdown
# Como <fazer X>

> **Pré-requisitos**: <links>
> **Tema**: guides

## Explicação

<O que o guia resolve e quando usá-lo.>

## Localização dos arquivos

<Caminhos reais que serão criados/editados, em lista.>

## Exemplo prático

<Passo a passo numerado com código/JSON real e citação de fonte
(`Fonte: <caminho>`) acima de cada bloco.>

## Convenções esperadas

<Nomenclatura, ordem de seções, fronteiras de camada a respeitar.>

## Erros comuns

| Sintoma | Causa | Correção |
|---------|-------|----------|
| ... | ... | ... (linka `docs/troubleshooting/problemas-comuns.md` quando aplicável) |

## Próximos passos

- [<Doc relacionado>](<caminho>)
- [Voltar ao índice de guias](./README.md)
```

> **Regra "dois registries" (GT-2)**: guias sobre tipos de seção DEVEM mostrar os
> dois registros, lado a lado, citando a fonte:
>
> Fonte: `sites/core/components/sections/register.ts`
>
> ```ts
> registerSection(defineSection('hero', heroSchema))   // validável (schema)
> registerSectionComponent('hero', HeroSection)        // renderável (componente)
> ```

## Próximos passos

- [Voltar ao índice principal](../README.md)
- [Guia de contribuição em padrões](../standards/README.md)
