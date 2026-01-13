import json
import logging
import random
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from marketing_api.db.models import ABTest, TestAssignment, TestConversion, TestVariant
from marketing_api.db.session import get_session
from marketing_api.limits import limiter
from marketing_api.posthog_client import capture_feature_usage

router = APIRouter(prefix="/public/ab-testing", tags=["ab-testing"])
logger = logging.getLogger(__name__)


class CreateTestRequest(BaseModel):
    name: str
    description: str | None = None
    target_url: str
    conversion_event: str
    traffic_split: dict[str, int]  # {"control": 50, "variant": 50}


class VariantRequest(BaseModel):
    name: str
    variant_key: str
    content_json: str
    weight: int = 50


class AssignVariantRequest(BaseModel):
    test_id: str
    user_id: str | None = None
    session_id: str | None = None


class TrackConversionRequest(BaseModel):
    test_id: str
    event_name: str
    user_id: str | None = None
    session_id: str | None = None


@router.post("/tests")
@limiter.limit("10/minute")
async def create_test(
    request: Request,
    body: CreateTestRequest,
    session: AsyncSession = Depends(get_session),
):
    """Create a new A/B test."""
    test = ABTest(
        name=body.name,
        description=body.description,
        target_url=body.target_url,
        conversion_event=body.conversion_event,
        traffic_split=json.dumps(body.traffic_split),
        status="draft",
    )
    session.add(test)
    await session.flush()
    await session.commit()
    
    capture_feature_usage("ab_test_created", {"test_id": str(test.id)})
    
    return {"test_id": str(test.id), "status": "created"}


@router.post("/tests/{test_id}/variants")
@limiter.limit("20/minute")
async def add_variant(
    request: Request,
    test_id: str,
    body: VariantRequest,
    session: AsyncSession = Depends(get_session),
):
    """Add a variant to an A/B test."""
    test = await session.get(ABTest, uuid.UUID(test_id))
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    variant = TestVariant(
        test_id=test.id,
        name=body.name,
        variant_key=body.variant_key,
        content_json=body.content_json,
        weight=body.weight,
    )
    session.add(variant)
    await session.commit()
    
    return {"variant_id": str(variant.id), "status": "created"}


@router.post("/assign")
@limiter.limit("100/minute")
async def assign_variant(
    request: Request,
    body: AssignVariantRequest,
    session: AsyncSession = Depends(get_session),
):
    """Assign a user/session to a test variant."""
    test = await session.get(ABTest, uuid.UUID(body.test_id))
    if not test or test.status != "active":
        return {"variant_key": "control", "content": None}
    
    # Check if already assigned
    query = select(TestAssignment).where(TestAssignment.test_id == test.id)
    if body.user_id:
        query = query.where(TestAssignment.user_id == body.user_id)
    elif body.session_id:
        query = query.where(TestAssignment.session_id == body.session_id)
    
    result = await session.execute(query.limit(1))
    existing = result.scalar_one_or_none()
    
    if existing:
        variant = await session.get(TestVariant, existing.variant_id)
        return {
            "variant_key": variant.variant_key,
            "content": json.loads(variant.content_json) if variant.content_json else None,
        }
    
    # Get all variants with weights
    variants_result = await session.execute(
        select(TestVariant).where(TestVariant.test_id == test.id)
    )
    variants = variants_result.scalars().all()
    
    if not variants:
        return {"variant_key": "control", "content": None}
    
    # Weighted random selection
    total_weight = sum(v.weight for v in variants)
    rand = random.randint(1, total_weight)
    cumulative = 0
    selected_variant = variants[0]
    
    for variant in variants:
        cumulative += variant.weight
        if rand <= cumulative:
            selected_variant = variant
            break
    
    # Create assignment
    assignment = TestAssignment(
        test_id=test.id,
        variant_id=selected_variant.id,
        user_id=body.user_id,
        session_id=body.session_id,
    )
    session.add(assignment)
    await session.commit()
    
    return {
        "variant_key": selected_variant.variant_key,
        "content": json.loads(selected_variant.content_json) if selected_variant.content_json else None,
    }


@router.post("/conversion")
@limiter.limit("100/minute")
async def track_conversion(
    request: Request,
    body: TrackConversionRequest,
    session: AsyncSession = Depends(get_session),
):
    """Track a conversion event for an A/B test."""
    test = await session.get(ABTest, uuid.UUID(body.test_id))
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    # Find assignment
    query = select(TestAssignment).where(TestAssignment.test_id == test.id)
    if body.user_id:
        query = query.where(TestAssignment.user_id == body.user_id)
    elif body.session_id:
        query = query.where(TestAssignment.session_id == body.session_id)
    
    result = await session.execute(query.order_by(TestAssignment.assigned_at.desc()).limit(1))
    assignment = result.scalar_one_or_none()
    
    if not assignment:
        raise HTTPException(status_code=400, detail="No assignment found for this user/session")
    
    # Check if conversion already tracked
    existing = await session.execute(
        select(TestConversion)
        .where(TestConversion.assignment_id == assignment.id)
        .where(TestConversion.event_name == body.event_name)
        .limit(1)
    )
    if existing.scalar_one_or_none():
        return {"status": "already_tracked"}
    
    conversion = TestConversion(
        test_id=test.id,
        variant_id=assignment.variant_id,
        assignment_id=assignment.id,
        user_id=body.user_id,
        event_name=body.event_name,
    )
    session.add(conversion)
    await session.commit()
    
    capture_feature_usage("ab_test_conversion", {"test_id": body.test_id, "event": body.event_name})
    
    return {"status": "tracked"}


@router.get("/tests/{test_id}/results")
@limiter.limit("30/minute")
async def get_test_results(
    request: Request,
    test_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Get A/B test results with statistical analysis."""
    test = await session.get(ABTest, uuid.UUID(test_id))
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    # Get variants
    variants_result = await session.execute(
        select(TestVariant).where(TestVariant.test_id == test.id)
    )
    variants = variants_result.scalars().all()
    
    results = []
    for variant in variants:
        # Count assignments
        assignments_count = await session.execute(
            select(func.count(TestAssignment.id))
            .where(TestAssignment.variant_id == variant.id)
        )
        visitors = assignments_count.scalar() or 0
        
        # Count conversions
        conversions_count = await session.execute(
            select(func.count(TestConversion.id))
            .where(TestConversion.variant_id == variant.id)
            .where(TestConversion.event_name == test.conversion_event)
        )
        conversions = conversions_count.scalar() or 0
        
        conversion_rate = (conversions / visitors * 100) if visitors > 0 else 0
        
        results.append({
            "variant_key": variant.variant_key,
            "name": variant.name,
            "visitors": visitors,
            "conversions": conversions,
            "conversion_rate": round(conversion_rate, 2),
        })
    
    return {"test_id": test_id, "results": results}
