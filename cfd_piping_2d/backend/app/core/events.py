"""
Application Lifecycle Events
==============================
Startup: Create DB tables, seed default fluid library.
Shutdown: Close connections gracefully.
"""

import logging
from sqlalchemy import text

from app.core.database import engine, Base
from app.core.config import settings

logger = logging.getLogger("flowsim.events")


async def startup_event() -> None:
    """Run on application startup."""
    logger.info("Initialising database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables ready.")

    # Seed default fluid library if empty
    try:
        from app.core.database import AsyncSessionLocal
        from app.models.fluid import FluidModel
        from sqlalchemy import select

        async with AsyncSessionLocal() as session:
            result = await session.execute(select(FluidModel).limit(1))
            if result.first() is None:
                await _seed_fluids(session)
                await session.commit()
                logger.info("Default fluid library seeded.")
    except Exception as exc:
        logger.warning("Could not seed fluids: %s", exc)


async def _seed_fluids(session) -> None:
    """Insert default fluids into the database."""
    from app.models.fluid import FluidModel

    defaults = [
        FluidModel(
            name="Water (20°C)",
            slug="water_20",
            density_kg_m3=998.2,
            dynamic_viscosity_pa_s=1.002e-3,
            kinematic_viscosity_m2_s=1.004e-6,
            bulk_modulus_pa=2.18e9,
            vapor_pressure_pa=2338.0,
            surface_tension_n_m=0.0728,
            specific_heat_j_kg_k=4182.0,
            thermal_conductivity_w_m_k=0.598,
            prandtl_number=7.01,
            compressible=False,
            description="Water at standard conditions (20°C, 1 atm)",
        ),
        FluidModel(
            name="Water (60°C)",
            slug="water_60",
            density_kg_m3=983.2,
            dynamic_viscosity_pa_s=4.67e-4,
            kinematic_viscosity_m2_s=4.75e-7,
            bulk_modulus_pa=2.27e9,
            vapor_pressure_pa=19940.0,
            surface_tension_n_m=0.0662,
            specific_heat_j_kg_k=4185.0,
            thermal_conductivity_w_m_k=0.651,
            prandtl_number=3.0,
            compressible=False,
            description="Water at 60°C",
        ),
        FluidModel(
            name="Air (20°C)",
            slug="air_20",
            density_kg_m3=1.204,
            dynamic_viscosity_pa_s=1.825e-5,
            kinematic_viscosity_m2_s=1.516e-5,
            bulk_modulus_pa=142000.0,
            vapor_pressure_pa=0.0,
            surface_tension_n_m=0.0,
            specific_heat_j_kg_k=1005.0,
            thermal_conductivity_w_m_k=0.0257,
            prandtl_number=0.713,
            compressible=True,
            description="Dry air at 20°C, 1 atm",
        ),
        FluidModel(
            name="Crude Oil",
            slug="crude_oil",
            density_kg_m3=870.0,
            dynamic_viscosity_pa_s=0.010,
            kinematic_viscosity_m2_s=1.15e-5,
            bulk_modulus_pa=1.5e9,
            vapor_pressure_pa=3000.0,
            surface_tension_n_m=0.030,
            specific_heat_j_kg_k=2000.0,
            thermal_conductivity_w_m_k=0.14,
            prandtl_number=143.0,
            compressible=False,
            description="Typical crude oil at 20°C",
        ),
        FluidModel(
            name="Natural Gas (Methane)",
            slug="methane_20",
            density_kg_m3=0.717,
            dynamic_viscosity_pa_s=1.087e-5,
            kinematic_viscosity_m2_s=1.516e-5,
            bulk_modulus_pa=101325.0,
            vapor_pressure_pa=0.0,
            surface_tension_n_m=0.0,
            specific_heat_j_kg_k=2226.0,
            thermal_conductivity_w_m_k=0.0343,
            prandtl_number=0.74,
            compressible=True,
            description="Methane at 20°C, 1 atm",
        ),
        FluidModel(
            name="Glycol 50% (Antifreeze)",
            slug="glycol_50",
            density_kg_m3=1065.0,
            dynamic_viscosity_pa_s=5.3e-3,
            kinematic_viscosity_m2_s=4.98e-6,
            bulk_modulus_pa=2.0e9,
            vapor_pressure_pa=500.0,
            surface_tension_n_m=0.046,
            specific_heat_j_kg_k=3500.0,
            thermal_conductivity_w_m_k=0.42,
            prandtl_number=44.0,
            compressible=False,
            description="50% ethylene glycol / water mixture at 20°C",
        ),
    ]
    session.add_all(defaults)


async def shutdown_event() -> None:
    """Run on application shutdown."""
    logger.info("Disposing database engine...")
    await engine.dispose()
    logger.info("Shutdown complete.")
