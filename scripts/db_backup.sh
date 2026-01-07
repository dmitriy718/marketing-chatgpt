#!/usr/bin/env bash
set -euo pipefail

ENV_FILE=${1:-.env.prod}
BACKUP_DIR=${2:-./backups}
CONTAINER_NAME=${POSTGRES_CONTAINER:-marketing_postgres}

if [[ -f "$ENV_FILE" ]]; then
  set -a
  . "$ENV_FILE"
  set +a
fi

mkdir -p "$BACKUP_DIR"

if [[ -z "${POSTGRES_DB:-}" || -z "${POSTGRES_USER:-}" || -z "${POSTGRES_PASSWORD:-}" ]]; then
  echo "Missing POSTGRES_DB/POSTGRES_USER/POSTGRES_PASSWORD in $ENV_FILE" >&2
  exit 1
fi

STAMP=$(date +%Y%m%d_%H%M%S)
OUT_FILE="$BACKUP_DIR/marketing_${STAMP}.sql"

docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" -t "$CONTAINER_NAME" \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$OUT_FILE"

echo "Backup saved to $OUT_FILE"
