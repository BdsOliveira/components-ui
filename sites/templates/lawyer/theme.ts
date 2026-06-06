/**
 * Lawyer visual identity (factory shape; research D5). Theme is the ONLY concern
 * this file owns, editable in isolation from structure (`page.ts`) and content
 * (`defaults.json`). Direction: a serious, trustworthy deep-navy primary.
 */
import type { ThemeConfig } from '~~/sites/core/schemas'

export const lawyerTheme: ThemeConfig = {
  colors: { primary: '#1e3a8a' },
}
