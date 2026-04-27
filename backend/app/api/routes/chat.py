from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class ChatMessage(BaseModel):
    message: str


@router.post("/")
async def send_chat(message: ChatMessage):
    return {"reply": f"This is a demo response to: {message.message}"}
