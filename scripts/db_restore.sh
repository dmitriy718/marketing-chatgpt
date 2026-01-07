#!/usr/bin/env bash
set -euo pipefail

ENV_FILE=${1:-.env.prod}
BACKUP_FILE=${2:-}
CONTAINER_NAME=${POSTGRES_CONTAINER:-carolina_growth_postgres}

if [[ -z "$BACKUP_FILE" ]]; then
  echo "Usage: $0 [env_file] backup_file.sql" >&2
  exit 1
fi

if [[ -f "$ENV_FILE" ]]; then
  set -a
  . "$ENV_FILE"
  set +a
fi

if [[ -z "${POSTGRES_DB:-}" || -z "${POSTGRES_USER:-}" || -z "${POSTGRES_PASSWORD:-}" ]]; then
  echo "Missing POSTGRES_DB/POSTGRES_USER/POSTGRES_PASSWORD in $ENV_FILE" >&2
  exit 1
fi

cat "$BACKUP_FILE" | docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" -i "$CONTAINER_NAME" \
  psql -U "$POSTGRES_USER" "$POSTGRES_DB"

echo "Restore completed from $BACKUP_FILE"
