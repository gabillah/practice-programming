# ── Build stage ──────────────────────────────────────────────────────────────
FROM golang:1.21-alpine AS builder

RUN apk add --no-cache protobuf protobuf-dev git

# Install protoc plugins
RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
RUN go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

WORKDIR /app
COPY server/go.mod server/go.sum ./
RUN go mod download

# Copy proto files and generate stubs
COPY proto/ /proto/
RUN protoc --proto_path=/proto \
    --go_out=. --go_opt=paths=source_relative \
    --go-grpc_out=. --go-grpc_opt=paths=source_relative \
    /proto/market.proto

COPY server/ .
RUN CGO_ENABLED=0 GOOS=linux go build -o trading-server ./cmd/

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM alpine:3.18
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app
COPY --from=builder /app/trading-server .
EXPOSE 50051
ENTRYPOINT ["./trading-server"]
