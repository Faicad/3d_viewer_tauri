import { defineConfig } from 'vitest/config'
import path from 'node:path'

const electronRenderer = path.resolve(__dirname, './3d_viewer_electron/src/renderer')

export default defineConfig({
  test: {
    environment: 'node',
    // Only test Tauri adapter layer. Electron project tests run in their own CI.
    include: [
      'src/**/*.{test,spec}.ts',
    ],
    exclude: [
      'src/**/__tests__/**',
    ],
    setupFiles: ['fake-indexeddb/auto'],
  },
  resolve: {
    alias: {
      '@': electronRenderer,
    },
  },
})
