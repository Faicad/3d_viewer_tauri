# CI pipeline for Windows
# Fast checks (~30s): typecheck + lint + unit tests + component tests
# Slow checks (~3min): Rust check + clippy + build

Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "  1/7  Type check (tsc --noEmit)"       -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
pnpm exec tsc --noEmit

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "  2/7  Lint (eslint)"                    -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
pnpm run lint

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "  3/7  Unit tests (vitest, node env)"    -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
pnpm exec vitest run

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "  4/7  Component & integration tests"     -ForegroundColor Cyan
Write-Host "       (vitest, jsdom env)"               -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
pnpm exec vitest run --config vitest.jsdom.config.ts

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "  5/7  Rust check (cargo check)"         -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
cargo check --manifest-path src-tauri/Cargo.toml

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "  6/7  Rust lint (cargo clippy)"         -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "  7/7  Build (frontend + tauri)"         -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
pnpm run build
cargo build --manifest-path src-tauri/Cargo.toml

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "  All checks and tests passed"            -ForegroundColor Green
Write-Host "========================================"  -ForegroundColor Cyan
