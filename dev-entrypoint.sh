#!/bin/sh
set -e

# Install netcat
apk add --no-cache netcat-openbsd

# Wait for database
echo "Waiting for database..."
while ! nc -z db 5432; do
  sleep 1
done

cd /app/server

# Install dependencies first
echo "Installing dependencies..."
npm install bcrypt @types/bcrypt
npm install @prisma/client

# Clean up any existing migrations
echo "Cleaning migrations..."
rm -rf prisma/migrations/*

# Generate and apply migrations
echo "Generating and applying migrations..."
npx prisma migrate reset --force
npx prisma generate

# Start development servers
echo "Starting development servers..."
cd /app && npm run dev