#!/usr/bin/env python3
"""Create a sample A/B test for testing the platform."""
import asyncio
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT / "apps" / "api" / "src"))

from marketing_api.db.models import ABTest, TestVariant  # noqa: E402
from marketing_api.db.session import SessionLocal  # noqa: E402


async def create_sample_test() -> None:
    """Create a sample A/B test with variants."""
    async with SessionLocal() as session:
        # Check if test already exists
        from sqlalchemy import select
        
        existing = await session.execute(
            select(ABTest).where(ABTest.name == "Sample Homepage CTA Test")
        )
        if existing.scalar_one_or_none():
            print("Sample test already exists!")
            return
        
        # Create test
        test = ABTest(
            name="Sample Homepage CTA Test",
            description="Testing different CTA button colors on homepage to improve conversions",
            target_url="https://carolinagrowth.co",
            conversion_event="button_click",
            traffic_split=json.dumps({"control": 50, "variant_a": 50}),
            status="active",
        )
        session.add(test)
        await session.flush()
        
        # Create variants
        variant_control = TestVariant(
            test_id=test.id,
            name="Control - Blue Button",
            variant_key="control",
            content_json=json.dumps({"button_color": "blue", "button_text": "Get Started"}),
            weight=50,
        )
        
        variant_a = TestVariant(
            test_id=test.id,
            name="Variant A - Green Button",
            variant_key="variant_a",
            content_json=json.dumps({"button_color": "green", "button_text": "Start Free Trial"}),
            weight=50,
        )
        
        session.add(variant_control)
        session.add(variant_a)
        await session.commit()
        
        print(f"✅ Created sample A/B test!")
        print(f"   Test ID: {test.id}")
        print(f"   Name: {test.name}")
        print(f"   Status: {test.status}")
        print(f"   Variants: 2 (Control + Variant A)")


if __name__ == "__main__":
    asyncio.run(create_sample_test())
