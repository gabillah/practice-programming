# Trading Market Platform

An independent securities trading platform with a gRPC API (Go server)
and a Windows desktop client (C# WinForms / .NET 8).

## Quick Start

### Server (Docker)
```bash
cd deployments
docker-compose up --build
```

### Server (local Go)
```bash
bash scripts/generate_proto.sh
cd server && go mod tidy && go run ./cmd/main.go
```

### Windows Client
```bash
cd client/windows_app
dotnet restore && dotnet run
```

## Key Features
- gRPC API with Protocol Buffers (unary + server streaming)
- Real-time price and trade streaming
- Order matching engine (limit + market orders)
- **Circuit breaker: trading halted if market drops ≥ 5% in a day**
- **Trading hours: 09:00 – 15:00 (Asia/Jakarta, configurable)**
- JWT authentication with bcrypt password hashing
- Dark-themed Windows dashboard with live price grid

## Documentation
See `docs/documentation.txt` for the full course and tutorial.
See `docs/flowchart.mermaid` for architecture and flow diagrams.
