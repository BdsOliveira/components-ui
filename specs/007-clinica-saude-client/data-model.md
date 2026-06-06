# Phase 1 Data Model: First Real Client — Clínica Saúde (Phase 7)

Entities are **data + file artifacts**, not new schema types — Phase 7 reuses the Phase 3/6 schemas
(`CompanyConfig`, `ThemeConfig`, block slices, `WebsiteConfig`) and adds one client directory plus the
loader that turns its data into a validated, rendered site.

## Entity: Client Directory (`sites/clients/clinica-saude/`)

The self-contained, highest-layer unit for one client (Constitution II/XII). Depends on `templates` and
`core`; nothing depends on it.

| Member | Kind | Required | Notes |
|--------|------|----------|-------|
| `config.json` | file | yes | Client override document (see below). |
| `images/` | dir | yes | Client-owned image assets referenced by `config.json`. |
| `domain.txt` | file | yes | Single-line domain string for this client. |
| `__tests__/` | dir | yes | Validation instruments (config parse, override proof, domain). |

**Rules**:
- Contains data + assets + tests only — no shared/template logic (clients README "Prohibited").
- No cross-client references; nothing imports from another client.

## Entity: Client Config (`config.json`)

A client override document consumed by the template factory. Shape:

```ts
interface ClientConfig {
  template: 'clinic'                         // template discriminator (Phase 7: clinic only)
  company?: Partial<CompanyConfig>           // Phase 3 company identity overrides
  theme?: Partial<ThemeConfig>               // Phase 3 theme token overrides
  content?: Partial<Record<ClinicSectionType, Record<string, unknown>>> // per-section slice overrides
}
```

| Field | Required | Validation |
|-------|----------|------------|
| `template` | yes | MUST equal `"clinic"` (only registered template this phase). Unknown → load error. |
| `company` | no | Deep-merged over clinic defaults; must keep `company.name` resolvable (Phase 3). |
| `theme` | no | Merged over `clinicTheme`; enum/`mode` fields validated by `themeSchema`. |
| `content` | no | Keys ∈ clinic `ORDER`; each slice must satisfy its block schema after merge. |

**Derivation → render**: `createClinicSite({ company, theme, content })` → `WebsiteConfig` →
`validateWebsiteConfig(...)`. Section **order is NOT a field** here (FR-008): the template owns it.

**Relationships**: `company`/`theme`/`content` map 1:1 to `ClinicOverrides` (Phase 6 `page.ts`). Image
references live inside `content.hero.media` (`{ src, alt }`).

## Entity: Client Images (`images/`)

Client-owned image files. Referenced from `config.json` by public URL
`/clients/clinica-saude/images/<file>` (served via Nitro `publicAssets`, research D4).

| Rule | Detail |
|------|--------|
| Location | Physically under `sites/clients/clinica-saude/images/` (isolation, XII). |
| Reference | `content.hero.media.src` = the served URL; `media.alt` REQUIRED (a11y, V/X). |
| Integrity | A referenced file that is absent MUST be detectable (FR-012) — covered by a presence check in tests/quickstart. |

## Entity: Domain Config (`domain.txt`)

| Rule | Detail |
|------|--------|
| Format | Exactly one trimmed domain string (e.g. `clinica-saude.example.com`). |
| Validation | Non-empty AND matches a basic hostname pattern (labels + TLD). Invalid → reported (FR-012). |
| Scope | Associates a domain with this client; multi-domain/DNS out of scope. |

## Entity: Client Site Loader (app composition layer)

The top-layer wiring that renders a client. Not in `core` (must not depend on `templates`, II/III).

| Responsibility | Detail |
|----------------|--------|
| Read | Import the client `config.json`. |
| Dispatch | `config.template` → template factory (`'clinic'` → `createClinicSite`). |
| Build | Apply `{ company, theme, content }` overrides → `WebsiteConfig`. |
| Validate | `validateWebsiteConfig(raw)`; render only `result.data` when `valid` (SiteRenderer contract). |
| Render | `<SiteRenderer :config>` inside `app/pages/index.vue`. |

**State / flow**: `config.json (data)` → `loader (dispatch+build)` → `validateWebsiteConfig (gate)` →
`SiteRenderer (render)`. Invalid config → no render + reported failure (Phase 3 failure behavior).

## Reused entities (unchanged, from earlier phases)

- `CompanyConfig`, `ThemeConfig`, block slices (`HeroConfig` w/ `media{src,alt}`, …) — Phase 3/5.
- `WebsiteConfig`, `validateWebsiteConfig` — Phase 3.
- `createClinicSite` / `clinicSite` / `ClinicOverrides`, fixed `ORDER` — Phase 6.
- `SiteRenderer`, `DynamicSection`, `useSiteTheme`, `useThemeVars` — Phase 4.
