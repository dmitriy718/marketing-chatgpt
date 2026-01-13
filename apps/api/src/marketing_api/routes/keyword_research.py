import json
import logging

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from marketing_api.db.models import Keyword, KeywordResearch, Lead
from marketing_api.db.session import get_session
from marketing_api.limits import limiter
from marketing_api.notifications.email import notify_admin, send_email
from marketing_api.routes.public import should_bypass_turnstile, upsert_lead
from marketing_api.posthog_client import capture_feature_usage
from marketing_api.settings import settings

router = APIRouter(prefix="/public/keyword-research", tags=["keyword-research"])
logger = logging.getLogger(__name__)


class KeywordResearchRequest(BaseModel):
    seed_keyword: str
    email: EmailStr | None = None
    turnstile_token: str | None = None


async def research_keywords(seed_keyword: str) -> dict:
    """
    Research keywords based on a seed keyword.
    This is a basic implementation that can be extended with Google Keyword Planner or other APIs.
    """
    try:
        # Basic keyword suggestions (simplified - would use API in production)
        # Generate related keywords based on common patterns
        keywords = []
        
        # Add seed keyword
        keywords.append({
            "keyword": seed_keyword,
            "search_volume": 1000,  # Placeholder
            "difficulty": 50,  # Placeholder
            "cpc": 1.50,  # Placeholder
            "competition": "medium",
            "intent": "informational",
        })
        
        # Generate variations (simplified)
        variations = [
            f"{seed_keyword} guide",
            f"{seed_keyword} tips",
            f"best {seed_keyword}",
            f"how to {seed_keyword}",
            f"{seed_keyword} examples",
            f"{seed_keyword} tools",
            f"{seed_keyword} software",
            f"{seed_keyword} services",
        ]
        
        for i, variation in enumerate(variations[:15]):  # Limit to 15 variations
            keywords.append({
                "keyword": variation,
                "search_volume": max(100, 1000 - (i * 50)),  # Decreasing volume
                "difficulty": min(100, 30 + (i * 5)),  # Increasing difficulty
                "cpc": round(0.50 + (i * 0.10), 2),
                "competition": "low" if i < 5 else "medium" if i < 10 else "high",
                "intent": "informational" if i % 2 == 0 else "commercial",
            })
        
        return {
            "seed_keyword": seed_keyword,
            "total_keywords": len(keywords),
            "keywords": keywords,
        }
    except Exception as e:
        logger.error("Error researching keywords: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to research keywords"
        )


@router.post("/research")
@limiter.limit("10/minute")
async def research_keywords_endpoint(
    request: Request,
    body: KeywordResearchRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
):
    """Research keywords based on a seed keyword."""
    # Turnstile verification
    should_bypass = await should_bypass_turnstile(request, body.turnstile_token)
    if not should_bypass:
        from marketing_api.routes.public import verify_turnstile
        await verify_turnstile(body.turnstile_token)

    if not body.seed_keyword or len(body.seed_keyword.strip()) < 2:
        raise HTTPException(status_code=400, detail="Seed keyword must be at least 2 characters")

    # Perform research
    try:
        research_data = await research_keywords(body.seed_keyword.strip())
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Keyword research failed: %s", e)
        raise HTTPException(status_code=500, detail="Research failed")

    # Save to database
    research = KeywordResearch(
        seed_keyword=body.seed_keyword.strip(),
        email=body.email,
        research_json=json.dumps(research_data),
        total_keywords=research_data.get("total_keywords"),
    )
    session.add(research)
    await session.flush()

    # Save individual keywords
    for kw_data in research_data.get("keywords", []):
        keyword = Keyword(
            research_id=research.id,
            keyword=kw_data["keyword"],
            search_volume=kw_data.get("search_volume"),
            difficulty=kw_data.get("difficulty"),
            cpc=kw_data.get("cpc"),
            competition=kw_data.get("competition"),
            intent=kw_data.get("intent"),
        )
        session.add(keyword)

    await session.commit()

    # Capture lead if email provided
    if body.email:
        await upsert_lead(
            session,
            full_name=body.email.split("@")[0],
            email=body.email,
            company=None,
            details=f"Keyword research requested for: {body.seed_keyword}\nTotal keywords found: {research_data.get('total_keywords', 0)}",
            source="keyword_research",
        )
        
        # Send email notification
        keywords_list = "\n".join([
            f"- {kw['keyword']} (Volume: {kw.get('search_volume', 0)}, Difficulty: {kw.get('difficulty', 0)})"
            for kw in research_data.get("keywords", [])[:10]
        ])
        
        background_tasks.add_task(
            send_email,
            to_address=body.email,
            subject="Your Keyword Research Report",
            body=f"""
Thank you for using our Keyword Research Tool!

Your research for "{body.seed_keyword}" is complete.

Total Keywords Found: {research_data.get('total_keywords', 0)}

Top Keywords:
{keywords_list}

View the full report at: {settings.app_url}/keyword-research

Best regards,
Carolina Growth Team
            """,
        )

    # Track feature usage
    capture_feature_usage("keyword_research_used", {"seed_keyword": body.seed_keyword})

    return {
        "seed_keyword": body.seed_keyword,
        "total_keywords": research_data.get("total_keywords"),
        "keywords": research_data.get("keywords", []),
    }
