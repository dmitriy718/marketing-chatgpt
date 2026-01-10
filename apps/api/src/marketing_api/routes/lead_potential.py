from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from marketing_api.db.session import get_session
from marketing_api.limits import limiter
from marketing_api.notifications.email import notify_admin, send_email
from marketing_api.routes.public import should_bypass_turnstile, verify_turnstile, upsert_lead

router = APIRouter(prefix="/public/lead-potential", tags=["lead-potential"])


class LeadPotentialRequest(BaseModel):
    industry: str
    monthly_website_visitors: int
    current_conversion_rate: float  # percentage
    average_deal_value: float
    email: str | None = None
    turnstile_token: str | None = None


def calculate_lead_potential(
    industry: str, visitors: int, current_rate: float, deal_value: float
) -> dict:
    """Calculate lead generation potential."""
    # Industry benchmarks (conversion rates)
    benchmarks = {
        "ecommerce": 2.5,
        "saas": 2.0,
        "services": 3.0,
        "healthcare": 1.5,
        "real_estate": 1.0,
        "legal": 2.5,
        "other": 2.0,
    }
    
    benchmark_rate = benchmarks.get(industry.lower(), 2.0)
    
    # Current performance
    current_leads = int(visitors * (current_rate / 100))
    current_revenue = current_leads * deal_value
    
    # Potential with optimization
    optimized_rate = min(benchmark_rate * 1.5, 5.0)  # Cap at 5%
    potential_leads = int(visitors * (optimized_rate / 100))
    potential_revenue = potential_leads * deal_value
    
    # Improvement
    lead_increase = potential_leads - current_leads
    revenue_increase = potential_revenue - current_revenue
    improvement_percentage = ((optimized_rate - current_rate) / current_rate * 100) if current_rate > 0 else 100
    
    return {
        "current": {
            "conversion_rate": current_rate,
            "leads_per_month": current_leads,
            "revenue_per_month": current_revenue,
        },
        "potential": {
            "conversion_rate": optimized_rate,
            "leads_per_month": potential_leads,
            "revenue_per_month": potential_revenue,
        },
        "improvement": {
            "lead_increase": lead_increase,
            "revenue_increase": revenue_increase,
            "improvement_percentage": round(improvement_percentage, 1),
        },
        "benchmark": {
            "industry_average": benchmark_rate,
            "your_current": current_rate,
        },
    }


@router.post("/calculate", status_code=status.HTTP_200_OK)
@limiter.limit("10/hour")
async def calculate_potential(
    request: Request,
    payload: LeadPotentialRequest,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Calculate lead generation potential."""
    if not should_bypass_turnstile(request):
        await verify_turnstile(payload.turnstile_token)
    
    if payload.monthly_website_visitors < 0:
        raise HTTPException(status_code=400, detail="Visitors must be positive")
    if payload.current_conversion_rate < 0 or payload.current_conversion_rate > 100:
        raise HTTPException(status_code=400, detail="Conversion rate must be between 0 and 100")
    if payload.average_deal_value < 0:
        raise HTTPException(status_code=400, detail="Deal value must be positive")
    
    result = calculate_lead_potential(
        payload.industry,
        payload.monthly_website_visitors,
        payload.current_conversion_rate,
        payload.average_deal_value,
    )
    
    # Capture as lead if email provided
    if payload.email:
        await upsert_lead(
            session,
            full_name=payload.email.split("@")[0],
            email=payload.email,
            company=None,
            details=f"Lead Potential Calculator\nIndustry: {payload.industry}\nPotential Revenue Increase: ${result['improvement']['revenue_increase']:,.0f}/month",
            source="lead-potential-calculator",
        )
        
        # Send email with results
        report_body = f"""
Lead Generation Potential Analysis

CURRENT PERFORMANCE
Conversion Rate: {result['current']['conversion_rate']}%
Leads per Month: {result['current']['leads_per_month']}
Revenue per Month: ${result['current']['revenue_per_month']:,.0f}

POTENTIAL WITH OPTIMIZATION
Conversion Rate: {result['potential']['conversion_rate']}%
Leads per Month: {result['potential']['leads_per_month']}
Revenue per Month: ${result['potential']['revenue_per_month']:,.0f}

OPPORTUNITY
Additional Leads: {result['improvement']['lead_increase']} per month
Additional Revenue: ${result['improvement']['revenue_increase']:,.0f} per month
Improvement: {result['improvement']['improvement_percentage']}%

Ready to unlock this potential?
Book a free strategy session: https://carolinagrowth.co/contact
"""
        
        await send_email(
            to_address=payload.email,
            subject=f"Your Lead Generation Potential: ${result['improvement']['revenue_increase']:,.0f}/month",
            body=report_body,
        )
        
        await notify_admin(
            subject="New lead potential calculation",
            body=f"Email: {payload.email}\nPotential increase: ${result['improvement']['revenue_increase']:,.0f}/month",
            reply_to=payload.email,
        )
    
    return result
