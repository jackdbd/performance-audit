import { configDefaults, defineConfig } from 'vitest/config'

// https://vitest.dev/config/
const config = defineConfig({
  test: {
    coverage: {
      provider: 'v8'
    },
    // The Apps Script runtime is NOT Node.js, but it is still based on V8
    // https://vitest.dev/guide/environment.html
    environment: 'node',
    exclude: [...configDefaults.exclude, '__tests__/stubs.mjs'],
    reporters: ['default', 'html']
  }
})

export default config
