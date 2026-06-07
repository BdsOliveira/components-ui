# Como o deployment funciona

> **Pré-requisitos**: [Deploy](../deployment/deploy.md).
> **Tema**: guides

## Explicação

Como levar um cliente do código a um site publicável. Hoje é um **build estático por
cliente** com a env `CLIENT`; o deploy automatizado (Vercel/CI) é evolução futura.
Use este guia para gerar a saída de um cliente.

## Localização dos arquivos

Fonte: `package.json`, `nuxt.config.ts`

```text
package.json      # scripts build/generate/preview
nuxt.config.ts    # CLIENT -> runtimeConfig + nitro.publicAssets
.output/          # saída do build (dist -> .output/public)
```

## Exemplo prático

### 1. Gerar a saída estática de um cliente

Fonte: `package.json`

```bash
CLIENT=acme-dental npm run generate
```

### 2. Pré-visualizar

```bash
CLIENT=acme-dental npm run preview
```

### 3. O que o `CLIENT` controla

Fonte: `nuxt.config.ts`

```ts
const CLIENT = process.env.CLIENT || 'clinica-saude'
// expõe runtimeConfig.public.client e mapeia nitro.publicAssets para
// /clients/<CLIENT>/images
```

A página de render seleciona o cliente por esse valor; um build = um cliente.

## Convenções esperadas

- Sempre passe `CLIENT=<name>` no build; sem ela, gera o default `clinica-saude`.
- Um build por cliente (não há multi-tenant em runtime hoje).
- Imagens são servidas da pasta do cliente — não copie para `public/`.
- Não prometa o pipeline automatizado: ele é futuro (Vercel/CI/CD).

## Erros comuns

| Sintoma | Causa | Correção |
|---------|-------|----------|
| build gera o cliente errado | `CLIENT` não setado | use `CLIENT=<name> npm run generate` |
| imagens faltando na saída | asset fora de `clients/<name>/images/` | mova o asset para a pasta do cliente |
| esperar deploy automático | não implementado | publique a saída de `.output/` manualmente (por ora) |

Ver [troubleshooting](../troubleshooting/problemas-comuns.md) (problemas de deployment).

## Próximos passos

- Detalhe e diagrama: [deploy](../deployment/deploy.md).
- Domínio do cliente: [configurar domínios](./configurar-dominios.md).
- [Voltar ao índice de guias](./README.md)
