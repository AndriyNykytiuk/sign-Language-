#!/bin/bash
set -e

echo "========================================="
echo "STARTING BUILD PROCESS"
echo "========================================="
echo "Current directory: $(pwd)"
echo "Contents:"
ls -la

echo ""
echo "Installing dependencies..."
npm install

echo ""
echo "Building frontend with Vite..."
npm run build

echo ""
echo "Checking if dist folder was created..."
ls -la dist/ || echo "ERROR: dist folder not found!"

echo ""
echo "Seeding database..."
node seed.js

echo ""
echo "========================================="
echo "BUILD COMPLETE!"
echo "========================================="

