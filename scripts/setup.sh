#!/usr/bin/env bash
#
# One-command setup against an existing database.
#
#   1. creates .env from .env.example (if missing)
#   2. applies Drizzle migrations
#   3. seeds CMS content (idempotent — never overwrites existing rows)
#
# Usage:
#   npm run setup
#
# Then:
#   npm run dev
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "✓ Created .env from .env.example"
  echo "  Review DATABASE_URL in .env before continuing."
else
  echo "✓ .env already exists (leaving it untouched)"
fi

if ! grep -q '^DATABASE_URL=' .env; then
  echo "✗ DATABASE_URL is not set in .env — see .env.example." >&2
  exit 1
fi

npm run db:setup

echo "✓ Setup complete. Start the app with: npm run dev"
