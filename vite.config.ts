import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

const originalRenderer = path.resolve(__dirname, './3d_viewer_electron/src/renderer')
const originalPublic = path.resolve(__dirname, './3d_viewer_electron/src/renderer/public')

export default defineConfig({
  plugins: [react(), tailwindcss()],

  root: __dirname,

  resolve: {
    alias: {
      '@': originalRenderer,
    },
  },

  publicDir: originalPublic,

  server: {
    port: 1420,
    fs: {
      allow: [
        __dirname,
        path.resolve(__dirname, './3d_viewer_electron'),
      ],
    },
    watch: {
      ignored: ['**/node_modules/**', '**/3d_viewer_electron/node_modules/**'],
    },
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
