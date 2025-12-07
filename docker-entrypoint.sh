#!/bin/sh
set -e

echo "[entrypoint] Running Prisma migrations..."
npx -y prisma@6 migrate deploy --schema=./prisma/schema.prisma

echo "[entrypoint] Starting application..."
exec node server.js
