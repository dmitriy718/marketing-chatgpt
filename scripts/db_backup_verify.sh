#!/usr/bin/env bash
# Database Backup Verification Script
# Verifies that a backup file is valid and can be restored
# Usage: ./db_backup_verify.sh <backup_file.sql.gz>

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <backup_file.sql.gz>" >&2
  exit 1
fi

BACKUP_FILE="$1"
TEMP_DIR=$(mktemp -d)
TEST_DB="backup_verify_$(date +%s)"

# Cleanup function
cleanup() {
  rm -rf "$TEMP_DIR"
  # Try to drop test database (may fail if container doesn't exist, that's ok)
  docker exec "$CONTAINER_NAME" psql -U "$POSTGRES_USER" -d postgres -c "DROP DATABASE IF EXISTS $TEST_DB;" 2>/dev/null || true
}

trap cleanup EXIT

# Load environment
ENV_FILE="${ENV_FILE:-.env.prod}"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  . "$ENV_FILE"
  set +a
fi

CONTAINER_NAME="${POSTGRES_CONTAINER:-carolina_growth_postgres}"

if [[ -z "${POSTGRES_USER:-}" || -z "${POSTGRES_PASSWORD:-}" ]]; then
  echo "ERROR: Missing POSTGRES_USER/POSTGRES_PASSWORD" >&2
  exit 1
fi

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "ERROR: Backup file not found: $BACKUP_FILE" >&2
  exit 1
fi

echo "Verifying backup: $BACKUP_FILE"

# Decompress backup
echo "Decompressing backup..."
gunzip -c "$BACKUP_FILE" > "$TEMP_DIR/backup.sql"

# Check SQL file has content
if [[ ! -s "$TEMP_DIR/backup.sql" ]]; then
  echo "ERROR: Backup file is empty" >&2
  exit 1
fi

# Check for SQL syntax (basic check - should contain CREATE TABLE or similar)
if ! grep -q -i "CREATE\|INSERT\|COPY" "$TEMP_DIR/backup.sql" 2>/dev/null; then
  echo "WARNING: Backup file may not contain valid SQL" >&2
fi

# Try to restore to test database
echo "Testing restore to temporary database..."
docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" -i "$CONTAINER_NAME" \
  psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE $TEST_DB;" 2>/dev/null || {
  echo "ERROR: Could not create test database" >&2
  exit 1
}

if docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" -i "$CONTAINER_NAME" \
  psql -U "$POSTGRES_USER" -d "$TEST_DB" < "$TEMP_DIR/backup.sql" > /dev/null 2>&1; then
  
  # Verify tables were created
  TABLE_COUNT=$(docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" -t "$CONTAINER_NAME" \
    psql -U "$POSTGRES_USER" -d "$TEST_DB" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" -t | tr -d ' ')
  
  if [[ "$TABLE_COUNT" -gt 0 ]]; then
    echo "SUCCESS: Backup verified - $TABLE_COUNT tables restored"
    exit 0
  else
    echo "WARNING: Backup restored but no tables found" >&2
    exit 1
  fi
else
  echo "ERROR: Backup restore failed" >&2
  exit 1
fi
