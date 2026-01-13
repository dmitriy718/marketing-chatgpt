#!/usr/bin/env python3
"""Create backlink analyzer tables if they don't exist."""
import asyncio
import sys
from pathlib import Path

# Add the src directory to the path
sys.path.insert(0, str(Path(__file__).parent.parent / "apps" / "api" / "src"))

from sqlalchemy import text
from marketing_api.db.session import get_async_engine


async def create_tables():
    """Create backlink analyzer tables."""
    engine = get_async_engine()
    
    async with engine.begin() as conn:
        # Create backlink_analyses table
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS backlink_analyses (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                url VARCHAR(500) NOT NULL,
                email VARCHAR(255),
                status VARCHAR(50) NOT NULL DEFAULT 'pending',
                analysis_json TEXT,
                quality_score INTEGER,
                total_backlinks INTEGER,
                referring_domains INTEGER,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            )
        """))
        
        # Create indexes
        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS ix_backlink_analyses_url 
            ON backlink_analyses (url)
        """))
        
        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS ix_backlink_analyses_email 
            ON backlink_analyses (email)
        """))
        
        # Create backlinks table
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS backlinks (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                analysis_id UUID NOT NULL,
                source_url VARCHAR(500) NOT NULL,
                target_url VARCHAR(500) NOT NULL,
                anchor_text VARCHAR(500),
                link_type VARCHAR(50),
                domain_authority INTEGER,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                CONSTRAINT fk_backlinks_analysis_id 
                    FOREIGN KEY (analysis_id) 
                    REFERENCES backlink_analyses(id) 
                    ON DELETE CASCADE
            )
        """))
        
        # Create index for backlinks
        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS ix_backlinks_analysis_id 
            ON backlinks (analysis_id)
        """))
        
        print("✅ Backlink analyzer tables created successfully!")


if __name__ == "__main__":
    asyncio.run(create_tables())
