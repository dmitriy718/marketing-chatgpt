#!/usr/bin/env bash
# Automated Database Backup Script
# Runs daily via cron to backup PostgreSQL database
# Usage: Add to crontab: 0 2 * * * /opt/marketing/scripts/db_backup_automated.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
CONTAINER_NAME="${POSTGRES_CONTAINER:-carolina_growth_postgres}"

# Load environment variables
ENV_FILE="${ENV_FILE:-$PROJECT_ROOT/.env.prod}"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  . "$ENV_FILE"
  set +a
fi

# Validate required variables
if [[ -z "${POSTGRES_DB:-}" || -z "${POSTGRES_USER:-}" || -z "${POSTGRES_PASSWORD:-}" ]]; then
  echo "ERROR: Missing POSTGRES_DB/POSTGRES_USER/POSTGRES_PASSWORD in $ENV_FILE" >&2
  exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
STAMP=$(date +%Y%m%d_%H%M%S)
OUT_FILE="$BACKUP_DIR/marketing_${STAMP}.sql"
COMPRESSED_FILE="${OUT_FILE}.gz"

# Perform backup
echo "[$(date +%Y-%m-%d\ %H:%M:%S)] Starting database backup..."
if docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" -t "$CONTAINER_NAME" \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$OUT_FILE" 2>&1; then
  
  # Compress backup
  gzip "$OUT_FILE"
  
  # Verify compressed backup exists and has content
  if [[ -f "$COMPRESSED_FILE" && -s "$COMPRESSED_FILE" ]]; then
    SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
    echo "[$(date +%Y-%m-%d\ %H:%M:%S)] Backup successful: $COMPRESSED_FILE ($SIZE)"
    
    # Clean up old backups (keep last N days)
    find "$BACKUP_DIR" -name "marketing_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
    echo "[$(date +%Y-%m-%d\ %H:%M:%S)] Cleaned up backups older than $RETENTION_DAYS days"
    
    exit 0
  else
    echo "ERROR: Backup file is empty or missing" >&2
    exit 1
  fi
else
  echo "ERROR: Backup failed" >&2
  exit 1
fi
