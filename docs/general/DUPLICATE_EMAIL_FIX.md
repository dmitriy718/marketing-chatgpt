# Duplicate Email Issue - Permanent Fix
## Date: 2026-01-11

## Problem

The leads table had duplicate emails, preventing the unique email constraint migration (`197326810f81_add_unique_email_to_leads`) from running successfully. Specifically:
- 14 leads with email `qa@carolinagrowth.co` (from E2E testing)
- Migration failed with: `UniqueViolation: could not create unique index "uq_leads_email_not_null"`

## Solution

### Step 1: Clean Up Duplicates
- Identified all duplicate emails using SQL query
- For each duplicate email:
  - Kept the most recent lead (by `created_at`)
  - Merged data from older duplicates into the kept lead
  - Deleted all duplicate leads

### Step 2: Create Unique Index
- Created unique index directly: `uq_leads_email_not_null`
- Index only applies to non-null emails (allows multiple NULL values)
- Prevents future duplicate emails at database level

### Step 3: Mark Migration Complete
- Stamped migration as complete using `alembic stamp`
- Verified no duplicates remain

## Results

### Before
- Total leads: 22
- Unique emails: 9
- Duplicates: 13 leads

### After
- Total leads: 9
- Unique emails: 9
- Duplicates: 0

### Verification
- ✅ No duplicate emails remain
- ✅ Unique index created and active
- ✅ Constraint tested and working (duplicate insert fails)
- ✅ Migration marked as complete

## Prevention

The unique index `uq_leads_email_not_null` now prevents any future duplicate emails:
- Database-level enforcement
- Automatic rejection of duplicate inserts
- No application-level checks needed

## Script

A cleanup script was created at `scripts/fix_duplicate_emails.py` for future use if needed:
- Finds all duplicate emails
- Merges data intelligently
- Deletes duplicates
- Verifies cleanup

## SQL Used

```sql
-- Clean up duplicates
DO $$
DECLARE
    keep_id UUID;
BEGIN
    SELECT id INTO keep_id
    FROM leads
    WHERE email = 'qa@carolinagrowth.co'
    ORDER BY created_at DESC
    LIMIT 1;
    
    UPDATE leads
    SET 
        full_name = COALESCE(full_name, ...),
        company = COALESCE(company, ...),
        -- Merge other fields
    WHERE id = keep_id;
    
    DELETE FROM leads
    WHERE email = 'qa@carolinagrowth.co'
    AND id != keep_id;
END $$;

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS uq_leads_email_not_null 
ON leads (email) 
WHERE email IS NOT NULL;
```

## Status

✅ **PERMANENTLY FIXED** - The duplicate email issue will not occur again. The unique constraint is now active and enforced at the database level.
