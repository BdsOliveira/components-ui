# Feature Specification: Automatic Client Scaffold (Phase 8)

**Feature Branch**: `008-new-client-scaffold`

**Created**: 2026-06-06

**Status**: Draft

**Input**: User description: "FASE 8 — Scaffold automático. Preciso de algo como `npm run new-client`. Esse comando deve: copiar template, gerar config, criar estrutura, preparar deploy."

## Overview

Phase 7 proved a real client can be born from configuration alone — but it was assembled **by hand**:
someone created the client directory, wrote `config.json`, added `domain.txt`, dropped in an `images/`
folder, wrote a test, and then edited shared deploy wiring so the site could actually be served. Every
new client repeats that error-prone ritual.

Phase 8 removes the ritual. It introduces a **single command** — `npm run new-client` — that produces a
complete, valid, ready-to-build client from a chosen template, with no hand editing of any shared or
lower-layer code. The command performs four jobs the operator does today by hand:

- **Copy template** — start from an existing niche template (e.g. clinic, lawyer, restaurant, school,
  local-business) instead of a blank file.
- **Generate config** — produce the client's own `config.json` seeded from that template's defaults,
  filled with the new client's identity.
- **Create structure** — lay down the full client directory (config, domain, images location, tests,
  README) in the conventional shape every client already follows.
- **Prepare deploy** — register the new client so it can be built and served (its assets resolve, its
  domain is recorded) **without breaking any existing client**.

The scaffold itself is platform tooling — it belongs to the `scripts` layer, whose stated job is "scaffold
a client, validate structure, generate config." It depends only on reading templates and core
types/schemas; nothing in lower layers depends on it. The command writes a new `clients/<name>/`
directory and updates deploy wiring; it never edits template or core source.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - One command scaffolds a complete client (Priority: P1)

An operator runs the new-client command, identifies the client (name and source template) and a domain,
and the command writes a complete, conventionally-shaped client directory — config, domain, images
location, tests, README — without the operator hand-creating any file.

**Why this priority**: This is the irreducible value of the phase. It replaces the manual Phase-7 ritual
with a repeatable command. Every other story refines or guards this one; on its own it already delivers a
working scaffold.

**Independent Test**: Run the command for a new client name against an existing template, then inspect the
result — a full client directory exists in the conventional shape, populated from the template, with no
files created by hand.

**Acceptance Scenarios**:

1. **Given** an existing niche template, **When** the operator runs the command with a new client name and
   that template, **Then** a new `clients/<name>/` directory is created containing config, a domain file,
   an images location, a tests location, and a README.
2. **Given** the command has run, **When** the produced directory is compared to the existing hand-built
   client, **Then** it follows the same structure and conventions.
3. **Given** the command runs, **When** template and core source are inspected afterward, **Then** they are
   unchanged — only the new client directory and deploy wiring were written.

---

### User Story 2 - The scaffolded client is valid and renders with no manual fixes (Priority: P1)

The configuration the command generates is immediately valid against the platform's rules and produces a
real, rendering site for the new client — the operator does not have to repair generated output before it
works.

**Why this priority**: A scaffold that emits invalid or non-rendering output just moves the manual work
downstream. The command's promise is "ready to build," so validity of its output is as critical as creating
it.

**Independent Test**: Scaffold a client, then run the project's validation and build/preview without editing
the generated files — the config passes validation and a complete site for the new client renders.

**Acceptance Scenarios**:

1. **Given** a freshly scaffolded client, **When** the platform's configuration validation runs against it,
   **Then** it passes with no errors.
2. **Given** a freshly scaffolded client, **When** the site is built/previewed, **Then** a complete site for
   that client renders using the chosen template, with the client's own identity.
3. **Given** the scaffolded client includes a test, **When** the project's test suite runs, **Then** the new
   client's test is discovered and passes.

---

### User Story 3 - The new client is deploy-ready without breaking existing clients (Priority: P2)

After scaffolding, the new client's assets resolve and its domain is recorded so the site can be built and
served — and every previously scaffolded client continues to build and serve exactly as before.

**Why this priority**: "Prepare deploy" is the step most prone to manual error today, because it means
touching shared wiring. Automating it is high value, but it depends on a valid client already existing
(US1/US2), so it ranks just below them.

**Independent Test**: Scaffold a second client alongside the existing one, then build/preview — both clients'
images resolve from their own directories and both domains are recorded, with no manual edit to shared
wiring.

**Acceptance Scenarios**:

1. **Given** a newly scaffolded client, **When** the site is built/served, **Then** that client's images
   resolve from its own directory at its own asset path.
2. **Given** at least one pre-existing client, **When** a new client is scaffolded, **Then** the existing
   client still builds and serves unchanged.
3. **Given** the new client, **When** its deploy registration is inspected, **Then** its domain and asset
   location are recorded through the conventional mechanism, not by hand-editing unrelated config.

---

### User Story 4 - Safe, guided, repeatable runs (Priority: P3)

The command guards against foreseeable mistakes — a name that collides with an existing client, an invalid
name, or an unknown template — reporting a clear reason and leaving the workspace unchanged rather than
producing a half-written client.

**Why this priority**: Guardrails make the tool trustworthy for repeated use, but the command delivers value
before they exist; they harden rather than enable it.

**Acceptance Scenarios**:

1. **Given** a client name that already exists, **When** the operator runs the command with that name, **Then**
   it refuses, explains the collision, and does not overwrite the existing client.
2. **Given** an unknown or misspelled template, **When** the operator runs the command, **Then** it reports
   the invalid template and lists the available templates, creating nothing.
3. **Given** an invalid client name (e.g. unsupported characters), **When** the operator runs the command,
   **Then** it reports the naming rule and creates nothing.
4. **Given** the command fails partway, **When** it stops, **Then** no partial client directory or partial
   deploy wiring is left behind.

---

### Edge Cases

- **Name collision** — a client directory with the requested name already exists (see US4). Default: refuse,
  do not overwrite.
- **Unknown template** — the requested source template does not exist; the command lists valid templates and
  creates nothing.
- **Invalid client name** — empty, whitespace, or characters illegal in a directory/URL segment; rejected
  with the naming rule.
- **Missing or empty input** — no name/template/domain supplied; the command either prompts for the missing
  value or reports what is required, rather than guessing silently.
- **Partial failure** — the command fails after creating some files; it must not leave a half-built client or
  half-applied deploy wiring (clean up or apply atomically).
- **Domain reuse** — the requested domain is already recorded for another client; the command surfaces the
  conflict.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The platform MUST expose a single command, runnable as `npm run new-client`, that scaffolds a
  new client end to end.
- **FR-002**: The command MUST accept, for a run, the new client's name, a source template, and the client's
  domain — collecting any missing value interactively or reporting it as required (no silent defaults for
  these three).
- **FR-003**: The command MUST create a new client directory under the clients layer, named for the client,
  in the same conventional shape as existing clients: a configuration document, a domain file, an images
  location, a tests location, and a README.
- **FR-004**: The command MUST seed the new client's configuration from the chosen template's defaults,
  applying the new client's identity (at minimum its name and domain), so the result is a distinct client and
  not a copy of another client's content.
- **FR-005**: The generated configuration MUST pass the platform's existing configuration validation with no
  manual edits.
- **FR-006**: The generated client MUST produce a complete, rendering site using the chosen template when the
  project is built or previewed, with no manual edits.
- **FR-007**: The command MUST register the new client for deployment — at minimum making its images resolve
  from its own directory and recording its domain — through the platform's conventional mechanism.
- **FR-008**: Registering a new client for deployment MUST NOT alter the behavior of any existing client; all
  previously scaffolded clients MUST continue to build and serve unchanged.
- **FR-009**: The command MUST NOT modify template-layer or core-layer source; it may only create the new
  client directory and update deploy wiring.
- **FR-010**: The command MUST refuse to overwrite an existing client of the same name, reporting the
  collision and leaving the existing client untouched.
- **FR-011**: The command MUST reject an unknown template (listing the available templates) and an invalid
  client name (stating the naming rule), creating nothing in either case.
- **FR-012**: On any failure, the command MUST NOT leave a partially-created client or partially-applied
  deploy wiring behind.
- **FR-013**: The command MUST report, on success, where the client was created and what to do next (e.g. how
  to build/preview it).
- **FR-014**: The generated client directory MUST include a starter test that the project's existing test
  suite discovers and runs.

### Key Entities *(include if feature involves data)*

- **Scaffold command**: The single entry point (`npm run new-client`) that orchestrates copy → generate →
  create → prepare-deploy for one client per run.
- **Source template**: An existing niche template (clinic, lawyer, restaurant, school, local-business) whose
  defaults seed the new client's configuration. Read-only input to the command.
- **Client scaffold**: The output directory for the new client — its configuration, domain file, images
  location, tests, and README — in the conventional client shape.
- **Deploy registration**: The conventional wiring that makes a client buildable and servable — its asset
  resolution and recorded domain — additive per client and isolated from other clients.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An operator can scaffold a new, deploy-ready client with a single command in under 2 minutes,
  versus the multi-file manual process used in Phase 7.
- **SC-002**: A scaffolded client requires zero manual file creation and zero manual edits before it
  validates, builds, and renders.
- **SC-003**: 100% of scaffolded clients pass the platform's configuration validation on first run.
- **SC-004**: After scaffolding a new client, 100% of previously existing clients still build and serve
  unchanged.
- **SC-005**: For every guarded error case (name collision, unknown template, invalid name), the command
  creates nothing and reports an actionable reason.
- **SC-006**: An operator unfamiliar with the internal client layout can create a working client using only
  the command and its prompts/messages, without reading the directory conventions first.

## Assumptions

- **Reuses Phase-7 conventions**: The scaffold targets the established client shape proven in Phase 7
  (`config.json`, `domain.txt`, `images/`, `__tests__/`, `README.md`) and the existing template and
  validation layers; it does not redesign them.
- **Per-client deploy model**: "Prepare deploy" means making each client independently buildable/servable —
  recording its domain and resolving its own assets — consistent with the existing one-directory-per-client,
  one-domain-per-client model. A multi-tenant runtime router is out of scope for this phase.
- **Input model**: The three identifying values (name, template, domain) are provided as command
  input/prompts; richer content (full copy, real images, branding) is refined afterward by editing the
  generated client, exactly as a hand-built client would be.
- **Templates already exist**: The available niche templates (clinic, lawyer, restaurant, school,
  local-business) are the selectable sources; the command does not create new templates.
- **Placeholder assets**: The scaffold provides a placeholder images location/asset; supplying real images is
  a later data change against the client's own directory.
- **Single client per run**: One invocation scaffolds exactly one client.
- **Local developer tooling**: The command runs in the project's development environment (alongside existing
  scripts); it does not itself perform a remote deploy — it makes the client deploy-ready for the existing
  build/preview pipeline.
