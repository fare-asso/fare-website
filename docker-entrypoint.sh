#!/bin/sh
set -e

ls -lA
ls -lA node_modules

echo "[entrypoint] Running Prisma migrations..."
npx -y prisma migrate deploy --schema=./prisma/schema.prisma

echo "[entrypoint] Starting application..."
exec node server.js
