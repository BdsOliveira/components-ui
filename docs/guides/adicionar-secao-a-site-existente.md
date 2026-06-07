# Como adicionar uma seção a um site existente

> **Pré-requisitos**: [config.json](../clients/config-json.md),
> [padrões de configuração JSON](../standards/padroes-de-configuracao-json.md).
> **Tema**: guides

## Explicação

Para ajustar o conteúdo de uma seção de um site já existente, você edita o
`config.json` do cliente — **não** o código. A ordem das seções é do template; você
fornece/sobrescreve o **conteúdo** por seção em `content`.

## Localização dos arquivos

Fonte: `sites/clients/clinica-saude/config.json`, `sites/templates/clinic/defaults.json`

```text
sites/clients/<name>/config.json   # editar: o bloco content.<tipo>
sites/templates/<template>/defaults.json   # referência: defaults da seção e quais tipos existem
```

## Exemplo prático

### 1. Ver quais seções o template oferece

Fonte: `sites/templates/clinic/page.ts`

O clinic tem `ORDER = ['hero', 'services', 'testimonials', 'faq', 'contact', 'footer']`.
Você pode dar conteúdo a qualquer uma delas em `content`.

### 2. Sobrescrever/adicionar conteúdo de uma seção

Fonte: `sites/clients/clinica-saude/config.json`

```json
{
  "content": {
    "testimonials": {
      "heading": "O que dizem nossos pacientes",
      "items": [
        { "quote": "Atendimento excelente.", "author": "M. Souza" }
      ]
    }
  }
}
```

Como o merge é por concern, basta declarar a seção que quer mudar; as demais
seguem com os defaults do template.

### 3. Validar

Fonte: `app/pages/index.vue`, `sites/core/schemas/validate-website.ts`

```bash
CLIENT=<name> npm run dev
```

Se o config for válido, a seção renderiza com o novo conteúdo. Se inválido, a
página mostra `Invalid client config`.

## Convenções esperadas

Fonte: `sites/templates/clinic/page.ts`, `sites/clients/clinica-saude/config.json`

- Use **apenas** `type`s que o template inclui na `ORDER` (e que estão registrados).
- Não adicione um campo de ordem ao cliente — a ordem é do template.
- O conteúdo precisa bater com o schema do bloco (campos certos, variantes válidas).
- Imagens via caminho convencional `/clients/<name>/images/...`.

## Erros comuns

| Sintoma | Causa | Correção |
|---------|-------|----------|
| `Invalid client config` | conteúdo viola o schema da seção | ajuste os campos ao schema do bloco |
| seção não muda | `type` não está na `ORDER` do template | use um tipo que o template renderiza |
| variante ignorada | valor fora do enum | use um membro válido (ex.: hero `centered`/`split`/`minimal`) |
| imagem quebrada | caminho fora de `/clients/<name>/images/` | use o caminho convencional |

Mais: [troubleshooting](../troubleshooting/problemas-comuns.md).

## Próximos passos

- Troque cores: [customizar tema/cores](./customizar-tema-cores.md).
- Adicione imagens: [adicionar assets/imagens](./adicionar-assets-imagens.md).
- [Voltar ao índice de guias](./README.md)
