#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

SERVICE_NAME="${SERVICE_NAME:-pageforge}"
PUBLIC_URL="${PUBLIC_URL:-https://pageforge.lengziyu.cn}"

HOST_PORT="$(
  grep -Eo '"[0-9]+:3000"' docker-compose.yml \
    | head -n 1 \
    | tr -d '"' \
    | cut -d: -f1
)"

echo "[1/9] Fetch and pull latest code"
git fetch --all --prune
git pull --ff-only

echo "[2/9] Check host port (${HOST_PORT})"
if [[ -n "${HOST_PORT}" ]]; then
  OCCUPY_LINE="$(ss -lntp 2>/dev/null | awk -v p=":${HOST_PORT}" '$4 ~ p {print; exit}' || true)"
  if [[ -n "${OCCUPY_LINE}" ]]; then
    if ! docker ps --format '{{.Ports}}' | grep -qE "(0\\.0\\.0\\.0|\\[::\\]):${HOST_PORT}->"; then
      echo "Port ${HOST_PORT} is occupied by a non-Docker process:"
      echo "${OCCUPY_LINE}"
      echo "Please free the port first, then run ./update.sh again."
      exit 1
    fi
  fi
fi

echo "[3/9] Build image"
docker compose build --pull "${SERVICE_NAME}"

echo "[4/9] Recreate container"
docker compose up -d --force-recreate "${SERVICE_NAME}"

echo "[5/9] Show container status"
docker compose ps "${SERVICE_NAME}"

echo "[6/9] Local health check"
if [[ -n "${HOST_PORT}" ]]; then
  READY=0
  for i in {1..30}; do
    if curl -fsSIL "http://127.0.0.1:${HOST_PORT}" >/dev/null 2>&1; then
      READY=1
      break
    fi
    sleep 1
  done

  if [[ "${READY}" -ne 1 ]]; then
    echo "Local health check failed after waiting 30s: http://127.0.0.1:${HOST_PORT}"
    docker compose logs --tail=120 "${SERVICE_NAME}" || true
    exit 1
  fi
fi

echo "[7/9] Test nginx config"
if command -v nginx >/dev/null 2>&1; then
  nginx -t
fi

echo "[8/9] Reload nginx"
if command -v systemctl >/dev/null 2>&1; then
  systemctl reload nginx
fi

echo "[9/9] Public health check + latest logs"
curl -fsSIL "${PUBLIC_URL}" >/dev/null
docker compose logs --tail=120 "${SERVICE_NAME}"

echo "Update completed."
