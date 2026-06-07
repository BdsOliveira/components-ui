# O `config.json` do cliente

> **Pré-requisitos**: [Clientes](./README.md), [estratégia de nicho](../templates/estrategia-de-nicho.md).
> **Tema**: clients

O `config.json` é tudo que define um site de cliente. Esta página descreve sua
estrutura, campos e — crucial — por que ele **não** é o `WebsiteConfig` final.

## Estrutura: `{ template, company, theme, content }`

Fonte: `sites/clients/clinica-saude/config.json`

```json
{
  "template": "clinic",
  "company": {
    "name": "Clínica Saúde",
    "tagline": "Cuidado de saúde moderno para toda a família",
    "contact": {
      "email": "contato@clinicasaude.example",
      "phone": "+55 11 4000 0000",
      "address": "Av. Paulista, 1000 — São Paulo"
    }
  },
  "theme": {
    "colors": { "primary": "#15803d", "background": "#ffffff", "foreground": "#0f172a" },
    "mode": "light"
  },
  "content": {
    "hero": {
      "variant": "split",
      "heading": "Sua saúde em boas mãos",
      "subheading": "Atendimento humano e moderno no coração de São Paulo.",
      "cta": { "label": "Agendar consulta", "href": "#contact" },
      "media": { "src": "/clients/clinica-saude/images/hero.jpg", "alt": "Equipe da Clínica Saúde recebendo um paciente" }
    },
    "services": {
      "heading": "Especialidades",
      "items": [
        { "title": "Clínica geral", "description": "Consultas e acompanhamento para toda a família." }
      ]
    }
  }
}
```

## Os quatro campos

Fonte: `app/pages/index.vue`, `sites/templates/registry.ts`

| Campo | Obrigatório | Papel |
|-------|-------------|-------|
| `template` | sim | discriminador; precisa existir em `templateRegistry` |
| `company` | sim (`name`) | identidade do negócio; sobrescreve `defaults.company` |
| `theme` | opcional | tokens visuais; sobrescreve o tema do template |
| `content` | opcional | conteúdo por seção; sobrescreve `defaults.sections` por concern |

`content` é um mapa `tipo-de-seção → campos`. Você só precisa declarar o que quer
**sobrescrever**; o resto vem do `defaults.json` do template. Note no exemplo que
`testimonials`, `faq`, `contact` e `footer` não aparecem — ficam com os defaults do
clinic.

## A distinção crítica: config do cliente ≠ WebsiteConfig

Fonte: `app/pages/index.vue`, `sites/templates/clinic/page.ts`, `sites/core/schemas/website.ts`

- **Config do cliente**: `{ template, company, theme, content }` — `content` é por
  seção, **sem ordem**.
- **`WebsiteConfig` final**: `{ company, theme, sections[] }` — `sections` é uma
  **lista ordenada**; a ordem vem do template, não do cliente.

A transformação é feita pela factory do template:

```ts
const overrides = { company: clientConfig.company, theme: clientConfig.theme, content: clientConfig.content }
const raw = entry.factory(overrides)         // -> WebsiteConfig
const result = validateWebsiteConfig(raw)    // valida o site inteiro
```

Confundir os dois é a fonte nº 1 de erro de config — ver
[troubleshooting](../troubleshooting/problemas-comuns.md).

## Validação

Fonte: `sites/core/schemas/validate-website.ts`

O `WebsiteConfig` montado passa por `validateWebsiteConfig`. Qualquer seção
inválida rejeita o config inteiro (a página exibe `Invalid client config`); nunca
renderiza quebrado. Detalhe em [schemas e validação](../core/schemas-e-validacao.md).

## Próximos passos

- Regras e tipagem do JSON: [padrões de configuração JSON](../standards/padroes-de-configuracao-json.md).
- Edite conteúdo: [adicionar uma seção a um site existente](../guides/adicionar-secao-a-site-existente.md).
- Isolamento e domínio: [isolamento e domínios](./isolamento-e-dominios.md).
- [Voltar ao índice de clientes](./README.md)
