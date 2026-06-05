# core/theme

**Responsibility**: Design tokens and the theme system (dark/light), the single source of visual styling values.

**Allowed**: Color/spacing/typography tokens, theme definitions, and the mechanism that switches or applies them.

**Prohibited**: Component markup (→ `components/`), client-specific brand overrides, and business logic.

**Depends on**: `core` only (`types`, `utils`). Never depends on higher layers.
