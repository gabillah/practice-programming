# Polymarket gRPC — Makefile
# ============================================================
# Usage:
#   make proto      — compile .proto files to Go stubs
#   make build      — build the server binary
#   make run        — run the server (hot-reload with air if available)
#   make test       — run all tests
#   make test-race  — run all tests with -race flag
#   make lint       — run golangci-lint
#   make docker     — build Docker image
#   make clean      — remove build artefacts
# ============================================================

BINARY_NAME   := polymarket-server
MODULE        := github.com/polymarket-grpc
PROTO_DIR     := proto
PROTO_OUT_DIR := proto/generated
DOCKER_IMAGE  := polymarket-grpc:latest

GO     := go
GOFLAGS :=

.PHONY: all proto build run test test-race lint docker clean deps install-tools

# ---- Default target ----------------------------------------
all: deps proto build

# ---- Protobuf code generation ------------------------------
proto:
	@echo "==> Generating protobuf stubs..."
	@mkdir -p $(PROTO_OUT_DIR)
	protoc \
		--go_out=$(PROTO_OUT_DIR) \
		--go_opt=paths=source_relative \
		--go-grpc_out=$(PROTO_OUT_DIR) \
		--go-grpc_opt=paths=source_relative \
		$(PROTO_DIR)/polymarket.proto
	@echo "==> Done: $(PROTO_OUT_DIR)"

# ---- Build -------------------------------------------------
build:
	@echo "==> Building $(BINARY_NAME)..."
	CGO_ENABLED=0 $(GO) build $(GOFLAGS) -o bin/$(BINARY_NAME) ./server/
	@echo "==> Binary: bin/$(BINARY_NAME)"

# ---- Run ---------------------------------------------------
run:
	@echo "==> Starting server..."
	$(GO) run ./server/main.go

# ---- Tests -------------------------------------------------
test:
	@echo "==> Running tests..."
	$(GO) test ./... -v -timeout 60s

test-race:
	@echo "==> Running tests with -race..."
	$(GO) test ./... -race -timeout 120s

# ---- Linting -----------------------------------------------
lint:
	@echo "==> Linting..."
	golangci-lint run ./...

# ---- Docker ------------------------------------------------
docker:
	@echo "==> Building Docker image $(DOCKER_IMAGE)..."
	docker build -t $(DOCKER_IMAGE) .

# ---- Dependency management ---------------------------------
deps:
	@echo "==> Downloading dependencies..."
	$(GO) mod download
	$(GO) mod tidy

# ---- Tool installation ------------------------------------
install-tools:
	@echo "==> Installing protoc plugins..."
	go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
	go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
	@echo "==> Installing golangci-lint..."
	curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh \
		| sh -s -- -b $$(go env GOPATH)/bin v1.57.2

# ---- Clean -------------------------------------------------
clean:
	@echo "==> Cleaning..."
	rm -rf bin/
	rm -rf $(PROTO_OUT_DIR)/
