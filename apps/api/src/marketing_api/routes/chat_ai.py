import json
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from marketing_api.db.models import ChatMessage
from marketing_api.db.session import get_session
from marketing_api.limits import limiter
from marketing_api.routes.public import should_bypass_turnstile, verify_turnstile
from marketing_api.posthog_client import capture_feature_usage
from marketing_api.settings import settings

router = APIRouter(prefix="/public/chat", tags=["chat-ai"])


class ChatAiRequest(BaseModel):
    message: str
    session_id: str | None = None
    name: str | None = None
    email: str | None = None
    turnstile_token: str | None = None


def get_ai_system_prompt() -> str:
    """Get the system prompt for the AI assistant."""
    return """You are a helpful AI assistant for Carolina Growth, a marketing agency specializing in lead generation, SEO, and web design for local businesses.

Your role:
- Answer questions about Carolina Growth's services (lead generation, SEO, web design, local marketing)
- Provide helpful information about pricing and packages
- Qualify leads by asking relevant questions
- Be friendly, professional, and concise
- If asked about complex topics or pricing specifics, encourage them to book a call or contact the team
- If someone wants to speak to a human, acknowledge and let them know they can use the contact form

Key information:
- Services: Lead Generation, SEO Growth, Web Design, Review Mediation
- Pricing: Monthly subscriptions starting at affordable rates, custom packages available
- Location: Serving local businesses, especially in the Carolinas
- Contact: They can book a call or use the contact form on the website

Keep responses under 150 words when possible. Be conversational and helpful."""


async def get_chat_history(session: AsyncSession, session_id: str, limit: int = 10) -> list[dict[str, Any]]:
    """Get recent chat history for context."""
    result = await session.execute(
        select(ChatMessage)
        .where(ChatMessage.chat_session_id == session_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
    )
    messages = result.scalars().all()
    # Reverse to get chronological order
    messages = list(reversed(messages))
    
    history = []
    for msg in messages:
        if not msg.is_ai_response:
            history.append({"role": "user", "content": msg.message})
        if msg.is_ai_response and msg.ai_response_text:
            history.append({"role": "assistant", "content": msg.ai_response_text})
    
    return history


async def get_ai_response(message: str, history: list[dict[str, Any]], name: str | None = None) -> str:
    """Get AI response using OpenAI API."""
    if not settings.openai_api_key:
        return "I'm currently unavailable. Please contact us directly using the contact form or book a call."
    
    try:
        from openai import AsyncOpenAI
        
        client = AsyncOpenAI(api_key=settings.openai_api_key)
        
        messages = [{"role": "system", "content": get_ai_system_prompt()}]
        messages.extend(history[-10:])  # Last 10 messages for context
        messages.append({"role": "user", "content": message})
        
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=200,
            temperature=0.7,
        )
        
        return response.choices[0].message.content or "I apologize, I couldn't generate a response."
    except Exception as exc:
        # Fallback response if AI fails
        return f"I'm having trouble right now. Please contact us directly - we'd love to help! Error: {str(exc)[:50]}"


@router.post("/ai-response", status_code=status.HTTP_200_OK)
@limiter.limit("20/hour")
async def get_ai_chat_response(
    request: Request,
    payload: ChatAiRequest,
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """Get AI response to a chat message."""
    if not should_bypass_turnstile(request):
        await verify_turnstile(payload.turnstile_token)
    
    # Generate or use session ID
    session_id = payload.session_id or str(uuid.uuid4())
    
    # Get chat history for context
    history = await get_chat_history(session, session_id) if payload.session_id else []
    
    # Get AI response
    ai_response = await get_ai_response(payload.message, history, payload.name)
    
    # Store user message
    user_message = ChatMessage(
        name=payload.name or "Anonymous",
        email=payload.email,
        message=payload.message,
        chat_session_id=session_id,
        is_ai_response=False,
    )
    session.add(user_message)
    await session.flush()
    
    # Store AI response
    ai_message = ChatMessage(
        name="Carolina Growth AI",
        email=None,
        message=payload.message,  # Original message for reference
        ai_response_text=ai_response,
        chat_session_id=session_id,
        is_ai_response=True,
    )
    session.add(ai_message)
    await session.commit()
    
    # Check if escalation needed
    escalation_keywords = ["speak to human", "talk to someone", "contact", "call me", "human agent"]
    needs_escalation = any(keyword in payload.message.lower() for keyword in escalation_keywords)
    
    return {
        "response": ai_response,
        "session_id": session_id,
        "needs_escalation": needs_escalation,
    }
