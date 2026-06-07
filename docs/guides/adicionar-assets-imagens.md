# Como adicionar assets/imagens

> **Pré-requisitos**: [Isolamento e domínios](../clients/isolamento-e-dominios.md).
> **Tema**: guides

## Explicação

As imagens de um cliente vivem na **própria pasta** do cliente e são servidas a
partir dela — nunca copiadas para `public/`. Trocar uma imagem é uma mudança de
**dado** contra arquivos do cliente.

## Localização dos arquivos

Fonte: `sites/clients/clinica-saude/`, `nuxt.config.ts`

```text
sites/clients/<name>/images/        # coloque os assets aqui
sites/clients/<name>/config.json    # referencie via /clients/<name>/images/...
```

## Exemplo prático

### 1. Adicionar o arquivo

```bash
cp minha-foto.jpg sites/clients/<name>/images/hero.jpg
```

### 2. Referenciar no `config.json`

Fonte: `sites/clients/clinica-saude/config.json`

```json
{
  "content": {
    "hero": {
      "media": {
        "src": "/clients/clinica-saude/images/hero.jpg",
        "alt": "Equipe da Clínica Saúde recebendo um paciente"
      }
    }
  }
}
```

`alt` é **obrigatório** no schema de mídia (acessibilidade):

Fonte: `sites/core/schemas/hero.ts`

```ts
const media = z.object({ src: z.string(), alt: z.string() })
```

### 3. Como o caminho resolve

Fonte: `nuxt.config.ts`

O Nitro serve a pasta de imagens do cliente selecionado na URL convencional:

```ts
nitro: {
  publicAssets: [{
    dir: fileURLToPath(new URL(`sites/clients/${CLIENT}/images`, import.meta.url)),
    baseURL: `/clients/${CLIENT}/images`,
  }],
}
```

Assim, `images/hero.jpg` fica disponível em `/clients/<name>/images/hero.jpg`.

## Convenções esperadas

Fonte: `sites/scripts/new-client.ts`, `nuxt.config.ts`

- Assets ficam em `sites/clients/<name>/images/` — **nunca** em `public/`.
- Referencie sempre pela URL `/clients/<name>/images/<arquivo>`.
- Todo `media` tem `src` **e** `alt` (alt não-vazio).
- O scaffold já cria um `hero.jpg` placeholder — troque por um asset real.

## Erros comuns

| Sintoma | Causa | Correção |
|---------|-------|----------|
| imagem 404 | arquivo não está em `images/` do cliente | mova o arquivo para a pasta certa |
| imagem certa só num cliente | rodou com outro `CLIENT` | `CLIENT=<name> npm run dev` |
| `Invalid client config` no hero | `media` sem `alt` | adicione `alt` não-vazio |
| copiou para `public/` | quebra o isolamento por cliente | use a pasta do cliente |

Mais: [troubleshooting](../troubleshooting/problemas-comuns.md) (assets faltando).

## Próximos passos

- Use em SEO/OG: [adicionar metadados de SEO](./adicionar-seo.md).
- Edite o conteúdo: [adicionar uma seção a um site existente](./adicionar-secao-a-site-existente.md).
- [Voltar ao índice de guias](./README.md)
