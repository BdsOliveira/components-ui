# clients

**Responsibility**: Isolated per-client configuration, assets, and domain config — one self-contained directory per client.

**Allowed**: Per-client `config.json`, client assets, and domain/brand configuration that selects and parameterizes templates and core components.

**Prohibited**: Shared/global logic (→ `core`), cross-client coupling, and any code another client could need (promote it to `core` or `templates` instead).

**Depends on**: `core` and `templates`. Nothing may depend on `clients` — it is the highest layer.
