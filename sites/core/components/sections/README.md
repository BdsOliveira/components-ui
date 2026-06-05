# core/components/sections

**Responsibility**: Full page sections — large, self-contained blocks composed into pages (e.g. HeroSection, ServicesSection, FAQSection, CTASection).

**Allowed**: Section-level components driven entirely by props/config, reusable across niches.

**Prohibited**: Atomic primitives (→ `ui/`), structural chrome like header/footer (→ `layout/`), and any client- or template-specific content.

**Depends on**: `core` only (may compose `ui/` primitives, `theme`, `composables`, `utils`).
