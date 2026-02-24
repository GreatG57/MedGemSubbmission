"""
services/preprocessing.py
--------------------------
Handles all input preprocessing before content is sent to the AI model:
  - Text passthrough / cleaning
  - PDF text extraction (pdfplumber preferred; PyMuPDF as fallback)
  - Image decoding and resizing (Pillow / OpenCV)

None of these functions perform any medical reasoning – they purely convert
raw uploaded bytes into clean strings or processed images for the AI layer.
"""

from __future__ import annotations

import io
import logging
from typing import Optional

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Text preprocessing
# ---------------------------------------------------------------------------

def clean_text(raw: str) -> str:
    """
    Normalise whitespace and strip control characters from a plain-text input.
    Keeps the content intact – no medical interpretation.
    """
    lines = raw.splitlines()
    cleaned_lines = [line.strip() for line in lines if line.strip()]
    return "\n".join(cleaned_lines)


# ---------------------------------------------------------------------------
# PDF text extraction
# ---------------------------------------------------------------------------

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extract all text from a PDF document.

    Strategy:
      1. Try pdfplumber (pure-Python, good layout preservation)
      2. Fall back to PyMuPDF (fitz) if pdfplumber is unavailable
      3. Return an empty string on failure so the caller can decide how to proceed

    Args:
        pdf_bytes: Raw bytes of the uploaded PDF file.

    Returns:
        Extracted text as a single string, pages separated by double newlines.
    """
    # --- Attempt 1: pdfplumber ---
    try:
        import pdfplumber  # type: ignore

        text_pages: list[str] = []
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page_num, page in enumerate(pdf.pages, start=1):
                page_text = page.extract_text() or ""
                if page_text.strip():
                    text_pages.append(f"[Page {page_num}]\n{page_text.strip()}")

        if text_pages:
            logger.info("PDF extracted via pdfplumber (%d pages)", len(text_pages))
            return "\n\n".join(text_pages)

    except ImportError:
        logger.warning("pdfplumber not installed – trying PyMuPDF")
    except Exception as exc:  # pragma: no cover
        logger.warning("pdfplumber failed: %s – trying PyMuPDF", exc)

    # --- Attempt 2: PyMuPDF (fitz) ---
    try:
        import fitz  # type: ignore  # PyMuPDF

        text_pages = []
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        for page_num, page in enumerate(doc, start=1):
            page_text = page.get_text("text").strip()
            if page_text:
                text_pages.append(f"[Page {page_num}]\n{page_text}")
        doc.close()

        logger.info("PDF extracted via PyMuPDF (%d pages)", len(text_pages))
        return "\n\n".join(text_pages)

    except ImportError:
        logger.error("Neither pdfplumber nor PyMuPDF is installed.")
    except Exception as exc:  # pragma: no cover
        logger.error("PyMuPDF failed: %s", exc)

    return ""  # Both extractors failed – upstream should handle the empty string


# ---------------------------------------------------------------------------
# Image preprocessing
# ---------------------------------------------------------------------------

def preprocess_image(image_bytes: bytes, filename: str | None = None) -> Optional[object]:
    """
    Decode and resize an uploaded scan image for AI inference.

    Supports standard image files (PNG/JPEG) and DICOM (`.dcm`) x-ray exports
    when pydicom is installed.

    Steps:
      1. Decode bytes to a PIL Image
      2. Convert to RGB (handles RGBA / grayscale / palette modes)
      3. Resize to 512×512 while preserving aspect ratio (LANCZOS)
      4. Return the PIL Image object (MedGemma accepts PIL images directly)

    Args:
        image_bytes: Raw bytes of the uploaded image file.

    Returns:
        A PIL.Image.Image ready for model input, or None if decoding fails.
    """
    try:
        from PIL import Image  # type: ignore

        img = None
        if filename and filename.lower().endswith(".dcm"):
            try:
                import numpy as np  # type: ignore
                import pydicom  # type: ignore

                ds = pydicom.dcmread(io.BytesIO(image_bytes))
                pixel_array = ds.pixel_array.astype("float32")
                pixel_min = float(pixel_array.min())
                pixel_max = float(pixel_array.max())
                if pixel_max > pixel_min:
                    pixel_array = (pixel_array - pixel_min) / (pixel_max - pixel_min)
                pixel_array = (pixel_array * 255).clip(0, 255).astype("uint8")
                img = Image.fromarray(pixel_array)
            except ImportError:
                logger.warning("pydicom/numpy not installed – DICOM scan cannot be processed.")
                return None

        if img is None:
            img = Image.open(io.BytesIO(image_bytes))

        # Convert to RGB so the model always receives a 3-channel image
        if img.mode != "RGB":
            img = img.convert("RGB")

        # Resize – maintain aspect ratio within a 512×512 bounding box
        img.thumbnail((512, 512), Image.LANCZOS)

        logger.info(
            "Image preprocessed successfully: mode=RGB, size=%s", img.size
        )
        return img

    except ImportError:
        logger.error("Pillow is not installed – cannot process images.")
        return None
    except Exception as exc:  # pragma: no cover
        logger.error("Image preprocessing failed: %s", exc)
        return None


def image_to_base64(image_bytes: bytes) -> Optional[str]:
    """
    Convert raw image bytes to a base64-encoded string.
    Some model pipelines prefer base64 strings over PIL objects.

    Args:
        image_bytes: Raw image bytes.

    Returns:
        Base64-encoded string, or None on failure.
    """
    import base64

    try:
        return base64.b64encode(image_bytes).decode("utf-8")
    except Exception as exc:  # pragma: no cover
        logger.error("base64 encoding failed: %s", exc)
        return None
