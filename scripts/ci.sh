#!/usr/bin/env bash
# CI pipeline — all platforms
# Fast checks (~30s): typecheck + lint + unit tests + component tests
# Slow checks (~3min): Rust check + clippy + build
set -euo pipefail

PLATFORM=$(uname -s)

if echo "${OS:-}${os:-}" | grep -q "Windows_NT" ||
   echo "$PLATFORM" | grep -qE "^(MINGW|MSYS|CYGWIN)"; then
  PLATFORM="Windows"
elif [ "$PLATFORM" = "Darwin" ]; then
  PLATFORM="macOS"
fi

echo "Platform: $PLATFORM"
echo ""

echo "========================================"
echo "  1/7  Type check (tsc --noEmit)"
echo "========================================"
pnpm exec tsc --noEmit

echo ""
echo "========================================"
echo "  2/7  Lint (eslint)"
echo "========================================"
pnpm run lint

echo ""
echo "========================================"
echo "  3/7  Unit tests (vitest, node env)"
echo "========================================"
pnpm exec vitest run

echo ""
echo "========================================"
echo "  4/7  Component & integration tests"
echo "       (vitest, jsdom env)"
echo "========================================"
pnpm exec vitest run --config vitest.jsdom.config.ts

echo ""
echo "========================================"
echo "  5/7  Rust check (cargo check)"
echo "========================================"
cargo check --manifest-path src-tauri/Cargo.toml

echo ""
echo "========================================"
echo "  6/7  Rust lint (cargo clippy)"
echo "========================================"
cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings

echo ""
echo "========================================"
echo "  7/7  Build (frontend + tauri)"
echo "========================================"
pnpm run build
cargo build --manifest-path src-tauri/Cargo.toml

echo ""
echo "========================================"
echo "  All checks and tests passed"
echo "========================================"
