#!/bin/bash

# AGENT_LAND.SAARLAND Dashboard Starter
# Dieses Skript startet das Dashboard mit einem Befehl

echo "=== AGENT_LAND.SAARLAND Dashboard ==="
echo "Starte das Dashboard..."

# Go to the web app directory
cd "$(dirname "$0")/apps/web"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js ist nicht installiert. Bitte installiere Node.js v18+ um fortzufahren."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installiere Abhängigkeiten..."
    npm install
fi

# Ensure port 5000 is free
echo "🔄 Stelle sicher, dass Port 5000 frei ist..."
fuser -k 5000/tcp 2>/dev/null || true

# Start the development server
echo "🚀 Starte den Server auf http://localhost:5000"
echo "💻 Drücke Ctrl+C um zu beenden"
npm run dev -- --host 0.0.0.0 --port 5000