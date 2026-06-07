# Criar e ver seu primeiro cliente

> **Pré-requisitos**: [Rodar em dev](./rodar-em-dev.md) funcionando.
> **Tema**: getting-started

Em poucos minutos: gerar um cliente novo com um comando e vê-lo renderizado no
navegador, sem editar nenhum arquivo à mão (SC-002).

## 1. Rodar o scaffold

Fonte: `package.json`, `sites/scripts/new-client.ts`

```bash
npm run new-client
```

O comando pergunta três coisas (ou aceita por flag, sem prompt):

- **nome** em kebab-case (slug — identificador minúsculo com hífens), ex.: `acme-dental`;
- **template** dentre os disponíveis (descobertos das pastas em `sites/templates/`
  que têm `defaults.json`: `clinic`, `lawyer`, `restaurant`, `school`, `local-business`);
- **domínio**, ex.: `acme-dental.example.com`.

Modo não interativo (útil em CI):

Fonte: `sites/scripts/new-client.ts`

```bash
npm run new-client -- --name acme-dental --template clinic --domain acme-dental.example.com
```

## 2. O que o comando faz

Fonte: `sites/scripts/new-client.ts`

1. Descobre os templates e valida os três inputs (slug, template existente, hostname).
2. Confere colisões: nome de cliente já existente e domínio já usado.
3. **Estaga** o cliente em `sites/clients/.new-client-tmp-<name>/`.
4. Roda um portão de validação (`vitest run` sobre o spec gerado).
5. Se passar, renomeia (atomicamente) para `sites/clients/<name>/`. Se falhar,
   apaga a staging e sai sem alterar o workspace.

A pasta gerada contém `config.json`, `domain.txt`, `images/hero.jpg` (placeholder),
`README.md` e `__tests__/<name>.spec.ts`.

## 3. Ver o cliente renderizado

Fonte: `nuxt.config.ts`, `app/pages/index.vue`

```bash
CLIENT=acme-dental npm run dev
```

Abra `http://localhost:3000`. O site do template escolhido aparece com o conteúdo
padrão e a identidade do novo cliente.

## Próximos passos

- Guia detalhado: [criar um novo cliente](../guides/criar-novo-cliente.md).
- Edite o conteúdo: [adicionar uma seção a um site existente](../guides/adicionar-secao-a-site-existente.md).
- Troque cores: [customizar tema/cores](../guides/customizar-tema-cores.md).
- [Voltar ao índice de getting-started](./README.md)
