#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Building frontend..."
npm run build

echo "Seeding database..."
node seed.js

echo "Build complete!"
