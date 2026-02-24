"""SQLite-backed store for dashboard patient, records, and AI insight data."""

from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DB_PATH = Path(__file__).resolve().parents[2] / "hospital_dashboard.db"

def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def _seed_defaults(conn: sqlite3.Connection) -> None:
    existing = conn.execute("SELECT COUNT(*) AS count FROM patients").fetchone()["count"]
    if existing:
        return

    default_patients = [
        {
            "id": "P001",
            "mrn": "MRN-2024-001",
            "name": "Sarah Johnson",
            "age": 67,
            "gender": "Female",
            "dob": "1957-03-15",
            "bloodType": "A+",
            "allergies": ["Penicillin", "Sulfa drugs"],
            "conditions": ["Type 2 Diabetes", "Hypertension", "Hyperlipidemia"],
            "lastVisit": "2024-01-15",
            "nextAppointment": "2024-02-20",
            "primaryPhysician": "Dr. Michael Chen",
        },
        {
            "id": "P002",
            "mrn": "MRN-2024-002",
            "name": "James Miller",
            "age": 59,
            "gender": "Male",
            "dob": "1965-07-04",
            "bloodType": "O+",
            "allergies": ["None known"],
            "conditions": ["Coronary artery disease"],
            "lastVisit": "2024-01-11",
            "nextAppointment": "2024-02-25",
            "primaryPhysician": "Dr. Aditi Rao",
        },
    ]

    for patient in default_patients:
        conn.execute(
            """
            INSERT INTO patients (
                id, mrn, name, age, gender, dob, blood_type,
                allergies_json, conditions_json, last_visit, next_appointment, primary_physician
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                patient["id"],
                patient["mrn"],
                patient["name"],
                patient["age"],
                patient["gender"],
                patient["dob"],
                patient["bloodType"],
                json.dumps(patient["allergies"]),
                json.dumps(patient["conditions"]),
                patient["lastVisit"],
                patient["nextAppointment"],
                patient["primaryPhysician"],
            ),
        )

        conn.execute(
            "INSERT INTO records (patient_id, records_json) VALUES (?, ?)",
            (patient["id"], json.dumps({"history": [], "labs": [], "imaging": [], "prescriptions": []})),
        )

    conn.commit()

def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS patients (
                id TEXT PRIMARY KEY,
                mrn TEXT NOT NULL,
                name TEXT NOT NULL,
                age INTEGER NOT NULL,
                gender TEXT NOT NULL,
                dob TEXT NOT NULL,
                blood_type TEXT NOT NULL,
                allergies_json TEXT NOT NULL,
                conditions_json TEXT NOT NULL,
                last_visit TEXT NOT NULL,
                next_appointment TEXT NOT NULL,
                primary_physician TEXT NOT NULL
            )
            """
        )

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS records (
                patient_id TEXT PRIMARY KEY,
                records_json TEXT NOT NULL,
                FOREIGN KEY(patient_id) REFERENCES patients(id)
            )
            """
        )

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS analysis (
                patient_id TEXT PRIMARY KEY,
                analysis_json TEXT NOT NULL,
                FOREIGN KEY(patient_id) REFERENCES patients(id)
            )
            """
        )

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS appointments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient TEXT NOT NULL,
                time TEXT NOT NULL,
                type TEXT NOT NULL,
                duration TEXT NOT NULL,
                status TEXT NOT NULL
            )
            """
        )

        _seed_defaults(conn)

def _row_to_patient(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "mrn": row["mrn"],
        "name": row["name"],
        "age": row["age"],
        "gender": row["gender"],
        "dob": row["dob"],
        "bloodType": row["blood_type"],
        "allergies": json.loads(row["allergies_json"]),
        "conditions": json.loads(row["conditions_json"]),
        "lastVisit": row["last_visit"],
        "nextAppointment": row["next_appointment"],
        "primaryPhysician": row["primary_physician"],
    }

def _next_patient_id(conn: sqlite3.Connection) -> str:
    """Generate the next patient id in the P### format."""
    rows = conn.execute("SELECT id FROM patients").fetchall()
    max_num = 0
    for row in rows:
        patient_id = row["id"]
        if isinstance(patient_id, str) and patient_id.startswith("P"):
            suffix = patient_id[1:]
            if suffix.isdigit():
                max_num = max(max_num, int(suffix))
    return f"P{max_num + 1:03d}"

def create_patient(payload: dict[str, Any]) -> dict[str, Any]:
    """Create a patient row and initialise empty records + analysis rows."""
    with _connect() as conn:
        patient_id = payload.get("id") or _next_patient_id(conn)
        if conn.execute("SELECT 1 FROM patients WHERE id = ?", (patient_id,)).fetchone() is not None:
            raise ValueError(f"Patient id {patient_id} already exists")

        patient_row = {
            "id": patient_id,
            "mrn": payload["mrn"],
            "name": payload["name"],
            "age": payload["age"],
            "gender": payload["gender"],
            "dob": payload["dob"],
            "bloodType": payload.get("bloodType", "Unknown"),
            "allergies": payload.get("allergies", []),
            "conditions": payload.get("conditions", []),
            "lastVisit": payload.get("lastVisit", datetime.now(timezone.utc).date().isoformat()),
            "nextAppointment": payload.get("nextAppointment", "TBD"),
            "primaryPhysician": payload.get("primaryPhysician", "Unassigned"),
        }

        conn.execute(
            """
            INSERT INTO patients (
                id, mrn, name, age, gender, dob, blood_type,
                allergies_json, conditions_json, last_visit, next_appointment, primary_physician
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                patient_row["id"],
                patient_row["mrn"],
                patient_row["name"],
                patient_row["age"],
                patient_row["gender"],
                patient_row["dob"],
                patient_row["bloodType"],
                json.dumps(patient_row["allergies"]),
                json.dumps(patient_row["conditions"]),
                patient_row["lastVisit"],
                patient_row["nextAppointment"],
                patient_row["primaryPhysician"],
            ),
        )
        conn.execute(
            """
            INSERT INTO records (patient_id, records_json)
            VALUES (?, ?)
            """,
            (patient_row["id"], json.dumps({"history": [], "labs": [], "imaging": [], "prescriptions": []})),
        )
        conn.commit()

    return patient_row

def list_patients() -> list[dict[str, Any]]:
    with _connect() as conn:
        rows = conn.execute("SELECT * FROM patients ORDER BY id ASC").fetchall()
    return [_row_to_patient(row) for row in rows]

def get_patient(patient_id: str) -> dict[str, Any] | None:
    with _connect() as conn:
        row = conn.execute("SELECT * FROM patients WHERE id = ?", (patient_id,)).fetchone()
    if row is None:
        return None
    return _row_to_patient(row)

def get_records(patient_id: str) -> dict[str, Any]:
    with _connect() as conn:
        row = conn.execute("SELECT records_json FROM records WHERE patient_id = ?", (patient_id,)).fetchone()
    if row is None:
        return {"history": [], "labs": [], "imaging": [], "prescriptions": []}
    return json.loads(row["records_json"])

def append_records(
    patient_id: str,
    *,
    patient_history: str,
    prescriptions: str,
    lab_reports: str,
    has_scan_image: bool,
    scan_filename: str | None,
) -> dict[str, Any]:
    """Append newly analyzed source documents to a patient's persisted records."""
    timestamp = datetime.now(timezone.utc).isoformat()
    records = get_records(patient_id)

    if patient_history:
        records.setdefault("history", []).append(
            {
                "captured_at": timestamp,
                "source": "doctor_analyze",
                "text": patient_history,
            }
        )

    if prescriptions:
        records.setdefault("prescriptions", []).append(
            {
                "captured_at": timestamp,
                "source": "doctor_analyze",
                "text": prescriptions,
            }
        )

    if lab_reports:
        records.setdefault("labs", []).append(
            {
                "captured_at": timestamp,
                "source": "doctor_analyze",
                "text": lab_reports,
            }
        )

    if has_scan_image:
        records.setdefault("imaging", []).append(
            {
                "captured_at": timestamp,
                "source": "doctor_analyze",
                "filename": scan_filename,
                "type": "xray_or_scan",
            }
        )

    payload = json.dumps(records)
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO records (patient_id, records_json)
            VALUES (?, ?)
            ON CONFLICT(patient_id) DO UPDATE SET records_json = excluded.records_json
            """,
            (patient_id, payload),
        )
        conn.commit()

    return records

def save_analysis(patient_id: str, analysis: dict[str, Any]) -> None:
    payload = json.dumps(analysis)
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO analysis (patient_id, analysis_json)
            VALUES (?, ?)
            ON CONFLICT(patient_id) DO UPDATE SET analysis_json = excluded.analysis_json
            """,
            (patient_id, payload),
        )
        conn.commit()

def get_analysis(patient_id: str) -> dict[str, Any] | None:
    with _connect() as conn:
        row = conn.execute("SELECT analysis_json FROM analysis WHERE patient_id = ?", (patient_id,)).fetchone()
    if row is None:
        return None
    return json.loads(row["analysis_json"])

def list_appointments() -> list[dict[str, Any]]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT id, patient, time, type, duration, status FROM appointments ORDER BY id ASC"
        ).fetchall()
    return [dict(row) for row in rows]

def create_appointment(payload: dict[str, Any]) -> dict[str, Any]:
    with _connect() as conn:
        cursor = conn.execute(
            """
            INSERT INTO appointments (patient, time, type, duration, status)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                payload["patient"],
                payload["time"],
                payload.get("type", "Consultation"),
                payload.get("duration", "30 min"),
                payload.get("status", "confirmed"),
            ),
        )
        conn.commit()
        new_id = cursor.lastrowid

    return {
        "id": new_id,
        "patient": payload["patient"],
        "time": payload["time"],
        "type": payload.get("type", "Consultation"),
        "duration": payload.get("duration", "30 min"),
        "status": payload.get("status", "confirmed"),
    }

init_db()
