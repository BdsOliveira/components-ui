/**
 * Test fixtures for the dynamic renderer (tasks.md T005).
 *
 * Provides throwaway "stub" section types that register into BOTH registries
 * (schema + component), so rendering tests can assert behavior against
 * *registered* types without shipping any concrete section. No production
 * section depends on this file.
 */
import { defineComponent, h, type Component } from 'vue'
import {
  z,
  defineSection,
  registerSection,
  clearSectionRegistry,
} from '~~/sites/core/schemas'
import {
  registerSectionComponent,
  clearSectionComponentRegistry,
} from '~~/sites/core/components/sections/registry'
import { useSiteTheme } from '~~/sites/core/composables/useSiteTheme'
import { useSiteCompany } from '~~/sites/core/composables/useSiteCompany'

/**
 * A minimal stub section component: renders an identifiable marker carrying its
 * `type` and the slice it received via the single `data` prop, so tests can
 * assert dispatch, order, and slice isolation via the DOM.
 *
 * DynamicSection binds the slice as `:data="section"` (Decision 1), so the stub
 * declares a `data` prop and serializes `props.data` (NOT fall-through attrs).
 */
export function makeStubSection(type: string): Component {
  return defineComponent({
    name: `Stub_${type}`,
    inheritAttrs: false,
    props: { data: { type: Object, default: () => ({}) } },
    setup(props) {
      return () =>
        h(
          'div',
          {
            'data-stub': type,
            'data-props': JSON.stringify(props.data),
          },
          type,
        )
    },
  })
}

/** A stub that injects the site theme and exposes it in the DOM (theme tests). */
export function makeThemeStub(type: string): Component {
  return defineComponent({
    name: `ThemeStub_${type}`,
    inheritAttrs: false,
    props: { data: { type: Object, default: () => ({}) } },
    setup() {
      const theme = useSiteTheme()
      return () =>
        h('div', { 'data-stub': type, 'data-theme': JSON.stringify(theme) }, type)
    },
  })
}

/** A stub that injects the site company and exposes it in the DOM (company tests). */
export function makeCompanyStub(type: string): Component {
  return defineComponent({
    name: `CompanyStub_${type}`,
    inheritAttrs: false,
    props: { data: { type: Object, default: () => ({}) } },
    setup() {
      const company = useSiteCompany()
      return () =>
        h('div', { 'data-stub': type, 'data-company': JSON.stringify(company) }, type)
    },
  })
}

/** A stub that throws during render (error-isolation tests). */
export function makeThrowingStub(type: string): Component {
  return defineComponent({
    name: `ThrowStub_${type}`,
    setup() {
      return () => {
        throw new Error(`stub ${type} boom`)
      }
    },
  })
}

/**
 * Register a stub section into BOTH registries:
 *  - schema: a permissive passthrough block schema + the `type` discriminator,
 *  - component: the given (or a default) stub component.
 * Pass `component: null` to register ONLY the schema (the "validatable but not
 * renderable" gap used by fallback tests).
 */
export function registerStub(
  type: string,
  component: Component | null = makeStubSection(type),
): void {
  registerSection(defineSection(type, z.object({}).passthrough()))
  if (component) registerSectionComponent(type, component)
}

/** Reset both registries — call in `afterEach`. */
export function resetRegistries(): void {
  clearSectionRegistry()
  clearSectionComponentRegistry()
}
