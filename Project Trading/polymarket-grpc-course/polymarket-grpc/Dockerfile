# ============================================================
# Polymarket gRPC Server — Dockerfile
# Multi-stage build: builder → minimal runtime image
# ============================================================

# ---- Stage 1: Build ----------------------------------------
FROM golang:1.22-alpine AS builder

# Install git and CA certificates (needed for go mod download)
RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /build

# Cache dependency layer separately for faster rebuilds
COPY go.mod go.sum ./
RUN go mod download

# Copy full source and compile
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-w -s" -o /polymarket-server ./server/main.go

# ---- Stage 2: Runtime image --------------------------------
FROM scratch

# Copy CA certs and timezone data from builder
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

# Copy binary
COPY --from=builder /polymarket-server /polymarket-server

# Expose gRPC and HTTP ports
EXPOSE 50051 8080

# Non-root uid (best practice)
USER 65534

ENTRYPOINT ["/polymarket-server"]
