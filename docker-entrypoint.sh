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

# In production, we only want to run pending migrations
echo "Running migrations..."
npx prisma migrate deploy

# Generate Prisma client if needed
echo "Generating Prisma client..."
npx prisma generate

# Start production server from project root
cd /app && exec "$@" 