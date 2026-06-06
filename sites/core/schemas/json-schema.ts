/**
 * JSON-Schema emission for block self-documentation
 * (block-contract.md §C2, Decision 7; FR-015).
 *
 * Each block's Zod schema is its machine-readable shape. Emitting JSON Schema
 * from it powers editor autocomplete, config self-documentation, and future
 * automated/AI-driven config authoring — usable without reading the source.
 */
import type { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

/** A JSON Schema document (kept loose — the emitter's own type is recursive). */
export type JsonSchema = Record<string, unknown>

/** Emit a JSON Schema document for a block config schema. */
export function blockJsonSchema(schema: z.ZodTypeAny, name?: string): JsonSchema {
  // `schema` is widened to avoid zod-to-json-schema's deeply-recursive generic
  // (TS2589) under `moduleResolution: node`; the emitter is loosely typed anyway.
  return zodToJsonSchema(schema as never, name) as JsonSchema
}
