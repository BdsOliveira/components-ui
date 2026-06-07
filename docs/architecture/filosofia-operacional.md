# Filosofia operacional — o PORQUÊ

> **Pré-requisitos**: [Arquitetura em camadas](./arquitetura-em-camadas.md).
> **Tema**: architecture

A documentação explica não só o "como", mas o "porquê" das decisões. Conhecer a
intenção evita que contribuidores futuros tomem atalhos que quebram a escala
(FR-018). Parte-se do princípio de que **futuros contribuidores existem**.

## Modelo Lego: compor, nunca recriar

Fonte: `.specify/memory/constitution.md` (Princípio I)

A plataforma é um **motor de sites componível**, não um projeto de site sob medida.
Todo site novo é montado de blocos existentes, estilo Lego — nunca desenvolvido do
zero. Composição é preferida a duplicação. É isso que torna possível entregar em
menos de 2 horas e escalar para centenas de clientes.

**Implicação prática**: antes de criar uma seção ou layout, procure um bloco
reutilizável existente e configure/estenda em vez de criar (Princípio "Composition
over creation").

## Anti-hardcode: dados, não código

Fonte: `.specify/memory/constitution.md` (Princípios III, IV)

O `core` é **neutro de negócio**: jamais contém conteúdo de cliente nem lógica
específica. Todo site é dirigido por configuração JSON tipada e validada. Criar um
site **não** pode exigir editar código-fonte. Hardcode de cliente no core acopla
sites não relacionados e destrói a reusabilidade — por isso é proibido (e barrado
por lint, ver [arquitetura em camadas](./arquitetura-em-camadas.md)).

## Por que templates de nicho (e não layouts custom)

Fonte: `.specify/memory/constitution.md` (Princípio VI)

Templates representam **nichos de mercado** (clinic, lawyer, restaurant, school,
local-business), não one-offs visuais. Eles orquestram seções reutilizáveis
(ordem, identidade visual, espaçamento) e não contêm lógica duplicada nem layout
custom por cliente. Assim, o esforço de design se amortiza entre muitos clientes do
mesmo vertical; layouts por cliente reintroduzem exatamente o custo que a
plataforma existe para eliminar.

## Anti-padrões proibidos

Fonte: `.specify/memory/constitution.md` (Princípio XIV)

São proibidos: componentes acoplados, layouts duplicados, lógica hardcoded por
cliente, templates monolíticos, abstrações desnecessárias, overengineering,
dependências em excesso e fluxos manuais repetitivos. Cada um corrói reusabilidade,
velocidade ou escala — os três pilares da plataforma.

## Speed-first

Fonte: `.specify/memory/constitution.md` (Princípios VII, VIII)

Toda decisão técnica favorece repetibilidade, automação e menos trabalho manual.
Daí o scaffold (`npm run new-client`), os schemas como fonte da verdade e os
auto-imports — transformam trabalho repetitivo em comandos.

## Próximos passos

- Veja a visão de longo prazo: [escala futura](../standards/escala-futura.md).
- Como isso vira código: [motor de renderização](../core/motor-de-renderizacao.md).
- [Voltar ao índice de arquitetura](./README.md)
