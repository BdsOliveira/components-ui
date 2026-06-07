# Fluxo de onboarding

> **Pré-requisitos**: [Onboarding](./README.md),
> [criar um novo cliente](../guides/criar-novo-cliente.md).
> **Tema**: onboarding

Como os dados de um cliente novo viram um site. Distingue **hoje** (scaffold por
comando) de **futuro** (intake estruturado / IA).

## Hoje: scaffold por comando

Fonte: `sites/scripts/new-client.ts`, `sites/onboarding/README.md`

Hoje o "onboarding" é coletar três entradas (nome, template, domínio) e rodar o
scaffold, que monta a pasta do cliente a partir dos defaults do template. A camada
`sites/onboarding/` guarda a responsabilidade de intake; os dados ainda são
fornecidos direto ao comando.

```mermaid
flowchart TD
  A["intake (hoje)<br/>nome · template · domínio"] --> B["npm run new-client<br/>valida inputs + guards"]
  B --> C["lê defaults do template<br/>defaults.json + theme.ts"]
  C --> D["staging .new-client-tmp-&lt;name&gt;/<br/>config.json · domain.txt · images/ · spec"]
  D --> E["portão vitest<br/>valida o cliente gerado"]
  E -->|passa| F["rename atômico -> sites/clients/&lt;name&gt;/"]
  E -->|falha| X["remove staging<br/>workspace intacto"]
  F --> G["CLIENT=&lt;name&gt; npm run dev<br/>site renderizado"]
```

## Futuro: intake estruturado e IA

Fonte: `sites/onboarding/README.md`, `.specify/memory/constitution.md` (Princípios IV, XV)

```mermaid
flowchart TD
  A["formulário de intake / CMS<br/>dados estruturados do negócio"] --> B["onboarding/<br/>captura o input bruto"]
  B --> C["geração de config<br/>(factory de template / IA via JSON-Schema)"]
  C --> D["validateWebsiteConfig<br/>rejeita inválido"]
  D --> E["sites/clients/&lt;name&gt;/config.json"]
  E --> F["build + deploy automatizado"]
```

A ponte do futuro reusa exatamente as mesmas peças de hoje: dado → factory →
`validateWebsiteConfig` → cliente. Só a **fonte** do dado muda (formulário/IA em vez
de prompt no terminal). Ver [escala futura](../standards/escala-futura.md).

## Próximos passos

- O guia operacional: [como o fluxo de onboarding funciona](../guides/como-funciona-onboarding.md).
- Crie um cliente agora: [criar um novo cliente](../guides/criar-novo-cliente.md).
- [Voltar ao índice de onboarding](./README.md)
