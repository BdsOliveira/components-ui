# Problemas comuns

> **Pré-requisitos**: [Troubleshooting](./README.md),
> [motor de renderização](../core/motor-de-renderizacao.md).
> **Tema**: troubleshooting

Os sete sintomas mais frequentes, cada um com **sintoma**, **causa provável** e
**correção** (FR-017). A maioria deriva da cadeia canônica config → DOM.

## 1. Seção não renderiza

- **Sintoma**: o site carrega, mas uma seção não aparece. Em dev, há um warning
  `[DynamicSection] no registered component for section type "<x>"`.
- **Causa provável**: o `type` está registrado no schema mas **não** no registry de
  componente — o renderer cai no fallback "renderiza nada".
  Fonte: `sites/core/components/render/DynamicSection.vue`
- **Correção**: adicione o par completo em `register.ts`:
  Fonte: `sites/core/components/sections/register.ts`
  ```ts
  registerSection(defineSection('x', xSchema))
  registerSectionComponent('x', XSection)   // <- o que faltava
  ```
  Ver [registries](../core/registries.md).

## 2. Estrutura de config inválida

- **Sintoma**: a página exibe `Invalid client config: ...`.
- **Causa provável**: o `WebsiteConfig` montado falhou em `validateWebsiteConfig` —
  uma seção tem `type` não registrado (faltou o **schema**) ou um slice que viola o
  schema do bloco. Qualquer seção inválida rejeita o config inteiro.
  Fonte: `sites/core/schemas/validate-website.ts`
- **Correção**: leia o `result.sections` (índice + `type` + issues) que a página
  imprime; corrija o campo no `config.json` ou registre o schema do `type`. Lembre
  que o config do cliente é `{ template, company, theme, content }`, não
  `{ sections[] }`. Ver [config.json](../clients/config-json.md).

## 3. Assets (imagens) faltando

- **Sintoma**: imagem aparece quebrada (404).
- **Causa provável**: o arquivo não está em `sites/clients/<name>/images/`, o
  caminho não segue `/clients/<name>/images/...`, ou você está rodando outro
  `CLIENT`.
  Fonte: `nuxt.config.ts`, `sites/clients/clinica-saude/config.json`
- **Correção**: ponha o asset na pasta do cliente e referencie pela URL
  convencional; rode `CLIENT=<name> npm run dev`. Ver
  [adicionar assets/imagens](../guides/adicionar-assets-imagens.md).

## 4. Problemas de hidratação

- **Sintoma**: warning de hydration mismatch no console; conteúdo "pisca" ou difere
  entre servidor e cliente.
- **Causa provável**: markup não-determinístico numa seção (ex.: `Date.now()`,
  `Math.random()`, acesso a `window` no setup) — o HTML do SSR diverge do cliente.
  Como o `DynamicSection` contém erros por seção (`onErrorCaptured`), o defeito pode
  se manifestar como seção que some.
  Fonte: `sites/core/components/render/DynamicSection.vue`
- **Correção**: torne o render da seção determinístico a partir de `data`; mova
  acesso a APIs de browser para `onMounted`/guards de cliente. Mantenha a seção
  dirigida só pelo prop `data`.

## 5. Problemas de SSR

- **Sintoma**: erro durante `npm run dev`/`generate` referenciando uma seção, ou
  página em branco no servidor.
- **Causa provável**: código que assume ambiente de browser executando no servidor
  (Nitro/SSR), ou um componente lançando no setup. O erro por seção é contido, mas
  erros fora de seção (ex.: na factory/validação) sobem.
  Fonte: `app/pages/index.vue`, `.specify/memory/constitution.md` (Princípio IX)
- **Correção**: garanta que factory e schemas não dependem de browser; valide com
  `validateWebsiteConfig` antes de renderizar (a página só monta `SiteRenderer`
  quando `result.valid`). Prefira SSG/SSR conforme o conteúdo.

## 6. Problemas de deployment

- **Sintoma**: o build não gera o site esperado, ou gera o cliente errado.
- **Causa provável**: a env `CLIENT` não foi setada para o build — o default
  `clinica-saude` é usado. O deploy automatizado (Vercel/CI) ainda **não** está
  implementado (é evolução futura).
  Fonte: `nuxt.config.ts`, `package.json`
- **Correção**: faça um build por cliente com a env explícita:
  ```bash
  CLIENT=<name> npm run generate
  ```
  Ver [como o deployment funciona](../guides/como-funciona-deploy.md).

## 7. Falha de resolução de template

- **Sintoma**: a página exibe `Unknown client template: <t>` (ou
  `Unknown client: <x>`).
- **Causa provável**: o `template` do `config.json` não existe em
  `templateRegistry`, ou não há pasta de cliente para o `CLIENT` selecionado.
  Fonte: `app/pages/index.vue`, `sites/templates/registry.ts`
- **Correção**: use um `template` registrado (`clinic`, `lawyer`, `restaurant`,
  `school`, `local-business`) ou registre o novo template em `registry.ts`; confira
  que existe `sites/clients/<CLIENT>/config.json`. Ver
  [criar um novo template](../guides/criar-novo-template.md).

## Próximos passos

- Entenda o pipeline: [motor de renderização](../core/motor-de-renderizacao.md).
- A regra dos dois registries: [registries](../core/registries.md).
- [Voltar ao índice principal](../README.md)
