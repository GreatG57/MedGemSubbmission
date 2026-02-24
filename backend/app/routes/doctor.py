"""
routes/doctor.py
----------------
Doctor-facing API route.

POST /doctor/analyze
  Accepts uploaded patient records (text, PDF, optional scan image),
  preprocesses them, calls the AI service, and returns a structured
  clinical summary with urgency-ranked findings.
"""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.schemas import DoctorAnalysisResponse, KeyFinding, ScanInsight, UrgencyLevel
from app.services.ai_service import MedGemmaService, get_service
from app.services.dashboard_store import append_records, save_analysis
from app.services.preprocessing import clean_text, extract_text_from_pdf, preprocess_image

logger = logging.getLogger(__name__)

router = APIRouter()

# Maximum upload size: 20 MB per file (enforce at app / nginx level too)
MAX_UPLOAD_BYTES = 20 * 1024 * 1024


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _read_text_or_pdf(
    text_field: Optional[str],
    file_upload: Optional[UploadFile],
    field_name: str,
) -> str:
    """
    Resolve a data field that can come as either a form text string or a
    PDF/text file upload.

    Priority: file upload > form text field > empty string.

    Args:
        text_field:   Raw text value from form data (may be None / empty).
        file_upload:  Uploaded file (PDF or plain text; may be None).
        field_name:   Human-readable name for log messages.

    Returns:
        Cleaned plain-text string suitable for AI inference.
    """
    if file_upload is not None:
        content_type = file_upload.content_type or ""
        raw_bytes = await file_upload.read()

        if len(raw_bytes) > MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"{field_name} file exceeds the 20 MB limit.",
            )

        if "pdf" in content_type.lower() or file_upload.filename.endswith(".pdf"):
            logger.info("Extracting text from PDF: %s", file_upload.filename)
            extracted = extract_text_from_pdf(raw_bytes)
            if not extracted:
                logger.warning("PDF extraction produced no text for %s", field_name)
            return clean_text(extracted)

        # Plain text file
        try:
            return clean_text(raw_bytes.decode("utf-8", errors="replace"))
        except Exception as exc:
            logger.error("Failed to decode text file %s: %s", field_name, exc)
            return ""

    if text_field:
        return clean_text(text_field)

    return ""


def _sort_findings_by_urgency(findings: list[KeyFinding]) -> list[KeyFinding]:
    """
    Sort findings so that HIGH urgency comes first, then MEDIUM, then LOW.
    """
    urgency_order = {UrgencyLevel.HIGH: 0, UrgencyLevel.MEDIUM: 1, UrgencyLevel.LOW: 2}
    return sorted(findings, key=lambda f: urgency_order.get(f.urgency, 99))


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.post(
    "/analyze",
    response_model=DoctorAnalysisResponse,
    summary="Analyse patient records and return structured AI summary",
    description=(
        "Upload any combination of patient history, prescriptions, lab reports "
        "(text or PDF), and an optional scan image. Returns a structured JSON "
        "summary with key findings ranked by urgency.\n\n"
        "**This endpoint is for authorised healthcare professionals only.**"
    ),
    status_code=status.HTTP_200_OK,
)
async def analyze_patient_records(
    # ----- Plain text form fields (alternative to file uploads) -----
    patient_history_text: Optional[str] = Form(
        None,
        description="Patient history as plain text. Use patient_history_file for PDFs.",
    ),
    prescriptions_text: Optional[str] = Form(
        None,
        description="Prescription text. Use prescriptions_file for PDFs.",
    ),
    lab_reports_text: Optional[str] = Form(
        None,
        description="Lab report text. Use lab_reports_file for PDFs.",
    ),
    patient_id: Optional[str] = Form(
        None,
        description="Optional patient id to attach analysis to dashboard state.",
    ),
    # ----- File uploads -----
    patient_history_file: Optional[UploadFile] = File(
        None, description="Patient history as a PDF or .txt file."
    ),
    prescriptions_file: Optional[UploadFile] = File(
        None, description="Prescriptions as a PDF or .txt file."
    ),
    lab_reports_file: Optional[UploadFile] = File(
        None, description="Lab reports as a PDF or .txt file."
    ),
    scan_image: Optional[UploadFile] = File(
        None, description="Optional scan image (JPEG / PNG / DICOM-as-PNG)."
    ),
    # ----- Dependency injection -----
    service: MedGemmaService = Depends(get_service),
) -> DoctorAnalysisResponse:
    """
    Main doctor-side analysis endpoint.

    Workflow:
      1. Validate that at least one data source has been provided.
      2. Preprocess each input (PDF extraction, text cleaning, image resize).
      3. Forward preprocessed data to the AI service.
      4. Parse and validate the AI response into Pydantic models.
      5. Sort findings by urgency and build the urgency_ranking list.
      6. Return the structured response.
    """

    # ------------------------------------------------------------------
    # 1. Preprocess text / PDF inputs
    # ------------------------------------------------------------------
    patient_history = await _read_text_or_pdf(
        patient_history_text, patient_history_file, "patient_history"
    )
    prescriptions = await _read_text_or_pdf(
        prescriptions_text, prescriptions_file, "prescriptions"
    )
    lab_reports = await _read_text_or_pdf(
        lab_reports_text, lab_reports_file, "lab_reports"
    )

    # Require at least one source of clinical text
    if not any([patient_history, prescriptions, lab_reports]):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "No clinical data provided. Supply at least one of: "
                "patient_history, prescriptions, or lab_reports."
            ),
        )

    # ------------------------------------------------------------------
    # 2. Preprocess scan image (optional)
    # ------------------------------------------------------------------
    processed_image = None
    if scan_image is not None:
        logger.info("Processing scan image: %s", scan_image.filename)
        image_bytes = await scan_image.read()

        if len(image_bytes) > MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Scan image exceeds the 20 MB limit.",
            )

        processed_image = preprocess_image(image_bytes, filename=scan_image.filename)
        if processed_image is None:
            logger.warning(
                "Could not decode scan image %s – proceeding without it.",
                scan_image.filename,
            )

    # ------------------------------------------------------------------
    # 3. AI inference
    # ------------------------------------------------------------------
    logger.info("Dispatching doctor analysis to AI service.")
    raw_result = await service.analyze_for_doctor(
        patient_history=patient_history,
        prescriptions=prescriptions,
        lab_reports=lab_reports,
        scan_image=processed_image,
    )

    # ------------------------------------------------------------------
    # 4. Parse AI output into typed Pydantic models
    # ------------------------------------------------------------------
    try:
        key_findings = [
            KeyFinding(
                finding=f.get("finding", "Unknown finding"),
                detail=f.get("detail", ""),
                urgency=UrgencyLevel(f.get("urgency", "low")),
                source=f.get("source", "unknown"),
            )
            for f in raw_result.get("key_findings", [])
        ]
    except Exception as exc:
        logger.error("Failed to parse key_findings from AI output: %s", exc)
        key_findings = []

    try:
        scan_insights = [
            ScanInsight(
                observation=s.get("observation", ""),
                region=s.get("region"),
                note=s.get("note", ""),
            )
            for s in raw_result.get("scan_insights", [])
        ]
    except Exception as exc:
        logger.error("Failed to parse scan_insights from AI output: %s", exc)
        scan_insights = []

    # ------------------------------------------------------------------
    # 5. Sort by urgency and build urgency_ranking list
    # ------------------------------------------------------------------
    sorted_findings = _sort_findings_by_urgency(key_findings)
    urgency_ranking = [f.finding for f in sorted_findings]

    # ------------------------------------------------------------------
    # 6. Build and return the final response
    # ------------------------------------------------------------------
    response = DoctorAnalysisResponse(
        patient_summary=raw_result.get(
            "patient_summary",
            "Summary could not be generated. Please review inputs.",
        ),
        key_findings=sorted_findings,
        scan_insights=scan_insights,
        urgency_ranking=urgency_ranking,
        disclaimer="This is an assistive tool and not a medical diagnosis.",
    )

    if patient_id:
        save_analysis(patient_id, response.model_dump())
        append_records(
            patient_id,
            patient_history=patient_history,
            prescriptions=prescriptions,
            lab_reports=lab_reports,
            has_scan_image=scan_image is not None,
            scan_filename=scan_image.filename if scan_image is not None else None,
        )

    return response
