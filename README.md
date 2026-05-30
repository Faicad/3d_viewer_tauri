# Faicad 3D Viewer (Tauri)

Tauri 版本的 Faicad 3D 模型查看器。相比 Electron 版本，安装包体积减少约 90%（~16MB vs ~200MB）。

## 前置依赖

### 1. 目录位置

本项目通过 Vite alias 和目录 junction 直接引用 Electron 项目的渲染层代码，**Electron 项目克隆在本项目目录内**：

```
3d_viewer_tauri\          # 本项目
├── 3d_viewer_electron\   # 原始 Electron 项目（克隆到内部）
│   └── src\renderer\     # ← Tauri 项目引用此目录
└── electron-src\         # → Junction → 3d_viewer_electron\src\renderer\
```

### 2. Electron 项目

克隆原项目到本项目目录内：

```bash
cd 3d_viewer_tauri
git clone https://github.com/Faicad/3d_viewer_electron.git
cd 3d_viewer_electron
pnpm install
cd ..
```

Electron 项目的 `node_modules` 必须存在（Tauri 项目引用其 `three`、`react` 等依赖的类型声明和 `public/` 静态资源）。

### 3. 系统要求

- **Node.js** >= 22
- **pnpm** >= 10
- **Rust** >= 1.95 (MSVC toolchain)
- **Visual Studio Build Tools 2022** (Windows, "Desktop development with C++")
- **WebView2** (Windows 10+ 自带，或从 [Microsoft Edge WebView2](https://developer.microsoft.com/microsoft-edge/webview2/) 安装)

## 安装

```bash
cd 3d_viewer_tauri
pnpm install
```

## 开发

```bash
pnpm dev        # 启动 Tauri 开发模式（热重载）
```

## 构建

```bash
# Windows NSIS 安装包
pnpm build:win

# 输出位置：
# src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\3D Model Viewer_1.1.1_x64-setup.exe
```

## 运行 CI 检查

```bash
# Windows
powershell -File scripts/ci.ps1

# Linux / macOS
bash scripts/ci.sh
```

CI 包含：TypeScript 类型检查 → ESLint → 单元测试 → 组件测试 → Cargo check → Clippy → 构建

## 架构

```
本项目（只包含适配层，~200 行）          原项目（渲染层，被引用）
┌──────────────────────────┐      ┌──────────────────────────┐
│ src/                     │      │ 3d_viewer_electron/       │
│   polyfills.ts           │──────│   src/renderer/           │
│   electron-api.ts  ←适配─┤      │     main.tsx              │
│   env.ts                 │      │     components/           │
│   __tests__/             │      │     stores/               │
├──────────────────────────┤      │     engine/               │
│ src-tauri/               │      │     lib/                  │
│   src/commands/          │      │     public/               │
│     fs.rs        ←Rust后端│     │     config/               │
│     window.rs            │      │     i18n/                 │
└──────────────────────────┘      └──────────────────────────┘
```

### 关键设计

- **零拷贝**：渲染层代码（components、stores、engine、lib、i18n 等）不复制，通过 Vite alias `@` 和目录 junction `electron-src/` 直接引用
- **API 适配**：`src/electron-api.ts` 用 Tauri API 实现了与 Electron preload 完全相同的 `window.electronAPI` 接口，渲染层代码无需修改
- **CSS 增强**：原项目 `index.css` 添加了一行 `@source "./**/*.{ts,tsx}"`，让 Tailwind v4 跨项目扫描类名

### 与 Electron 项目的差异

| 项目 | 3d_viewer_electron | 3d_viewer_tauri |
|------|-------------------|-----------------|
| 安装包大小 | ~200MB | ~16MB |
| 后端运行时 | Node.js | Rust (原生) |
| 窗口框架 | Chromium (Electron) | WebView2 (Windows) / WKWebView (macOS) |
| 自定义协议 | `faicad-viewer://` | 不需要（Tauri 内置资产服务） |
| 构建工具 | electron-vite + electron-builder | Vite + Tauri CLI |

## 原项目修改记录

为了支持跨项目引用，对原 Electron 项目做了最小修改：

| 文件 | 修改 |
|------|------|
| `3d_viewer_electron/src/renderer/index.css` | 添加 `@source "./**/*.{ts,tsx}"`（1 行） |

此修改不影响 Electron 项目的正常运行。

## License

LGPL-2.0-only — 与原项目相同
