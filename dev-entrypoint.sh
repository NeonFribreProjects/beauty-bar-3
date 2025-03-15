#!/bin/sh

# Wait for database
echo "Waiting for database..."
while ! nc -z db 5432; do
  sleep 1
done

cd /app/server

# Run migrations in development
echo "Running migrations..."
npx prisma migrate dev

# Run seeds if needed
if [ "$SEED_DB" = "true" ]; then
  echo "Running seeds..."
  npx ts-node prisma/seed.ts
fi

# Start development servers
echo "Starting development servers..."
cd /app
npm run dev 