import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

const electronRenderer = path.resolve(__dirname, './3d_viewer_electron/src/renderer')

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    // Only test Tauri adapter layer. Electron project tests run in their own CI.
    include: [
      'src/**/__tests__/*.test.{ts,tsx}',
    ],
    css: false,
  },
  resolve: {
    alias: {
      '@': electronRenderer,
    },
  },
})
