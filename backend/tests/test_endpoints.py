"""
tests/test_endpoints.py
-----------------------
Integration tests for all three API endpoints.
These tests run against the FastAPI app with FORCE_MOCK=1 so no real
model weights are required – CI-friendly out of the box.
"""

from __future__ import annotations

import io
import os

import pytest
from fastapi.testclient import TestClient

# Force mock mode before importing the app
os.environ["FORCE_MOCK"] = "1"

from app.main import app  # noqa: E402  (must come after env var)

client = TestClient(app)

# ---------------------------------------------------------------------------
# Health endpoint
# ---------------------------------------------------------------------------

class TestHealthEndpoint:
    def test_health_returns_ok(self):
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"
        assert "model_loaded" in data
        assert "gpu_available" in data
        assert "message" in data

    def test_health_mock_mode_message(self):
        resp = client.get("/health")
        data = resp.json()
        # In mock mode, model_loaded should be False
        assert data["model_loaded"] is False
        assert "MOCK" in data["message"].upper() or "mock" in data["message"].lower()

# ---------------------------------------------------------------------------
# Doctor endpoint
# ---------------------------------------------------------------------------

class TestDoctorAnalyzeEndpoint:
    BASE_URL = "/doctor/analyze"

    def test_analyze_with_text_fields(self):
        """Basic happy path – all inputs as form text."""
        resp = client.post(
            self.BASE_URL,
            data={
                "patient_history_text": "65-year-old male with hypertension and T2DM.",
                "prescriptions_text": "Metformin 500mg twice daily. Amlodipine 5mg OD.",
                "lab_reports_text": "HbA1c: 8.2%. Creatinine: 1.8 mg/dL. BP: 150/95.",
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        self._assert_response_shape(data)

    def test_analyze_missing_all_inputs_raises_422(self):
        """No clinical data at all should return 422."""
        resp = client.post(self.BASE_URL, data={})
        assert resp.status_code == 422

    def test_analyze_with_text_file_upload(self):
        """Lab report uploaded as a .txt file."""
        txt_content = b"Sodium: 138 mEq/L\nPotassium: 3.4 mEq/L\nGlucose: 210 mg/dL"
        resp = client.post(
            self.BASE_URL,
            data={"patient_history_text": "Adult patient."},
            files={"lab_reports_file": ("labs.txt", io.BytesIO(txt_content), "text/plain")},
        )
        assert resp.status_code == 200
        data = resp.json()
        self._assert_response_shape(data)

    def test_analyze_disclaimer_always_present(self):
        resp = client.post(
            self.BASE_URL,
            data={"patient_history_text": "Test patient."},
        )
        assert resp.status_code == 200
        assert resp.json()["disclaimer"] != ""

    def test_urgency_ranking_matches_key_findings(self):
        resp = client.post(
            self.BASE_URL,
            data={"patient_history_text": "Test patient."},
        )
        assert resp.status_code == 200
        data = resp.json()
        # urgency_ranking should list the same findings as key_findings
        finding_titles = [f["finding"] for f in data["key_findings"]]
        for ranked_item in data["urgency_ranking"]:
            assert ranked_item in finding_titles

    @staticmethod
    def _assert_response_shape(data: dict):
        assert "patient_summary" in data
        assert isinstance(data["key_findings"], list)
        assert isinstance(data["scan_insights"], list)
        assert isinstance(data["urgency_ranking"], list)
        assert "disclaimer" in data

        for finding in data["key_findings"]:
            assert "finding" in finding
            assert "detail" in finding
            assert finding["urgency"] in ("high", "medium", "low")
            assert "source" in finding

# ---------------------------------------------------------------------------
# Patient endpoint
# ---------------------------------------------------------------------------

class TestPatientExplainEndpoint:
    BASE_URL = "/patient/explain"

    def test_explain_with_text(self):
        resp = client.post(
            self.BASE_URL,
            data={"report_text": "Your HbA1c is 7.8%, indicating suboptimal glycaemic control."},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "simplified_explanation" in data
        assert data["simplified_explanation"] != ""
        assert "disclaimer" in data

    def test_explain_with_txt_file_upload(self):
        content = b"Your blood pressure reading was 145/90 mmHg."
        resp = client.post(
            self.BASE_URL,
            files={"report_file": ("report.txt", io.BytesIO(content), "text/plain")},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "simplified_explanation" in data

    def test_explain_missing_input_raises_422(self):
        resp = client.post(self.BASE_URL, data={})
        assert resp.status_code == 422

    def test_explain_disclaimer_always_present(self):
        resp = client.post(
            self.BASE_URL,
            data={"report_text": "Cholesterol: 220 mg/dL"},
        )
        assert resp.status_code == 200
        assert "disclaimer" in resp.json()

# ---------------------------------------------------------------------------
# Dashboard persistence endpoint checks
# ---------------------------------------------------------------------------

class TestDashboardPersistence:

    def test_create_patient_and_fetch_details(self):
        create_resp = client.post(
            "/patients",
            json={
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
                "primaryPhysician": "Dr. R. Shah",
            },
        )
        assert create_resp.status_code == 201
        created = create_resp.json()
        assert created["id"].startswith("P")

        fetch_resp = client.get(f"/patients/{created['id']}")
        assert fetch_resp.status_code == 200
        fetched = fetch_resp.json()
        assert fetched["name"] == "Ava Patel"

        records_resp = client.get(f"/patients/{created['id']}/records")
        assert records_resp.status_code == 200
        assert records_resp.json() == {"history": [], "labs": [], "imaging": [], "prescriptions": []}


    def test_create_patient_with_minimum_fields_uses_defaults(self):
        create_resp = client.post(
            "/patients",
            json={
                "mrn": "MRN-NEW-901",
                "name": "No Extras",
                "age": 50,
                "gender": "Male",
                "dob": "1975-11-01",
            },
        )
        assert create_resp.status_code == 201
        created = create_resp.json()
        assert created["bloodType"] == "Unknown"
        assert created["primaryPhysician"] == "Unassigned"
        assert created["nextAppointment"] == "TBD"

    def test_analyze_persists_patient_records_and_ai_insights(self):
        analyze_resp = client.post(
            "/doctor/analyze",
            data={
                "patient_id": "P001",
                "patient_history_text": "History entry from doctor note.",
                "lab_reports_text": "Lab value sample.",
            },
        )
        assert analyze_resp.status_code == 200

        records_resp = client.get("/patients/P001/records")
        assert records_resp.status_code == 200
        records = records_resp.json()
        assert records["history"]
        assert records["labs"]

        insights_resp = client.get("/patients/P001/ai-insights")
        assert insights_resp.status_code == 200
        insights = insights_resp.json()
        assert insights["analysis"] is not None
        assert "patient_summary" in insights["analysis"]
