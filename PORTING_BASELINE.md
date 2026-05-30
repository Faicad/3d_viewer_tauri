# Porting Baseline — 3D Viewer Tauri

This document records which version of the upstream Electron project
(`./3d_viewer_electron`) the Tauri project is currently in sync with.

## Architecture Overview

```
Tauri project
├── src/                  ← Tauri adapter layer (NEEDS porting from electron/)
│   └── electron-api.ts       Polyfill implementing window.electronAPI via Tauri APIs
│   └── types/electron.d.ts   Type declarations
│   └── __tests__/            Adapter layer tests
├── src-tauri/            ← Rust backend (NEEDS porting from electron/main/)
│   └── src/lib.rs            App lifecycle, Tauri commands
│   └── src/commands/         Rust command handlers
│   └── tauri.conf.json       Bundle config, file associations
├── electron-src/         ← Junction/symlink, NOT tracked in git
│                          (see .gitignore)
└── @/ → ./3d_viewer_electron/src/renderer/  ← Vite alias, AUTOMATIC
```

There are **two code pathways** in the Tauri project:

### 1. Shared renderer code — AUTOMATIC (no porting needed)

The Vite alias `@` → `./3d_viewer_electron/src/renderer/` and `tsconfig.json`
path mapping `@/*` → `./3d_viewer_electron/src/renderer/*` mean the Tauri
project **always uses the latest Electron project renderer code** at both
compile time and runtime. No porting is needed for files under
`src/renderer/` in the Electron project.

### 2. Tauri adapter layer — MANUAL porting required

The Electron-specific layer (`electron/main/`, `electron/preload/`,
`package.json` build config, `resources/`) has no equivalent in the Tauri
polyfill or Rust backend. Changes to these files must be manually ported
to the corresponding Tauri files:

| Electron file | Tauri equivalent |
|---|---|
| `electron/main/index.ts` | `src-tauri/src/lib.rs` + new Rust commands |
| `electron/preload/index.ts` | `src/electron-api.ts` |
| `package.json` (build config) | `src-tauri/tauri.conf.json` |
| `resources/` | `src-tauri/icons/` |
| `src/renderer/types/electron.d.ts` | `src/types/electron.d.ts` |

## Baseline

The Tauri project was first created from the Electron project at commit:

```
9082740 feat: auto-hide shadow floor in wireframe and mesh display modes
Date:   2026-05-24 12:10:46 +0800
```

At this point all Electron source under `electron/` was ported to the Tauri
adapter layer. Changes to `src/renderer/` are excluded here because they are
automatically consumed through the Vite alias mechanism.

## Porting History

| Date | Electron Commit | Description | Tauri Layer Changes |
|---|---|---|---|
| 2026-05-24 | `9082740` | Initial Tauri port (baseline) | All `src/` + `src-tauri/` |
| 2026-05-28 | `37793bf` | File associations for OS-level file type support | `Cargo.toml` `lib.rs` `tauri.conf.json` `capabilities/default.json` `electron-api.ts` `electron.d.ts` tests |

## Electron Commits Since Baseline (NOT yet ported to Tauri adapter layer)

All commits below only change `src/renderer/` files (shared code) and
therefore need **zero porting** unless noted otherwise.

| Commit | Description | Needs Tauri Porting? |
|---|---|---|
| `af6d412` | chore: add tailwindcss @source directive | No (renderer only) |
| `2c51e80` | feat: material editor texture display and Draco/KTX2 | No (renderer only) |
| `2d97b9c` | feat: UV mapping visualization | No (renderer only) |
| `4742aa1` | feat: material editor card-based grouping | No (renderer only) |
| `bc90893` | fix: material editor title order, thickness range | No (renderer only) |
| `7e5a917` | ui | No (renderer only) |
| `cc4878f` | feat: GLTF animation player with popup dialog | No (renderer only) |
| `37793bf` | ✅ feat: register file associations | Ported (see history above) |
| `e704c4d` | perf: defer thumbnail gen and directory listing | No (renderer only) |
| `9be31a2` | always show file preview icon | No (renderer only) |

**Current Electron HEAD**: `9be31a2` (2026-05-28 10:00:51 +0800)

## Porting Checklist (for future updates)

When a new commit adds or modifies files under `electron/` in the Electron
project, follow these steps:

1. **Identify what changed** in `electron/main/index.ts`, `electron/preload/index.ts`, `package.json` (build config section), `resources/`, and `src/renderer/types/electron.d.ts`.

2. **Map to Tauri equivalents**:

   - `electron/main/` → `src-tauri/` (Rust)
   - `electron/preload/` → `src/electron-api.ts` (TypeScript polyfill)
   - `package.json` `build.*` → `src-tauri/tauri.conf.json`
   - `package.json` `fileAssociations` → `src-tauri/tauri.conf.json` `bundle.fileAssociations`
   - `src/renderer/types/electron.d.ts` → `src/types/electron.d.ts`

3. **Add Rust commands** and `tauri_plugin_*` dependencies as needed in `src-tauri/`.

4. **Update capabilities** in `src-tauri/capabilities/default.json` if new permissions are needed.

5. **Add tests** in `src/__tests__/` for the new polyfill methods.

6. **Verify**:
   ```
   npx tsc --noEmit                          # TypeScript check
   npx vitest run                            # Node tests
   npx vitest run --config vitest.jsdom.config.ts  # jsdom tests
   cargo check --manifest-path src-tauri/Cargo.toml  # Rust check
   npm run build                             # Vite build
   ```

## Commands

```bash
# Check unported Electron commits (shows commits touching electron/ directory)
cd 3d_viewer_electron
git log --oneline 9082740..HEAD -- electron/

# Check all ports from electron to Tauri adapter layer
# (looking for commit messages referencing "port from electron")
git log --all --oneline --grep="port" ../

# Verify renderer code is in sync (Vite alias check)
# The alias @ → ./3d_viewer_electron/src/renderer is used at both
# dev time (vite.config.ts) and type-check time (tsconfig.json paths).
# No manual sync needed for renderer-only changes.
```
