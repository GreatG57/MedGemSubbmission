# MedGem – Full Stack Setup & Integration Guide

This repository contains a complete **frontend + backend + AI service** stack for a medical assistant dashboard.

- **Frontend:** React + Vite (`/frontend`)
- **Backend API:** FastAPI (`/backend`)
- **AI model integration:** Hugging Face MedGemma with automatic mock fallback (`/backend`)
- **Legacy prototype folder:** `AI_Backend` (not required for the current integrated app path)

---

## 1) Quick Start (Run the Full Stack)

## Prerequisites

- Node.js 18+
- Python 3.10+
- `pip`

---

### Step A — Start Backend (FastAPI)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

Backend default URL:
- `http://localhost:8000`

Useful backend pages:
- Swagger docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health endpoint: `http://localhost:8000/health`

---

### Step B — Start Frontend (React + Vite)

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend default URL:
- `http://localhost:5173`

The frontend calls backend using:
- `VITE_API_BASE_URL` if defined, otherwise
- `protocol://current-host:8000` (automatic fallback)

So in most local environments, no extra config is needed.

---


### Optional Step C — Start the legacy AI_Backend backbone (recommended when GPU available)

If you want the integrated backend (`/backend`) to use the older GPU-first MedGemma 1.5 pipeline, run `AI_Backend` as a sidecar service:

```bash
cd AI_Backend
# install its own dependencies first if needed
python main.py
```

Default AI_Backend URL:
- `http://127.0.0.1:8085`

When `AI_BACKEND_ENABLED=1`, the current backend automatically calls this service first and normalizes its output into the frontend schema.

---


## 2.1) Dashboard Database (non-AI data for site rendering)

The backend now persists dashboard data in SQLite at:
- `backend/hospital_dashboard.db`

This DB stores:
- patient profile list used by `GET /patients`
- per-patient records payload used by `GET /patients/{patient_id}/records`
- saved AI summaries used by `GET /patients/{patient_id}/ai-insights`

On first backend import/startup, tables are created and seeded with default patients, so the frontend can render immediately even before any uploads.

---

## 2) Environment Variables Reference

## Backend (.env in `/backend`)

You can create `backend/.env` and define:

```env
HOST=0.0.0.0
PORT=8000
LOG_LEVEL=info
RELOAD=true

FORCE_MOCK=1
HUGGINGFACE_TOKEN=hf_xxx
MEDGEMMA_MODEL_ID=google/medgemma-4b-it
```

### Important backend env keys

- `FORCE_MOCK`
  - `1`: skips real model load and returns mock AI output (fast, offline-friendly)
  - `0`: attempts real model load
- `HUGGINGFACE_TOKEN`
  - Hugging Face token used to download gated model weights
- `MEDGEMMA_MODEL_ID`
  - Default: `google/medgemma-4b-it`
- `RELOAD`
  - `true` enables auto reload in development
- `AI_BACKEND_ENABLED`
  - `1` tries to delegate AI generation to `AI_Backend` first (`/analyze` at port 8085)
  - `0` disables delegation and uses backend local MedGemma/mock path only
- `AI_BACKEND_URL`
  - Base URL of legacy AI backbone service (default `http://127.0.0.1:8085`)
- `AI_BACKEND_TIMEOUT_SECONDS`
  - Timeout for legacy AI backbone calls (default `25`)

## Frontend (.env in `/frontend`)

Optional:

```env
VITE_API_BASE_URL=http://localhost:8000
```

If omitted, app auto-resolves backend host to current hostname on port `8000`.

---

## 3) API Endpoints (Dictionary)

## Health

### `GET /health`

Purpose: liveness + model status.

Example response:

```json
{
  "status": "ok",
  "model_loaded": false,
  "gpu_available": false,
  "message": "Service operational in MOCK mode. MedGemma is not loaded – responses are simulated."
}
```

---

## Dashboard Data

### `GET /patients`
Returns all patients for dashboard list/search.

Response shape:

```json
{
  "patients": [
    {
      "id": "P001",
      "name": "Sarah Johnson"
    }
  ]
}
```

### `GET /patients/{patient_id}`
Returns one patient profile.

### `GET /patients/{patient_id}/records`
Returns records grouped by tabs:

```json
{
  "history": [],
  "labs": [],
  "imaging": [],
  "prescriptions": []
}
```

### `GET /patients/{patient_id}/ai-insights`
Returns persisted analysis for patient:

```json
{
  "analysis": {
    "patient_summary": "...",
    "key_findings": [],
    "scan_insights": [],
    "urgency_ranking": [],
    "disclaimer": "This is an assistive tool and not a medical diagnosis."
  }
}
```

---

## Doctor AI

### `POST /doctor/analyze`
Form-data endpoint that accepts any mix of text and file inputs.

Form fields:
- `patient_history_text` (string)
- `prescriptions_text` (string)
- `lab_reports_text` (string)
- `patient_history_file` (PDF/TXT)
- `prescriptions_file` (PDF/TXT)
- `lab_reports_file` (PDF/TXT)
- `scan_image` (optional image)
- `patient_id` (optional, used to attach output to dashboard patient)

Response dictionary:

```json
{
  "patient_summary": "string",
  "key_findings": [
    {
      "finding": "string",
      "detail": "string",
      "urgency": "high|medium|low",
      "source": "string"
    }
  ],
  "scan_insights": [
    {
      "observation": "string",
      "region": "string|null",
      "note": "string"
    }
  ],
  "urgency_ranking": ["string"],
  "disclaimer": "This is an assistive tool and not a medical diagnosis."
}
```

---

## Patient AI

### `POST /patient/explain`
Form-data endpoint for plain-language explanation.

Form fields:
- `report_text` (string)
- `report_file` (PDF/TXT)

Response dictionary:

```json
{
  "simplified_explanation": "string",
  "disclaimer": "This is an assistive tool and not a medical diagnosis."
}
```

---

## 4) CORS / Host Linking Notes

- Backend CORS is configured for common local origins using regex:
  - `localhost`
  - `127.0.0.1`
  - `0.0.0.0`
  - any local port
- Frontend default API fallback targets current browser host on port `8000`.

This makes local multi-device testing easier (e.g., opening frontend by IP and still hitting backend on same host/IP).

---

## 5) Hugging Face / MedGemma Notes

- Model default: `google/medgemma-4b-it`
- You may need to accept model access terms on Hugging Face before download.
- If your environment cannot reach Hugging Face or lacks resources, backend still works in mock mode.

Recommended development mode:
- `FORCE_MOCK=1` for UI and API integration work

---

## 6) Troubleshooting

### Frontend loads but shows fetch errors

- Confirm backend is running on port `8000`
- Check browser devtools network requests
- If using custom host/port, set `VITE_API_BASE_URL`

### Backend startup fails downloading model

- Set `FORCE_MOCK=1`
- Verify `HUGGINGFACE_TOKEN`
- Check network/proxy/firewall restrictions

### File upload issues

- Per-file limit is 20 MB
- Use readable PDFs or plain text for best extraction quality

---

## 7) Minimal Smoke-Test Commands

Run backend checks:

```bash
cd backend
python -m compileall app
```

Run frontend production build:

```bash
cd frontend
npm run build
```

---

If you want, I can also add:
- a `.env.example` at repo root that maps both frontend and backend variables, and
- a one-command startup script (`./start-all.sh`) to boot both services together.
