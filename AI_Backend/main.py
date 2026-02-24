# backend/main.py

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import torch
from transformers import AutoProcessor, AutoModelForImageTextToText, BitsAndBytesConfig
import uvicorn
import io
import fitz  # PyMuPDF
from PIL import Image
import pytesseract
import json
import re
from datetime import datetime

# NEW IMPORTS FOR SQLITE
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# 1. API Configuration
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1.5 Database Setup
print("Initializing SQLite Database...")
SQLALCHEMY_DATABASE_URL = "sqlite:///./hospital_ai.db"

# check_same_thread is set to False because FastAPI can pass connections across threads
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Define the Database Schema
class AnalysisLog(Base):
    __tablename__ = "analysis_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    mode = Column(String)
    extracted_text = Column(Text)
    response_json = Column(Text) # We will store the AI output as a JSON string
    timestamp = Column(DateTime, default=datetime.now)

# Automatically create the file and tables if they don't exist
Base.metadata.create_all(bind=engine)

# Dependency to safely open and close DB connections per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 2. AI Model Initialization
print("Initializing MedGemma in strict 4-bit GPU mode... This may take a moment.")
model_id = "google/medgemma-1.5-4b-it"
MAX_INPUT_TOKENS = 2048


def _is_model_cuda_mapped(loaded_model) -> bool:
    device_map = getattr(loaded_model, "hf_device_map", None)
    if isinstance(device_map, dict) and device_map:
        return any("cuda" in str(device).lower() for device in device_map.values())

    model_device = getattr(loaded_model, "device", None)
    if model_device is not None and "cuda" in str(model_device).lower():
        return True

    try:
        first_param_device = next(loaded_model.parameters()).device
        return "cuda" in str(first_param_device).lower()
    except StopIteration:
        return False


def _load_model_and_processor():
    if not torch.cuda.is_available():
        raise RuntimeError(
            "CUDA GPU not available. MedGemma must run on NVIDIA GPU in 4-bit mode."
        )

    quantization_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_use_double_quant=True,
    )

    loaded_processor = AutoProcessor.from_pretrained(model_id)
    loaded_model = AutoModelForImageTextToText.from_pretrained(
        model_id,
        device_map={"": 0},
        quantization_config=quantization_config,
        low_cpu_mem_usage=True,
    )
    loaded_model.eval()

    if not _is_model_cuda_mapped(loaded_model):
        raise RuntimeError(
            "Model is not mapped to CUDA. Refusing to run because CPU offload causes severe freezing."
        )

    return loaded_processor, loaded_model


try:
    processor, model = _load_model_and_processor()
    print("MedGemma loaded successfully in strict 4-bit GPU mode. System is ready.")
except Exception as e:
    print(f"Error loading model: {e}")
    raise

# 3. Data Structures
class MedicalRequest(BaseModel):
    text: str
    mode: str = "doctor"


def format_analysis_response(data: dict, mode: str) -> str:
    abnormalities = data.get("abnormalities", []) if isinstance(data, dict) else []
    recommendations = data.get("recommendations", []) if isinstance(data, dict) else []
    summary = data.get("summary", "") if isinstance(data, dict) else ""

    findings = "\n".join(
        f"* **{item.get('issue', 'Unknown finding')}** ({item.get('severity', 'unknown')})"
        for item in abnormalities
        if isinstance(item, dict)
    ) or "* No specific abnormalities reported."

    actions = "\n".join(f"* {item}" for item in recommendations if isinstance(item, str))
    if not actions:
        actions = "* No specific recommendations provided."

    note = (
        "\n\n**Please note:** This is a summary for a doctor and should not be used for self-diagnosis or treatment."
        if mode == "doctor"
        else "\n\n**Please note:** This is an educational summary and not a diagnosis."
    )

    return (
        f"**Key findings:**\n{findings}\n\n"
        f"**Recommendation:**\n{actions}\n\n"
        f"**Summary:**\n{summary}"
        f"{note}"
    )


def _extract_json_payload(raw_output: str):
    candidates = re.findall(r'\{.*?\}', raw_output, re.DOTALL)
    for candidate in reversed(candidates):
        try:
            payload = json.loads(candidate)
            if isinstance(payload, dict):
                return payload
        except json.JSONDecodeError:
            continue
    return None


def _build_fallback_payload(source_text: str) -> dict:
    condensed = " ".join(source_text.split())[:450]
    return {
        "summary": condensed if condensed else "Unable to produce a structured summary from the report text.",
        "abnormalities": [],
        "recommendations": [
            "Structured JSON extraction failed; please review the report manually and rerun analysis if needed."
        ],
    }


# 4. Core AI Logic Function
def generate_structured_analysis(text: str, mode: str) -> dict:
    print("\n[AI LOGIC] -> Building JSON template and instructions...")
    json_template = """
    {
      "summary": "Your concise clinical summary here.",
      "abnormalities": [
        {"issue": "Name of finding", "severity": "critical, high, medium, or low"}
      ],
      "recommendations": ["Action item 1", "Action item 2"]
    }
    """

    if mode == "doctor":
        instruction = (
            "You are a medical data extraction API. Analyze the following medical report. "
            "Return ONLY a valid JSON object. No markdown, no prose. "
            f"Use this exact schema:\n{json_template}"
        )
    else:
        instruction = (
            "You are a medical AI assistant. Explain this report in patient-friendly language. "
            "Return ONLY a valid JSON object. No markdown, no prose. "
            f"Use this exact schema:\n{json_template}"
        )

    working_text = text
    for attempt in range(2):
        messages = [
            {"role": "user", "content": f"{instruction}\n\nReport Text:\n{working_text}"}
        ]

        print(f"[AI LOGIC] -> Applying MedGemma chat template (attempt {attempt + 1})...")
        prompt = processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)

        print("[AI LOGIC] -> Tokenizing text and sending to GPU...")
        inputs = processor(
            text=prompt,
            return_tensors="pt",
            truncation=True,
            max_length=MAX_INPUT_TOKENS,
        )
        inputs = {k: v.to("cuda") for k, v in inputs.items()}

        print("[AI LOGIC] -> GPU is generating response...")
        with torch.inference_mode():
            outputs = model.generate(
                **inputs,
                max_new_tokens=1500, 
                do_sample=False,
                use_cache=True,
                pad_token_id=processor.tokenizer.eos_token_id
            )

        print("[AI LOGIC] -> Generation complete. Decoding output...")
        response_text = processor.decode(outputs[0], skip_special_tokens=True)

        if response_text.startswith(prompt):
            raw_output = response_text[len(prompt):].strip()
        else:
            raw_output = response_text.strip()

        payload = _extract_json_payload(raw_output)
        if payload is not None:
            print("[AI LOGIC] -> SUCCESS: Valid JSON generated.")
            return payload

        print("[AI LOGIC] -> WARNING: No valid JSON found in model output.")
        if attempt == 0:
            working_text = text[:2500]

    print("[AI LOGIC] -> ERROR: Returning deterministic fallback JSON payload.")
    return _build_fallback_payload(text)


# 5. Endpoints
@app.post("/analyze")
async def analyze_text(request: MedicalRequest):
    safe_text = request.text[:6000]
    result = generate_structured_analysis(safe_text, request.mode)
    return {
        "response": format_analysis_response(result, request.mode),
        "data": result
    }


@app.post("/analyze-document")
async def analyze_document(
    file: UploadFile = File(...),
    mode: str = Form("doctor"),
    db: Session = Depends(get_db) # INJECTED DATABASE SESSION
):
    print(f"\n==================================================")
    print(f"NEW UPLOAD RECEIVED: {file.filename} | MODE: {mode}")
    print(f"==================================================")

    extracted_text = ""
    file_bytes = await file.read()

    try:
        print("[EXTRACTION] -> Starting file parsing...")
        if file.filename.lower().endswith(".pdf"):
            print("[EXTRACTION] -> PDF detected. Booting PyMuPDF...")
            pdf_document = fitz.open(stream=file_bytes, filetype="pdf")
            for page_num in range(len(pdf_document)):
                page = pdf_document.load_page(page_num)
                extracted_text += page.get_text()
            print(f"[EXTRACTION] -> PDF parsed successfully. Found {len(extracted_text)} characters.")

        elif file.filename.lower().endswith((".png", ".jpg", ".jpeg")):
            print("[EXTRACTION] -> Image detected. Booting OCR...")
            image = Image.open(io.BytesIO(file_bytes))
            extracted_text = pytesseract.image_to_string(image)
            print(f"[EXTRACTION] -> Image parsed successfully. Found {len(extracted_text)} characters.")

        else:
            print("[EXTRACTION] -> ERROR: Unsupported file type.")
            raise HTTPException(status_code=400, detail="Unsupported file type.")

        if not extracted_text.strip():
            print("[EXTRACTION] -> ERROR: File was empty or unreadable.")
            raise HTTPException(status_code=400, detail="Could not extract text.")

        print("[EXTRACTION] -> Truncating text to safe limits for VRAM...")
        safe_text = extracted_text[:6000]

        print("[EXTRACTION] -> Passing data to MedGemma Engine...")
        analysis_data = generate_structured_analysis(safe_text, mode)

        # -----------------------------------------------------------------
        # NEW DATABASE LOGIC: Save the successful interaction to SQLite
        # -----------------------------------------------------------------
        print("[DATABASE] -> Saving analysis log to SQLite...")
        db_log = AnalysisLog(
            filename=file.filename,
            mode=mode,
            extracted_text=safe_text,
            response_json=json.dumps(analysis_data)
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        print(f"[DATABASE] -> Saved successfully with Record ID: {db_log.id}")

        print(f"==================================================")
        print(f"REQUEST COMPLETE: Sending response back to client.")
        print(f"==================================================")
        return {
            "filename": file.filename,
            "extracted_text_preview": safe_text[:300] + ("..." if len(safe_text) > 300 else ""),
            "response": format_analysis_response(analysis_data, mode),
            "data": analysis_data
        }

    except HTTPException:
        raise

    except Exception as e:
        print(f"[CRITICAL ERROR] -> {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# NEW ENDPOINT: Fetch history for the frontend
@app.get("/history")
def get_history(limit: int = 10, db: Session = Depends(get_db)):
    print(f"\n[DATABASE] -> Fetching last {limit} records...")
    logs = db.query(AnalysisLog).order_by(AnalysisLog.timestamp.desc()).limit(limit).all()
    
    formatted_logs = []
    for log in logs:
        formatted_logs.append({
            "id": log.id,
            "filename": log.filename,
            "mode": log.mode,
            "timestamp": log.timestamp,
            "data": json.loads(log.response_json) if log.response_json else {}
        })
        
    return {"status": "success", "history": formatted_logs}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8085)