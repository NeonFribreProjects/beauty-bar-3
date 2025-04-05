#!/bin/sh

# Wait for database
echo "Waiting for database..."
while ! nc -z db 5432; do
  sleep 1
done

cd /app/server

# Run migrations in development
echo "Running migrations..."
npx prisma migrate dev --name init

# Always run seeds in development
echo "Running seeds..."
npx ts-node prisma/seed.ts

# Start development servers
echo "Starting development servers..."
exec npm run dev 