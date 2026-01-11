import logging
from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from marketing_api.auth.dependencies import get_current_user
from marketing_api.db.models import ConsultationBooking, User
from marketing_api.db.session import get_session

router = APIRouter(prefix="/admin/consultation", tags=["consultation-admin"])
logger = logging.getLogger(__name__)


class BookingCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    company: str | None = None
    scheduled_at: datetime
    duration_minutes: int = 30
    notes: str | None = None


class BookingUpdate(BaseModel):
    scheduled_at: datetime | None = None
    duration_minutes: int | None = None
    status: str | None = None
    notes: str | None = None


@router.get("/bookings")
async def list_bookings(
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    status_filter: str | None = None,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """List consultation bookings with optional filtering."""
    query = select(ConsultationBooking)
    
    if start_date:
        query = query.where(ConsultationBooking.scheduled_at >= start_date)
    if end_date:
        query = query.where(ConsultationBooking.scheduled_at <= end_date)
    if status_filter:
        query = query.where(ConsultationBooking.status == status_filter)
    
    query = query.order_by(ConsultationBooking.scheduled_at.asc())
    
    result = await session.execute(query)
    bookings = result.scalars().all()
    
    return {
        "bookings": [
            {
                "id": str(b.id),
                "name": b.name,
                "email": b.email,
                "phone": b.phone,
                "company": b.company,
                "scheduled_at": b.scheduled_at.isoformat() if b.scheduled_at else None,
                "duration_minutes": b.duration_minutes,
                "status": b.status,
                "notes": b.notes,
                "created_at": b.created_at.isoformat() if b.created_at else None,
            }
            for b in bookings
        ]
    }


@router.post("/bookings", status_code=status.HTTP_201_CREATED)
async def create_booking(
    payload: BookingCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Create a new consultation booking."""
    booking = ConsultationBooking(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        company=payload.company,
        scheduled_at=payload.scheduled_at,
        duration_minutes=payload.duration_minutes,
        notes=payload.notes,
    )
    session.add(booking)
    await session.commit()
    await session.refresh(booking)
    
    return {
        "id": str(booking.id),
        "name": booking.name,
        "email": booking.email,
        "scheduled_at": booking.scheduled_at.isoformat() if booking.scheduled_at else None,
        "status": booking.status,
    }


@router.put("/bookings/{booking_id}")
async def update_booking(
    booking_id: UUID,
    payload: BookingUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Update a consultation booking."""
    result = await session.execute(
        select(ConsultationBooking).where(ConsultationBooking.id == booking_id)
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if payload.scheduled_at is not None:
        booking.scheduled_at = payload.scheduled_at
    if payload.duration_minutes is not None:
        booking.duration_minutes = payload.duration_minutes
    if payload.status is not None:
        booking.status = payload.status
    if payload.notes is not None:
        booking.notes = payload.notes
    
    await session.commit()
    await session.refresh(booking)
    
    return {
        "id": str(booking.id),
        "name": booking.name,
        "email": booking.email,
        "scheduled_at": booking.scheduled_at.isoformat() if booking.scheduled_at else None,
        "status": booking.status,
    }


@router.delete("/bookings/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_booking(
    booking_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> None:
    """Delete a consultation booking."""
    result = await session.execute(
        select(ConsultationBooking).where(ConsultationBooking.id == booking_id)
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    await session.delete(booking)
    await session.commit()


@router.get("/availability")
async def get_availability(
    start_date: datetime,
    end_date: datetime,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Get available time slots between start_date and end_date."""
    # Get all bookings in the date range
    result = await session.execute(
        select(ConsultationBooking)
        .where(
            ConsultationBooking.scheduled_at >= start_date,
            ConsultationBooking.scheduled_at <= end_date,
            ConsultationBooking.status != "canceled",
        )
    )
    bookings = result.scalars().all()
    
    # Return booked times (simplified - in production, you'd calculate available slots)
    booked_times = [
        {
            "start": b.scheduled_at.isoformat() if b.scheduled_at else None,
            "end": (
                (b.scheduled_at + timedelta(minutes=b.duration_minutes)).isoformat()
                if b.scheduled_at
                else None
            ),
            "name": b.name,
        }
        for b in bookings
    ]
    
    return {
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "booked_times": booked_times,
    }
