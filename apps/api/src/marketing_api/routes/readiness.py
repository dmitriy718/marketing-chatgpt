import json
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from marketing_api.db.models import Lead
from marketing_api.db.session import get_session
from marketing_api.limits import limiter
from marketing_api.notifications.email import notify_admin, send_email
from marketing_api.routes.public import should_bypass_turnstile, verify_turnstile, upsert_lead

router = APIRouter(prefix="/public/readiness", tags=["readiness"])


class ReadinessAssessmentRequest(BaseModel):
    answers: dict[str, int]  # question_id -> answer_score (1-5)
    email: EmailStr | None = None
    turnstile_token: str | None = None


QUESTIONS = [
    {
        "id": "seo",
        "question": "How would you rate your website's SEO optimization?",
        "options": {
            "1": "We don't have SEO",
            "2": "Basic SEO, not optimized",
            "3": "Some optimization, needs work",
            "4": "Well optimized",
            "5": "Expertly optimized",
        },
    },
    {
        "id": "content",
        "question": "How often do you publish new content (blog, social, etc.)?",
        "options": {
            "1": "Rarely or never",
            "2": "Monthly",
            "3": "Bi-weekly",
            "4": "Weekly",
            "5": "Daily or multiple times per week",
        },
    },
    {
        "id": "leads",
        "question": "How would you rate your lead generation system?",
        "options": {
            "1": "We don't have a system",
            "2": "Basic contact form only",
            "3": "Some automation, manual follow-up",
            "4": "Automated with nurturing",
            "5": "Fully automated with scoring",
        },
    },
    {
        "id": "analytics",
        "question": "How well do you track and analyze your marketing performance?",
        "options": {
            "1": "We don't track anything",
            "2": "Basic website traffic only",
            "3": "Some metrics, not comprehensive",
            "4": "Good tracking, regular reviews",
            "5": "Comprehensive analytics with insights",
        },
    },
    {
        "id": "social",
        "question": "How active and effective is your social media presence?",
        "options": {
            "1": "No social media",
            "2": "Inactive or irregular",
            "3": "Active but low engagement",
            "4": "Regular posts, good engagement",
            "5": "Highly active with strong community",
        },
    },
    {
        "id": "email",
        "question": "How sophisticated is your email marketing?",
        "options": {
            "1": "No email marketing",
            "2": "Occasional newsletters",
            "3": "Regular emails, basic segmentation",
            "4": "Automated sequences, good segmentation",
            "5": "Advanced automation with personalization",
        },
    },
    {
        "id": "conversion",
        "question": "How optimized is your website for conversions?",
        "options": {
            "1": "Not optimized",
            "2": "Basic optimization",
            "3": "Some testing done",
            "4": "Well optimized with testing",
            "5": "Continuously optimized with data",
        },
    },
    {
        "id": "brand",
        "question": "How strong is your brand presence and recognition?",
        "options": {
            "1": "No clear brand",
            "2": "Basic branding",
            "3": "Some brand awareness",
            "4": "Strong brand in local market",
            "5": "Strong brand, recognized widely",
        },
    },
]


def calculate_readiness_score(answers: dict[str, int]) -> dict:
    """Calculate marketing readiness score and recommendations."""
    total_score = sum(answers.values())
    max_score = len(QUESTIONS) * 5
    percentage = (total_score / max_score) * 100

    # Determine level
    if percentage >= 80:
        level = "Advanced"
        message = "You're doing great! Focus on optimization and scaling."
    elif percentage >= 60:
        level = "Intermediate"
        message = "You're on the right track. Focus on filling key gaps."
    elif percentage >= 40:
        level = "Beginner"
        message = "You have a foundation. Significant opportunities for growth."
    else:
        level = "Getting Started"
        message = "You're just beginning. Major opportunities to build your marketing."

    # Find weakest areas
    weakest = sorted(answers.items(), key=lambda x: x[1])[:3]
    recommendations = []
    for q_id, score in weakest:
        question = next((q for q in QUESTIONS if q["id"] == q_id), None)
        if question and score < 3:
            recommendations.append({
                "area": question["id"],
                "question": question["question"],
                "current_score": score,
                "recommendation": f"Focus on improving {question['question'].lower()}",
            })

    return {
        "score": round(percentage, 1),
        "level": level,
        "message": message,
        "total_points": total_score,
        "max_points": max_score,
        "recommendations": recommendations,
        "breakdown": answers,
    }


@router.post("/assess", status_code=status.HTTP_200_OK)
@limiter.limit("5/hour")
async def assess_readiness(
    request: Request,
    payload: ReadinessAssessmentRequest,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Assess marketing readiness."""
    if not should_bypass_turnstile(request):
        await verify_turnstile(payload.turnstile_token)

    # Validate answers
    valid_question_ids = {q["id"] for q in QUESTIONS}
    if not all(qid in valid_question_ids for qid in payload.answers.keys()):
        raise HTTPException(status_code=400, detail="Invalid question IDs")
    if not all(1 <= score <= 5 for score in payload.answers.values()):
        raise HTTPException(status_code=400, detail="Answer scores must be between 1 and 5")

    # Calculate score
    assessment = calculate_readiness_score(payload.answers)
    assessment["questions"] = QUESTIONS

    # Store in database (via lead if email provided)
    if payload.email:
        await upsert_lead(
            session,
            full_name=payload.email.split("@")[0],
            email=payload.email,
            company=None,
            details=f"Marketing Readiness Assessment\nScore: {assessment['score']}%\nLevel: {assessment['level']}",
            source="readiness-assessment",
        )

        # Send email with results
        report_body = f"""
Marketing Readiness Assessment Results

Your Score: {assessment['score']}%
Level: {assessment['level']}

{assessment['message']}

Key Areas to Improve:
"""
        for rec in assessment["recommendations"][:5]:
            report_body += f"\n- {rec['recommendation']}\n"

        report_body += "\n\nReady to improve your marketing readiness?\nBook a free strategy session: https://carolinagrowth.co/contact"

        await send_email(
            to_address=payload.email,
            subject=f"Your Marketing Readiness: {assessment['score']}% - {assessment['level']}",
            body=report_body,
        )

        await notify_admin(
            subject="New marketing readiness assessment",
            body=f"Email: {payload.email}\nScore: {assessment['score']}%\nLevel: {assessment['level']}",
            reply_to=payload.email,
        )

    return assessment


@router.get("/questions", status_code=status.HTTP_200_OK)
async def get_questions() -> dict:
    """Get assessment questions."""
    return {"questions": QUESTIONS}
