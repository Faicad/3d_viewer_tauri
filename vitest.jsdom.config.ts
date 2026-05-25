import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

const electronRenderer = path.resolve(__dirname, '../3d_viewer_electron/src/renderer')
const electronProject = path.resolve(__dirname, '../3d_viewer_electron')

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: [
      '../3d_viewer_electron/src/**/__tests__/*.test.{ts,tsx}',
      'src/**/__tests__/*.test.{ts,tsx}',
    ],
    setupFiles: [path.resolve(__dirname, '../3d_viewer_electron/src/test/setup-jsdom.ts')],
    css: false,
  },
  resolve: {
    alias: {
      '@': electronRenderer,
    },
  },
  server: {
    fs: {
      allow: [__dirname, electronProject],
    },
  },
})
