import { defineConfig } from 'vitest/config'
import path from 'node:path'

const electronRenderer = path.resolve(__dirname, '../3d_viewer_electron/src/renderer')

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      '../3d_viewer_electron/src/**/*.{test,spec}.ts',
      'src/**/*.{test,spec}.ts',
    ],
    exclude: [
      '../3d_viewer_electron/src/test/**',
      '../3d_viewer_electron/src/**/__tests__/**',
      'src/test/**',
      'src/**/__tests__/**',
    ],
    setupFiles: ['fake-indexeddb/auto'],
    server: {
      fs: {
        allow: [path.resolve(__dirname, '../3d_viewer_electron')],
      },
    },
  },
  resolve: {
    alias: {
      '@': electronRenderer,
    },
  },
})
