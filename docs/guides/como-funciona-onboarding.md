# Como o fluxo de onboarding funciona

> **Pré-requisitos**: [Fluxo de onboarding](../onboarding/fluxo-de-onboarding.md).
> **Tema**: guides

## Explicação

Como os dados de um cliente novo viram um site, na prática. Hoje o onboarding é o
**scaffold** (`npm run new-client`): coletar nome/template/domínio e gerar a pasta
do cliente validada. O intake estruturado/IA é evolução futura.

## Localização dos arquivos

Fonte: `sites/scripts/new-client.ts`, `sites/onboarding/README.md`

```text
sites/scripts/new-client.ts   # o comando de scaffold
sites/onboarding/README.md    # a camada de intake (dados brutos; helpers = futuro)
sites/clients/<name>/         # saída: o cliente gerado
```

## Exemplo prático

### 1. Rodar o onboarding (hoje)

Fonte: `package.json`, `sites/scripts/new-client.ts`

```bash
npm run new-client -- --name acme-dental --template clinic --domain acme-dental.example.com
```

### 2. O que acontece

Fonte: `sites/scripts/new-client.ts`

`parse flags → prompt do que faltar → valida inputs → checa guards → estaga →
portão vitest → rename atômico → reporta`. Falha em qualquer etapa remove a staging
e deixa o workspace intacto.

### 3. A saída

```text
sites/clients/acme-dental/
├── config.json   # template + company/theme/content (semeado dos defaults)
├── domain.txt
├── images/hero.jpg
├── README.md
└── __tests__/acme-dental.spec.ts
```

### 4. Ver renderizado

```bash
CLIENT=acme-dental npm run dev
```

## Convenções esperadas

Fonte: `sites/scripts/new-client.ts`

- Nome em kebab-case; template existente; domínio hostname válido e único.
- O cliente é semeado dos defaults do template; a identidade (`company.name`) vem do
  slug.
- Em CI (sem TTY), passe as três flags — não há prompt.
- O futuro (formulário/IA) reusa a mesma cadeia dado → factory →
  `validateWebsiteConfig` → cliente.

## Erros comuns

| Sintoma | Causa | Correção |
|---------|-------|----------|
| `missing required input(s)` | sem TTY e faltou flag | passe `--name --template --domain` |
| `failed the validation gate` | cliente gerado não valida | leia o output do vitest; cheque o `defaults.json` |
| `already exists` / `domain ... already used` | colisão | use nome/domínio únicos |

Ver [criar um novo cliente](./criar-novo-cliente.md) e
[troubleshooting](../troubleshooting/problemas-comuns.md).

## Próximos passos

- Diagramas hoje vs futuro: [fluxo de onboarding](../onboarding/fluxo-de-onboarding.md).
- Visão de longo prazo: [escala futura](../standards/escala-futura.md).
- [Voltar ao índice de guias](./README.md)
