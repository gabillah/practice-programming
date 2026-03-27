# FlowSim CFD v2.0

**Computational Fluid Dynamics for Complex Pipe Networks**

A production-grade full-stack web application for analyzing fluid flow in pipe networks,
comparable to PipeFlow Expert / EPANET. Implements Hardy-Cross and Todini-Pilati (gradient)
iterative solvers with full Darcy-Weisbach, Colebrook-White, turbulence, and water hammer
physics engines.

## Quick Start

```bash
# Backend
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8000/api/v1/docs
- **OpenAPI JSON**: http://localhost:8000/api/v1/openapi.json

## Docker

```bash
docker-compose up --build
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000

## Run Tests

```bash
cd backend
pytest tests/ -v
```

All 57 tests should pass, covering:
- Reynolds number, friction factors (Colebrook, Swamee-Jain, Churchill)
- Head loss equations (Darcy-Weisbach, minor losses)
- Velocity profiles (laminar parabolic, turbulent power-law, log-law)
- Bernoulli / energy equation
- Water hammer (Joukowski, wave speed, critical closure)
- Turbulence parameters (k-ε model)
- Hardy-Cross and Gradient (Todini-Pilati) network solvers
- Built-in test cases: simple_loop, branched, complex_grid

## Features

| Feature | Description |
|---------|-------------|
| **Solver** | Hardy-Cross & Todini-Pilati gradient, 500-iteration, 10⁻⁷ tolerance |
| **Friction** | Colebrook-White (Newton-Raphson), Churchill, Swamee-Jain |
| **Losses** | Darcy-Weisbach + all minor losses (12 fitting types) |
| **Profiles** | Parabolic (laminar), power-law & log-law (turbulent) |
| **Turbulence** | Intensity, TKE, dissipation, wall shear (k-ε) |
| **Transient** | Water hammer: Joukowski ΔP, wave celerity, critical time |
| **Compressible** | Mach number, Fanno flow, stagnation properties |
| **Fluids** | Water, oil, gas, glycol + custom |
| **Visualization** | 6 colormaps, 8 CFD fields, flow arrows, labels |
| **Diagrams** | Interactive Moody chart, velocity profile chart |
| **API** | Full REST: CRUD + simulate + canvas export |

## Architecture

```
Frontend (React/Vite) ←→ FastAPI REST API ←→ SQLite
         ↓                      ↓
   Konva Canvas            Physics Engine
   Recharts                Hardy-Cross / Gradient Solver
   TanStack Query          Colebrook-White / Churchill
```

See `docs/DOCUMENTATION.txt` for the complete tutorial course.
See `diagrams/` for UML class diagram, sequence diagram, solver flowchart, and architecture diagram.

## License

MIT
