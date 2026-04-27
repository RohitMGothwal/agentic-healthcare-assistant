from fastapi import APIRouter
from pydantic import BaseModel
from datetime import date
from typing import List

router = APIRouter()


class Appointment(BaseModel):
    id: int
    date: date
    doctor: str
    clinic: str
    status: str


@router.get("/")
async def list_appointments() -> List[Appointment]:
    return [
        {"id": 1, "date": date.today().isoformat(), "doctor": "Dr. Patel", "clinic": "Wellness Center", "status": "confirmed"},
        {"id": 2, "date": date.today().isoformat(), "doctor": "Dr. Smith", "clinic": "City Clinic", "status": "pending"},
    ]


class AppointmentRequest(BaseModel):
    date: date
    doctor: str
    clinic: str


@router.post("/")
async def create_appointment(payload: AppointmentRequest):
    return {"message": "Appointment request submitted", "appointment": payload}
