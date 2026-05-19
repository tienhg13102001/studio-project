#!/usr/bin/env bash
# Deploy / update beezvn.com
# Usage: ./deploy.sh
set -euo pipefail

cd "$(dirname "$0")"

echo "▶ git pull"
git pull --ff-only

echo "▶ docker compose up --build -d"
docker compose up --build -d

echo "▶ pruning dangling images"
docker image prune -f >/dev/null || true

echo "✅ Deploy done. Status:"
docker compose ps
