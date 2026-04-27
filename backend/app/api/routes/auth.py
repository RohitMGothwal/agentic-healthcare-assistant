from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class AuthRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
async def login(payload: AuthRequest):
    if not payload.username or not payload.password:
        raise HTTPException(status_code=400, detail="Username and password are required")
    return {"access_token": "demo-token", "token_type": "bearer", "user": {"username": payload.username}}


@router.post("/register")
async def register(payload: AuthRequest):
    return {"message": "User registered successfully", "user": {"username": payload.username}}
