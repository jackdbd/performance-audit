import { configDefaults, defineConfig } from 'vitest/config'

// https://vitest.dev/config/
const config = defineConfig({
  test: {
    coverage: {
      provider: 'v8'
    },
    exclude: [...configDefaults.exclude, '__tests__/stubs.mjs'],
    reporters: ['default', 'html']
  }
})

// console.log(`=== vitest config ===`, config);

export default config
