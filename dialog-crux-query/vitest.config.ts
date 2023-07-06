import { configDefaults, defineConfig } from 'vitest/config'

// vitest.config.ts overrides the configuration from vite.config.ts
// https://vitest.dev/config/

const config = defineConfig({
  test: {
    coverage: {
      provider: 'v8'
    },
    // The Apps Script frontend files are executed in the user's browser
    environment: 'happy-dom',
    exclude: [...configDefaults.exclude],
    reporters: ['default', 'html']
  }
})

// console.log(`=== vitest config ===`, config)

export default config
