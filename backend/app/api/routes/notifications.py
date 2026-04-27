from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class PushToken(BaseModel):
    token: str


@router.post("/register")
async def register_token(payload: PushToken):
    return {"message": "Push token registered", "token": payload.token}
