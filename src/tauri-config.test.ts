import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('Tauri project config', () => {
  const root = path.resolve(__dirname, '..')

  it('has package.json with required fields', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'))
    expect(pkg.name).toBe('3d_viewer_tauri')
    expect(pkg.scripts.dev).toBe('tauri dev')
    expect(pkg.scripts['build:win']).toBeDefined()
    expect(pkg.dependencies['@tauri-apps/api']).toBeDefined()
  })

  it('has tauri.conf.json with valid config', () => {
    const conf = JSON.parse(fs.readFileSync(path.join(root, 'src-tauri/tauri.conf.json'), 'utf-8'))
    expect(conf.identifier).toMatch(/^[a-z0-9.-]+$/)
    expect(conf.build.frontendDist).toBe('../dist')
    expect(conf.app.windows[0].title).toBe('3D Model Viewer')
  })

  it('has all required Rust command modules', () => {
    const cmds = path.join(root, 'src-tauri/src/commands')
    expect(fs.existsSync(path.join(cmds, 'mod.rs'))).toBe(true)
    expect(fs.existsSync(path.join(cmds, 'fs.rs'))).toBe(true)
    expect(fs.existsSync(path.join(cmds, 'window.rs'))).toBe(true)
  })

  it('has CI scripts', () => {
    const scripts = path.join(root, 'scripts')
    expect(fs.existsSync(path.join(scripts, 'ci.sh'))).toBe(true)
    expect(fs.existsSync(path.join(scripts, 'ci.ps1'))).toBe(true)
  })

  it('has GitHub Actions workflow', () => {
    const wf = path.join(root, '.github/workflows/ci.yml')
    expect(fs.existsSync(wf)).toBe(true)
  })
})
