/**
 * Section discriminated union + its single registry
 * (website-schema-contract.md §W3/§W6/§W7, research Decisions 2/3/4;
 * FR-004, FR-005, FR-014, FR-016, FR-018, FR-019).
 *
 * A `Section` is a CLOSED discriminated union keyed by the `type` discriminator.
 * Each member is FLAT: a Phase 2 block schema extended with its literal `type`
 * (Decision 2), so the block's variant/fields and `z.infer` type stay
 * authoritative — Phase 3 never redefines block internals.
 *
 * The union is built from ONE authoritative registry (Decision 4 / FR-018): a
 * concrete section is added with a single `registerSection(defineSection(...))`
 * call and nowhere else. `buildSectionSchema()` assembles the current registry
 * into a `z.discriminatedUnion('type', ...)`. Phase 3 ships the registry EMPTY
 * (no concrete sections), so the defined empty-registry behavior applies:
 *
 *   - >= 1 registered type -> the discriminated union of registered members.
 *   - empty registry       -> a reject-all element schema (`z.never()`): every
 *     section item is invalid, so a non-empty `sections` list is invalid while
 *     an EMPTY `sections: []` list stays valid (FR-016 / §W6). It never throws
 *     at module load.
 *
 *   import { registerSection, defineSection, buildSectionSchema } from '~/sites/core/schemas'
 *   registerSection(defineSection('hero', heroSchema))   // one authoritative call
 */
import { z } from 'zod'

/** A registered union member: a block schema extended with its literal `type`. */
export type SectionMember = z.ZodObject<z.ZodRawShape & { type: z.ZodLiteral<string> }>

/**
 * Build one `Section` union member from a Phase 2 block schema by merging in the
 * `type` discriminator (flat member, Decision 2). The block schema is reused
 * unchanged — only the literal `type` key is added.
 */
export function defineSection<T extends string, S extends z.ZodObject<z.ZodRawShape>>(
  type: T,
  blockSchema: S,
) {
  return blockSchema.extend({ type: z.literal(type) })
}

/** The single authoritative registry: `type` -> member schema (FR-018). */
const registry = new Map<string, SectionMember>()

/**
 * Register a section member into the single registry (the one place section
 * types are added). Idempotent per `type` — re-registering a `type` replaces it.
 */
export function registerSection(member: SectionMember): void {
  const type = (member.shape.type as z.ZodLiteral<string>).value
  registry.set(type, member)
}

/** Remove all registered section types (test/scratch support; not used in prod). */
export function clearSectionRegistry(): void {
  registry.clear()
}

/** The currently registered section `type` strings, in registration order. */
export function registeredSectionTypes(): string[] {
  return [...registry.keys()]
}

/**
 * Assemble the current registry into the `Section` element schema:
 *   - >= 1 member -> `z.discriminatedUnion('type', [...members])` (O(1) dispatch,
 *     unknown `type` reported as an invalid discriminator value, FR-014).
 *   - empty registry -> `z.never()`, a reject-all element schema (§W6 / FR-016).
 */
export function buildSectionSchema() {
  const members = [...registry.values()]
  if (members.length === 0) {
    // Reject-all: any section item is invalid, but `z.array(z.never())` still
    // accepts an empty list — the defined empty-registry state (§W6).
    return z.never()
  }
  return z.discriminatedUnion(
    'type',
    members as unknown as [SectionMember, SectionMember, ...SectionMember[]],
  )
}

/** The inferred `Section` type — the union of all currently registered members. */
export type Section = z.infer<ReturnType<typeof buildSectionSchema>>
