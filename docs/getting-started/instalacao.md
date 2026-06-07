# Instalação

> **Pré-requisitos**: [Getting Started](./README.md). Node.js e Git instalados.
> **Tema**: getting-started

Como obter o projeto e instalar as dependências a partir do zero.

## Passos

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio> components-ui
cd components-ui
```

### 2. Instalar dependências

Fonte: `package.json`

```bash
npm install
```

O `package.json` define um hook de `postinstall` que executa `nuxt prepare`
automaticamente após a instalação — ele gera os tipos do Nuxt em `.nuxt/`
(necessários para o TypeScript e o ESLint funcionarem):

Fonte: `package.json`

```json
"scripts": {
  "postinstall": "nuxt prepare"
}
```

Não é preciso rodar `nuxt prepare` à mão; o `npm install` já o dispara.

### 3. Conferir a stack instalada

Fonte: `package.json`

Principais dependências de runtime: `nuxt` (4), `vue` (3), `zod` (validação de
schema), `@nuxtjs/tailwindcss`, `@nuxt/image`, `@nuxt/icon`, `@nuxt/fonts`. Para o
scaffold e os testes: `tsx`, `vitest`, `zod-to-json-schema`.

## Verificação

Se `npm install` terminou sem erro e a pasta `.nuxt/` existe, a instalação está
pronta. O próximo passo é subir o servidor de desenvolvimento.

## Próximos passos

- [Rodar em dev](./rodar-em-dev.md) — subir o servidor e ver um site.
- [Voltar ao índice de getting-started](./README.md)
