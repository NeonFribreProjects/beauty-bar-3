#!/bin/sh

cd /app/server

# Run migrations
echo "Running migrations..."
npx prisma migrate deploy

# Run seeds
echo "Running seeds..."
node ./prisma/seed.js

# Start the application
echo "Starting application..."
node ./dist/src/index.js 
