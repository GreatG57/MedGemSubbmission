"""Dashboard data endpoints used by the frontend."""

from __future__ import annotations

from datetime import date

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.services.dashboard_store import (
    create_appointment,
    create_patient,
    get_analysis,
    get_patient,
    get_records,
    list_appointments,
    list_patients,
)

router = APIRouter()

@router.get("/patients")
async def patients_list() -> dict:
    return {"patients": list_patients()}

class PatientCreateRequest(BaseModel):
    id: str | None = None
    mrn: str
    name: str
    age: int
    gender: str
    dob: str
    bloodType: str
    allergies: list[str] = Field(default_factory=list)
    conditions: list[str] = Field(default_factory=list)
    lastVisit: str
    nextAppointment: str
    primaryPhysician: str

@router.post("/patients", status_code=status.HTTP_201_CREATED)
async def patients_create(payload: PatientCreateRequest) -> dict:
    try:
        patient = create_patient(payload.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return patient

class PatientCreateRequest(BaseModel):
    id: str | None = None
    mrn: str
    name: str
    age: int
    gender: str
    dob: str
    bloodType: str = "Unknown"
    allergies: list[str] = Field(default_factory=list)
    conditions: list[str] = Field(default_factory=list)
    lastVisit: str = Field(default_factory=lambda: date.today().isoformat())
    nextAppointment: str = "TBD"
    primaryPhysician: str = "Unassigned"


@router.post("/patients", status_code=status.HTTP_201_CREATED)
async def patients_create(payload: PatientCreateRequest) -> dict:
    try:
        patient = create_patient(payload.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return patient


@router.get("/patients/{patient_id}")
async def patient_detail(patient_id: str) -> dict:
    patient = get_patient(patient_id)
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return patient

@router.get("/patients/{patient_id}/records")
async def patient_records(patient_id: str) -> dict:
    if get_patient(patient_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return get_records(patient_id)

@router.get("/patients/{patient_id}/ai-insights")
async def patient_ai_insights(patient_id: str) -> dict:
    if get_patient(patient_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    analysis = get_analysis(patient_id)
    return {"analysis": analysis}

class AppointmentCreateRequest(BaseModel):
    patient: str
    time: str
    type: str = "Consultation"
    duration: str = "30 min"
    status: str = "confirmed"

@router.get("/appointments")
async def appointments_list() -> dict:
    return {"appointments": list_appointments()}

@router.post("/appointments")
async def appointments_create(payload: AppointmentCreateRequest) -> dict:
    return create_appointment(payload.model_dump())
