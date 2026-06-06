# Quickstart: Automatic Client Scaffold (Phase 8)

Scaffold a complete, deploy-ready client with one command, then build it.

## Prerequisites

- Repo installed (`npm install`) — adds `tsx` (the scaffold runner).
- Templates available: `clinic`, `lawyer`, `restaurant`, `school`, `local-business`.

## 1. Scaffold a client

Non-interactive (CI-safe — all three flags supplied):

```bash
npm run new-client -- --name acme-dental --template clinic --domain acmedental.example.com
```

Interactive (prompts for anything omitted):

```bash
npm run new-client
# ? Client name (kebab-case): acme-dental
# ? Template (clinic, lawyer, restaurant, school, local-business): clinic
# ? Domain: acmedental.example.com
```

Result:

```text
sites/clients/acme-dental/
├── config.json          # seeded from template defaults + your identity
├── domain.txt           # acmedental.example.com
├── images/              # placeholder asset (swap later)
├── README.md
└── __tests__/acme-dental.spec.ts
✓ Created sites/clients/acme-dental/ from template "clinic"
Next: CLIENT=acme-dental npm run generate
      CLIENT=acme-dental npm run dev
```

## 2. Verify it validates (already proven by the scaffold's gate)

```bash
npx vitest run sites/clients/acme-dental/__tests__/acme-dental.spec.ts
```

The whole suite also discovers the new test:

```bash
npm test
```

## 3. Preview / build the client

```bash
CLIENT=acme-dental npm run dev        # preview
CLIENT=acme-dental npm run generate   # static site → ship .output/public to your server
```

Existing clients still build unchanged:

```bash
CLIENT=clinica-saude npm run generate
npm run generate                      # CLIENT unset ⇒ defaults to clinica-saude
```

## Guardrails (all create nothing on failure)

```bash
npm run new-client -- --name clinica-saude --template clinic --domain x.example.com
#   ✗ client "clinica-saude" already exists — refusing to overwrite

npm run new-client -- --name acme --template dentist --domain x.example.com
#   ✗ unknown template "dentist". Available: clinic, lawyer, restaurant, school, local-business

npm run new-client -- --name "Acme Dental" --template clinic --domain x.example.com
#   ✗ invalid name. Use kebab-case: lowercase letters/digits separated by hyphens
```

## Refine afterward (data only)

- Replace `images/` placeholders with real assets.
- Edit `config.json` copy, add accents to the display name, adjust theme.
- All refinements are data changes against the client's own directory — no
  source edits to templates or core.
