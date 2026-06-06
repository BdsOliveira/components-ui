/**
 * new-client scaffold — acceptance instruments (Phase 8; scaffold-cli-contract,
 * build-target-contract). Drives the real command via `npm run new-client` and
 * asserts the four user stories end-to-end:
 *
 *   US1 (T012) — one command writes a complete, conventionally-shaped client dir;
 *                template/core source are left unchanged.
 *   US2 (T020) — the scaffolded client's emitted spec passes, its config builds a
 *                `validateWebsiteConfig`-valid site, and it renders via SiteRenderer.
 *   US3 (T021) — the new client is selectable and resolves its own config/image/domain;
 *                the existing client still validates; no shared-file edit occurs per run.
 *   US4 (T024) — every foreseeable mistake is refused with nothing written.
 *
 * The scaffold runs its own scoped vitest gate in a subprocess; this suite spawns it
 * once in `beforeAll` (a real, deploy-ready client) and cleans up in `afterAll`.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import '~~/sites/core/components/sections/register'
import { validateWebsiteConfig } from '~~/sites/core/schemas'
import SiteRenderer from '~~/sites/core/components/render/SiteRenderer.vue'
import { createClinicSite, type ClinicOverrides } from '~~/sites/templates/clinic/page'
import { templateRegistry, type TemplateOverrides } from '~~/sites/templates/registry'
import clinicaSaude from '~~/sites/clients/clinica-saude/config.json'

const REPO_ROOT = process.cwd()
const CLIENTS_DIR = resolve(REPO_ROOT, 'sites/clients')
const CLINIC_DEFAULTS = resolve(REPO_ROOT, 'sites/templates/clinic/defaults.json')

/** A throwaway client name unlikely to collide; removed in afterAll. */
const NAME = 'zz-scaffold-itest'
const TEMPLATE = 'clinic'
const DOMAIN = 'zz-scaffold-itest.example.com'
const CLIENT_DIR = resolve(CLIENTS_DIR, NAME)

/** Run the scaffold non-interactively; returns the spawn result. */
function runScaffold(name: string, template: string, domain: string) {
  return spawnSync(
    'npm',
    ['run', 'new-client', '--silent', '--', '--name', name, '--template', template, '--domain', domain],
    { cwd: REPO_ROOT, encoding: 'utf8' },
  )
}

function cleanup() {
  rmSync(CLIENT_DIR, { recursive: true, force: true })
  rmSync(resolve(CLIENTS_DIR, `.new-client-tmp-${NAME}`), { recursive: true, force: true })
}

/** Captured before the run to prove the scaffold edits nothing in the template layer (FR-009). */
let clinicDefaultsBefore = ''
/** The scaffolded client's config, read after the run (NOT at collection time). */
let config: { template: string; company: unknown; theme: unknown; content: unknown }

beforeAll(() => {
  cleanup()
  clinicDefaultsBefore = readFileSync(CLINIC_DEFAULTS, 'utf8')
  const r = runScaffold(NAME, TEMPLATE, DOMAIN)
  expect(r.status, `scaffold failed:\n${r.stdout}\n${r.stderr}`).toBe(0)
  config = JSON.parse(readFileSync(resolve(CLIENT_DIR, 'config.json'), 'utf8'))
}, 60_000)

afterAll(() => {
  cleanup()
})

describe('US1 — one command writes a complete, conventional client dir (T012)', () => {
  it('creates every conventional file in the Phase-7 shape', () => {
    expect(existsSync(resolve(CLIENT_DIR, 'config.json'))).toBe(true)
    expect(existsSync(resolve(CLIENT_DIR, 'domain.txt'))).toBe(true)
    expect(existsSync(resolve(CLIENT_DIR, 'images', 'hero.jpg'))).toBe(true)
    expect(existsSync(resolve(CLIENT_DIR, 'README.md'))).toBe(true)
    expect(existsSync(resolve(CLIENT_DIR, '__tests__', `${NAME}.spec.ts`))).toBe(true)
  })

  it('leaves no staging directory behind', () => {
    const staging = readdirSync(CLIENTS_DIR).filter((d) => d.startsWith('.new-client-tmp-'))
    expect(staging).toEqual([])
  })

  it('does not mutate the template layer (clinic defaults byte-unchanged, FR-009)', () => {
    expect(readFileSync(CLINIC_DEFAULTS, 'utf8')).toBe(clinicDefaultsBefore)
  })
})

describe('US2 — the scaffolded client is valid and renders (T020)', () => {
  const overridesOf = () =>
    ({ company: config.company, theme: config.theme, content: config.content }) as ClinicOverrides

  it('its emitted spec passes under the suite (proven by the green scaffold gate)', () => {
    // The gate ran in beforeAll (status 0). Re-assert the core guarantee here.
    expect(validateWebsiteConfig(createClinicSite(overridesOf())).valid).toBe(true)
  })

  it('builds a validateWebsiteConfig-valid site with the client identity', () => {
    const result = validateWebsiteConfig(createClinicSite(overridesOf()))
    expect(result.valid).toBe(true)
    expect(result.data!.company.name).toBe('Zz Scaffold Itest')
  })

  it('renders every section through SiteRenderer', () => {
    const result = validateWebsiteConfig(createClinicSite(overridesOf()))
    const w = mount(SiteRenderer, { props: { config: result.data! } })
    const rendered = w.findAll('[data-block]').map((el) => el.attributes('data-block'))
    expect(rendered.length).toBeGreaterThan(0)
    expect(rendered).toEqual(result.data!.sections.map((s) => (s as { type: string }).type))
  })
})

describe('US3 — selectable and isolated; existing client unchanged (T021)', () => {
  // Replicates the index.vue dispatch (no Nuxt): select by name → registry → build → validate.
  const dispatch = (cfg: { template: string } & TemplateOverrides) => {
    const entry = templateRegistry[cfg.template as keyof typeof templateRegistry]
    return entry
      ? validateWebsiteConfig(entry.factory({ company: cfg.company, theme: cfg.theme, content: cfg.content }))
      : undefined
  }

  it('CLIENT=<name> resolves the new client config + own image base path', () => {
    const result = dispatch(config as { template: string } & TemplateOverrides)
    expect(result?.valid).toBe(true)
    const hero = result!.data!.sections.find((s) => (s as { type: string }).type === 'hero') as Record<string, unknown>
    expect((hero.media as { src: string }).src).toBe(`/clients/${NAME}/images/hero.jpg`)
  })

  it('resolves the domain from the client\'s own domain.txt', () => {
    const domain = readFileSync(resolve(CLIENT_DIR, 'domain.txt'), 'utf8').trim()
    expect(domain).toBe(DOMAIN)
  })

  it('the existing clinica-saude client still validates (FR-008, SC-004)', () => {
    const result = dispatch(clinicaSaude as { template: string } & TemplateOverrides)
    expect(result?.valid).toBe(true)
  })
})

describe('US4 — foreseeable mistakes are refused with nothing written (T024)', () => {
  // Snapshot AFTER the outer beforeAll scaffolds the client, so the guard runs below
  // are compared against a stable baseline (collection-time capture would miss it).
  let before: string[] = []
  beforeAll(() => {
    before = readdirSync(CLIENTS_DIR).sort()
  })

  const cases: Array<[string, () => ReturnType<typeof runScaffold>]> = [
    ['name collision', () => runScaffold(NAME, TEMPLATE, 'fresh-collide.example.com')],
    ['unknown template', () => runScaffold('zz-bad-tmpl', 'dentist', 'fresh-tmpl.example.com')],
    ['invalid name', () => runScaffold('Bad Name', TEMPLATE, 'fresh-name.example.com')],
    ['invalid domain', () => runScaffold('zz-bad-domain', TEMPLATE, 'not a domain')],
    ['domain reuse', () => runScaffold('zz-reuse', TEMPLATE, DOMAIN)],
  ]

  it.each(cases)('%s → exits non-zero', (_label, run) => {
    const r = run()
    expect(r.status).not.toBe(0)
  })

  it('created nothing and left no staging dir (SC-005, FR-012)', () => {
    const after = readdirSync(CLIENTS_DIR).sort()
    expect(after).toEqual(before)
    expect(after.filter((d) => d.startsWith('.new-client-tmp-'))).toEqual([])
  })
})
