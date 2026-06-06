/**
 * Clinic visual identity — the ONLY concern this file owns (contract T4, FR-004,
 * FR-009; research Decision 4). A typed `ThemeConfig` so `mode`/enum fields are
 * statically checked and the theme is editable in isolation from structure
 * (`page.ts`) and content (`defaults.json`).
 *
 * Direction (frontend-design: calm/clinical): a clean, trustworthy clinic look —
 * cool primary, light mode, soft radius, generous spacing — applied by default,
 * not a bare schema default.
 */
import type { ThemeConfig } from '~~/sites/core/schemas'

export const clinicTheme: ThemeConfig = {
  colors: { primary: '#0ea5e9', background: '#ffffff', foreground: '#0f172a' },
  mode: 'light',
  radius: '0.75rem',
  spacing: 'comfortable',
}
