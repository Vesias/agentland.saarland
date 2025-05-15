#!/bin/bash

# Feature-Commit: Intelligente Gruppierung von Änderungen nach Features
# Integriert staged-split-features.js mit git-automate.sh

set -e

# Farbcodes für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verzeichnisse
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"

# Suche nach staged-split-features.js
if [ -f "$SCRIPT_DIR/tools/scripts/saar/git/staged-split-features.js" ]; then
  SPLIT_FEATURES_SCRIPT="$SCRIPT_DIR/tools/scripts/saar/git/staged-split-features.js"
  echo -e "${BLUE}SAAR Git-Tools gefunden.${NC}"
elif [ -f "$SCRIPT_DIR/tools/scripts/git/staged-split-features.js" ]; then
  SPLIT_FEATURES_SCRIPT="$SCRIPT_DIR/tools/scripts/git/staged-split-features.js"
  echo -e "${BLUE}Standard Git-Tools gefunden.${NC}"
else
  echo -e "${RED}Konnte staged-split-features.js nicht finden. Bitte stellen Sie sicher, dass das Repository korrekt eingerichtet ist.${NC}"
  exit 1
fi

# Prüfen, ob Node.js installiert ist
if ! command -v node &> /dev/null; then
  echo -e "${RED}Node.js ist nicht installiert. Die Git-Tools benötigen Node.js.${NC}"
  exit 1
fi

echo -e "${BLUE}=== Feature-basierter Commit ====${NC}"

# Alle Änderungen stagen
echo -e "${GREEN}Führe 'git add .' aus...${NC}"
git add .

# NX-Build-Dateien in .gitignore aktualisieren
if [ -f "$SCRIPT_DIR/git-automate.sh" ]; then
  echo -e "${GREEN}Aktualisiere .gitignore für NX-Build-Dateien...${NC}"
  "$SCRIPT_DIR/git-automate.sh" ignore-nx
fi

# Feature-basierte Commit-Analyse und -Gruppierung
echo -e "${GREEN}Analysiere und gruppiere Änderungen nach Features...${NC}"
node "$SPLIT_FEATURES_SCRIPT" "$@"

# Status nach Commits
echo -e "${BLUE}=== Git-Status nach Feature-Commits ===${NC}"
git status

# Remote-Synchronisierung (optional, je nach Parameter)
if [[ "$*" == *"--sync"* ]]; then
  echo -e "${GREEN}Synchronisiere mit Remote-Repository...${NC}"
  if [ -f "$SCRIPT_DIR/git-automate.sh" ]; then
    "$SCRIPT_DIR/git-automate.sh" auto-sync
  else
    echo -e "${YELLOW}git-automate.sh nicht gefunden. Führe standard git push durch...${NC}"
    git push
  fi
fi

echo -e "${GREEN}Feature-basierter Commit abgeschlossen.${NC}"
