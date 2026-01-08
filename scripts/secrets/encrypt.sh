#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PLAINTEXT_PATH="${PLAINTEXT_PATH:-$ROOT_DIR/secrets/.env.prod}"
ENCRYPTED_PATH="${ENCRYPTED_PATH:-$ROOT_DIR/secrets/.env.prod.enc}"
KEEP_PLAINTEXT="${KEEP_PLAINTEXT:-}"

if [[ ! -f "$PLAINTEXT_PATH" ]]; then
  echo "Missing plaintext file: $PLAINTEXT_PATH" >&2
  exit 1
fi

if ! command -v sops >/dev/null 2>&1; then
  echo "sops not installed. Install sops to continue." >&2
  exit 1
fi

sops --encrypt "$PLAINTEXT_PATH" > "$ENCRYPTED_PATH"
echo "Encrypted secrets to $ENCRYPTED_PATH"

if [[ -z "$KEEP_PLAINTEXT" ]]; then
  rm -f "$PLAINTEXT_PATH"
  echo "Removed plaintext file $PLAINTEXT_PATH"
fi
