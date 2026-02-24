"""
routes/patient.py
-----------------
Patient-facing API route.

POST /patient/explain
  Accepts a medical report (plain text or PDF) and returns a
  plain-language explanation that a non-medical person can understand.
  The AI is strictly prohibited from providing diagnoses or medical advice.
"""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.schemas import PatientExplainResponse
from app.services.ai_service import MedGemmaService, get_service
from app.services.preprocessing import clean_text, extract_text_from_pdf

logger = logging.getLogger(__name__)

router = APIRouter()

MAX_UPLOAD_BYTES = 20 * 1024 * 1024  # 20 MB


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.post(
    "/explain",
    response_model=PatientExplainResponse,
    summary="Get a plain-language explanation of a medical report",
    description=(
        "Upload a medical document (PDF or plain text) and receive a "
        "simplified explanation written in everyday language.\n\n"
        "**Note:** This endpoint never provides diagnoses or medical advice. "
        "Always consult your doctor for medical decisions."
    ),
    status_code=status.HTTP_200_OK,
)
async def explain_report(
    # ----- Plain text form field -----
    report_text: Optional[str] = Form(
        None,
        description="Medical report as plain text. Use report_file for PDFs.",
    ),
    # ----- File upload -----
    report_file: Optional[UploadFile] = File(
        None,
        description="Medical report as a PDF or .txt file.",
    ),
    # ----- Dependency injection -----
    service: MedGemmaService = Depends(get_service),
) -> PatientExplainResponse:
    """
    Patient-side explanation endpoint.

    Workflow:
      1. Accept report as raw text OR uploaded file (PDF / .txt).
      2. Extract and clean text.
      3. Call AI service with patient-safe prompt constraints.
      4. Return a simplified plain-language explanation.
    """

    # ------------------------------------------------------------------
    # 1. Resolve the report text from whichever source was provided
    # ------------------------------------------------------------------
    resolved_text = ""

    if report_file is not None:
        content_type = report_file.content_type or ""
        raw_bytes = await report_file.read()

        if len(raw_bytes) > MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Report file exceeds the 20 MB limit.",
            )

        if "pdf" in content_type.lower() or (report_file.filename or "").endswith(".pdf"):
            logger.info("Extracting text from patient PDF: %s", report_file.filename)
            extracted = extract_text_from_pdf(raw_bytes)
            if not extracted:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=(
                        "Could not extract text from the uploaded PDF. "
                        "Please ensure the file is a readable, non-scanned PDF, "
                        "or paste the text directly."
                    ),
                )
            resolved_text = clean_text(extracted)
        else:
            # Plain text file
            try:
                resolved_text = clean_text(raw_bytes.decode("utf-8", errors="replace"))
            except Exception as exc:
                logger.error("Failed to decode text file: %s", exc)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Could not decode the uploaded text file.",
                ) from exc

    elif report_text:
        resolved_text = clean_text(report_text)

    # ------------------------------------------------------------------
    # 2. Validate we actually have something to work with
    # ------------------------------------------------------------------
    if not resolved_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "No report content provided. Supply report_text (form field) "
                "or upload a report_file (PDF or .txt)."
            ),
        )

    # Truncate extremely long documents to avoid exceeding model context window
    MAX_CHARS = 12_000  # ~3000 tokens – safe limit for MedGemma 4B
    if len(resolved_text) > MAX_CHARS:
        logger.warning(
            "Report text truncated from %d to %d characters for model safety.",
            len(resolved_text),
            MAX_CHARS,
        )
        resolved_text = resolved_text[:MAX_CHARS] + "\n[...document truncated for processing]"

    # ------------------------------------------------------------------
    # 3. AI inference
    # ------------------------------------------------------------------
    logger.info("Dispatching patient explain request to AI service.")
    raw_result = await service.explain_for_patient(report_text=resolved_text)

    # ------------------------------------------------------------------
    # 4. Build and return validated response
    # ------------------------------------------------------------------
    simplified = raw_result.get(
        "simplified_explanation",
        (
            "We were unable to generate an explanation for this document. "
            "Please try again or contact your healthcare provider."
        ),
    )

    return PatientExplainResponse(
        simplified_explanation=simplified,
        disclaimer="This is an assistive tool and not a medical diagnosis.",
    )
