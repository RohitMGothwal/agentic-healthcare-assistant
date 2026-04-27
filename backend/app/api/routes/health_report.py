from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()


class HealthMetric(BaseModel):
    name: str
    value: float
    unit: str


class HealthReport(BaseModel):
    metrics: List[HealthMetric]


@router.get("/")
async def get_health_report() -> HealthReport:
    return {
        "metrics": [
            {"name": "Blood Pressure", "value": 120, "unit": "mmHg"},
            {"name": "Heart Rate", "value": 72, "unit": "bpm"},
            {"name": "Sleep Quality", "value": 8.2, "unit": "hours"},
        ]
    }
