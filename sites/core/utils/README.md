# core/utils

**Responsibility**: Pure utility functions and data transformers — framework-free helpers with no Vue reactivity.

**Allowed**: Deterministic, side-effect-free functions (formatting, parsing, transforming data) usable anywhere.

**Prohibited**: Vue reactivity or lifecycle (→ `composables/`), component markup, and client-specific logic.

**Depends on**: `core` only (`types`). Never depends on Vue runtime or higher layers.
