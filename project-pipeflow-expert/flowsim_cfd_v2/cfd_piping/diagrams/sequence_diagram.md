```mermaid
---
title: FlowSim CFD — Simulation Execution Sequence Diagram
---
sequenceDiagram
    actor User as User / Browser
    participant FE  as Frontend (React)
    participant API as FastAPI Backend
    participant BG  as Background Task (asyncio)
    participant DB  as SQLite Database
    participant SLV as CFD Solver

    User->>FE: Click "Run CFD"
    FE->>API: POST /api/v1/simulations/\n{network_id, name, solver_settings}

    API->>DB: SELECT network, nodes, pipes
    DB-->>API: Network topology

    API->>DB: INSERT SimulationModel\n{status: "pending"}
    DB-->>API: sim_id

    API-->>FE: 202 Accepted\n{id: sim_id, status: "pending"}

    API->>BG: add_task(_run_simulation, sim_id)

    Note over BG: Runs in thread pool

    BG->>DB: UPDATE status = "running"

    BG->>DB: SELECT nodes, pipes, fluid
    DB-->>BG: Full network data

    BG->>SLV: Build NodeBC[], PipeBC[]\nFluidProperties, SolverSettings

    alt use_gradient_method = True
        SLV->>SLV: GradientSolver.__init__()\nBuild A matrix, partition nodes
        loop Newton-Raphson until convergence
            SLV->>SLV: Compute R_vec, D_vec\n(pipe resistances)
            SLV->>SLV: Assemble Jacobian J\n[D A11; A11^T 0]
            SLV->>SLV: Solve J·δ = r\n(scipy lstsq)
            SLV->>SLV: Update Q += ω·δQ\nH += ω·δH
            SLV->>SLV: Check convergence\nmax|r| < tol?
        end
    else use_gradient_method = False
        SLV->>SLV: HardyCrossSolver.__init__()\nFind independent loops (DFS)
        loop Hardy-Cross until convergence
            SLV->>SLV: Per loop: ΔQ = -Σhf / (n·Σ|hf/Q|)
            SLV->>SLV: Apply corrections to all loop pipes
            SLV->>SLV: Check max|ΔQ| < tol?
        end
    end

    SLV->>SLV: compute_node_heads()\nBFS from fixed-head nodes
    SLV->>SLV: _build_results()\nPipeResult, NodeResult per element

    SLV-->>BG: NetworkSolution\n{converged, iterations, pipe_results, node_results, ...}

    BG->>BG: Serialize results to dicts\n(per-pipe, per-node)

    BG->>DB: UPDATE SimulationModel\n{status, converged, pipe_results, node_results,\niterations_used, max_residual, solve_time_s}

    Note over FE: Frontend polling every 2s

    FE->>API: GET /api/v1/simulations/{sim_id}
    API->>DB: SELECT SimulationModel
    DB-->>API: status = "converged"
    API-->>FE: {status: "converged", iterations_used: N, ...}

    FE->>API: POST /api/v1/canvas/export\n{network_id, simulation_id, color_field, colormap}

    API->>DB: SELECT nodes, pipes, simulation.pipe_results
    DB-->>API: All data

    API->>API: For each pipe:\n  extract field_value\n  normalize (v-min)/(max-min)\n  map to RGB hex via colormap

    API-->>FE: CanvasExportResponse\n{nodes: [...], pipes: [{color, velocity, Re, ...}],\nlegend_min, legend_max}

    FE->>FE: Re-render Konva canvas\nwith color-mapped pipes\nand result overlays
    FE-->>User: Color-coded pipe network\nwith CFD results
```
