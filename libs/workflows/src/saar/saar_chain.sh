#!/bin/bash

# saar.sh - Haupt-Einstiegspunkt für Saar-Operationen

# Definiere den Basispfad relativ zum Speicherort dieses Skripts
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHAIN_SCRIPT_PATH="$SCRIPT_DIR/tools/saar/saar_chain.sh"

# Überprüfe, ob das saar_chain.sh Skript existiert
if [ ! -f "$CHAIN_SCRIPT_PATH" ]; then
  echo "Fehler: Das Skript saar_chain.sh wurde nicht unter $CHAIN_SCRIPT_PATH gefunden."
  exit 1
fi

# Rufe saar_chain.sh mit allen übergebenen Argumenten auf
"$CHAIN_SCRIPT_PATH" "$@"