#!/bin/sh
set -e

cd /app/server

# Ensure Prisma client is generated
npx prisma generate

# Run migrations
echo "Running migrations..."
npx prisma migrate deploy

# Run seeds (using compiled JS file)
echo "Running seeds..."
node prisma/seed.js

# Start the application (correct dist path)
echo "Starting application..."
node dist/index.js 
