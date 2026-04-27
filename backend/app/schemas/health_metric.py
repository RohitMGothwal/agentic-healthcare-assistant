from pydantic import BaseModel
from datetime import datetime
from typing import List


class HealthMetricBase(BaseModel):
    metric_name: str
    value: float
    unit: str
    recorded_at: datetime


class HealthMetricCreate(HealthMetricBase):
    pass


class HealthMetricResponse(HealthMetricBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class HealthReport(BaseModel):
    metrics: List[HealthMetricResponse]
