"""
routes/health.py
----------------
GET /health – lightweight liveness probe for the service.
Returns model load status and GPU availability.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.schemas import HealthResponse
from app.services.ai_service import MedGemmaService, get_service

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Service health check",
    description="Returns the current status of the API and AI model.",
)
async def health_check(
    service: MedGemmaService = Depends(get_service),
) -> HealthResponse:
    """
    Liveness endpoint.

    Checks:
      - Whether the service is running (always true if this handler executes)
      - Whether MedGemma model weights are loaded into memory
      - Whether a CUDA GPU is detected
    """
    gpu = service.gpu_available
    loaded = service.model_loaded

    if loaded and gpu:
        message = "Service operational. MedGemma loaded on GPU."
    elif loaded and not gpu:
        message = "Service operational. MedGemma loaded on CPU (slower inference)."
    else:
        message = (
            "Service operational in MOCK mode. "
            "MedGemma is not loaded – responses are simulated."
        )

    return HealthResponse(
        status="ok",
        model_loaded=loaded,
        gpu_available=gpu,
        message=message,
    )
