from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class ChatMessageBase(BaseModel):
    message: str


class ChatMessageCreate(ChatMessageBase):
    language: Optional[str] = None


class ChatMessageResponse(ChatMessageBase):
    id: int
    user_id: Optional[int]
    is_user: int
    response: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ConditionInfo(BaseModel):
    condition: str
    matching_symptoms: List[str]
    treatment: str
    urgency: str


class SymptomAnalysisRequest(BaseModel):
    symptoms: str


class SymptomAnalysisResponse(BaseModel):
    conditions: List[ConditionInfo]
    disclaimer: str
    urgency: str
