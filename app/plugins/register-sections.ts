/**
 * Nuxt plugin — populate the section registries at app boot (block-set-contract
 * B7; FR-003, FR-014).
 *
 * Imports `sections/register` purely for its side effect: every core block's
 * `registerSection` + `registerSectionComponent` pair runs once, so both the
 * schema registry (validation) and the component registry (rendering) are
 * populated before any page renders. The plugin holds no logic of its own.
 */
import '~~/sites/core/components/sections/register'

export default defineNuxtPlugin(() => {})
