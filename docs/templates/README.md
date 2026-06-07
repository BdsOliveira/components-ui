# Templates

> **Pré-requisitos**: [Arquitetura em camadas](../architecture/arquitetura-em-camadas.md).
> **Tema**: templates

Templates representam **nichos de mercado**, não one-offs visuais. Cada template
orquestra seções reutilizáveis com ordem fixa, tema e conteúdo padrão.

## Documentos

- [Estratégia de nicho](./estrategia-de-nicho.md) — como um template compõe
  estrutura + tema + defaults e por que a ordem não é sobrescrevível.

## Templates existentes

Fonte: `sites/templates/registry.ts`

`clinic`, `lawyer`, `restaurant`, `school`, `local-business` — todos com a mesma
forma normalizada (`defaults.json` + `theme.ts` + `page.ts → create<X>Site`).

## Próximos passos

- Entenda a composição: [estratégia de nicho](./estrategia-de-nicho.md).
- Crie um novo: [criar um novo template](../guides/criar-novo-template.md).
- [Voltar ao índice principal](../README.md)
