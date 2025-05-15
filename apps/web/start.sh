#!/bin/bash

# agentland.saarland Dashboard Starter Script
# This script helps to start the dashboard development server

echo "=== agentland.saarland Dashboard ==="
echo "Starte das agentland.saarland Dashboard mit folgendem Befehl:"
echo ""
echo "cd $(pwd) && npm install && npm run dev"
echo ""
echo "Der Server wird dann auf http://localhost:5000 verfügbar sein."
echo ""
echo "Drücke ENTER, um fortzufahren oder STRG+C, um abzubrechen..."
read

# Navigate to the project directory (no-op if already there)
cd "$(dirname "$0")"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js ist nicht installiert. Bitte installiere Node.js, um fortzufahren."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm ist nicht installiert. Bitte installiere npm, um fortzufahren."
    exit 1
fi

# Check if node_modules exists, if not run npm install
if [ ! -d "node_modules" ]; then
    echo "Es wurden keine installierten Abhängigkeiten gefunden. Führe npm install aus..."
    npm install
fi

# Start the development server
echo "Starte den Entwicklungsserver..."
npm run dev