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

/**
 * A minimal stub section component: renders an identifiable marker carrying its
 * `type` and the props (config slice) it received, so tests can assert dispatch,
 * order, and slice isolation via the DOM.
 */
export function makeStubSection(type: string): Component {
  return defineComponent({
    name: `Stub_${type}`,
    inheritAttrs: false,
    setup(_props, { attrs }) {
      // `attrs` is the bound config slice (DynamicSection does v-bind="section").
      return () =>
        h(
          'div',
          {
            'data-stub': type,
            'data-props': JSON.stringify(attrs),
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
    setup() {
      const theme = useSiteTheme()
      return () =>
        h('div', { 'data-stub': type, 'data-theme': JSON.stringify(theme) }, type)
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
