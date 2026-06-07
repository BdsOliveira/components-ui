# Como criar um novo cliente

> **Pré-requisitos**: [Getting Started](../getting-started/README.md),
> [config.json](../clients/config-json.md).
> **Tema**: guides

## Explicação

Cada site comercial é um **cliente**: uma pasta isolada sob `sites/clients/<name>/`
que produz um site por **configuração apenas**, reusando um template de nicho e os
blocos do `core` sem alterar camadas inferiores. Use este guia quando precisar
publicar um site novo para um negócio. Não se escreve arquivo à mão — o comando
`npm run new-client` gera tudo, validado.

## Localização dos arquivos

Fonte: `sites/scripts/new-client.ts`, `sites/clients/clinica-saude/`

O scaffold cria:

```text
sites/clients/<name>/
├── config.json     # template + overrides de company/theme/content
├── domain.txt      # uma linha com o domínio
├── images/
│   └── hero.jpg    # placeholder — trocar por asset real
├── README.md       # responsabilidade/permitido/proibido/fluxo
└── __tests__/
    └── <name>.spec.ts   # spec de aceitação do cliente
```

Arquivos lidos pelo comando (não alterados): `sites/templates/<template>/defaults.json`
e `sites/templates/<template>/theme.ts`.

## Exemplo prático

### 1. Rodar o comando

Fonte: `package.json`, `sites/scripts/new-client.ts`

```bash
# interativo
npm run new-client

# não interativo (CI-safe; sem TTY exige as três flags)
npm run new-client -- --name acme-dental --template clinic --domain acme-dental.example.com
```

### 2. O fluxo interno

Fonte: `sites/scripts/new-client.ts`

`parse flags → prompt do que faltar → valida inputs → checa guards → estaga em
.new-client-tmp-<name>/ → portão vitest → rename atômico → reporta`. Qualquer
falha remove a staging e sai não-zero, deixando o workspace intacto.

### 3. O `config.json` gerado

O comando lê `defaults.json` do template, injeta a identidade (`company.name` =
nome de exibição derivado do slug) e aponta o hero para a imagem própria do cliente:

Fonte: `sites/scripts/new-client.ts` (`buildConfig`)

```ts
return {
  template: input.template,
  company: { ...defaults.company, name: displayName },
  theme,
  content,   // content.hero.media.src = `/clients/<name>/images/hero.jpg`
}
```

### 4. Ver renderizado

Fonte: `nuxt.config.ts`

```bash
CLIENT=acme-dental npm run dev        # preview
CLIENT=acme-dental npm run generate   # site estático
```

## Convenções esperadas

Fonte: `sites/scripts/new-client.ts`, `.specify/memory/constitution.md` (Princípio XII)

- **Nome**: kebab-case, regex `^[a-z0-9]+(-[a-z0-9]+)*$` — serve como pasta e
  segmento de URL.
- **Domínio**: hostname válido (ex.: `acme.example.com`); não pode repetir o de
  outro cliente.
- **Template**: precisa existir em `sites/templates/` com `defaults.json`.
- O cliente é a camada **mais alta**: só configura. Nunca contém código, lógica,
  schemas, nem um campo de ordem de seção (a ordem é do template).
- Imagens ficam em `images/` do próprio cliente — nunca copiadas para `public/`.

## Erros comuns

| Sintoma | Causa | Correção |
|---------|-------|----------|
| `invalid name "<x>"` | nome fora do kebab-case | use só minúsculas/dígitos e hífens |
| `unknown template "<t>"` | template inexistente | escolha um de `sites/templates/` (ex.: `clinic`) |
| `invalid domain "<d>"` | hostname inválido | use algo como `acme.example.com` |
| `client "<x>" already exists` | pasta de cliente já existe | escolha outro nome (não sobrescreve) |
| `domain ... already used by ...` | domínio repetido | use um domínio único |
| `missing required input(s)` em CI | sem TTY e faltou flag | passe `--name --template --domain` |
| `failed the validation gate` | config gerado não valida | veja o output do vitest; cheque o `defaults.json` do template |

Mais casos em [troubleshooting](../troubleshooting/problemas-comuns.md).

## Próximos passos

- Entenda o arquivo gerado: [config.json](../clients/config-json.md).
- Customize conteúdo: [adicionar seção a site existente](./adicionar-secao-a-site-existente.md).
- Configure o domínio: [configurar domínios](./configurar-dominios.md).
- [Voltar ao índice de guias](./README.md)
