#!/bin/sh
set -e

# Ensure server directory exists and is accessible
SERVER_DIR="/app/server"
if [ ! -d "$SERVER_DIR" ]; then
    echo "Error: Directory $SERVER_DIR does not exist"
    exit 1
fi

cd "$SERVER_DIR"

# Ensure Prisma client is generated
npx prisma generate

# Run migrations
echo "Running migrations..."
npx prisma migrate deploy

# Run seeds with absolute path
echo "Running seeds..."
node prisma/seed.js

# Start the application with absolute path
echo "Starting application..."
node dist/index.js 
