# Isolamento e domínios

> **Pré-requisitos**: [config.json](./config-json.md).
> **Tema**: clients

Cada cliente vive em um diretório isolado com sua própria configuração, assets e
domínio (Princípio XII). Isolamento é o pré-requisito da operação white-label e da
futura evolução SaaS.

## Diretório isolado por cliente

Fonte: `sites/clients/clinica-saude/`

```text
sites/clients/<name>/
├── config.json   # configuração do site
├── domain.txt    # o domínio do cliente, em uma linha
└── images/       # assets próprios do cliente
```

Nenhum cliente referencia outro. Configurações isoladas evitam contaminação cruzada.

## Descoberta por glob (zero edição)

Fonte: `app/pages/index.vue`

A página de render descobre todo cliente por convenção — adicionar uma pasta de
cliente o torna selecionável **sem editar nada** aqui:

```ts
const modules = import.meta.glob('~~/sites/clients/*/config.json', {
  eager: true,
  import: 'default',
})
// path ".../clients/<name>/config.json" -> segmento "<name>"
const segment = path.split('/').slice(-2, -1)[0]
```

O cliente exibido é escolhido pela env `CLIENT` (default `clinica-saude`).

## `domain.txt`

Fonte: `sites/clients/clinica-saude/domain.txt`

Um arquivo de **uma linha** com o domínio:

```text
clinica-saude.example.com
```

O scaffold valida o hostname e recusa domínio já usado por outro cliente
(`sites/scripts/new-client.ts`). O domínio é abstraído do código — é dado do cliente.

## Imagens servidas do próprio cliente

Fonte: `nuxt.config.ts`

As imagens são servidas direto da pasta isolada, sem copiar para `public/`. O Nitro
mapeia `sites/clients/<CLIENT>/images` para a URL `/clients/<CLIENT>/images`:

```ts
nitro: {
  publicAssets: [{
    dir: fileURLToPath(new URL(`sites/clients/${CLIENT}/images`, import.meta.url)),
    baseURL: `/clients/${CLIENT}/images`,
  }],
}
```

## Próximos passos

- Configure o domínio: [configurar domínios](../guides/configurar-dominios.md).
- Adicione imagens: [adicionar assets/imagens](../guides/adicionar-assets-imagens.md).
- [Voltar ao índice de clientes](./README.md)
