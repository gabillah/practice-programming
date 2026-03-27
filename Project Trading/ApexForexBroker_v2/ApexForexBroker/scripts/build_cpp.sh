#!/usr/bin/env bash
# build_cpp.sh — Build math_engine shared library on Linux / macOS
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/.."
CPP_DIR="$ROOT/cpp"
OUT_DIR="$ROOT/python/cpp"

echo ""
echo "  Building Apex Math Engine (C++)..."
echo ""

if [[ "$OSTYPE" == "darwin"* ]]; then
    EXT="dylib"
    FLAGS="-dynamiclib"
else
    EXT="so"
    FLAGS="-shared -fPIC"
fi

g++ -std=c++17 -O3 $FLAGS \
    -I"$CPP_DIR/include" \
    -o "$OUT_DIR/math_engine.$EXT" \
    "$CPP_DIR/src/math_engine.cpp" \
    -lm

echo "  [OK] math_engine.$EXT → $OUT_DIR/math_engine.$EXT"
