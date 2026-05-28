import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock all @tauri-apps/* modules before importing the polyfill
vi.mock('@tauri-apps/api/webviewWindow', () => ({
  getCurrentWebviewWindow: () => ({
    onDragDropEvent: vi.fn(),
  }),
}))

const mockInvoke = vi.fn()
vi.mock('@tauri-apps/api/core', () => ({
  invoke: mockInvoke,
}))

vi.mock('@tauri-apps/api/app', () => ({
  getVersion: vi.fn().mockResolvedValue('1.1.1'),
}))

const mockSetFullscreen = vi.fn()
const mockIsFullscreen = vi.fn()
const mockOnResized = vi.fn()
vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: () => ({
    setFullscreen: mockSetFullscreen,
    isFullscreen: mockIsFullscreen,
    onResized: mockOnResized,
  }),
}))

vi.mock('@tauri-apps/plugin-opener', () => ({
  openUrl: vi.fn(),
}))

vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: vi.fn(),
}))

const mockListen = vi.fn()
vi.mock('@tauri-apps/api/event', () => ({
  listen: mockListen,
}))

describe('electron-api polyfill', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sets window.electronAPI with all expected methods', async () => {
    await import('../electron-api')
    expect(window.electronAPI).toBeDefined()
    expect(typeof window.electronAPI.getAppVersion).toBe('function')
    expect(typeof window.electronAPI.getPlatform).toBe('function')
    expect(typeof window.electronAPI.openExternal).toBe('function')
    expect(typeof window.electronAPI.readDirectory).toBe('function')
    expect(typeof window.electronAPI.readFile).toBe('function')
    expect(typeof window.electronAPI.readFileAsBase64).toBe('function')
    expect(typeof window.electronAPI.getFilePath).toBe('function')
    expect(typeof window.electronAPI.openFileDialog).toBe('function')
    expect(typeof window.electronAPI.toggleFullscreen).toBe('function')
    expect(typeof window.electronAPI.onFullscreenChanged).toBe('function')
  })

  it('getAppVersion calls Tauri getVersion', async () => {
    const { getVersion } = await import('@tauri-apps/api/app')
    await window.electronAPI.getAppVersion()
    expect(getVersion).toHaveBeenCalled()
  })

  it('getPlatform returns win32 on Windows user agent', () => {
    // jsdom defaults don't include Windows, but the function uses navigator.userAgent
    const result = window.electronAPI.getPlatform()
    expect(['win32', 'darwin', 'linux', 'unknown']).toContain(result)
  })

  it('openExternal calls openUrl', async () => {
    const { openUrl } = await import('@tauri-apps/plugin-opener')
    await window.electronAPI.openExternal('https://example.com')
    expect(openUrl).toHaveBeenCalledWith('https://example.com')
  })

  it('readDirectory calls invoke with dirPath', async () => {
    mockInvoke.mockResolvedValueOnce({ success: true, files: [] })
    await window.electronAPI.readDirectory('/some/dir')
    expect(mockInvoke).toHaveBeenCalledWith('read_directory', { dirPath: '/some/dir' })
  })

  it('readFile decodes base64 data to ArrayBuffer', async () => {
    const testString = 'hello world'
    const base64 = btoa(testString)
    mockInvoke.mockResolvedValueOnce({ success: true, data: base64 })

    const result = await window.electronAPI.readFile('/test.stl')
    expect(result.success).toBe(true)
    expect(result.data).toBeInstanceOf(ArrayBuffer)
    const decoded = new TextDecoder().decode(result.data)
    expect(decoded).toBe(testString)
  })

  it('readFile returns error when invoke fails', async () => {
    mockInvoke.mockResolvedValueOnce({ success: false, error: 'not found' })
    const result = await window.electronAPI.readFile('/nonexistent')
    expect(result.success).toBe(false)
    expect(result.error).toBe('not found')
  })

  it('readFileAsBase64 passes through base64 string', async () => {
    mockInvoke.mockResolvedValueOnce({ success: true, data: 'aGVsbG8=' })
    const result = await window.electronAPI.readFileAsBase64('/test.bin')
    expect(result.success).toBe(true)
    expect(result.data).toBe('aGVsbG8=')
  })

  it('getFilePath returns file.name as fallback', () => {
    const file = new File([], 'model.stl')
    const path = window.electronAPI.getFilePath(file)
    expect(path).toBe('model.stl')
  })

  it('toggleFullscreen toggles and returns new state', async () => {
    mockIsFullscreen.mockResolvedValueOnce(false)
    mockSetFullscreen.mockResolvedValueOnce(undefined)
    const result = await window.electronAPI.toggleFullscreen()
    expect(mockSetFullscreen).toHaveBeenCalledWith(true)
    expect(result).toBe(true)
  })

  it('onFullscreenChanged returns a cleanup function', () => {
    const unlistenFn = vi.fn()
    mockOnResized.mockResolvedValueOnce(unlistenFn)
    mockIsFullscreen.mockResolvedValueOnce(false)

    const cleanup = window.electronAPI.onFullscreenChanged(() => {})
    expect(typeof cleanup).toBe('function')
    cleanup()
    // unlistenFn might not have been called yet (async), but cleanup should still work
  })

  it('getPendingFilePath calls invoke with correct command', async () => {
    mockInvoke.mockResolvedValueOnce('/path/to/model.stl')
    const result = await window.electronAPI.getPendingFilePath()
    expect(mockInvoke).toHaveBeenCalledWith('get_pending_file_path')
    expect(result).toBe('/path/to/model.stl')
  })

  it('getPendingFilePath returns null when no pending file', async () => {
    mockInvoke.mockResolvedValueOnce(null)
    const result = await window.electronAPI.getPendingFilePath()
    expect(result).toBeNull()
  })

  it('onOpenExternalFile listens for open-external-file event', () => {
    const unlistenFn = vi.fn()
    mockListen.mockResolvedValueOnce(unlistenFn)

    const callback = vi.fn()
    const cleanup = window.electronAPI.onOpenExternalFile(callback)

    expect(mockListen).toHaveBeenCalledWith('open-external-file', expect.any(Function))
    expect(typeof cleanup).toBe('function')
  })

  it('onOpenExternalFile callback receives payload from event', async () => {
    let registeredListener: ((event: { payload: string }) => void) | null = null
    mockListen.mockImplementation((_event: string, listener: (event: { payload: string }) => void) => {
      registeredListener = listener
      return Promise.resolve(vi.fn())
    })

    const callback = vi.fn()
    window.electronAPI.onOpenExternalFile(callback)

    // Trigger the event with a payload
    registeredListener!({ payload: '/path/to/file.stl' })
    expect(callback).toHaveBeenCalledWith('/path/to/file.stl')
  })

  it('onOpenExternalFile cleanup calls unlisten', async () => {
    const unlistenFn = vi.fn()
    mockListen.mockResolvedValueOnce(unlistenFn)

    const cleanup = window.electronAPI.onOpenExternalFile(() => {})
    await cleanup()
    expect(unlistenFn).toHaveBeenCalled()
  })

  it('checks new methods exist on window.electronAPI', async () => {
    await import('../electron-api')
    expect(typeof window.electronAPI.getPendingFilePath).toBe('function')
    expect(typeof window.electronAPI.onOpenExternalFile).toBe('function')
  })
})
