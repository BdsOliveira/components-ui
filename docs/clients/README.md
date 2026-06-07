# Clientes

> **Pré-requisitos**: [Arquitetura em camadas](../architecture/arquitetura-em-camadas.md).
> **Tema**: clients

Cada cliente é uma pasta isolada sob `sites/clients/<name>/` que produz um site por
**configuração apenas**. É a camada mais alta: só configura, nunca contém código.

## Documentos

- [config.json](./config-json.md) — estrutura, campos obrigatórios/opcionais e a
  distinção entre o config do cliente e o `WebsiteConfig` final.
- [Isolamento e domínios](./isolamento-e-dominios.md) — diretório isolado por
  cliente, `domain.txt` e descoberta por glob.

## Anatomia de um cliente

Fonte: `sites/clients/clinica-saude/`

```text
sites/clients/<name>/
├── config.json   # { template, company, theme, content }
├── domain.txt    # uma linha com o domínio
└── images/       # assets próprios, servidos em /clients/<name>/images/
```

## Próximos passos

- Entenda o config: [config.json](./config-json.md).
- Crie um cliente: [criar um novo cliente](../guides/criar-novo-cliente.md).
- [Voltar ao índice principal](../README.md)
