#!/bin/sh
cd /app
echo "Building ..."
yarn build
echo "Build done"
echo "Applying migrations ..."
yarn prisma migrate deploy
echo "Migrations done"
echo "Starting server ..."
yarn start