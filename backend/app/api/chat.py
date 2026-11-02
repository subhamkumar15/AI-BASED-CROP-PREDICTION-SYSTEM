"""
AI Agricultural Assistant Chatbot API
AGRISENSE Platform
"""

from typing import Any
from fastapi import APIRouter
from backend.app.schemas.schemas import ChatMessageRequest, ChatMessageResponse
from backend.app.services.chat_service import chat_service

router = APIRouter(prefix="/chat", tags=["AI Agricultural Assistant"])

@router.post("/message", response_model=ChatMessageResponse)
def handle_chat_message(req: ChatMessageRequest) -> Any:
    """Answers farmer queries with grounded agricultural intelligence and decision support."""
    result = chat_service.answer_query(
        query=req.message,
        farm_context=req.farm_context
    )
    return result
