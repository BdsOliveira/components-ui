// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Block independence guard (block-contract.md §C6, FR-010/FR-011).
  // Blocks under sites/core/components/** must stay client-neutral and isolated:
  // no importing client identity / global client state / per-client modules.
  {
    files: ['sites/core/components/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/clients/**',
                '~/sites/clients/**',
                '@/sites/clients/**',
                '**/onboarding/**',
              ],
              message:
                "Blocks must be client-neutral and isolated (block-contract §C6, FR-010/FR-011): no client identity or global client state imported inside core blocks. Pass content through the block's `data` prop instead.",
            },
          ],
        },
      ],
    },
  },
)
