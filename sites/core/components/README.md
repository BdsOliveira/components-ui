# core/components

**Responsibility**: Reusable UI components, grouped by role into `sections/`, `ui/`, and `layout/`.

**Allowed**: Vue components that are business-neutral and configurable via props. Place each by role: full page sections, atomic primitives, or structural chrome.

**Prohibited**: Client/template-specific markup or copy; components that do not belong to one of the three role groups.

**Depends on**: `core` only (theme, types, composables, utils). Never depends on `templates`, `clients`, `onboarding`, `assets`, or `scripts`.
