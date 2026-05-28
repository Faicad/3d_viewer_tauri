/**
 * postbump hook for standard-version.
 * Syncs the version from package.json into:
 *   - src-tauri/Cargo.toml
 *   - src-tauri/tauri.conf.json
 *
 * Uses regex replacement to preserve original file formatting.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const version = pkg.version

// --- Cargo.toml ---
const cargoPath = join(root, 'src-tauri', 'Cargo.toml')
let cargo = readFileSync(cargoPath, 'utf8')
cargo = cargo.replace(/^(version\s*=\s*)"[^"]+"/m, `$1"${version}"`)
writeFileSync(cargoPath, cargo)
console.log(`[sync-version] Updated Cargo.toml → ${version}`)

// --- tauri.conf.json ---
const tauriConfPath = join(root, 'src-tauri', 'tauri.conf.json')
let tauriConf = readFileSync(tauriConfPath, 'utf8')
tauriConf = tauriConf.replace(/"version"\s*:\s*"[^"]+"/, `"version": "${version}"`)
writeFileSync(tauriConfPath, tauriConf)
console.log(`[sync-version] Updated tauri.conf.json → ${version}`)
