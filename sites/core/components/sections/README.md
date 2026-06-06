# core/components/sections

**Responsibility**: Full page sections — large, self-contained blocks composed into pages (e.g. HeroSection, ServicesSection, FAQSection, CTASection).

**Allowed**: Section-level components driven entirely by props/config, reusable across niches.

**Prohibited**: Atomic primitives (→ `ui/`), structural chrome like header/footer (→ `layout/`), and any client- or template-specific content.

**Depends on**: `core` only (may compose `ui/` primitives, `theme`, `composables`, `utils`).

## Phase 5 — the Core Block Set

The eight concrete blocks live here as `<Block>Section.vue` SFCs. Each reads its slice from a single
`data` prop (`BlockProps<T>`), reads the site theme via `useSiteTheme()`/`useThemeVars()`, and
(Contact/Footer) site-level identity via `useSiteCompany()`. All eight are registered in
`register.ts` and reached only through the type→component registry (never auto-imported).

| `type` | Component | Variants (default first) | Required content |
|--------|-----------|--------------------------|------------------|
| `hero` | HeroSection | centered, split, minimal | `heading` |
| `about` | AboutSection | text, media-left, media-right | `heading`, `body` |
| `services` | ServicesSection | grid, list | `items[]` (each `title`) |
| `cta` | CtaSection | banner, boxed | `heading`, `cta` |
| `testimonials` | TestimonialsSection | grid, carousel | `items[]` (each `quote`+`author`) |
| `faq` | FaqSection | accordion, list | `items[]` (each `question`+`answer`) |
| `contact` | ContactSection | split, stacked | — (sources `company.contact`) |
| `footer` | FooterSection | columns, minimal | — (sources `company` identity/social) |

Schemas (source of truth for each `data` type) are `sites/core/schemas/<block>.ts`. Adding a ninth
block later is "add schema + SFC + one registration pair in `register.ts`" — no renderer edits.

**Section CSS approach** (zero new deps — `@nuxtjs/tailwindcss` / `@nuxt/image` / `@nuxt/icon` are
already present and usable from section SFCs):

- **Tailwind utilities** for layout, spacing, and responsive (mobile-first) structure.
- **Injected theme vars** for brand: `useThemeVars()` maps the injected `ThemeConfig` to inline
  `--site-*` CSS custom properties bound on the block root; utilities reference them via
  `var(--site-primary)` etc. Re-skinning is a theme-config change, no block-source edits.
