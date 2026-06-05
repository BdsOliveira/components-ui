<!--
SYNC IMPACT REPORT
Version change: TEMPLATE (unversioned) → 1.0.0
Bump rationale: Initial ratification of project constitution from template.
Modified principles: N/A (initial creation)
Added principles (15):
  I. Modular & Composable Architecture First
  II. Layered System Design
  III. Core Engine Neutrality
  IV. JSON-Driven Rendering
  V. Reusable Component Philosophy
  VI. Niche-Based Template Strategy
  VII. Speed-First Operations
  VIII. Developer Experience Standards
  IX. Performance & Web Vitals
  X. UX Consistency
  XI. Testing & Reliability
  XII. Multi-Client Scalability
  XIII. Deployment Discipline
  XIV. Anti-Pattern Prohibition
  XV. Long-Term Vision Alignment
Added sections: Technology Constraints; Development Workflow & Quality Gates
Removed sections: None
Templates requiring updates:
  ✅ .specify/templates/plan-template.md (generic Constitution Check gate — compatible, no edit needed)
  ✅ .specify/templates/spec-template.md (compatible — no constitution-mandated sections added)
  ✅ .specify/templates/tasks-template.md (compatible — task categories cover principle-driven work)
Follow-up TODOs: None
-->

# Commercial Website Starter Kit Constitution

A Nuxt 4 multi-client commercial website starter-kit platform. Mission: publish complete
commercial websites in under 2 hours using reusable UI blocks, structured onboarding data,
and predefined niche templates. Optimizes for ultra-fast delivery, maintainability,
scalability, and JSON-driven architecture.

## Core Principles

### I. Modular & Composable Architecture First

The system MUST behave as a composable website engine, not a custom-coded website project.
Every UI section MUST be reusable, isolated, configurable, and independent. New websites MUST
be assembled from existing blocks (Lego-style), never developed from scratch. Composition
MUST be preferred over duplication.

**Rationale**: A composable engine is what makes sub-2-hour delivery and hundreds-of-clients
scale possible; custom-coded sites do not scale operationally.

### II. Layered System Design

The project MUST be divided into four clear layers with this canonical structure:

```text
sites/
├── core/          # technical engine
├── templates/     # niche-specific orchestrations
├── clients/       # client onboarding data + config
├── assets/        # shared and client assets
└── onboarding/    # onboarding form data and intake
```

Each layer MUST have a single responsibility. Higher layers (templates, clients) MUST depend
on lower layers (core) and never the reverse. Cross-layer leakage is a violation.

**Rationale**: Strict layering keeps the engine reusable and client data isolated, enabling
white-label operation and independent evolution of each layer.

### III. Core Engine Neutrality

The `core/` layer MUST contain only reusable, business-neutral building blocks: components,
layouts, composables, SEO utilities, forms, the theme system, rendering helpers, and data
transformers. The core MUST NOT contain business-specific logic or client-specific hardcoded
content. The core MUST prioritize extensibility and support white-label multi-client
operation plus future automation and AI-assisted generation.

**Rationale**: A neutral core is reused unchanged across every client; embedding client logic
there couples unrelated sites and destroys reusability.

### IV. JSON-Driven Rendering

All websites MUST be fully driven by structured configuration. Rendering MUST originate from
JSON data (`config.json`), uploaded assets, and onboarding form input. Configurations MUST be
strongly typed, schema-consistent, validated before render, and predictable in structure.
Creating a new website MUST NOT require modifying source code; manual editing MUST be
minimized.

**Rationale**: Data-driven rendering is the mechanism that converts onboarding input into a
live site without engineering work — the foundation of speed and automation.

### V. Reusable Component Philosophy

Components MUST be generic, highly configurable via props, loosely coupled, and content-driven.
They MUST be responsive and accessible (WCAG) by default and theme-aware (dark/light where
applicable). Component APIs MUST be predictable, consistent, and low in cognitive load.
Baseline reusable sections include: HeroSection, ServicesSection, TestimonialsSection,
FAQSection, CTASection, ContactSection, GallerySection.

**Rationale**: Generic, predictable components are the interchangeable blocks the assembly
model depends on; tightly coupled or bespoke components break composition.

### VI. Niche-Based Template Strategy

Templates MUST represent market niches (e.g., clinic, lawyer, restaurant, school,
local-business), not unique visual one-offs. Templates MUST orchestrate reusable sections —
defining section ordering, visual identity, and spacing/layout patterns — and MUST NOT contain
duplicated logic or fully custom per-client layouts.

**Rationale**: Niche templates amortize design effort across many clients in the same vertical;
per-client custom layouts reintroduce the cost the platform exists to eliminate.

### VII. Speed-First Operations

Every technical decision MUST favor repeatability, automation, reduced friction, and reduced
manual work. The architecture MUST optimize onboarding, assembly, deployment, content
replacement, maintenance, and scale-across-clients speed.

**Rationale**: Operational speed is the platform's core value proposition; decisions that add
manual steps directly undermine the mission.

### VIII. Developer Experience Standards

The project MUST enforce: strict TypeScript, auto-import patterns, clear folder organization,
linting and formatting, and composable-first patterns. Naming conventions MUST be strong and
file structures predictable. The system SHOULD provide scaffolding commands, code generators,
reusable schemas, and automated setup flows to keep onboarding complexity low.

**Rationale**: High DX keeps the platform maintainable as contributors and clients grow, and
generators turn repeatable work into commands.

### IX. Performance & Web Vitals

All generated websites MUST prioritize high Lighthouse scores, fast initial load, image
optimization, SEO, and accessibility. Static generation (SSG) MUST be used wherever possible,
with SSR where dynamic content requires it, and JavaScript hydration MUST be kept minimal.
Nuxt features MUST be leveraged for SSR/SSG, image optimization, SEO meta management, route
performance, and caching.

**Rationale**: Commercial sites convert on speed and search ranking; performance is a
deliverable requirement, not an optimization afterthought.

### X. UX Consistency

All templates and sections MUST follow consistent UX principles: clear CTA hierarchy,
mobile-first and conversion-oriented layouts, accessible typography, a consistent spacing
system, visual consistency, and predictable navigation.

**Rationale**: Consistent, conversion-focused UX guarantees baseline quality across every
client site regardless of who assembles it.

### XI. Testing & Reliability

The platform MUST define and maintain: component-level tests, schema validation tests,
rendering-consistency tests, regression prevention, and type-safe data contracts. The
following critical flows MUST be validated: onboarding rendering, template rendering, SEO
generation, deployment generation, and config parsing.

**Rationale**: With one engine powering many sites, a regression scales to every client;
validated contracts and flows contain that blast radius.

### XII. Multi-Client Scalability

The architecture MUST support operating many websites simultaneously. Each client MUST live
under an isolated directory containing its `config.json`, assets, and domain configuration:

```text
clients/
├── client-a/
├── client-b/
└── client-c/
```

Client configurations MUST be isolated, deployments scalable, operation white-label, and
domains abstracted. The structure MUST not block future SaaS evolution.

**Rationale**: Isolation per client prevents cross-contamination and is the prerequisite for
white-label and SaaS scaling.

### XIII. Deployment Discipline

Deployments MUST be automated, reproducible, fast, and low-maintenance. The preferred strategy
is Vercel with automatic SSL, CI/CD pipelines, preview deployments, and environment isolation.

**Rationale**: Reproducible automated deploys remove the last manual bottleneck between
onboarding and a live site.

### XIV. Anti-Pattern Prohibition

The following are prohibited: tightly coupled components, duplicated layouts, client-specific
hardcoded logic, monolithic templates, unnecessary abstractions, overengineering, excessive
dependencies, and manual repetitive workflows.

**Rationale**: These anti-patterns each erode reusability, speed, or scale — the three pillars
the platform is built on.

### XV. Long-Term Vision Alignment

Decisions MUST keep the platform on a path toward a scalable commercial website operating
system capable of rapid generation, efficient client onboarding, automation, AI-generated
content integration, and scaling to hundreds of clients with minimal operational overhead.
Work that contradicts this trajectory MUST be justified or rejected.

**Rationale**: A shared long-term target keeps short-term choices coherent and prevents
local optimizations that block the SaaS endgame.

## Technology Constraints

- **Framework**: Nuxt 4 (Vue 3, Nitro). Leverage SSR/SSG, image optimization, SEO meta APIs.
- **Language**: TypeScript in strict mode across all layers. No implicit `any`.
- **Data contracts**: Every `config.json` MUST validate against a versioned, typed schema
  before rendering. Schemas are the source of truth for component and template props.
- **Tooling**: Linting and formatting MUST be enforced in CI and pre-commit. Auto-imports and
  composable-first patterns are the default.
- **Deployment target**: Vercel with CI/CD, preview deployments, and per-environment isolation.
- **Dependencies**: New runtime dependencies MUST be justified against Principle XIV
  (excessive dependencies) before adoption.

## Development Workflow & Quality Gates

- **Composition over creation**: Before building a new section or layout, contributors MUST
  check for an existing reusable block and extend or configure it instead.
- **Schema-first changes**: Changes to rendered output MUST start from the data schema, then
  flow to transformers, components, and templates.
- **Constitution Check**: Plans and specs MUST pass a Constitution Check gate. Violations MUST
  be recorded in the plan's Complexity Tracking with justification or the design revised.
- **Critical-flow validation**: No feature touching onboarding, template rendering, SEO,
  deployment, or config parsing ships without its corresponding validation (Principle XI).
- **Reviews**: Every PR MUST verify principle compliance, especially Principles I–VI and XIV.

## Governance

This constitution supersedes all other development practices. When guidance conflicts, the
constitution wins.

- **Amendments**: Proposed via PR that edits this file, states the change and rationale, and
  updates the Sync Impact Report. Amendments require maintainer approval and a migration note
  when they affect existing clients, schemas, or templates.
- **Versioning**: Semantic versioning of this document.
  - MAJOR: backward-incompatible governance or principle removal/redefinition.
  - MINOR: new principle/section added or materially expanded guidance.
  - PATCH: clarifications, wording, and non-semantic refinements.
- **Compliance review**: All PRs and design reviews MUST verify compliance. Complexity and
  anti-pattern exceptions MUST be justified in the plan's Complexity Tracking. Unjustified
  violations block merge.

**Version**: 1.0.0 | **Ratified**: 2026-06-05 | **Last Amended**: 2026-06-05
