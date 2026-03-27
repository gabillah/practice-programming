#!/usr/bin/env bash
# generate_proto.sh — Generate Go gRPC stubs from market.proto
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
PROTO_DIR="$ROOT_DIR/proto"
OUT_DIR="$ROOT_DIR/server"

echo "==> Checking dependencies..."
command -v protoc            >/dev/null 2>&1 || { echo "ERROR: protoc not found. Install protobuf-compiler."; exit 1; }
command -v protoc-gen-go     >/dev/null 2>&1 || go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
command -v protoc-gen-go-grpc>/dev/null 2>&1 || go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

echo "==> Generating stubs from $PROTO_DIR/market.proto..."
protoc \
  --proto_path="$PROTO_DIR" \
  --go_out="$OUT_DIR" \
  --go_opt=paths=source_relative \
  --go-grpc_out="$OUT_DIR" \
  --go-grpc_opt=paths=source_relative \
  "$PROTO_DIR/market.proto"

echo "==> Done. Generated files in $OUT_DIR"
