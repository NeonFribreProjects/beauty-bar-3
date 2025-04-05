#!/bin/sh
set -e

# Ensure server directory exists and is accessible
SERVER_DIR="/app/server"
if [ ! -d "$SERVER_DIR" ]; then
    echo "Error: Directory $SERVER_DIR does not exist"
    exit 1
fi

cd "$SERVER_DIR"

# Wait for database to be ready
echo "Waiting for database..."
../wait-for-it.sh db:5432 -t 60

# Reset and run migrations
echo "Running migrations..."
npx prisma migrate reset --force

echo "Starting development servers..."
npm run dev

# Ensure Prisma client is generated
npx prisma generate

# Run seeds with absolute path
echo "Running seeds..."
node prisma/seed.js

# Start the application with absolute path
echo "Starting application..."
node dist/index.js 
