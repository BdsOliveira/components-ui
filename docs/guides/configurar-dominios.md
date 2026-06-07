# Como configurar domínios

> **Pré-requisitos**: [Isolamento e domínios](../clients/isolamento-e-dominios.md).
> **Tema**: guides

## Explicação

Cada cliente tem um domínio próprio, abstraído do código num arquivo `domain.txt`.
Este guia mostra como defini-lo e as regras de validação. A publicação efetiva no
provedor é parte do [deployment](./como-funciona-deploy.md) (evolução futura).

## Localização dos arquivos

Fonte: `sites/clients/clinica-saude/domain.txt`, `sites/scripts/new-client.ts`

```text
sites/clients/<name>/domain.txt   # uma linha com o domínio
```

## Exemplo prático

### 1. O arquivo

Fonte: `sites/clients/clinica-saude/domain.txt`

```text
clinica-saude.example.com
```

Uma única linha, sem protocolo e sem barra final.

### 2. Definido pelo scaffold

Fonte: `sites/scripts/new-client.ts`

`npm run new-client` já cria o `domain.txt` a partir do domínio informado:

```bash
npm run new-client -- --name acme-dental --template clinic --domain acme-dental.example.com
```

### 3. Editar depois

Basta editar o arquivo. Garanta um hostname válido e único entre os clientes.

## Convenções esperadas

Fonte: `sites/scripts/new-client.ts`

- Hostname válido, regex
  `^(?=.{1,253}$)([a-z0-9](-?[a-z0-9])*\.)+[a-z]{2,}$` (ex.: `acme.example.com`).
- **Único**: o scaffold recusa um domínio já usado por outro cliente.
- Uma linha, sem `http://`, sem caminho.

## Erros comuns

| Sintoma | Causa | Correção |
|---------|-------|----------|
| `invalid domain "<d>"` no scaffold | hostname inválido | use `sub.dominio.tld` |
| `domain ... already used by <c>` | domínio repetido | escolha um domínio único |
| domínio com protocolo | incluiu `https://` | deixe só o hostname |

Mais: [troubleshooting](../troubleshooting/problemas-comuns.md).

## Próximos passos

- Publicação: [como o deployment funciona](./como-funciona-deploy.md).
- Estrutura do cliente: [isolamento e domínios](../clients/isolamento-e-dominios.md).
- [Voltar ao índice de guias](./README.md)
