```mermaid
---
title: FlowSim CFD — System Architecture
---
graph TB
    subgraph CLIENT["Browser — React Frontend"]
        direction TB
        APP[App.tsx\nReact Router]
        NE[NetworkEditorPage\nKonva Canvas]
        AP[AnalysisPage\nSingle Pipe CFD]
        MC[MoodyChartPage\nRecharts Diagram]
        DIAG[DiagnosticsPage\nSolver Tests]
        STORE[Zustand Store\nGlobal State]
        RQ[TanStack Query\nData Fetching / Cache]
        APICLIENT[api/client.ts\nAxios HTTP Client]
    end

    subgraph BACKEND["FastAPI Backend"]
        direction TB
        subgraph ROUTES["REST API — /api/v1"]
            R_FLUIDS[/fluids/]
            R_PROJECTS[/projects/]
            R_NETWORKS[/networks/]
            R_NODES[/nodes/]
            R_PIPES[/pipes/]
            R_SIMS[/simulations/]
            R_ANALYSIS[/analysis/]
            R_CANVAS[/canvas/export]
            R_DIAG[/diagnostics/]
        end

        subgraph SERVICES["Physics & Solver Layer"]
            PHY["physics.py\n─────────────────\nReynolds / Moody\nColebrook-White\nDarcy-Weisbach\nMinor losses\nVelocity profiles\nTurbulence (k-ε)\nWater hammer\nBernoulli energy eq"]
            SOLV["solver.py\n─────────────────\nHardyCrossSolver\nGradientSolver\n(Todini-Pilati)\nLoop detection\nMass balance check"]
            CANVAS_SVC["canvas.py\n─────────────────\nColormap interpolation\nField extraction\nLegend scaling"]
        end

        subgraph MODELS["ORM Models (SQLAlchemy)"]
            M_FLUID[FluidModel]
            M_PROJ[ProjectModel]
            M_NET[NetworkModel]
            M_NODE[NodeModel]
            M_PIPE[PipeModel]
            M_SIM[SimulationModel]
        end

        BG["Background Tasks\n(asyncio)\nSimulation runner"]
    end

    subgraph STORAGE["Persistence"]
        DB[(SQLite / PostgreSQL\nflowsim.db)]
    end

    %% Connections
    APICLIENT <-->|HTTP JSON| ROUTES
    RQ --> APICLIENT
    APP --> NE
    APP --> AP
    APP --> MC
    APP --> DIAG
    NE --> RQ
    AP --> RQ
    MC --> RQ
    DIAG --> RQ

    R_SIMS --> BG
    BG --> SOLV
    SOLV --> PHY
    R_CANVAS --> CANVAS_SVC
    R_ANALYSIS --> PHY

    R_FLUIDS & R_PROJECTS & R_NETWORKS --> MODELS
    R_NODES & R_PIPES & R_SIMS --> MODELS
    MODELS <--> DB
    BG --> DB

    style CLIENT  fill:#f0f7ff,stroke:#baddfd
    style BACKEND fill:#f0fdfa,stroke:#99f6e4
    style STORAGE fill:#fef9ee,stroke:#fde68a
    style ROUTES  fill:#e0effe,stroke:#7dc3fc
    style SERVICES fill:#d1fae5,stroke:#6ee7b7
    style MODELS  fill:#fef3c7,stroke:#fcd34d
```
