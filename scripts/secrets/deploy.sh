#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENCRYPTED_PATH="${ENCRYPTED_PATH:-$ROOT_DIR/secrets/.env.prod.enc}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/marketing/.env.prod}"

if [[ ! -f "$ENCRYPTED_PATH" ]]; then
  echo "Missing encrypted file: $ENCRYPTED_PATH" >&2
  exit 1
fi

if ! command -v sops >/dev/null 2>&1; then
  echo "sops not installed. Install sops to continue." >&2
  exit 1
fi

SOPS_AGE_KEY_FILE="${SOPS_AGE_KEY_FILE:-/opt/marketing/private/age/keys.txt}"
export SOPS_AGE_KEY_FILE

tmp_file="$(mktemp)"
sops --decrypt "$ENCRYPTED_PATH" > "$tmp_file"
chmod 600 "$tmp_file"

mkdir -p "$(dirname "$DEPLOY_PATH")"
mv "$tmp_file" "$DEPLOY_PATH"
chmod 600 "$DEPLOY_PATH"

echo "Secrets deployed to $DEPLOY_PATH"
echo "Run: docker compose -f /opt/marketing/docker-compose.prod.yml --env-file /opt/marketing/.env.prod up -d --build"
