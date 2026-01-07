#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$ROOT_DIR/.env"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  . "$ENV_FILE"
  set +a
fi

API_PORT=${API_PORT:-8001}
WEB_PORT=${WEB_PORT:-3001}
POSTGRES_PORT=${POSTGRES_PORT:-5434}

have_cmd() {
  command -v "$1" >/dev/null 2>&1
}

is_port_free() {
  local port=$1
  if have_cmd lsof; then
    lsof -iTCP:"$port" -sTCP:LISTEN -n -P >/dev/null 2>&1 && return 1 || return 0
  fi
  if have_cmd ss; then
    ss -ltn | awk '{print $4}' | grep -q ":$port$" && return 1 || return 0
  fi
  return 0
}

next_free_port() {
  local port=$1
  while ! is_port_free "$port"; do
    port=$((port + 1))
  done
  echo "$port"
}

WEB_PORT=$(next_free_port "$WEB_PORT")
API_PORT=$(next_free_port "$API_PORT")
POSTGRES_PORT=$(next_free_port "$POSTGRES_PORT")

export WEB_PORT API_PORT POSTGRES_PORT
export APP_URL="http://localhost:$WEB_PORT"
export API_URL="http://localhost:$API_PORT"
export NEXT_PUBLIC_SITE_URL="http://localhost:$WEB_PORT"
export DATABASE_URL="postgresql+psycopg://${POSTGRES_USER:-marketing}:${POSTGRES_PASSWORD:-change_me}@localhost:${POSTGRES_PORT}/carolina_growth"

printf "Using ports: web=%s api=%s db=%s\n" "$WEB_PORT" "$API_PORT" "$POSTGRES_PORT"

if have_cmd docker; then
  echo "Starting Postgres (Docker)..."
  docker compose up -d postgres || echo "Docker compose failed. See logs above."
else
  echo "Docker not available. Skipping container startup."
fi

if have_cmd poetry; then
  echo "Installing API dependencies..."
  (cd "$ROOT_DIR/apps/api" && poetry lock) || true
  (cd "$ROOT_DIR/apps/api" && poetry install) || true
  echo "Running migrations..."
  (cd "$ROOT_DIR/apps/api" && poetry run alembic upgrade head) || true
  echo "Seeding data..."
  (cd "$ROOT_DIR/apps/api" && poetry run python3 ../../scripts/seed_data.py) || true
fi

if have_cmd poetry; then
  echo "Starting API..."
  (cd "$ROOT_DIR/apps/api" && poetry run uvicorn marketing_api.main:app --reload --port "$API_PORT") &
fi

if have_cmd npm; then
  if [[ ! -x "$ROOT_DIR/apps/web/node_modules/.bin/next" ]]; then
    echo "Installing web dependencies..."
    (cd "$ROOT_DIR/apps/web" && npm install) || true
  fi
  echo "Starting web..."
  (cd "$ROOT_DIR/apps/web" && npx next dev --webpack --port "$WEB_PORT") &
fi

echo "Web:      http://localhost:$WEB_PORT"
echo "API:      http://localhost:$API_PORT/graphql"

wait
