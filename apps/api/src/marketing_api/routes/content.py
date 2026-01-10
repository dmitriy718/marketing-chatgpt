import json
import uuid
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from marketing_api.db.models import GeneratedContent, Lead, LeadStatus
from marketing_api.db.session import get_session
from marketing_api.limits import limiter
from marketing_api.routes.public import should_bypass_turnstile, verify_turnstile
from marketing_api.settings import settings

router = APIRouter(prefix="/public/content", tags=["content"])


class ContentGenerateRequest(BaseModel):
    content_type: Literal["blog_post", "social_media", "email_campaign"]
    topic: str
    tone: Literal["professional", "casual", "friendly"] = "professional"
    length: Literal["short", "medium", "long"] = "medium"
    email: EmailStr | None = None
    turnstile_token: str | None = None


def get_content_prompt(
    content_type: str, topic: str, tone: str, length: str
) -> tuple[str, int]:
    """Generate prompt for content generation."""
    length_words = {"short": 200, "medium": 500, "long": 1000}[length]
    
    prompts = {
        "blog_post": f"""Write a {tone} blog post about "{topic}" for a marketing agency website targeting local businesses.

Requirements:
- Length: approximately {length_words} words
- Tone: {tone}
- Include an engaging headline
- Include 2-3 subheadings
- End with a call-to-action encouraging readers to contact Carolina Growth
- Focus on practical, actionable advice for local business owners

Format as markdown with proper headings.""",
        "social_media": f"""Create {tone} social media content about "{topic}" for a marketing agency.

Requirements:
- Create 3-5 social media posts (variations)
- Each post should be 100-200 characters
- Include relevant hashtags
- Tone: {tone}
- Include a call-to-action where appropriate
- Make it engaging and shareable""",
        "email_campaign": f"""Write a {tone} email campaign about "{topic}" for a marketing agency.

Requirements:
- Subject line
- Email body (approximately {length_words} words)
- Tone: {tone}
- Include a clear call-to-action
- Professional but approachable
- Focus on value for the recipient""",
    }
    
    return prompts.get(content_type, prompts["blog_post"]), length_words


async def generate_content_with_ai(prompt: str, max_tokens: int) -> str:
    """Generate content using OpenAI API."""
    if not settings.openai_api_key:
        raise HTTPException(
            status_code=503,
            detail="Content generation is currently unavailable. Please try again later.",
        )
    
    try:
        from openai import AsyncOpenAI
        
        client = AsyncOpenAI(api_key=settings.openai_api_key)
        
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional content writer specializing in marketing content for local businesses. Write engaging, helpful, and conversion-focused content.",
                },
                {"role": "user", "content": prompt},
            ],
            max_tokens=max_tokens,
            temperature=0.8,
        )
        
        return response.choices[0].message.content or "Content generation failed."
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Content generation failed: {str(exc)[:100]}"
        ) from exc


@router.post("/generate", status_code=status.HTTP_200_OK)
@limiter.limit("10/hour")
async def generate_content(
    request: Request,
    payload: ContentGenerateRequest,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Generate AI content (blog post, social media, or email)."""
    if not should_bypass_turnstile(request):
        await verify_turnstile(payload.turnstile_token)
    
    # Check usage limits (free tier: 3/month, premium: unlimited)
    usage_count = 0
    if payload.email:
        # Check monthly usage
        from datetime import datetime, timezone
        month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        usage = await session.execute(
            select(GeneratedContent)
            .where(
                GeneratedContent.email == payload.email,
                GeneratedContent.created_at >= month_start,
            )
        )
        usage_count = len(usage.scalars().all())
        # Free tier limit: 3 per month
        if usage_count >= 3:
            raise HTTPException(
                status_code=429,
                detail="Monthly limit reached. Upgrade to premium for unlimited content generation.",
            )
    
    # Generate prompt
    prompt, max_tokens = get_content_prompt(
        payload.content_type, payload.topic, payload.tone, payload.length
    )
    
    # Adjust max_tokens based on length
    token_limits = {"short": 300, "medium": 700, "long": 1500}
    max_tokens = token_limits[payload.length]
    
    # Generate content
    generated_text = await generate_content_with_ai(prompt, max_tokens)
    
    # Store in database
    content = GeneratedContent(
        email=payload.email,
        content_type=payload.content_type,
        prompt=prompt,
        generated_text=generated_text,
    )
    session.add(content)
    await session.commit()
    
    # If email provided, capture as lead
    if payload.email:
        from marketing_api.routes.public import upsert_lead
        await upsert_lead(
            session,
            full_name=payload.email.split("@")[0],
            email=payload.email,
            company=None,
            details=f"Content generation requested\nType: {payload.content_type}\nTopic: {payload.topic}",
            source="content-generator",
        )
    
    return {
        "content": generated_text,
        "content_type": payload.content_type,
        "topic": payload.topic,
        "usage_count": usage_count + 1 if payload.email else None,
        "limit": 3,
    }
