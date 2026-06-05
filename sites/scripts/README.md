# scripts

**Responsibility**: Automation, scaffolding, and generators — tooling that builds, validates, or generates platform artifacts.

**Allowed**: Generic scripts and generators (e.g. scaffold a client, validate structure, generate config) reusable across the platform.

**Prohibited**: Client-specific one-offs, and runtime application logic (→ `core`).

**Depends on**: `core` (may read its types/schemas). Never depended on by lower layers.
