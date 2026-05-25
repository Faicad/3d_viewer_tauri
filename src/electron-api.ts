import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { invoke } from '@tauri-apps/api/core'
import { getVersion } from '@tauri-apps/api/app'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { openUrl } from '@tauri-apps/plugin-opener'
import { open } from '@tauri-apps/plugin-dialog'

// Map filename → native path for drag-drop → getFilePath() bridge
const filePathMap = new Map<string, string>()

const webview = getCurrentWebviewWindow()
webview.onDragDropEvent((event) => {
  if (event.payload.type === 'drop') {
    for (const p of event.payload.paths) {
      const name = p.replace(/\\/g, '/').split('/').pop()!
      filePathMap.set(name, p)
    }
    setTimeout(() => filePathMap.clear(), 1000)
  }
})

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

interface FsResult {
  success: boolean
  data?: string
  files?: { name: string; path: string; mtimeMs: number }[]
  error?: string
}

const EXTENSIONS = [
  'stl', 'glb', 'gltf', '3mf', 'step', 'stp', 'obj', 'ply', 'fbx', 'dae',
  'igs', 'iges', 'amf', 'wrl', '3ds', 'off', 'xyz', 'x3d', 'lwo', 'msh',
  'ifc', 'bvh', 'vrm', 'mhx2', 'q3o', 'vtk', 'gcode', 'pcd',
]

window.electronAPI = {
  getAppVersion: () => getVersion(),

  getPlatform: () => {
    const ua = navigator.userAgent
    if (ua.includes('Windows')) return 'win32'
    if (ua.includes('Mac')) return 'darwin'
    if (ua.includes('Linux')) return 'linux'
    return 'unknown'
  },

  openExternal: (url: string) => openUrl(url),

  readDirectory: (dirPath: string) =>
    invoke('read_directory', { dirPath }) as Promise<FsResult>,

  readFile: async (filePath: string) => {
    const result = (await invoke('read_file', { filePath })) as FsResult
    if (result.success && result.data) {
      return { success: true, data: base64ToArrayBuffer(result.data) }
    }
    return { success: false, error: result.error }
  },

  readFileAsBase64: (filePath: string) =>
    invoke('read_file_base64', { filePath }) as Promise<FsResult>,

  getFilePath: (file: File) => {
    return filePathMap.get(file.name) ?? file.name
  },

  openFileDialog: async () => {
    const selected = await open({
      multiple: true,
      filters: [{
        name: '3D Models',
        extensions: EXTENSIONS,
      }],
    })
    if (!selected) {
      return { success: false, error: 'User cancelled' }
    }
    const paths = Array.isArray(selected) ? selected : [selected]
    const filePaths = paths.map((p) => {
      if (typeof p === 'string') return p
      return (p as { path: string }).path ?? String(p)
    })
    return { success: true, filePaths }
  },

  toggleFullscreen: async () => {
    const win = getCurrentWindow()
    const isFullscreen = await win.isFullscreen()
    await win.setFullscreen(!isFullscreen)
    return !isFullscreen
  },

  onFullscreenChanged: (callback: (isFullscreen: boolean) => void) => {
    const win = getCurrentWindow()
    let unlisten: (() => void) | null = null
    let active = true

    win.onResized(() => {
      win.isFullscreen().then(callback)
    }).then((fn) => {
      if (active) {
        unlisten = fn
      } else {
        fn()
      }
    })

    // Poll initial state
    win.isFullscreen().then(callback)

    return () => {
      active = false
      unlisten?.()
    }
  },
}
