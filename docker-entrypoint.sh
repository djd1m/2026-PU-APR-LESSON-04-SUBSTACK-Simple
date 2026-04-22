#!/bin/sh
set -e

echo "Generating Prisma client..."
./node_modules/.bin/prisma generate

echo "Running database migrations..."
./node_modules/.bin/prisma migrate deploy

echo "Starting application..."
exec node server.js
