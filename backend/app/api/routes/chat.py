from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated, List
from app.db.database import get_db
from app.models.chat import ChatMessage
from app.models.user import User
from app.schemas.chat import ChatMessageCreate, ChatMessageResponse
from app.api.routes.auth import oauth2_scheme
from app.core.security import decode_token

router = APIRouter()


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Annotated[Session, Depends(get_db)]):
    from jose import JWTError
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        if payload is None:
            raise credentials_exception
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user


@router.get("/", response_model=List[ChatMessageResponse])
async def get_chat_history(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    messages = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).order_by(ChatMessage.created_at).all()
    return messages


@router.post("/", response_model=ChatMessageResponse)
async def send_chat(
    message: ChatMessageCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    # Save user message
    user_message = ChatMessage(
        user_id=current_user.id,
        message=message.message,
        is_user=1
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)
    
    # Generate AI response (mock for now, can integrate OpenAI)
    ai_response = f"I understand you're asking about: {message.message}. This is a healthcare assistant response."
    
    # Save AI response
    bot_message = ChatMessage(
        user_id=current_user.id,
        message=ai_response,
        is_user=0,
        response=ai_response
    )
    db.add(bot_message)
    db.commit()
    db.refresh(bot_message)
    
    return bot_message
