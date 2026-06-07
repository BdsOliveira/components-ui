# Como customizar temas/cores

> **Pré-requisitos**: [config.json](../clients/config-json.md),
> [padrões de componente](../components/padroes-de-componente.md).
> **Tema**: guides

## Explicação

Re-skin de um site inteiro é uma mudança de **configuração** (tema), não de
código-fonte. Você ajusta `theme` no `config.json` do cliente; os blocos leem os
tokens via `useThemeVars()` e aplicam como CSS custom properties — **sem cor
hardcoded** dentro de componente.

## Localização dos arquivos

Fonte: `sites/clients/clinica-saude/config.json`, `sites/core/schemas/theme.ts`, `sites/templates/clinic/theme.ts`

```text
sites/clients/<name>/config.json     # editar: o bloco theme (override do cliente)
sites/core/schemas/theme.ts          # referência: campos válidos e defaults
sites/templates/<template>/theme.ts  # referência: tema base do template
```

## Exemplo prático

### 1. Campos de tema disponíveis

Fonte: `sites/core/schemas/theme.ts`

```ts
export const themeSchema = z.object({
  colors: colorsSchema,                 // primary (default #0ea5e9), secondary, accent, background, foreground
  typography: z.object({ headingFont, bodyFont }).optional(),
  mode: z.enum(['light', 'dark', 'system']).default('system'),
  radius: z.string().optional(),
  spacing: z.string().optional(),
})
```

### 2. Sobrescrever o tema no cliente

Fonte: `sites/clients/clinica-saude/config.json`

```json
{
  "theme": {
    "colors": { "primary": "#15803d", "background": "#ffffff", "foreground": "#0f172a" },
    "mode": "light"
  }
}
```

O override é por concern: mexer no tema não toca estrutura nem conteúdo.

### 3. Como o bloco aplica o tema

Fonte: `sites/core/components/sections/useThemeVars.ts`

```ts
const themeVars = useThemeVars()  // { '--site-primary': '#15803d', ... }
// <section :style="themeVars">   -> Tailwind usa var(--site-primary)
```

## Convenções esperadas

- Cores e tokens vivem em `theme` (cliente) ou `theme.ts` (template) — **nunca**
  hardcoded em um componente.
- Use os campos do `themeSchema`; `colors.primary` tem default, então pode omitir.
- `mode`: `light` | `dark` | `system`.
- Prefixo das CSS vars é `--site-*`.

## Erros comuns

| Sintoma | Causa | Correção |
|---------|-------|----------|
| cor não muda | cor hardcoded no componente | mova para `theme`; use `useThemeVars` |
| tema "some" | `theme` inválido no config | confira contra `themeSchema` |
| var indefinida no CSS | token não setado no tema | adicione o campo (ex.: `colors.accent`) |

Mais: [troubleshooting](../troubleshooting/problemas-comuns.md).

## Próximos passos

- Conteúdo das seções: [adicionar uma seção a um site existente](./adicionar-secao-a-site-existente.md).
- Critérios theme-aware: [padrões de componente](../components/padroes-de-componente.md).
- [Voltar ao índice de guias](./README.md)
