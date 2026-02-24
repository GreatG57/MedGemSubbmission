"""
Hospital AI Assistant – FastAPI Application Entry Point
-------------------------------------------------------
Boots the FastAPI app, registers routers, and configures
CORS so the React frontend can communicate with this backend.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import doctor, patient, health, dashboard
from app.services.ai_service import get_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan: load the model once at startup, release at shutdown
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    """
    FastAPI lifespan context manager.
    Runs model loading before the server starts accepting requests,
    ensuring the first request never has to wait for a cold start.
    """
    logger.info("=== Hospital AI Assistant starting up ===")
    service = get_service()
    service.load()          # loads MedGemma (or logs mock mode)
    logger.info("=== Startup complete – ready to serve requests ===")
    yield
    # Shutdown hook (nothing to teardown for now, placeholder for future cleanup)
    logger.info("=== Hospital AI Assistant shutting down ===")


# ---------------------------------------------------------------------------
# App initialisation
# ---------------------------------------------------------------------------

app = FastAPI(
    lifespan=lifespan,
    title="Hospital AI Assistant API",
    description=(
        "AI-powered backend that helps doctors summarise patient records "
        "and provides patients with plain-language explanations of their "
        "medical documents. NOT a diagnostic tool."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS – adjust origins to match your React dev / prod URLs
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|0\.0\.0\.0)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Router registration
# ---------------------------------------------------------------------------

app.include_router(health.router, tags=["Health"])
app.include_router(dashboard.router, tags=["Dashboard"])
app.include_router(doctor.router, prefix="/doctor", tags=["Doctor"])
app.include_router(patient.router, prefix="/patient", tags=["Patient"])
