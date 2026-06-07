# Estratégia de nicho

> **Pré-requisitos**: [Templates](./README.md), [diagramas](../architecture/diagramas.md).
> **Tema**: templates

Um template de nicho = **ordem fixa de seções** + **tema** + **conteúdo padrão**,
orquestrando seções reutilizáveis. A ordem das seções é do template e **não** é
sobrescrevível pelo cliente (Princípio VI).

## As três partes de um template

Fonte: `sites/templates/clinic/{page.ts,theme.ts,defaults.json}`

| Arquivo | Concern | Conteúdo |
|---------|---------|----------|
| `page.ts` | **estrutura** | a `ORDER` das seções e a factory `create<X>Site` |
| `theme.ts` | **identidade visual** | um `ThemeConfig` tipado (cores, mode, radius, spacing) |
| `defaults.json` | **conteúdo padrão** | `company` + conteúdo por seção |

### Estrutura (`page.ts`) — ordem é render

Fonte: `sites/templates/clinic/page.ts`

```ts
const ORDER = ['hero', 'services', 'testimonials', 'faq', 'contact', 'footer'] as const

export function createClinicSite(overrides: ClinicOverrides = {}): WebsiteConfig {
  return {
    company: { ...defaults.company, ...overrides.company },
    theme: { ...clinicTheme, ...overrides.theme },
    sections: ORDER.map((type) => ({
      type,
      ...defaultSections[type],
      ...(overrides.content?.[type] ?? {}),
    })),
  } as WebsiteConfig
}
```

`page.ts` contém **só estrutura** — nenhum conteúdo de seção e nenhum token de
tema. O merge é **por concern**: um override de `content` nunca toca estrutura ou
tema; um override de `theme` nunca toca estrutura ou conteúdo. `ORDER` é
intencionalmente NÃO sobrescrevível.

### Tema (`theme.ts`)

Fonte: `sites/templates/clinic/theme.ts`

```ts
export const clinicTheme: ThemeConfig = {
  colors: { primary: '#0ea5e9', background: '#ffffff', foreground: '#0f172a' },
  mode: 'light',
  radius: '0.75rem',
  spacing: 'comfortable',
}
```

### Conteúdo padrão (`defaults.json`)

Fonte: `sites/templates/clinic/defaults.json`

```json
{
  "company": { "name": "Bright Smile Dental", "tagline": "..." },
  "sections": {
    "hero": { "variant": "centered", "heading": "Confident smiles start here" },
    "services": { "heading": "Our services", "items": [ ... ] }
  }
}
```

## O registry de templates

Fonte: `sites/templates/registry.ts`

A fonte única que mapeia o discriminador `template` → factory + defaults. A página
de render despacha por aqui; o scaffold lê `defaults` para semear um cliente novo.
As chaves são a lista autoritativa de templates disponíveis:

```ts
export const templateRegistry = {
  clinic: { factory: createClinicSite, defaults: clinicDefaults },
  lawyer: { factory: createLawyerSite, defaults: lawyerDefaults },
  restaurant: { factory: createRestaurantSite, defaults: restaurantDefaults },
  school: { factory: createSchoolSite, defaults: schoolDefaults },
  'local-business': { factory: createLocalBusinessSite, defaults: localBusinessDefaults },
} as const satisfies Record<string, TemplateEntry>
```

Todo template compartilha a forma normalizada `TemplateOverrides`
(`{ company?, theme?, content? }`), então um único documento de override dirige
todas as factories.

## Por que a ordem não é do cliente

Fixar a ordem no template (e não no `config.json`) é o que mantém o template
**orquestrando** o nicho em vez de virar um layout custom por cliente — o
anti-padrão que a plataforma evita (ver [filosofia operacional](../architecture/filosofia-operacional.md)).

## Próximos passos

- Veja o diagrama de composição: [diagramas](../architecture/diagramas.md).
- Crie o seu: [criar um novo template](../guides/criar-novo-template.md).
- [Voltar ao índice de templates](./README.md)
