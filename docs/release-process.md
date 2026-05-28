# Release Process

## 前置条件

- 代码已合并到 `main` 分支
- `pnpm run ci` 全部通过（tsc + lint + vitest + cargo check + cargo clippy + build）
- 有 GitHub 仓库的 push 权限（用于推送 tag 和 release）

## 版本号规则

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) + `standard-version` 自动管理版本号。

版本号格式：`major.minor.patch`（如 `1.1.1`）

| 提交类型 | 版本号变化 | 示例 |
|----------|-----------|------|
| `fix: ...` | patch +1（1.1.0 → 1.1.1） | `fix: crash on STEP load` |
| `feat: ...` | minor +1（1.1.0 → 1.2.0） | `feat: add file associations` |
| `feat: ...\n\nBREAKING CHANGE: ...` | major +1（1.1.0 → 2.0.0） | 不兼容的 API 变更 |
| `docs:`, `style:`, `test:`, `chore:`, `perf:`, `refactor:` | 不 bump 版本 | 仅出现在 CHANGELOG |

`.versionrc` 中的配置决定哪些类型被显式记录到 CHANGELOG，哪些被隐藏。

`standard-version` 执行后会自动同步版本号到 `src-tauri/Cargo.toml` 和 `src-tauri/tauri.conf.json`（通过 `scripts/sync-version.mjs` 钩子）。

## 发布流程

### 1. 确保分支干净

```bash
git checkout main
git pull origin main
git status          # 应该干净，没有未提交的变更
```

### 2. 运行 CI

```bash
pnpm run ci
```

必须全部通过才能继续。

### 3. 生成新版本号 + CHANGELOG

**自动 bump（推荐）**：由 commit 历史决定 bump 类型

```bash
pnpm run release
```

此命令会：
1. 根据自上次 tag 以来的 commit 类型 bump 版本号
2. 更新 `package.json` 中的 `version`
3. 同步版本号到 `src-tauri/Cargo.toml` 和 `src-tauri/tauri.conf.json`
4. 生成/更新 `CHANGELOG.md`
5. 创建 git tag（如 `v1.2.0`）
6. 提交版本变更

**手动指定 bump 类型**（当自动逻辑不正确或需要手动干预时）：

```bash
pnpm run release:minor   # 强制 bump minor（1.1.1 → 1.2.0）
pnpm run release:major   # 强制 bump major（1.1.1 → 2.0.0）
```

要强制 bump patch（与 `pnpm run release` 行为相同）：

```bash
pnpm exec standard-version --release-as patch
```

**首次打版或预发布**：

```bash
pnpm exec standard-version --first-release    # 不打 tag，只更新 CHANGELOG
pnpm exec standard-version --prerelease beta  # 生成 1.2.0-beta.0
```

### 4. 推送 tag 和提交

```bash
git push --follow-tags origin main
```

`--follow-tags` 确保 tag 和提交一起被推送。

### 5. 打包

打包前，确认 `package.json` 中的 `version` 已经是新的版本号。

```bash
# 前端构建
pnpm run build

# Windows — 使用 tauri build 交叉编译
pnpm run build:win

# 或直接打包当前平台
pnpm run build:tauri
```

Tauri 打包产物由 `src-tauri/tauri.conf.json` 中的 `bundle.targets` 控制：

| 平台 | 产物 |
|------|------|
| Windows | `src-tauri/target/release/bundle/nsis/3D Model Viewer_1.2.0_x64-setup.exe` |
| Windows | `src-tauri/target/release/bundle/msi/3D Model Viewer_1.2.0_x64.msi` |
| Linux | `src-tauri/target/release/bundle/appimage/3d-model-viewer_1.2.0_amd64.AppImage` |
| Linux | `src-tauri/target/release/bundle/deb/3d-model-viewer_1.2.0_amd64.deb` |
| macOS | `src-tauri/target/release/bundle/dmg/3D Model Viewer_1.2.0_x64.dmg` |

### 6. 发布到 GitHub Releases（可选）

Tauri 不内置 GitHub 发布功能，但可以手动将打包产物上传到 GitHub Releases：

1. 在 GitHub 上创建 Release，指向刚推送的 tag（如 `v1.2.0`）
2. 将 `src-tauri/target/release/bundle/` 下的安装包上传为附件

## 版本历史

查看已发布的版本：

```bash
git tag --sort=-v:refname
```

查看某个版本包含的变更：

```bash
git log v1.1.0...v1.1.1 --oneline
```

## 快速参考

```bash
# 完整发布一个 patch 版本（Windows）
pnpm run ci                    # 1. 全量检查
pnpm run release               # 2. bump version + changelog + tag
git push --follow-tags origin main  # 3. 推送
pnpm run build:win             # 4. 打包
```

## 注意事项

- 版本号同时存在于 `package.json`、`src-tauri/Cargo.toml` 和 `src-tauri/tauri.conf.json` 中。`standard-version` 只自动更新 `package.json`，但 `postbump` 钩子（`scripts/sync-version.mjs`）会自动同步到其余两个文件。
- 如果手动修改版本号（不通过 `standard-version`），请运行 `pnpm run version:sync` 手动同步。
