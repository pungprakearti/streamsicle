#!/usr/bin/env bash
set -euo pipefail

DB_NAME="streamsicle_test"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Setting up test database: $DB_NAME"

# Drop and recreate
psql -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" -q 2>/dev/null
dropdb --if-exists "$DB_NAME"
createdb "$DB_NAME"

# Run Prisma migrations against test DB
DATABASE_URL="postgresql://andrew@localhost:5432/$DB_NAME?host=/var/run/postgresql" \
  npx prisma db push --skip-generate --accept-data-loss 2>&1 | tail -1

# Seed
psql -d "$DB_NAME" -f "$SCRIPT_DIR/seed.sql" -q

echo "Test database ready: $(psql -d "$DB_NAME" -t -c "SELECT count(*) FROM titles") titles"
