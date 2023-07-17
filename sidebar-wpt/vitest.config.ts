import { configDefaults, defineConfig } from 'vitest/config'
import preact from '@preact/preset-vite'

// vitest.config.ts overrides the configuration from vite.config.ts
// https://vitest.dev/config/

const config = defineConfig({
  plugins: [preact()],
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

export default config
