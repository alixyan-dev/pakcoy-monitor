from fastapi import APIRouter, Body
from app.services.ai_chat import chat as chat_service

router = APIRouter()

@router.post("/ai/chat")
def ai_chat(message: dict = Body(...)):
    return chat_service(message)
