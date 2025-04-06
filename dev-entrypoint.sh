#!/bin/sh
set -e

# Install netcat
apk add --no-cache netcat-openbsd

# Wait for database
echo "Waiting for database..."
while ! nc -z db 5432; do
  sleep 1
done

# All Prisma operations must run from server context
cd /app/server

# Apply migrations safely (non-destructively)
echo "Applying pending Prisma migrations..."
npx prisma migrate deploy    # Safe: applies pending migrations without dropping data

echo "Generating Prisma client..."
npx prisma generate         # Regenerate client to match current schema

# Start development servers from project root
cd /app && npm run dev