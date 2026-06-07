# Como criar um novo template

> **Pré-requisitos**: [Estratégia de nicho](../templates/estrategia-de-nicho.md).
> **Tema**: guides

## Explicação

Um template representa um **nicho** (clinic, lawyer, ...). Crie um novo quando um
vertical de mercado precisa de uma ordem de seções, identidade visual e conteúdo
padrão próprios. Você **não** cria layouts novos — orquestra seções existentes.

## Localização dos arquivos

Fonte: `sites/templates/clinic/`, `sites/templates/registry.ts`

```text
sites/templates/<nicho>/
├── page.ts        # ORDER + create<Nicho>Site(overrides)
├── theme.ts       # <nicho>Theme: ThemeConfig
└── defaults.json  # company + conteúdo por seção
```

E registre o template em: `sites/templates/registry.ts`.

## Exemplo prático

### 1. `theme.ts` — identidade visual

Fonte: `sites/templates/clinic/theme.ts`

```ts
import type { ThemeConfig } from '~~/sites/core/schemas'

export const bakeryTheme: ThemeConfig = {
  colors: { primary: '#b45309', background: '#fffbeb', foreground: '#1c1917' },
  mode: 'light',
  radius: '0.5rem',
  spacing: 'comfortable',
}
```

### 2. `defaults.json` — conteúdo padrão

Fonte: `sites/templates/clinic/defaults.json`

```json
{
  "company": { "name": "Sample Bakery", "tagline": "Fresh every morning" },
  "sections": {
    "hero": { "variant": "centered", "heading": "Baked with love" },
    "services": { "heading": "Our menu", "items": [] }
  }
}
```

### 3. `page.ts` — estrutura (ordem fixa)

Fonte: `sites/templates/clinic/page.ts`

```ts
import type { WebsiteConfig } from '~~/sites/core/schemas'
import defaults from './defaults.json'
import { bakeryTheme } from './theme'

const ORDER = ['hero', 'services', 'cta', 'contact', 'footer'] as const
type SectionType = (typeof ORDER)[number]

export interface BakeryOverrides {
  company?: Partial<WebsiteConfig['company']>
  theme?: Partial<WebsiteConfig['theme']>
  content?: Partial<Record<SectionType, Record<string, unknown>>>
}

const defaultSections = defaults.sections as Record<SectionType, Record<string, unknown>>

export function createBakerySite(overrides: BakeryOverrides = {}): WebsiteConfig {
  return {
    company: { ...defaults.company, ...overrides.company },
    theme: { ...bakeryTheme, ...overrides.theme },
    sections: ORDER.map((type) => ({ type, ...defaultSections[type], ...(overrides.content?.[type] ?? {}) })),
  } as WebsiteConfig
}
```

### 4. Registrar no registry

Fonte: `sites/templates/registry.ts`

```ts
import { createBakerySite } from './bakery/page'
import bakeryDefaults from './bakery/defaults.json'

export const templateRegistry = {
  // ...existentes
  bakery: { factory: createBakerySite as TemplateEntry['factory'], defaults: bakeryDefaults as TemplateDefaults },
} as const satisfies Record<string, TemplateEntry>
```

Só `type`s já registrados (ver [registries](../core/registries.md)) podem entrar na
`ORDER`. O scaffold passa a oferecer `bakery` automaticamente.

## Convenções esperadas

- Três arquivos por concern: `page.ts` (estrutura), `theme.ts` (visual),
  `defaults.json` (conteúdo). Nunca misture concerns.
- Factory `create<Pascal>Site`; tema `<camel>Theme`; chave de registry em kebab-case.
- `ORDER` é fixa no template, não no cliente.
- Use só seções existentes; não duplique lógica nem crie layout custom.

## Erros comuns

| Sintoma | Causa | Correção |
|---------|-------|----------|
| `Unknown client template` no render | template não no registry | adicione a entrada em `registry.ts` |
| seção da ORDER some | `type` não registrado nos dois registries | registre o tipo ([guia](./adicionar-tipo-de-secao.md)) |
| scaffold não lista o template | falta `defaults.json` na pasta | crie o `defaults.json` |
| `Invalid client config` | default viola o schema da seção | ajuste o `defaults.json` ao schema |

Mais: [troubleshooting](../troubleshooting/problemas-comuns.md).

## Próximos passos

- Entenda a composição: [estratégia de nicho](../templates/estrategia-de-nicho.md).
- Adicione tipos de seção: [adicionar um tipo de seção](./adicionar-tipo-de-secao.md).
- [Voltar ao índice de guias](./README.md)
