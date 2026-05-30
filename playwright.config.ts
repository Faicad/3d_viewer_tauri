import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './3d_viewer_electron/src/test',
  timeout: 60000,
  retries: 0,
  workers: 1,
  fullyParallel: false,
  use: {
    viewport: { width: 1280, height: 800 },
  },
})
