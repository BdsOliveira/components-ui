# Getting Started — primeiros passos

> **Pré-requisitos**: Nenhum (apenas Node.js e Git instalados).
> **Tema**: getting-started

Esta seção leva um desenvolvedor sem contexto prévio de "abri o repositório" até
"tenho um cliente novo renderizando no navegador" — usando apenas a documentação.

Metas mensuráveis: rodar o dev em menos de 15 minutos (SC-001) e criar um cliente
visível em menos de 30 minutos (SC-002).

## Ordem recomendada

1. [Instalação](./instalacao.md) — clonar e `npm install`.
2. [Rodar em dev](./rodar-em-dev.md) — `npm run dev` e seleção de cliente.
3. [Primeiro cliente](./primeiro-cliente.md) — `npm run new-client` e ver renderizado.

## Pré-requisitos do sistema

Fonte: `package.json`

- **Node.js** com suporte a ESM (o `package.json` declara `"type": "module"`).
- **npm** (os scripts usam `npm run`).
- **Git** para clonar o repositório.

Nenhuma outra ferramenta global é necessária: `tsx`, `vitest` e o toolchain Nuxt
vêm como dependências do projeto.

## Próximos passos

- Comece pela [instalação](./instalacao.md).
- Depois entenda a arquitetura em [arquitetura em camadas](../architecture/arquitetura-em-camadas.md).
- [Voltar ao índice principal](../README.md)
