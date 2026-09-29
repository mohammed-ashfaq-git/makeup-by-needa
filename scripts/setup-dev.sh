#!/usr/bin/env bash
#
# One-command local bootstrap — no root, no apt, no system packages.
#
#   1. creates .env pointing at the local dev database (if missing)
#   2. boots the private MySQL 5.7 dev instance (scripts/dev-db.sh)
#   3. applies Drizzle migrations
#   4. seeds CMS content (idempotent — never overwrites existing rows)
#
# The dev database keeps running in this process afterwards, so open a
# second terminal and run `npm run dev` when the setup prints done.
#
# Usage:
#   npm run setup:dev
#
# First run downloads the MySQL server binaries (~50 MB) and compiles the
# one missing library (libaio) — everything lives in ~/.cache/mysql-dev.
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT="${MYSQL_DEV_PORT:-3306}"
DB="${MYSQL_DEV_DB:-makeup_by_needa}"
DB_USER="${MYSQL_DEV_USER:-mbn_app}"
DB_PASS="${MYSQL_DEV_PASSWORD:-dev-mbn-3f9a2c}"

if [ ! -f .env ]; then
  cat > .env <<EOF
# Local development (created by npm run setup:dev)
DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@127.0.0.1:${PORT}/${DB}"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
EOF
  echo "✓ Created .env pointing at the local dev database"
else
  if ! grep -q '127\.0\.0\.1' .env; then
    echo "⚠ .env already exists and does not mention 127.0.0.1 —"
    echo "  migrations/seed will run against whatever DATABASE_URL it contains."
  else
    echo "✓ .env already exists (leaving it untouched)"
  fi
fi

echo "→ Booting the private MySQL dev instance (first run takes a while)…"
bash scripts/dev-db.sh &
DB_PID=$!
cleanup() { kill "$DB_PID" 2>/dev/null || true; }
trap cleanup EXIT INT TERM

for i in $(seq 1 300); do
  if node -e "
const net = require('net');
const s = net.connect($PORT, '127.0.0.1');
s.on('connect', () => { s.end(); process.exit(0); });
s.on('error', () => process.exit(1));
setTimeout(() => process.exit(1), 1000);
" >/dev/null 2>&1; then
    break
  fi
  if ! kill -0 "$DB_PID" 2>/dev/null; then
    echo "✗ Dev database failed to start — see output above." >&2
    exit 1
  fi
  if [ "$i" -eq 300 ]; then
    echo "✗ Dev database did not become ready within 5 minutes." >&2
    exit 1
  fi
  sleep 1
done
echo "✓ MySQL is ready on 127.0.0.1:$PORT"

npm run db:setup

echo "✓ Setup complete. The dev database keeps running in this terminal —"
echo "  start the app in a second terminal with: npm run dev"
wait "$DB_PID"
