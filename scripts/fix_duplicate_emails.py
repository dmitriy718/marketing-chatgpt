#!/usr/bin/env python3
"""
Fix duplicate emails in leads table.

This script:
1. Finds all duplicate emails
2. Keeps the most recent lead for each email (by created_at)
3. Merges important data from older leads into the kept lead
4. Deletes the duplicate leads
5. Verifies no duplicates remain
"""

import asyncio
import sys
from datetime import datetime
from typing import Any

import asyncpg
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "").replace("+psycopg", "").replace("+asyncpg", "")


async def get_duplicates(conn: asyncpg.Connection) -> list[dict[str, Any]]:
    """Find all duplicate emails."""
    query = """
        SELECT email, COUNT(*) as count
        FROM leads
        WHERE email IS NOT NULL
        GROUP BY email
        HAVING COUNT(*) > 1
        ORDER BY count DESC;
    """
    rows = await conn.fetch(query)
    return [dict(row) for row in rows]


async def get_leads_for_email(conn: asyncpg.Connection, email: str) -> list[dict[str, Any]]:
    """Get all leads with a specific email, ordered by created_at."""
    query = """
        SELECT id, email, full_name, company, phone, budget, details, source, status, created_at
        FROM leads
        WHERE email = $1
        ORDER BY created_at DESC;
    """
    rows = await conn.fetch(query, email)
    return [dict(row) for row in rows]


async def merge_lead_data(kept_lead: dict, duplicate_lead: dict) -> dict:
    """Merge data from duplicate lead into kept lead."""
    # Keep the most recent created_at
    if duplicate_lead["created_at"] > kept_lead["created_at"]:
        kept_lead["created_at"] = duplicate_lead["created_at"]
    
    # Merge full_name if kept is empty/null
    if not kept_lead.get("full_name") and duplicate_lead.get("full_name"):
        kept_lead["full_name"] = duplicate_lead["full_name"]
    
    # Merge company if kept is empty/null
    if not kept_lead.get("company") and duplicate_lead.get("company"):
        kept_lead["company"] = duplicate_lead["company"]
    
    # Merge phone if kept is empty/null
    if not kept_lead.get("phone") and duplicate_lead.get("phone"):
        kept_lead["phone"] = duplicate_lead["phone"]
    
    # Merge budget if kept is empty/null
    if not kept_lead.get("budget") and duplicate_lead.get("budget"):
        kept_lead["budget"] = duplicate_lead["budget"]
    
    # Append details if both exist
    if kept_lead.get("details") and duplicate_lead.get("details"):
        if kept_lead["details"] != duplicate_lead["details"]:
            kept_lead["details"] = f"{kept_lead['details']}\n\n--- Merged from duplicate lead ---\n{duplicate_lead['details']}"
    elif duplicate_lead.get("details"):
        kept_lead["details"] = duplicate_lead["details"]
    
    # Keep the most recent source if different
    if duplicate_lead.get("source") and duplicate_lead["source"] != kept_lead.get("source"):
        kept_lead["source"] = duplicate_lead["source"]
    
    # Keep the most advanced status
    status_priority = {"converted": 4, "qualified": 3, "nurturing": 2, "new": 1, "lost": 0}
    kept_priority = status_priority.get(kept_lead.get("status", "new"), 1)
    dup_priority = status_priority.get(duplicate_lead.get("status", "new"), 1)
    if dup_priority > kept_priority:
        kept_lead["status"] = duplicate_lead["status"]
    
    return kept_lead


async def fix_duplicates() -> None:
    """Main function to fix duplicate emails."""
    if not DATABASE_URL:
        print("ERROR: DATABASE_URL not set")
        sys.exit(1)
    
    conn = await asyncpg.connect(DATABASE_URL)
    
    try:
        # Find all duplicates
        duplicates = await get_duplicates(conn)
        
        if not duplicates:
            print("✅ No duplicate emails found!")
            return
        
        print(f"Found {len(duplicates)} email(s) with duplicates:")
        for dup in duplicates:
            print(f"  - {dup['email']}: {dup['count']} leads")
        
        total_fixed = 0
        total_deleted = 0
        
        # Process each duplicate email
        for dup_info in duplicates:
            email = dup_info["email"]
            print(f"\nProcessing: {email}")
            
            # Get all leads with this email
            leads = await get_leads_for_email(conn, email)
            
            if len(leads) <= 1:
                continue
            
            # Keep the most recent lead (first in DESC order)
            kept_lead = leads[0].copy()
            duplicate_leads = leads[1:]
            
            print(f"  Keeping lead {kept_lead['id']} (created: {kept_lead['created_at']})")
            print(f"  Merging {len(duplicate_leads)} duplicate(s)...")
            
            # Merge data from duplicates
            for dup_lead in duplicate_leads:
                kept_lead = merge_lead_data(kept_lead, dup_lead)
            
            # Update the kept lead with merged data
            await conn.execute(
                """
                UPDATE leads
                SET full_name = COALESCE($1, full_name),
                    company = COALESCE($2, company),
                    phone = COALESCE($3, phone),
                    budget = COALESCE($4, budget),
                    details = COALESCE($5, details),
                    source = COALESCE($6, source),
                    status = COALESCE($7, status),
                    created_at = LEAST(created_at, $8)
                WHERE id = $9
                """,
                kept_lead.get("full_name"),
                kept_lead.get("company"),
                kept_lead.get("phone"),
                kept_lead.get("budget"),
                kept_lead.get("details"),
                kept_lead.get("source"),
                kept_lead.get("status"),
                kept_lead["created_at"],
                kept_lead["id"],
            )
            
            # Delete duplicate leads
            dup_ids = [lead["id"] for lead in duplicate_leads]
            deleted = await conn.execute(
                "DELETE FROM leads WHERE id = ANY($1::uuid[])",
                dup_ids,
            )
            deleted_count = int(deleted.split()[-1])
            total_deleted += deleted_count
            
            print(f"  ✅ Merged and deleted {deleted_count} duplicate(s)")
            total_fixed += 1
        
        # Verify no duplicates remain
        remaining = await get_duplicates(conn)
        if remaining:
            print(f"\n⚠️  WARNING: {len(remaining)} duplicate(s) still remain!")
            for dup in remaining:
                print(f"  - {dup['email']}: {dup['count']} leads")
        else:
            print(f"\n✅ Successfully fixed all duplicates!")
            print(f"   - Fixed {total_fixed} email(s)")
            print(f"   - Deleted {total_deleted} duplicate lead(s)")
        
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(fix_duplicates())
