#!/bin/sh
# PostgreSQL backup with rotation. See README → «Резервні копії».
#   BACKUP_MODE=docker (default) — database in the docker compose "db" container
#   BACKUP_MODE=node             — external PostgreSQL from DATABASE_URL (needs pg_dump installed)
set -eu
cd "$(dirname "$0")"

BACKUP_DIR="${BACKUP_DIR:-./backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
mkdir -p "$BACKUP_DIR"
FILE="$BACKUP_DIR/signlng_$(date +%Y-%m-%d_%H-%M).dump"

# Write to a temp file so a failed dump never leaves a broken backup behind
trap 'rm -f "$FILE.tmp"' EXIT

if [ "${BACKUP_MODE:-docker}" = "docker" ]; then
  docker compose exec -T db pg_dump -U signlng -Fc signlng > "$FILE.tmp"
else
  if [ -z "${DATABASE_URL:-}" ]; then
    DATABASE_URL=$(grep '^DATABASE_URL=' .env | cut -d= -f2-)
  fi
  pg_dump "$DATABASE_URL" -Fc -f "$FILE.tmp"
fi

mv "$FILE.tmp" "$FILE"
find "$BACKUP_DIR" -name 'signlng_*.dump' -mtime +"$KEEP_DAYS" -delete
echo "Backup saved: $FILE"
