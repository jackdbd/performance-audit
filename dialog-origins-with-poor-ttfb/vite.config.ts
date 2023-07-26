import path from 'node:path'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

const outDir = path.resolve(__dirname, 'dist')

const config = defineConfig({
  plugins: [
    preact(),
    viteSingleFile(),
    // rollup-plugin-visualizer must be the last plugin
    visualizer({ open: false })
  ],
  build: {
    minify: true,
    outDir
  }
})

export default config
