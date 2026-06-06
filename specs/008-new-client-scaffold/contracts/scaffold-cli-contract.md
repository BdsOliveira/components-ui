# Contract: `npm run new-client` (Scaffold CLI)

The command's external interface — invocation, inputs, outputs, exit codes, and
messages. This is the user-facing contract the scaffold MUST satisfy.

## Invocation

```bash
npm run new-client -- --name <slug> --template <known> --domain <hostname>
# any omitted flag is prompted for; all three present ⇒ fully non-interactive
npm run new-client            # fully interactive (prompts for all three)
```

Resolves to `tsx sites/scripts/new-client.ts` (research D1).

## Inputs (C-CLI-1 .. C-CLI-3)

| # | Input | Flag | Prompt when missing | Rule |
|---|-------|------|--------------------|------|
| C-CLI-1 | name | `--name` | yes | kebab slug `^[a-z0-9]+(-[a-z0-9]+)*$` |
| C-CLI-2 | template | `--template` | yes | a registry key (FR-011) |
| C-CLI-3 | domain | `--domain` | yes | hostname regex (research D9) |

No silent defaults for these three (FR-002). When all three flags are present, the
command MUST NOT prompt (CI-safe).

## Success output (C-CLI-4)

- Exit code `0`.
- `sites/clients/<name>/` exists with `config.json`, `domain.txt`, `images/`
  (placeholder asset), `README.md`, `__tests__/<name>.spec.ts`.
- Generated `config.json` passes `validateWebsiteConfig` (proven by the staged
  vitest gate, research D7).
- Message states **where** it was created and **what to do next** (FR-013), e.g.:
  ```
  ✓ Created sites/clients/<name>/ from template "<template>"
  Next: CLIENT=<name> npm run generate   # build this client's static site
        CLIENT=<name> npm run dev        # preview it
  ```

## Guarded failures (C-CLI-5) — exit ≠ 0, nothing written

| Case | Trigger | Message contract |
|------|---------|------------------|
| name collision | `clients/<name>/` exists | reports collision, does NOT overwrite (FR-010) |
| unknown template | template ∉ registry | reports invalid template + lists available templates (FR-011) |
| invalid name | fails slug rule | states the naming rule (FR-011) |
| invalid domain | fails hostname rule | states the domain rule |
| domain reuse | domain already in another `domain.txt` | surfaces the conflicting client |
| partial failure | any error mid-run | staging removed; no partial client or wiring left (FR-012) |

Every guarded failure MUST create nothing in `sites/clients/` (SC-005).

## Invariants (C-CLI-6)

- Writes ONLY `sites/clients/<name>/` (FR-009). Template-layer, core-layer, and
  shared app/deploy source are unchanged by a run (US1 scenario 3).
- One invocation scaffolds exactly one client (spec Assumption).
