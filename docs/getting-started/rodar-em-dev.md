# Rodar em modo de desenvolvimento

> **Pré-requisitos**: [Instalação](./instalacao.md) concluída.
> **Tema**: getting-started

Como subir o servidor de desenvolvimento (dev server) e escolher qual cliente é
renderizado.

## Subir o dev server

Fonte: `package.json`, `README.md`

```bash
npm run dev
```

O servidor sobe em `http://localhost:3000`. Por padrão, o site renderizado é o
cliente `clinica-saude`.

## Escolher o cliente com a env `CLIENT`

O cliente exibido é controlado pela variável de ambiente (env var) `CLIENT`. Quando
ausente, o default é `clinica-saude`.

Fonte: `nuxt.config.ts`

```ts
const CLIENT = process.env.CLIENT || 'clinica-saude'

export default defineNuxtConfig({
  runtimeConfig: {
    public: { client: CLIENT },
  },
})
```

A página de render lê esse valor via `useRuntimeConfig().public.client`, descobre
todo `sites/clients/*/config.json` por glob (padrão de caminho com `*`) e seleciona
o cliente cujo segmento de diretório bate com `CLIENT`:

Fonte: `app/pages/index.vue`

```ts
const modules = import.meta.glob('~~/sites/clients/*/config.json', {
  eager: true,
  import: 'default',
})
const client = useRuntimeConfig().public.client as string
const clientConfig = byClient[client]
```

Para rodar outro cliente:

```bash
CLIENT=clinica-saude npm run dev   # explícito (mesmo que o default)
CLIENT=<outro-cliente> npm run dev # qualquer pasta em sites/clients/
```

## O que aparece quando algo está errado

Fonte: `app/pages/index.vue`

A página nunca renderiza um site inválido — ela exibe a falha:

- `Unknown client: <x>` — não há pasta `sites/clients/<x>/config.json`.
- `Unknown client template: <t>` — o `template` do config não existe no registry.
- `Invalid client config: ...` — o config falhou na validação Zod.

Veja [troubleshooting](../troubleshooting/problemas-comuns.md) para cada caso.

## Próximos passos

- [Criar seu primeiro cliente](./primeiro-cliente.md).
- Entenda o que acontece por baixo: [motor de renderização](../core/motor-de-renderizacao.md).
- [Voltar ao índice de getting-started](./README.md)
