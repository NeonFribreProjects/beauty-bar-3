#!/bin/sh
set -e

# Wait for database
echo "Waiting for database..."
while ! nc -z db 5432; do
  sleep 1
done

cd /app/server

# Run migrations in development
echo "Running migrations..."
npx prisma migrate dev --name initial_migration --create-only

# Apply migrations
echo "Applying migrations..."
npx prisma migrate deploy

# Always run seeds in development
echo "Running seeds..."
npx ts-node prisma/seed.ts

# Start development servers
echo "Starting development servers..."
npm run dev