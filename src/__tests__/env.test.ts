import { describe, it, expect, vi } from 'vitest'

// Vite's import.meta.env for tests
vi.stubEnv('VITE_E2E', 'false')

describe('env polyfill', () => {
  it('sets window.env with DEV, PROD, E2E', async () => {
    await import('../env')
    expect(window.env).toBeDefined()
    expect(typeof window.env.DEV).toBe('boolean')
    expect(typeof window.env.PROD).toBe('boolean')
    expect(window.env.E2E).toBe(false)
  })

  it('PROD is opposite of DEV', async () => {
    await import('../env')
    expect(window.env.PROD).toBe(!window.env.DEV)
  })
})
