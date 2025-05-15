#!/bin/bash

# agentland.saarland Dashboard Startup Script (Improved)

echo "=== agentland.saarland Dashboard Starter ==="
echo "Starte das Dashboard für agentland.saarland..."

# Navigate to the project directory
cd "$(dirname "$0")"

# Check for dependencies and install if needed
if [ ! -d "node_modules" ]; then
    echo "Installation der Abhängigkeiten..."
    npm install
fi

# Kill any processes that might be running on port 5000
echo "Port 5000 freigeben..."
fuser -k 5000/tcp 2>/dev/null || true

# Start the development server with explicit host and port settings
echo "Starte den Server auf http://localhost:5000"
export NODE_ENV=development
npm run dev -- --host 0.0.0.0 --port 5000