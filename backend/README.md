# 🏥 Hospital AI Assistant – Backend

A production-structured FastAPI backend for an AI-powered hospital assistant.
Uses **Google MedGemma** (via HuggingFace Transformers) to help doctors
summarise patient records and generate plain-language explanations for patients.

> **Hackathon Note:** The backend runs in **mock mode** automatically when
> MedGemma cannot be loaded (no GPU, missing weights, or `FORCE_MOCK=1`).
> Every endpoint remains fully functional and returns structurally valid JSON.

---

## Folder Structure

```
hospital_ai_backend/
├── app/
│   ├── main.py                  # FastAPI app, CORS, lifespan hooks
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── doctor.py            # POST /doctor/analyze
│   │   ├── patient.py           # POST /patient/explain
│   │   └── health.py            # GET  /health
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ai_service.py        # MedGemma inference + mock fallback
│   │   └── preprocessing.py     # PDF extraction, image resize, text cleaning
│   └── schemas/
│       ├── __init__.py
│       └── models.py            # Pydantic request/response models
├── tests/
│   ├── __init__.py
│   └── test_endpoints.py        # pytest integration tests (mock mode)
├── .env.example                 # Environment variable template
├── requirements.txt
├── run.py                       # Uvicorn launcher
└── README.md
```

---

## API Endpoints

### `GET /health`
Service liveness probe. Returns model load status and GPU availability.

**Response:**
```json
{
  "status": "ok",
  "model_loaded": false,
  "gpu_available": false,
  "message": "Service operational in MOCK mode. MedGemma is not loaded – responses are simulated."
}
```

---

### `POST /doctor/analyze`
Upload patient records and receive a structured AI-generated clinical summary.

**Form fields (at least one required):**

| Field | Type | Description |
|---|---|---|
| `patient_history_text` | string | Patient history as plain text |
| `prescriptions_text` | string | Prescriptions as plain text |
| `lab_reports_text` | string | Lab report as plain text |
| `patient_id` | string | Optional patient id used to persist history + AI insights in SQLite |
| `patient_history_file` | file | Patient history as PDF or .txt |
| `prescriptions_file` | file | Prescriptions as PDF or .txt |
| `lab_reports_file` | file | Lab report as PDF or .txt |
| `scan_image` | file | Optional scan image (JPEG / PNG / DICOM `.dcm`) |

**Response:**
```json
{
  "patient_summary": "65-year-old male with hypertension and T2DM showing signs of...",
  "key_findings": [
    {
      "finding": "Elevated Creatinine",
      "detail": "Lab value of 1.8 mg/dL suggests possible renal stress.",
      "urgency": "high",
      "source": "lab_report"
    }
  ],
  "scan_insights": [
    {
      "observation": "Possible consolidation in lower right lobe",
      "region": "Right lower lobe",
      "note": "Further evaluation recommended – this is not a diagnosis."
    }
  ],
  "urgency_ranking": ["Elevated Creatinine", "Hypertension History"],
  "disclaimer": "This is an assistive tool and not a medical diagnosis."
}
```

When `patient_id` is provided, the backend now appends submitted history/lab/prescription inputs to the patient's persisted `records` row and stores the latest AI analysis in `analysis`.

---


### `POST /patients`
Create a new patient in local SQLite storage so doctors can fetch details and track history.

**JSON body:**
```json
{
  "mrn": "MRN-NEW-900",
  "name": "Ava Patel",
  "age": 44,
  "gender": "Female",
  "dob": "1980-04-03",
  "bloodType": "B+",
  "allergies": ["Peanuts"],
  "conditions": ["Asthma"],
  "lastVisit": "2026-02-12",
  "nextAppointment": "2026-03-01",
  "primaryPhysician": "Dr. R. Shah"
}
```

Returns the created patient object (with auto-generated `id` like `P003` if not provided).

---

### Patient detail/history retrieval
- `GET /patients` → list all patients
- `GET /patients/{patient_id}` → fetch one patient's profile
- `GET /patients/{patient_id}/records` → fetch persisted history/labs/imaging/prescriptions
- `GET /patients/{patient_id}/ai-insights` → fetch latest saved AI analysis

---

### `POST /patient/explain`
Upload a medical document and receive a plain-language explanation.
**Never returns diagnoses or medical advice.**

**Form fields (one required):**

| Field | Type | Description |
|---|---|---|
| `report_text` | string | Report as plain text |
| `report_file` | file | Report as PDF or .txt |

**Response:**
```json
{
  "simplified_explanation": "Your blood test shows your sugar levels have been a bit high over the past few months...",
  "disclaimer": "This is an assistive tool and not a medical diagnosis."
}
```

---

## Local Setup & Run

### Prerequisites
- Python 3.10+
- pip
- (Optional) CUDA-capable GPU for real MedGemma inference

---

### 1 — Clone and create a virtual environment

```bash
git clone <your-repo-url>
cd hospital_ai_backend

python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
```

---

### 2 — Install dependencies

**CPU-only (hackathon laptop / no GPU):**
```bash
pip install -r requirements.txt
```

**GPU (CUDA 12.x):**
```bash
# Replace the torch line in requirements.txt first:
# torch==2.5.1  →  torch==2.5.1+cu121  --index-url https://download.pytorch.org/whl/cu121
pip install -r requirements.txt
```

---

### 3 — Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
# To skip model loading entirely (fast startup, mock responses):
FORCE_MOCK=1

# To use the real model, set your HuggingFace token:
FORCE_MOCK=0
HUGGINGFACE_TOKEN=hf_your_token_here
MEDGEMMA_MODEL_ID=google/medgemma-4b-it
```

> **MedGemma access:** You must accept the MedGemma license on HuggingFace
> before the model will download. Visit:
> https://huggingface.co/google/medgemma-4b-it
> and click "Agree and access repository".

---

### 4 — Run the server

```bash
python run.py
```

Or directly with Uvicorn:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API is now live at **http://localhost:8000**

Interactive docs: **http://localhost:8000/docs**

---

### 5 — Run tests

```bash
pip install pytest httpx
pytest tests/ -v
```

Tests run in mock mode automatically (no GPU or model weights needed).

---

## Quick API Test (curl)

```bash
# Health check
curl http://localhost:8000/health

# Doctor analyze (text inputs)
curl -X POST http://localhost:8000/doctor/analyze \
  -F "patient_history_text=65-year-old male with hypertension." \
  -F "lab_reports_text=HbA1c: 8.2%. Creatinine: 1.8 mg/dL."

# Patient explain (text input)
curl -X POST http://localhost:8000/patient/explain \
  -F "report_text=Your HbA1c is 8.2%, which means your blood sugar has been high."

# Doctor analyze with PDF upload
curl -X POST http://localhost:8000/doctor/analyze \
  -F "patient_history_text=Adult patient." \
  -F "lab_reports_file=@/path/to/lab_report.pdf"
```

---

## Architecture Notes

### Mock vs Real Mode

| Condition | Behaviour |
|---|---|
| `FORCE_MOCK=1` | Always mock – fast startup, no GPU needed |
| `FORCE_MOCK=0`, no GPU | Attempts real model load on CPU, falls back to mock on failure |
| `FORCE_MOCK=0`, GPU available | Loads MedGemma on GPU via `device_map="auto"` |

### Prompting Strategy
- MedGemma is instructed to act as a **clinical documentation assistant** only
- Explicit rules in system prompts: no diagnosis, no prescriptions, flag uncertainty
- All prompts demand structured JSON output to ensure parseable responses
- A regex-based JSON extractor handles cases where the model adds prose preamble

### PDF Extraction
- Primary: `pdfplumber` (pure Python, better layout handling)
- Fallback: `PyMuPDF` (fitz) if pdfplumber fails or is unavailable
- Scanned PDFs (image-only) will return empty text; OCR support can be added via `pytesseract`

### Image Preprocessing
- PIL converts uploaded scans to RGB and resizes to 512×512
- The PIL image object is passed directly to the MedGemma multimodal pipeline

---

## Disclaimer

This software is a **hackathon prototype** and is **not intended for clinical use**.
All AI outputs are assistive only and must be reviewed by qualified medical professionals.
