"""
schemas/models.py
-----------------
All Pydantic models used across the API.
Strict typing ensures clean, validated I/O contracts.
"""

from __future__ import annotations

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Shared / Enum types
# ---------------------------------------------------------------------------

class UrgencyLevel(str, Enum):
    """Urgency levels for ranked findings."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


# ---------------------------------------------------------------------------
# Doctor-side schemas
# ---------------------------------------------------------------------------

class KeyFinding(BaseModel):
    """A single clinical finding extracted from the uploaded records."""

    finding: str = Field(..., description="Short description of the finding")
    detail: str = Field(..., description="Additional context or supporting evidence")
    urgency: UrgencyLevel = Field(..., description="Urgency level: high / medium / low")
    source: str = Field(..., description="Which input produced this finding")


class ScanInsight(BaseModel):
    """Observations extracted from an uploaded scan image (if provided)."""

    observation: str = Field(..., description="What is observed in the scan")
    region: Optional[str] = Field(None, description="Anatomical region if identifiable")
    note: str = Field(..., description="Clinical note – always non-diagnostic")


class DoctorAnalysisResponse(BaseModel):
    """
    Structured response returned to the doctor after AI analysis.
    Always includes the standard medical disclaimer.
    """

    patient_summary: str = Field(
        ..., description="High-level summary of the patient's condition based on records"
    )
    key_findings: List[KeyFinding] = Field(
        default_factory=list,
        description="List of findings ranked from highest to lowest urgency",
    )
    scan_insights: List[ScanInsight] = Field(
        default_factory=list,
        description="Observations from scan images (empty if no image uploaded)",
    )
    urgency_ranking: List[str] = Field(
        default_factory=list,
        description=(
            "Ordered list of finding summaries: highest urgency first. "
            "Mirrors key_findings sorted by urgency for quick reference."
        ),
    )
    disclaimer: str = Field(
        default="This is an assistive tool and not a medical diagnosis.",
        description="Mandatory disclaimer – always present in the response",
    )


# ---------------------------------------------------------------------------
# Patient-side schemas
# ---------------------------------------------------------------------------

class PatientExplainResponse(BaseModel):
    """
    Plain-language explanation of a medical document for the patient.
    Must NOT include any diagnosis or prescriptive medical advice.
    """

    simplified_explanation: str = Field(
        ...,
        description=(
            "Easy-to-understand summary of the document content. "
            "No diagnosis, no medical decisions."
        ),
    )
    disclaimer: str = Field(
        default="This is an assistive tool and not a medical diagnosis.",
        description="Mandatory disclaimer – always present in the response",
    )


# ---------------------------------------------------------------------------
# Health-check schema
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    """Service status response."""

    status: str = Field(..., description="'ok' when the service is running normally")
    model_loaded: bool = Field(
        ..., description="Whether the AI model is fully loaded into memory"
    )
    gpu_available: bool = Field(
        ..., description="Whether a CUDA GPU is available for inference"
    )
    message: str = Field(..., description="Human-readable status message")
