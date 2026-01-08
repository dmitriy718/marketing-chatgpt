#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENCRYPTED_PATH="${ENCRYPTED_PATH:-$ROOT_DIR/secrets/.env.prod.enc}"
PLAINTEXT_PATH="${PLAINTEXT_PATH:-$ROOT_DIR/secrets/.env.prod}"

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

sops --decrypt "$ENCRYPTED_PATH" > "$PLAINTEXT_PATH"
chmod 600 "$PLAINTEXT_PATH"
echo "Decrypted secrets to $PLAINTEXT_PATH"
