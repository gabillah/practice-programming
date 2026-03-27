# CFD Pipe Flow Expert

A full-stack Computational Fluid Dynamics (CFD) web application for piping
network analysis, similar to PipeFlow Expert or EPANET.

## Features

- **Interactive canvas editor** — draw pipe networks with zoom, pan, drag
- **Two CFD solvers** — Hardy-Cross and Newton-Raphson (Todini-Pilati)
- **Colour-coded results** — velocity, pressure, temperature, Reynolds number
- **Interactive Moody Chart** — with hover, zoom/pan, and user-point plotting
- **10 engineering calculators** — DW, Reynolds, water hammer, heat transfer, etc.
- **Water-hammer MOC solver** — transient pressure animation player
- **REST API** — 30+ endpoints, Swagger docs at `/docs`
- **C++ acceleration** — optional pybind11 extension for 5–20× speedup
- **SQLite / PostgreSQL** — async SQLAlchemy 2.x ORM

## Quick Start

```bash
# 1. Clone or extract the project
cd cfd-pipe-flow

# 2. Create virtual environment
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. (Optional) Build C++ extension
pip install pybind11
python setup_ext.py build_ext --inplace

# 5. Start the backend
cd backend
uvicorn main:app --reload --port 8000

# 6. Open the frontend
# Open frontend/index.html in your browser, or:
cd ../frontend && python -m http.server 5500
# Then visit http://localhost:5500
```

API docs: http://localhost:8000/docs

## Docker Compose (full stack)

```bash
docker-compose up --build
# Frontend: http://localhost
# API docs: http://localhost:8000/docs
```

## Project Structure

```
cfd-pipe-flow/
├── backend/
│   ├── main.py              FastAPI app entry point
│   ├── cfd/
│   │   ├── solver.py        CFD engine (2 450 lines)
│   │   └── cfd_solver_ext.cpp  C++ pybind11 extension
│   ├── models/
│   │   ├── database.py      Async SQLAlchemy ORM
│   │   └── schemas.py       Pydantic v2 schemas
│   ├── api/
│   │   └── routes.py        REST API routes (30+ endpoints)
│   └── utils/
│       ├── config.py        Pydantic-settings configuration
│       └── logger.py        Loguru structured logging
├── frontend/
│   ├── index.html           SPA shell
│   ├── styles/main.css      Light-mode design system
│   └── js/
│       ├── api.js           REST client
│       ├── canvas.js        Interactive canvas editor
│       ├── network.js       Network state manager
│       ├── ui.js            UI components (modals, toasts)
│       ├── solver.js        Solve dispatch + colour mapping
│       ├── moody.js         Moody chart renderer
│       ├── calculators.js   Engineering calculators
│       ├── docs.js          Documentation renderer
│       └── app.js           App boot + routing
├── docs/
│   └── tutorial.txt         64-chapter step-by-step tutorial
├── diagrams/                Mermaid UML + flowchart diagrams
├── requirements.txt
├── docker-compose.yml
└── README.md
```

## Total Code

| Category | Files | Lines |
|----------|-------|-------|
| Backend Python | 9 | ~5 300 |
| C++ Extension | 1 | ~1 200 |
| Frontend JS | 9 | ~7 100 |
| HTML + CSS | 2 | ~1 670 |
| Docs + Diagrams | 6 | ~2 900 |
| Config + Build | 4 | ~140 |
| **Total** | **31** | **~18 300** |

## CFD Theory Covered

- Navier-Stokes equations and pipe-flow simplification
- Friction factors: Colebrook-White, Swamee-Jain, Churchill
- Hardy-Cross loop-correction method
- Newton-Raphson / Todini-Pilati gradient method
- Standard k-ε turbulence model (Launder & Spalding 1974)
- Heat transfer: Gnielinski, Dittus-Boelter, Sieder-Tate
- Water hammer: Joukowsky equation + Method of Characteristics
- Two-phase flow: Lockhart-Martinelli
- Compressible gas flow: Mach, Fanno line, choked conditions
- Cavitation number and NPSH

## License

MIT License — free for educational and commercial use.
