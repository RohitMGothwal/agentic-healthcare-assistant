from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.appointment import AppointmentStatus


class AppointmentBase(BaseModel):
    doctor_name: str
    clinic_name: str
    appointment_date: datetime
    notes: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    doctor_name: Optional[str] = None
    clinic_name: Optional[str] = None
    appointment_date: Optional[datetime] = None
    status: Optional[AppointmentStatus] = None
    notes: Optional[str] = None


class AppointmentResponse(AppointmentBase):
    id: int
    user_id: int
    status: AppointmentStatus
    created_at: datetime

    class Config:
        from_attributes = True
