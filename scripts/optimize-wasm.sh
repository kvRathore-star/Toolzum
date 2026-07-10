#!/usr/bin/env bash
#
# optimize-wasm.sh — Build and optimize WebAssembly binaries for production.
#
# Usage: ./scripts/optimize-wasm.sh
#
# This script:
#   1. Builds Rust WASM crates (if present) with wasm-pack
#   2. Optimizes all .wasm files in public/wasm/ using wasm-opt (Binaryen)
#   3. Generates a manifest for lazy loading
#
# Requirements:
#   - wasm-pack (cargo install wasm-pack)
#   - wasm-opt  (brew install binaryen / npm install -g wasm-opt)

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WASM_DIR="$ROOT_DIR/public/wasm"
MANIFEST="$WASM_DIR/manifest.json"

echo "=== Toolzum WASM Optimizer ==="

# Step 1: Build Rust crates if any exist
if [ -d "$ROOT_DIR/crates" ]; then
  echo "Building Rust WASM crates..."
  for crate in "$ROOT_DIR"/crates/*/; do
    if [ -f "${crate}Cargo.toml" ]; then
      name=$(basename "$crate")
      echo "  Building $name..."
      (cd "$crate" && wasm-pack build --target web --release)
      # Copy output to public/wasm/
      if [ -d "${crate}pkg" ]; then
        cp "${crate}pkg/"*.wasm "$WASM_DIR/"
        cp "${crate}pkg/"*.js   "$WASM_DIR/" 2>/dev/null || true
      fi
    fi
  done
fi

# Step 2: Optimize all .wasm files with wasm-opt
if command -v wasm-opt &>/dev/null; then
  echo "Optimizing WASM binaries..."
  for wasm in "$WASM_DIR"/*.wasm; do
    if [ -f "$wasm" ]; then
      name=$(basename "$wasm")
      orig_size=$(stat -f%z "$wasm" 2>/dev/null || stat -c%s "$wasm" 2>/dev/null || echo 0)
      wasm-opt -O3 \
        --enable-simd \
        --enable-bulk-memory \
        --strip-debug \
        --strip-producers \
        -o "$wasm.opt" \
        "$wasm" 2>/dev/null || {
          echo "  Skipping $name (optimization failed)"
          continue
        }
      mv "$wasm.opt" "$wasm"
      new_size=$(stat -f%z "$wasm" 2>/dev/null || stat -c%s "$wasm" 2>/dev/null || echo 0)
      reduction=$((100 - (new_size * 100 / (orig_size > 0 ? orig_size : 1))))
      echo "  $name: $orig_size -> $new_size bytes (-${reduction}%)"
    fi
  done
else
  echo "wasm-opt not found — skipping WASM optimization"
  echo "Install with: brew install binaryen"
fi

# Step 3: Generate manifest for the client-side loader
echo "Generating manifest..."
echo "{" > "$MANIFEST"
first=true
for wasm in "$WASM_DIR"/*.wasm; do
  if [ -f "$wasm" ]; then
    name=$(basename "$wasm")
    size=$(stat -f%z "$wasm" 2>/dev/null || stat -c%s "$wasm" 2>/dev/null || echo 0)
    $first || echo "," >> "$MANIFEST"
    printf '  "%s": {"size": %d}' "$name" "$size" >> "$MANIFEST"
    first=false
  fi
done
echo "" >> "$MANIFEST"
echo "}" >> "$MANIFEST"

echo "=== Done ==="
echo "WASM files ready in: $WASM_DIR"