"""
EquationZero FastAPI Application
"""
import os
import sys
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import create_tables

# Add scientific module to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "scientific"))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    logger.info("Starting EquationZero backend...")
    create_tables()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    logger.info(f"Upload directory: {settings.UPLOAD_DIR}")
    logger.info("EquationZero backend ready.")
    yield
    logger.info("Shutting down EquationZero backend.")


app = FastAPI(
    title="EquationZero API",
    description="Autonomous Scientific Equation Discovery Platform",
    version=settings.APP_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
from app.api.v1 import auth, projects, datasets, discoveries, experiments, benchmarks, health

app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["Projects"])
app.include_router(datasets.router, prefix="/api/v1/datasets", tags=["Datasets"])
app.include_router(discoveries.router, prefix="/api/v1/discoveries", tags=["Discoveries"])
app.include_router(experiments.router, prefix="/api/v1/experiments", tags=["Experiments"])
app.include_router(benchmarks.router, prefix="/api/v1/benchmarks", tags=["Benchmarks"])


@app.get("/")
def root():
    return {
        "product": "EquationZero",
        "version": settings.APP_VERSION,
        "tagline": "Discover the Mathematics Hidden in Reality.",
        "docs": "/api/docs",
    }
