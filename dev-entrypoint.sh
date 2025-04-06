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

# In development, reset the database and migrations
echo "Resetting database and migrations..."
npx prisma migrate reset --force

# This will:
# 1. Drop the database
# 2. Create a new database
# 3. Apply all migrations
# 4. Seed the database (if a seed file is present)

echo "Generating Prisma client..."
npx prisma generate

# Start development servers from project root
cd /app && npm run dev