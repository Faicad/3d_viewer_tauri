# 版本控制与接口约定

## 版本控制方案

本项目使用 **语义化版本控制 2.0**（SemVer）配合 `standard-version` 自动管理版本号。

### 版本格式

```
主版本号.次版本号.修订号
   ↑       ↑       ↑
  major   minor   patch
```

### 版本递增规则

| 版本类型 | 对应 Commit 类型 | 示例 |
|---------|-----------------|------|
| **patch**（修订号） | `fix:` | 1.0.0 → 1.0.1 |
| **minor**（次版本号） | `feat:` | 1.0.0 → 1.1.0 |
| **major**（主版本号） | `feat:` + `BREAKING CHANGE` | 1.0.0 → 2.0.0 |

### 发布命令

```bash
pnpm run release          # 根据 commit 信息自动推断版本号
pnpm run release:minor    # 强制升级 minor（1.0 → 1.1）
pnpm run release:major    # 强制升级 major（1.0 → 2.0）
```

执行后自动完成：
1. 根据 commit 记录计算新版本号
2. 更新 `package.json` 中的 `version` 字段
3. 同步到 `src-tauri/Cargo.toml` 和 `src-tauri/tauri.conf.json`
4. 生成/更新 `CHANGELOG.md`
5. 创建 Git tag
6. 提交变更

## 接口约定

### Commit 消息格式

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<类型>(<可选作用域>): <描述>

<可选正文>

<可选页脚>
```

#### 类型 (type)

| 类型 | 含义 | 是否触发版本号 |
|------|------|:------------:|
| `feat` | 新功能 | **minor** |
| `fix` | 修复 Bug | **patch** |
| `docs` | 文档变更 | 否 |
| `refactor` | 代码重构 | 否 |
| `perf` | 性能优化 | 否 |
| `chore` | 构建/工具链变更 | 否 |
| `style` | 代码格式调整 | 否 |
| `test` | 测试变更 | 否 |

#### 作用域 (scope)

可选，建议使用的作用域：

| 作用域 | 范围 |
|--------|------|
| `adapter` | Tauri 适配层（`src/electron-api.ts`、类型声明） |
| `backend` | Rust 后端（`src-tauri/`） |
| `ci` | CI/CD 配置 |
| `deps` | 依赖升级 |
| `docs` | 文档 |
| `port` | 从 Electron 项目移植功能 |

#### 示例

```text
feat(adapter): 实现 getPendingFilePath polyfill

fix(backend): 修复单实例锁在 macOS 上的路径提取

docs: 更新 PORTING_BASELINE.md

feat: 新增模型缩放滑块

BREAKING CHANGE: 移除对旧版 STL 二进制格式的支持
```

### 分支命名

```
<类型>/<描述>
```

示例：
```
feat/dark-mode
fix/step-crash-on-large-file
chore/upgrade-tauri-v2
docs/update-readme
port/file-associations
```

### Git Tag 命名

`standard-version` 自动生成，格式为 `v<版本号>`：

```
v1.0.0
v1.1.0
v2.0.0
```

## 工作流

### 日常开发

```bash
# 1. 创建特性分支
git checkout -b feat/my-feature

# 2. 编写代码并提交（使用约定格式）
git commit -m "feat: 新增模型缩放功能"
git commit -m "fix: 修正缩放边界值溢出"

# 3. 合并到 main
git checkout main
git merge feat/my-feature

# 4. 发布新版本
pnpm run release
git push --follow-tags
```

### Commit 建议

- 每个 commit 保持单一关注点，一个 commit 只做一件事
- 描述使用中文或英文均可，建议在类型/作用域部分保持英文
- Breaking change 在正文中写明 `BREAKING CHANGE:`，可在提交信息中直接写 `feat: xxx\n\nBREAKING CHANGE: xxx`

## 工具链

| 工具 | 用途 |
|------|------|
| `standard-version` | 自动版本号 + CHANGELOG 生成 |
| `standard-version --dry-run` | 预览本次 release 效果，不实际执行 |
| `pnpm run version:sync` | 手动将 `package.json` 版本同步到 `Cargo.toml` 和 `tauri.conf.json` |
| `git log --oneline --no-decorate` | 查看 commit 历史确认版本递增是否正确 |

## 版本同步

版本号同时存在于三个文件中，`standard-version` 通过 `postbump` 钩子自动同步：

| 文件 | 字段 |
|------|------|
| `package.json` | `version`（standard-version 自动更新） |
| `src-tauri/Cargo.toml` | `[package] version`（postbump 同步） |
| `src-tauri/tauri.conf.json` | `version`（postbump 同步） |

如果手动修改了 `package.json` 中的版本号，运行以下命令手动同步：

```bash
pnpm run version:sync
```
