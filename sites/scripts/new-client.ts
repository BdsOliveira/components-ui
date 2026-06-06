/**
 * new-client — the automatic client scaffold (Phase 8; scaffold-cli-contract).
 *
 * One command (`npm run new-client`) writes a complete, valid, deploy-ready client
 * directory under `sites/clients/<name>/` from a chosen niche template — no file
 * created by hand. Strict TypeScript run via `tsx` (research D1); uses ONLY Node
 * builtins for its own logic (fs/path/url/readline/child_process).
 *
 * Config validation is delegated to a scoped `vitest run` over the staged client
 * spec (research D7): this script never imports `core` schemas nor a template
 * `page.ts`/`registry.ts` (their `~~` value-imports do not resolve under bare
 * `tsx`). It reads each template's plain `defaults.json` and dynamically imports
 * the template's `theme.ts` (whose only import is type-only, so esbuild erases it)
 * to seed the new client.
 *
 * @remarks `node:process` is imported explicitly so the script type-checks under
 * the node tsconfig without relying on an ambient global.
 *
 * Flow (data-model "State Flow"): parse flags → prompt missing → validate inputs →
 * check guards → STAGE under `.new-client-tmp-<name>/` → vitest gate → atomic
 * rename → report. Every failure branch removes staging and exits non-zero, leaving
 * the workspace unchanged (FR-012, SC-005).
 */
import process from 'node:process'
import { mkdir, writeFile, rename, rm, readFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createInterface } from 'node:readline/promises'
import { spawnSync } from 'node:child_process'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url)) // sites/scripts
const REPO_ROOT = resolve(SCRIPT_DIR, '../..')
const CLIENTS_DIR = resolve(REPO_ROOT, 'sites/clients')
const TEMPLATES_DIR = resolve(REPO_ROOT, 'sites/templates')

/** Lowercase kebab slug — a safe directory AND URL segment (research D9). */
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/
/** Hostname rule reused from the Phase-7 client test (research D9). */
const HOSTNAME = /^(?=.{1,253}$)([a-z0-9](-?[a-z0-9])*\.)+[a-z]{2,}$/

/** A 1×1 placeholder JPEG (swapped for a real asset later) — referenced by the seeded hero. */
const PLACEHOLDER_JPEG_BASE64 =
  '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRof' +
  'Hh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwh' +
  'MjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAAR' +
  'CAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAA' +
  'AgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkK' +
  'FhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWG' +
  'h4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl' +
  '5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREA' +
  'AgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYk' +
  'NOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOE' +
  'hYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk' +
  '5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD/2Q=='

/** A guarded, user-facing failure (slug/template/domain/collision) — prints just the message. */
class ScaffoldError extends Error {}

type ScaffoldInput = { name: string; template: string; domain: string }

/** Parse `--key value` and `--key=value` flags from argv (no parser dependency; research D2). */
function parseArgs(args: string[]): Partial<ScaffoldInput> {
  const out: Partial<ScaffoldInput> = {}
  const known = new Set(['name', 'template', 'domain'])
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (!arg.startsWith('--')) continue
    const eq = arg.indexOf('=')
    let key: string
    let value: string | undefined
    if (eq !== -1) {
      key = arg.slice(2, eq)
      value = arg.slice(eq + 1)
    } else {
      key = arg.slice(2)
      value = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : undefined
    }
    if (known.has(key) && value !== undefined) out[key as keyof ScaffoldInput] = value
  }
  return out
}

/** The available templates = directories under `sites/templates/` that ship a `defaults.json`. */
async function discoverTemplates(): Promise<string[]> {
  const entries = await readdir(TEMPLATES_DIR, { withFileTypes: true })
  const found: string[] = []
  for (const e of entries) {
    if (e.isDirectory() && existsSync(resolve(TEMPLATES_DIR, e.name, 'defaults.json'))) {
      found.push(e.name)
    }
  }
  return found.sort()
}

/** Prompt (only) for any missing value; all three present ⇒ no prompt (CI-safe, FR-002). */
async function resolveInputs(
  partial: Partial<ScaffoldInput>,
  available: string[],
): Promise<ScaffoldInput> {
  const need = (['name', 'template', 'domain'] as const).filter((k) => !partial[k])
  if (need.length === 0) return partial as ScaffoldInput

  if (!process.stdin.isTTY) {
    throw new ScaffoldError(
      `missing required input(s): ${need.map((k) => `--${k}`).join(', ')} (no TTY to prompt)`,
    )
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout })
  try {
    const result: Partial<ScaffoldInput> = { ...partial }
    if (!result.name) result.name = (await rl.question('Client name (kebab-case): ')).trim()
    if (!result.template) {
      result.template = (await rl.question(`Template (${available.join(', ')}): `)).trim()
    }
    if (!result.domain) result.domain = (await rl.question('Domain: ')).trim()
    return result as ScaffoldInput
  } finally {
    rl.close()
  }
}

/** Validate the three inputs against their rules; throw a stated-rule `ScaffoldError` on any failure. */
function validateInputs(input: ScaffoldInput, available: string[]): void {
  if (!SLUG.test(input.name)) {
    throw new ScaffoldError(
      `invalid name "${input.name}". Use kebab-case: lowercase letters/digits separated by hyphens.`,
    )
  }
  if (!available.includes(input.template)) {
    throw new ScaffoldError(
      `unknown template "${input.template}". Available: ${available.join(', ')}`,
    )
  }
  if (!HOSTNAME.test(input.domain)) {
    throw new ScaffoldError(
      `invalid domain "${input.domain}". Use a hostname like acme.example.com.`,
    )
  }
}

/** Up-front guards that touch nothing: name collision (FR-010) and domain reuse (edge case). */
async function checkGuards(input: ScaffoldInput): Promise<void> {
  if (existsSync(resolve(CLIENTS_DIR, input.name))) {
    throw new ScaffoldError(`client "${input.name}" already exists — refusing to overwrite.`)
  }
  const entries = await readdir(CLIENTS_DIR, { withFileTypes: true })
  for (const e of entries) {
    if (!e.isDirectory() || e.name.startsWith('.')) continue
    const domainFile = resolve(CLIENTS_DIR, e.name, 'domain.txt')
    if (!existsSync(domainFile)) continue
    const existing = (await readFile(domainFile, 'utf8')).trim()
    if (existing.toLowerCase() === input.domain.toLowerCase()) {
      throw new ScaffoldError(
        `domain "${input.domain}" is already used by client "${e.name}".`,
      )
    }
  }
}

/** Title-cased display name from the slug (`acme-dental` → `Acme Dental`; research D8). */
function toDisplayName(slug: string): string {
  return slug
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/** PascalCase factory stem from the slug (`local-business` → `LocalBusiness`). */
function toPascal(slug: string): string {
  return slug
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')
}

type TemplateDefaults = {
  company: Record<string, unknown>
  sections: Record<string, Record<string, unknown>>
}

/** Read a template's plain `defaults.json` and dynamically import its `theme.ts` value. */
async function loadTemplateSeed(
  template: string,
): Promise<{ defaults: TemplateDefaults; theme: Record<string, unknown> }> {
  const defaults = JSON.parse(
    await readFile(resolve(TEMPLATES_DIR, template, 'defaults.json'), 'utf8'),
  ) as TemplateDefaults
  // theme.ts imports only a TYPE from `~~` (erased by tsx), so this resolves under bare tsx.
  const themeMod = (await import(
    pathToFileURL(resolve(TEMPLATES_DIR, template, 'theme.ts')).href
  )) as Record<string, unknown>
  const theme = Object.values(themeMod).find((v) => v && typeof v === 'object') as
    | Record<string, unknown>
    | undefined
  if (!theme) throw new ScaffoldError(`template "${template}" has no theme export.`)
  return { defaults, theme }
}

/** Assemble the client `config.json` document from template defaults + the new identity (FR-004). */
function buildConfig(
  input: ScaffoldInput,
  displayName: string,
  defaults: TemplateDefaults,
  theme: Record<string, unknown>,
): Record<string, unknown> {
  const content: Record<string, Record<string, unknown>> = structuredClone(defaults.sections)
  // Point the hero image at the client's OWN served asset (created below); keep a non-empty alt.
  const hero = content.hero ?? {}
  const heroMedia = (hero.media ?? {}) as { alt?: string }
  content.hero = {
    ...hero,
    media: {
      src: `/clients/${input.name}/images/hero.jpg`,
      alt: heroMedia.alt && heroMedia.alt.length > 0 ? heroMedia.alt : `${displayName} hero image`,
    },
  }
  return {
    template: input.template,
    company: { ...defaults.company, name: displayName },
    theme,
    content,
  }
}

/** The client README, in the Phase-7 conventional shape (responsibility/allowed/prohibited/flow). */
function emitReadme(input: ScaffoldInput, displayName: string): string {
  const factory = `create${toPascal(input.template)}Site`
  return `# ${input.name}

**Responsibility**: A self-contained client directory that produces the **${displayName}** site by
**configuration only**, reusing the \`${input.template}\` template and \`core\` blocks with no source changes to
lower layers. Scaffolded by \`npm run new-client\` (Phase 8).

**Allowed**: This client's own \`config.json\` (template + company/theme/content overrides), client-owned
\`images/\`, \`domain.txt\`, and its own \`__tests__/\`.

**Prohibited**: Shared/template/core logic, cross-client references, a section-order field (order is owned
by the template, FR-008), and copying images into \`public/\` (they are served from here via Nitro).

**Depends on**: \`sites/templates/${input.template}\` (\`${factory}\`) and \`sites/core\` (\`validateWebsiteConfig\`,
\`SiteRenderer\`). Nothing depends on this client — it is the highest layer.

## Layout

\`\`\`text
sites/clients/${input.name}/
├── config.json   # template + company/theme/content overrides
├── domain.txt    # single-line domain string
├── images/       # client-owned assets, served at /clients/${input.name}/images/
│   └── hero.jpg  # placeholder — swap for a real asset
└── __tests__/    # config-parse + validation + domain/image instruments
\`\`\`

## Render flow

\`config.json\` → \`app/pages/index.vue\` (select by \`CLIENT=${input.name}\`, dispatch \`template\` →
\`${factory}({ company, theme, content })\`) → \`validateWebsiteConfig\` → \`<SiteRenderer :config>\`. Images map to
\`/clients/${input.name}/images/\` via \`nitro.publicAssets\` in \`nuxt.config.ts\`.

## Build

\`\`\`bash
CLIENT=${input.name} npm run dev        # preview
CLIENT=${input.name} npm run generate   # static site
\`\`\`
`
}

/** The starter spec the suite discovers (FR-014) and the scaffold gate runs (research D7). */
function emitStarterSpec(input: ScaffoldInput, displayName: string): string {
  const factory = `create${toPascal(input.template)}Site`
  const overridesType = `${toPascal(input.template)}Overrides`
  return `/**
 * ${input.name} client acceptance instruments — emitted by \`npm run new-client\` (Phase 8, FR-014).
 *
 * Proves the scaffolded client is valid and deploy-ready by data only, reusing the
 * \`${input.template}\` template factory: config parses, builds a \`validateWebsiteConfig\`-valid
 * site with the client identity, \`domain.txt\` is a valid hostname, and the seeded hero
 * image resolves to an existing client-owned asset (no broken reference).
 */
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import '~~/sites/core/components/sections/register'
import { validateWebsiteConfig } from '~~/sites/core/schemas'
import { ${factory}, type ${overridesType} } from '~~/sites/templates/${input.template}/page'
import config from '../config.json'

/** Basic hostname validator (scaffold-cli-contract C-CLI / research D9). */
const HOSTNAME = /^(?=.{1,253}$)([a-z0-9](-?[a-z0-9])*\\.)+[a-z]{2,}$/i

/** Client dir, resolved from THIS spec's own location (works while staged and after rename). */
const CLIENT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const overrides = {
  company: config.company,
  theme: config.theme,
  content: config.content,
} as ${overridesType}

const heroOf = (site: { sections: Array<{ type: string }> }) =>
  site.sections.find((s) => s.type === 'hero') as Record<string, unknown>

describe('${input.name} — a valid, identified ${input.template} site exists by config', () => {
  it('config.json parses with template "${input.template}"', () => {
    expect(typeof config).toBe('object')
    expect(config.template).toBe('${input.template}')
  })

  it('${factory}(config) passes whole-site validation with data defined', () => {
    const result = validateWebsiteConfig(${factory}(overrides))
    expect(result.valid).toBe(true)
    expect(result.data).toBeDefined()
  })

  it('the company name resolves to the client identity', () => {
    expect(${factory}(overrides).company.name).toBe(${JSON.stringify(displayName)})
  })
})

describe('${input.name} — domain.txt is present and valid', () => {
  const domainPath = resolve(CLIENT_DIR, 'domain.txt')

  it('exists', () => {
    expect(existsSync(domainPath)).toBe(true)
  })

  it('is a single trimmed, valid hostname', () => {
    const domain = readFileSync(domainPath, 'utf8').trim()
    expect(domain.length).toBeGreaterThan(0)
    expect(domain).toMatch(HOSTNAME)
  })
})

describe('${input.name} — the seeded hero image resolves to an existing client asset', () => {
  const built = ${factory}(overrides)
  const hero = heroOf(built)
  const media = hero.media as { src: string; alt: string }

  it('references the served client image URL with non-empty alt', () => {
    expect(media.src).toBe('/clients/${input.name}/images/hero.jpg')
    expect(media.alt.length).toBeGreaterThan(0)
  })

  it('the referenced file exists under images/', () => {
    const file = media.src.replace('/clients/${input.name}/images/', '')
    expect(existsSync(resolve(CLIENT_DIR, 'images', file))).toBe(true)
  })
})
`
}

/** Write the full client directory (config, domain, images, README, starter spec) under `dir`. */
async function writeClientDir(
  dir: string,
  input: ScaffoldInput,
  displayName: string,
  config: Record<string, unknown>,
): Promise<void> {
  await mkdir(resolve(dir, 'images'), { recursive: true })
  await mkdir(resolve(dir, '__tests__'), { recursive: true })
  await writeFile(resolve(dir, 'config.json'), JSON.stringify(config, null, 2) + '\n')
  await writeFile(resolve(dir, 'domain.txt'), input.domain + '\n')
  await writeFile(resolve(dir, 'images', 'hero.jpg'), Buffer.from(PLACEHOLDER_JPEG_BASE64, 'base64'))
  await writeFile(resolve(dir, 'README.md'), emitReadme(input, displayName))
  await writeFile(resolve(dir, '__tests__', `${input.name}.spec.ts`), emitStarterSpec(input, displayName))
}

/** Run the validation gate: a scoped `vitest run` over the staged client's spec (research D7, FR-005). */
function runGate(stagedSpecRel: string): boolean {
  const result = spawnSync('npx', ['vitest', 'run', stagedSpecRel], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
  })
  return result.status === 0
}

async function main(): Promise<void> {
  const available = await discoverTemplates()
  const input = await resolveInputs(parseArgs(process.argv.slice(2)), available)

  validateInputs(input, available)
  await checkGuards(input)

  const displayName = toDisplayName(input.name)
  const { defaults, theme } = await loadTemplateSeed(input.template)
  const config = buildConfig(input, displayName, defaults, theme)

  const staging = resolve(CLIENTS_DIR, `.new-client-tmp-${input.name}`)
  const target = resolve(CLIENTS_DIR, input.name)
  const stagedSpecRel = `sites/clients/.new-client-tmp-${input.name}/__tests__/${input.name}.spec.ts`

  try {
    if (existsSync(staging)) await rm(staging, { recursive: true, force: true })
    await writeClientDir(staging, input, displayName, config)

    if (!runGate(stagedSpecRel)) {
      throw new ScaffoldError('generated client failed the validation gate — nothing written.')
    }
    // Atomic within the same filesystem (research D6).
    await rename(staging, target)
  } catch (err) {
    await rm(staging, { recursive: true, force: true }).catch(() => {})
    throw err
  }

  console.log(`\n✓ Created sites/clients/${input.name}/ from template "${input.template}"`)
  console.log(`Next: CLIENT=${input.name} npm run generate   # build this client's static site`)
  console.log(`      CLIENT=${input.name} npm run dev        # preview it`)
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err)
  console.error(err instanceof ScaffoldError ? `✗ ${message}` : message)
  process.exitCode = 1
})
