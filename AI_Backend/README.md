# 🏥 Hospital AI Backend - MedGemma 1.5 API

A FastAPI-powered backend that ingests medical records (PDFs and Images), extracts the raw text, and uses Google's locally-hosted **MedGemma 1.5 (4B)** AI model to generate structured, clinical JSON summaries. 

This API features dual-mode processing (Doctor vs. Patient-friendly language) and includes a local SQLite database for persistent patient history tracking.

## ✨ Core Features
* **Multi-Format Ingestion:** Parses clinical PDFs using `PyMuPDF` and scans medical images/prescriptions using `Tesseract OCR`.
* **Local GPU Processing:** Runs `google/medgemma-1.5-4b-it` entirely locally for strict data privacy.
* **4-Bit NF4 Quantization:** Uses `bitsandbytes` to compress the 4-Billion parameter model so it fits comfortably inside consumer GPU VRAM without CPU thrashing.
* **Structured JSON Output:** AI strictly outputs a deterministic JSON payload containing a clinical summary, severity-ranked abnormalities, and recommended actions.
* **SQLite Memory:** Automatically logs all uploaded documents, modes, and AI responses to a local `hospital_ai.db` file for the frontend dashboard to fetch.

## 🛠️ Tech Stack
* **Framework:** FastAPI, Uvicorn
* **AI & Machine Learning:** PyTorch (CUDA 12.4), Hugging Face `transformers`, `accelerate`, `bitsandbytes`
* **Document Parsing:** `fitz` (PyMuPDF), `pytesseract`, `Pillow`
* **Database:** SQLite, SQLAlchemy

## ⚠️ Prerequisites & Hardware Requirements
1. **NVIDIA GPU:** You must have an NVIDIA GPU to run this. The model is forced to map to `device="cuda"` to prevent system freezing.
2. **Hugging Face Token:** MedGemma 1.5 is a gated model. You must [accept the agreement on Hugging Face](https://huggingface.co/google/medgemma-1.5-4b-it) and log in locally using your HF token.
3. **Tesseract OCR (Windows Users):** The Python `pytesseract` library requires the actual Tesseract engine to be installed on your machine.
   * Download and install the `.exe` from [UB-Mannheim](https://github.com/UB-Mannheim/tesseract/wiki).
   * Open `main.py` and uncomment/update this line with your installation path:
     ```python
     pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
     ```

## 🚀 Installation & Setup

**1. Clone the repository and navigate to the backend directory:**
```bash
git clone [https://github.com/YOUR_USERNAME/HospitalAI.git](https://github.com/YOUR_USERNAME/HospitalAI.git)
cd HospitalAI/backend
