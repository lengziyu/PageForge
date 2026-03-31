#!/usr/bin/env bash

set -euo pipefail

echo "[1/9] Pull latest code"
git pull

echo "[2/9] Generate Prisma client"
npm run prisma:generate

echo "[3/9] Push Prisma schema"
npm run prisma:push

echo "[4/9] Seed database"
npm run db:seed

echo "[5/9] Build app"
npm run build

echo "[6/9] Reload systemd units"
systemctl daemon-reload

echo "[7/9] Restart pageforge service"
systemctl restart pageforge

echo "[8/9] Test nginx config"
nginx -t

echo "[9/9] Reload nginx"
systemctl reload nginx

echo "Update completed."
