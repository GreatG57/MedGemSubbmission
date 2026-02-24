"""
services/ai_service.py
----------------------
Handles all AI inference via Google MedGemma (HuggingFace Transformers).

Architecture:
  - `MedGemmaService` is a singleton loaded once at startup.
  - On GPU-capable machines the real model runs inference.
  - On CPU-only machines (hackathon laptop, CI, etc.) a mock response is
    returned so the rest of the API stack can be tested end-to-end.
  - All prompts include explicit instructions that the AI is an assistant,
    not a decision-maker, and must flag uncertainty.
"""

from __future__ import annotations

import json
import logging
import os
import re
from typing import Any, Dict, List, Optional
from urllib import error, request

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Model identifiers
# ---------------------------------------------------------------------------

# MedGemma 4B is the recommended variant for most hardware profiles.
# Switch to "google/medgemma-27b-it" for more power if A100/H100 is available.
MEDGEMMA_MODEL_ID = os.getenv("MEDGEMMA_MODEL_ID", "google/medgemma-4b-it")

# Set env var FORCE_MOCK=1 to bypass the real model even on GPU (useful for
# rapid UI/integration testing without model weights).
FORCE_MOCK = os.getenv("FORCE_MOCK", "0").strip() == "1"

# Optional legacy AI_Backend integration (GPU-first MedGemma 1.5 service).
AI_BACKEND_ENABLED = os.getenv("AI_BACKEND_ENABLED", "1").strip() == "1"
AI_BACKEND_URL = os.getenv("AI_BACKEND_URL", "http://127.0.0.1:8085").rstrip("/")
AI_BACKEND_TIMEOUT_SECONDS = float(os.getenv("AI_BACKEND_TIMEOUT_SECONDS", "25"))


# ---------------------------------------------------------------------------
# Prompt templates
# ---------------------------------------------------------------------------

DOCTOR_SYSTEM_PROMPT = """You are MedAssist, a clinical documentation assistant.
Your role is to help doctors quickly understand uploaded patient records.
Rules you MUST follow:
1. You are NOT a diagnostician. Do not make definitive diagnoses.
2. If you are uncertain about anything, state that uncertainty explicitly.
3. Do not suggest prescriptions or specific treatment plans.
4. Rank findings by urgency: HIGH (needs immediate attention), MEDIUM (needs
   follow-up), LOW (routine / informational).
5. Always return a valid JSON object matching the schema below – no extra prose.

Required JSON schema:
{
  "patient_summary": "<2-4 sentence overview>",
  "key_findings": [
    {
      "finding": "<short finding title>",
      "detail": "<supporting evidence from records>",
      "urgency": "high|medium|low",
      "source": "<patient_history|prescription|lab_report|scan>"
    }
  ],
  "scan_insights": [
    {
      "observation": "<what is visible>",
      "region": "<anatomical region or null>",
      "note": "<non-diagnostic clinical note>"
    }
  ],
  "urgency_ranking": ["<highest urgency finding title>", "...", "<lowest>"]
}"""


PATIENT_SYSTEM_PROMPT = """You are MedExplain, a medical document simplifier.
Your role is to help patients understand their own medical records in plain,
friendly language they can follow without any medical background.
Rules you MUST follow:
1. Do NOT suggest a diagnosis.
2. Do NOT recommend or advise on medications or treatments.
3. Do NOT make any definitive medical statements – you are explaining, not deciding.
4. Use simple, short sentences. Avoid jargon. If a medical term is unavoidable,
   define it in parentheses.
5. Return ONLY a JSON object with a single key "simplified_explanation".

Required JSON schema:
{
  "simplified_explanation": "<plain language explanation>"
}"""


# ---------------------------------------------------------------------------
# Singleton AI service
# ---------------------------------------------------------------------------

class MedGemmaService:
    """
    Wraps the MedGemma model pipeline.
    Loaded once via `get_service()` and shared across all requests.
    """

    def __init__(self) -> None:
        self._pipeline: Any = None
        self._processor: Any = None
        self._model: Any = None
        self._device: str = "cpu"
        self._model_loaded: bool = False
        self._gpu_available: bool = False

    # ------------------------------------------------------------------
    # Initialisation
    # ------------------------------------------------------------------

    def load(self) -> None:
        """
        Attempt to load the real MedGemma model.
        Falls back gracefully if torch / transformers are unavailable or
        if GPU VRAM is insufficient.
        """
        if FORCE_MOCK:
            logger.info("FORCE_MOCK=1 – skipping real model load.")
            return

        try:
            import torch  # type: ignore
            from transformers import AutoProcessor, AutoModelForImageTextToText, pipeline  # type: ignore

            self._gpu_available = torch.cuda.is_available()
            self._device = "cuda" if self._gpu_available else "cpu"

            logger.info(
                "Loading MedGemma: model=%s  device=%s",
                MEDGEMMA_MODEL_ID,
                self._device,
            )

            # For multimodal MedGemma (supports text + images)
            self._processor = AutoProcessor.from_pretrained(
                MEDGEMMA_MODEL_ID,
                trust_remote_code=True,
            )
            self._model = AutoModelForImageTextToText.from_pretrained(
                MEDGEMMA_MODEL_ID,
                torch_dtype=torch.bfloat16 if self._gpu_available else torch.float32,
                device_map="auto" if self._gpu_available else None,
                trust_remote_code=True,
            )

            if not self._gpu_available:
                self._model = self._model.to(self._device)

            self._model_loaded = True
            logger.info("MedGemma loaded successfully.")

        except ImportError as exc:
            logger.warning("Transformers/torch not installed: %s – using mock.", exc)
        except Exception as exc:
            logger.warning("MedGemma load failed: %s – using mock.", exc)

    # ------------------------------------------------------------------
    # Core inference (real model path)
    # ------------------------------------------------------------------

    def _run_inference(
        self,
        system_prompt: str,
        user_message: str,
        image: Optional[Any] = None,
        max_new_tokens: int = 1024,
    ) -> str:
        """
        Run a single inference pass with MedGemma.

        Args:
            system_prompt: Instruction prompt that shapes model behaviour.
            user_message:  Clinical text content to analyse.
            image:         Optional PIL.Image for multimodal analysis.
            max_new_tokens: Maximum number of tokens the model may generate.

        Returns:
            Raw model output string (expected to be valid JSON).
        """
        import torch  # type: ignore

        # Build the conversation list in HuggingFace chat format
        messages: List[Dict[str, Any]] = [
            {"role": "system", "content": system_prompt},
        ]

        if image is not None:
            # Multimodal turn: text + image
            messages.append({
                "role": "user",
                "content": [
                    {"type": "image", "image": image},
                    {"type": "text", "text": user_message},
                ],
            })
        else:
            # Text-only turn
            messages.append({
                "role": "user",
                "content": user_message,
            })

        # Tokenise using the processor's chat template
        inputs = self._processor.apply_chat_template(
            messages,
            add_generation_prompt=True,
            tokenize=True,
            return_tensors="pt",
            return_dict=True,
        ).to(self._device)

        input_len = inputs["input_ids"].shape[-1]

        with torch.inference_mode():
            output_ids = self._model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                do_sample=False,      # Deterministic – important for clinical tools
            )

        # Decode only the newly generated tokens (skip input)
        new_tokens = output_ids[0][input_len:]
        raw_output: str = self._processor.decode(new_tokens, skip_special_tokens=True)
        return raw_output.strip()

    # ------------------------------------------------------------------
    # Mock responses (CPU / no model)
    # ------------------------------------------------------------------

    def _mock_doctor_response(self) -> Dict[str, Any]:
        """
        Structured mock response used when MedGemma is unavailable.
        Mirrors the exact shape of a real model response.
        """
        return {
            "patient_summary": (
                "[MOCK] This is a simulated summary. MedGemma is not loaded "
                "(running in mock mode). The patient's uploaded records have "
                "been received and would normally be processed by the AI model."
            ),
            "key_findings": [
                {
                    "finding": "[MOCK] Elevated Creatinine",
                    "detail": "Lab report indicates possible renal stress markers.",
                    "urgency": "high",
                    "source": "lab_report",
                },
                {
                    "finding": "[MOCK] Hypertension History",
                    "detail": "Patient history notes long-standing hypertension.",
                    "urgency": "medium",
                    "source": "patient_history",
                },
                {
                    "finding": "[MOCK] Routine Follow-up Due",
                    "detail": "Annual cardiology review overdue by 3 months.",
                    "urgency": "low",
                    "source": "prescription",
                },
            ],
            "scan_insights": [
                {
                    "observation": "[MOCK] Scan received and processed.",
                    "region": "Unknown (mock mode)",
                    "note": "Real scan analysis requires GPU and loaded MedGemma model.",
                }
            ],
            "urgency_ranking": [
                "[MOCK] Elevated Creatinine",
                "[MOCK] Hypertension History",
                "[MOCK] Routine Follow-up Due",
            ],
        }

    def _mock_patient_response(self) -> Dict[str, Any]:
        """Mock simplified explanation for patient-side requests."""
        return {
            "simplified_explanation": (
                "[MOCK] This is a simulated explanation. When the AI model is "
                "fully loaded, it would turn your medical document into plain "
                "language that is easy to understand. Please note: this tool "
                "does not provide any medical diagnosis or advice."
            )
        }

    def _normalize_legacy_doctor_payload(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Map AI_Backend schema to this service's doctor response schema."""
        legacy_data = payload.get("data") if isinstance(payload, dict) else {}
        if not isinstance(legacy_data, dict):
            legacy_data = {}

        urgency_map = {"critical": "high", "high": "high", "medium": "medium", "low": "low"}
        findings: List[Dict[str, Any]] = []
        for finding in legacy_data.get("abnormalities", []):
            if not isinstance(finding, dict):
                continue
            severity = str(finding.get("severity", "low")).lower()
            findings.append({
                "finding": finding.get("issue", "Unknown finding"),
                "detail": finding.get("explanation", "Derived from AI_Backend analysis."),
                "urgency": urgency_map.get(severity, "low"),
                "source": "legacy_ai_backend",
            })

        rank_order = {"high": 0, "medium": 1, "low": 2}
        findings.sort(key=lambda item: rank_order.get(item.get("urgency", "low"), 99))

        patient_summary = legacy_data.get("summary")
        if not patient_summary:
            patient_summary = payload.get("response") or self._mock_doctor_response()["patient_summary"]

        return {
            "patient_summary": patient_summary,
            "key_findings": findings,
            "scan_insights": [],
            "urgency_ranking": [item["finding"] for item in findings],
        }

    def _normalize_legacy_patient_payload(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Map AI_Backend schema to patient explanation schema."""
        legacy_data = payload.get("data") if isinstance(payload, dict) else {}
        if not isinstance(legacy_data, dict):
            legacy_data = {}

        summary = str(legacy_data.get("summary") or "").strip()
        recommendations = [str(item).strip() for item in legacy_data.get("recommendations", []) if isinstance(item, str)]

        pieces: List[str] = []
        if summary:
            pieces.append(summary)
        if recommendations:
            pieces.append("Key next steps mentioned in your report: " + "; ".join(recommendations))

        if not pieces:
            return self._mock_patient_response()

        return {"simplified_explanation": "\n\n".join(pieces)}

    def _call_legacy_ai_backend(self, text: str, mode: str) -> Optional[Dict[str, Any]]:
        """Call the legacy AI_Backend FastAPI service if enabled and reachable."""
        if not AI_BACKEND_ENABLED:
            return None

        endpoint = f"{AI_BACKEND_URL}/analyze"
        payload = json.dumps({"text": text, "mode": mode}).encode("utf-8")
        req = request.Request(endpoint, data=payload, headers={"Content-Type": "application/json"}, method="POST")

        try:
            with request.urlopen(req, timeout=AI_BACKEND_TIMEOUT_SECONDS) as response:
                body = response.read().decode("utf-8")
            parsed = json.loads(body)
            if isinstance(parsed, dict):
                return parsed
            logger.warning("Legacy AI_Backend returned a non-dict payload.")
            return None
        except (error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            logger.info("Legacy AI_Backend unavailable (%s). Falling back to local service.", exc)
            return None

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def analyze_for_doctor(
        self,
        patient_history: str,
        prescriptions: str,
        lab_reports: str,
        scan_image: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """
        Produce a structured clinical summary for the doctor endpoint.

        Combines all uploaded inputs into a single prompt and calls MedGemma
        (or returns a mock when the model is not loaded).

        Args:
            patient_history: Cleaned patient history text.
            prescriptions:   Cleaned prescription text or PDF extract.
            lab_reports:     Cleaned lab report text or PDF extract.
            scan_image:      Optional preprocessed PIL.Image.

        Returns:
            Dict matching the DoctorAnalysisResponse schema fields.
        """
        combined_text = "\n\n".join(
            section
            for section in [
                f"Patient History:\n{patient_history}" if patient_history else "",
                f"Prescriptions:\n{prescriptions}" if prescriptions else "",
                f"Lab Reports:\n{lab_reports}" if lab_reports else "",
            ]
            if section
        )

        legacy_payload = self._call_legacy_ai_backend(combined_text, mode="doctor")
        if legacy_payload is not None:
            legacy_result = self._normalize_legacy_doctor_payload(legacy_payload)
            if scan_image is None:
                legacy_result["scan_insights"] = []
            return legacy_result

        if not self._model_loaded or FORCE_MOCK:
            logger.info("Using mock doctor response (model_loaded=%s)", self._model_loaded)
            result = self._mock_doctor_response()
            # Strip scan_insights if no image was supplied
            if scan_image is None:
                result["scan_insights"] = []
            return result

        # Build the clinical context block sent to the model
        context_parts: List[str] = []
        if patient_history:
            context_parts.append(f"## Patient History\n{patient_history}")
        if prescriptions:
            context_parts.append(f"## Current / Past Prescriptions\n{prescriptions}")
        if lab_reports:
            context_parts.append(f"## Lab Reports\n{lab_reports}")
        if scan_image is not None:
            context_parts.append("## Scan Image\n[Image attached – please analyse]")

        user_message = "\n\n".join(context_parts)

        raw = self._run_inference(
            system_prompt=DOCTOR_SYSTEM_PROMPT,
            user_message=user_message,
            image=scan_image,
        )

        return self._parse_json_response(raw, fallback=self._mock_doctor_response())

    async def explain_for_patient(self, report_text: str) -> Dict[str, Any]:
        """
        Produce a plain-language explanation for the patient endpoint.

        Args:
            report_text: Cleaned text from the uploaded medical report.

        Returns:
            Dict matching the PatientExplainResponse schema fields.
        """
        legacy_payload = self._call_legacy_ai_backend(report_text, mode="patient")
        if legacy_payload is not None:
            return self._normalize_legacy_patient_payload(legacy_payload)

        if not self._model_loaded or FORCE_MOCK:
            logger.info("Using mock patient response (model_loaded=%s)", self._model_loaded)
            return self._mock_patient_response()

        user_message = f"Please explain the following medical document:\n\n{report_text}"

        raw = self._run_inference(
            system_prompt=PATIENT_SYSTEM_PROMPT,
            user_message=user_message,
        )

        return self._parse_json_response(raw, fallback=self._mock_patient_response())

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _parse_json_response(raw: str, fallback: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract and parse a JSON object from the model's raw output.

        The model sometimes wraps the JSON in markdown code fences or adds
        preamble text.  We strip all of that before parsing.

        Args:
            raw:      Raw string output from the model.
            fallback: Dict to return if parsing fails.

        Returns:
            Parsed dict, or the fallback dict if parsing fails.
        """
        # Strip markdown code fences if present
        cleaned = re.sub(r"```(?:json)?", "", raw, flags=re.IGNORECASE).strip()

        # Find the first '{' … last '}' pair (handles leading prose)
        start = cleaned.find("{")
        end = cleaned.rfind("}") + 1
        if start == -1 or end == 0:
            logger.warning("No JSON object found in model output – using fallback.")
            return fallback

        json_str = cleaned[start:end]

        try:
            return json.loads(json_str)
        except json.JSONDecodeError as exc:
            logger.warning("JSON parse error: %s – using fallback.", exc)
            return fallback

    # ------------------------------------------------------------------
    # Status accessors (used by the health endpoint)
    # ------------------------------------------------------------------

    @property
    def model_loaded(self) -> bool:
        return self._model_loaded

    @property
    def gpu_available(self) -> bool:
        return self._gpu_available


# ---------------------------------------------------------------------------
# Singleton accessor
# ---------------------------------------------------------------------------

_service_instance: Optional[MedGemmaService] = None


def get_service() -> MedGemmaService:
    """
    Return the shared MedGemmaService singleton.
    Instantiated lazily on first call; the model is loaded at app startup
    via the lifespan handler in main.py (see startup hook registration below).
    """
    global _service_instance
    if _service_instance is None:
        _service_instance = MedGemmaService()
    return _service_instance
