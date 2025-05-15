#!/bin/bash

# Git-Automate: Vollautomatisches Git-Workflow-Tool für agentland.saarland
# Dieses Skript automatisiert alle Git-Operationen ohne manuelle Eingriffe

set -e

# Farbcodes für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verzeichnisse
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"

# Funktionen
show_help() {
  echo -e "${BLUE}=== Git-Automate: Vollautomatischer Git-Workflow ===${NC}"
  echo ""
  echo "Verwendung: ./git-automate.sh [Befehl] [Optionen]"
  echo ""
  echo "Befehle:"
  echo "  auto-commit [nachricht]        Automatisch alle Änderungen stagen und committen"
  echo "  auto-merge [branch]            Automatisches Mergen mit Konfliktlösung"
  echo "  auto-sync                      Aktualisiert den Branch und pusht Änderungen"
  echo "  auto-all [nachricht]           Führt auto-commit und auto-sync in einem Schritt durch"
  echo "  ignore-nx                      Aktualisiert .gitignore für NX-Build-Dateien"
  echo "  push                           Pusht alle lokalen Commits zum Remote"
  echo "  help                           Zeigt diese Hilfe an"
  echo ""
  echo "Beispiele:"
  echo "  ./git-automate.sh auto-commit \"Verbesserte Dashboard-Komponenten\""
  echo "  ./git-automate.sh auto-all \"Aktualisierung aller Komponenten\""
}

# Fügt NX-Build-Dateien zur .gitignore hinzu, falls noch nicht vorhanden
update_gitignore_for_nx() {
  echo -e "${BLUE}=== Aktualisiere .gitignore für NX-Build-Dateien ===${NC}"
  
  NX_PATTERNS=(
    ".nx/workspace-data/d/daemon.log"
    ".nx/workspace-data/file-map.json"
    ".nx/workspace-data/project-graph.json"
    ".nx/workspace-data/**/*.db-shm"
    ".nx/workspace-data/**/*.db-wal"
    ".nx/cache/terminalOutputs/*"
    ".nx/cache/run.json"
  )
  
  GITIGNORE_FILE="$SCRIPT_DIR/.gitignore"
  
  if [ ! -f "$GITIGNORE_FILE" ]; then
    echo -e "${YELLOW}.gitignore nicht gefunden, erstelle neu...${NC}"
    touch "$GITIGNORE_FILE"
  fi
  
  UPDATED=0
  
  for pattern in "${NX_PATTERNS[@]}"; do
    if ! grep -q "^$pattern$" "$GITIGNORE_FILE"; then
      echo "$pattern" >> "$GITIGNORE_FILE"
      echo -e "${GREEN}Hinzugefügt: $pattern${NC}"
      UPDATED=1
    fi
  done
  
  if [ $UPDATED -eq 0 ]; then
    echo -e "${GREEN}NX-Build-Dateien sind bereits in .gitignore eingetragen.${NC}"
  else
    echo -e "${GREEN}.gitignore erfolgreich aktualisiert.${NC}"
    
    # Entferne alle gestaged NX-Build-Dateien
    git rm --cached ".nx/workspace-data/d/daemon.log" 2>/dev/null || true
    git rm --cached ".nx/workspace-data/file-map.json" 2>/dev/null || true
    git rm --cached ".nx/workspace-data/project-graph.json" 2>/dev/null || true
    git rm --cached ".nx/workspace-data/**/*.db-shm" 2>/dev/null || true
    git rm --cached ".nx/workspace-data/**/*.db-wal" 2>/dev/null || true
    git rm --cached ".nx/cache/terminalOutputs/*" 2>/dev/null || true
    git rm --cached ".nx/cache/run.json" 2>/dev/null || true
    
    echo -e "${GREEN}Ignorierte NX-Build-Dateien wurden aus dem Git-Index entfernt.${NC}"
  fi
}

# Automatisches Committen aller Änderungen
auto_commit() {
  echo -e "${BLUE}=== Automatischer Git-Commit ===${NC}"
  
  # Alle Änderungen stagen, inklusive neue Dateien
  git add -A
  
  echo -e "${GREEN}Alle Änderungen wurden zum Staging-Bereich hinzugefügt.${NC}"
  
  # Status nach Staging
  STAGED=$(git diff --cached --name-only)
  if [ -z "$STAGED" ]; then
    echo -e "${YELLOW}Keine Änderungen zum Committen.${NC}"
    return 0
  fi
  
  echo -e "${GREEN}Dateien zum Commit:${NC}"
  git diff --cached --name-only | sort
  
  # Kategorisiere Änderungen für intelligente Commit-Nachricht
  COMPONENTS_CHANGED=$(git diff --cached --name-only | grep -E 'components/' | grep -v 'test' | wc -l)
  API_CHANGED=$(git diff --cached --name-only | grep -E 'api/|pages/api/' | wc -l)
  CONFIG_CHANGED=$(git diff --cached --name-only | grep -E '\.json$|\.config\.|tsconfig|package\.json' | wc -l)
  CSS_CHANGED=$(git diff --cached --name-only | grep -E '\.css$|\.scss$' | wc -l)
  
  # Wenn keine Commit-Nachricht übergeben wurde, generiere eine intelligente
  if [ -z "$1" ]; then
    COMMIT_MSG="Automatischer Commit: "
    
    if [ $COMPONENTS_CHANGED -gt 0 ]; then
      COMMIT_MSG+="UI-Komponenten aktualisiert, "
    fi
    
    if [ $API_CHANGED -gt 0 ]; then
      COMMIT_MSG+="API-Endpunkte verbessert, "
    fi
    
    if [ $CONFIG_CHANGED -gt 0 ]; then
      COMMIT_MSG+="Konfiguration aktualisiert, "
    fi
    
    if [ $CSS_CHANGED -gt 0 ]; then
      COMMIT_MSG+="Styling verbessert, "
    fi
    
    # Entferne das letzte Komma und Leerzeichen
    COMMIT_MSG=${COMMIT_MSG%, }
    
    # Falls keine spezifischen Änderungen erkannt wurden
    if [ "$COMMIT_MSG" == "Automatischer Commit" ]; then
      COMMIT_MSG="Automatischer Commit: Verschiedene Aktualisierungen und Verbesserungen"
    fi
  else
    COMMIT_MSG="$1"
  fi
  
  echo -e "${GREEN}Commit-Nachricht: $COMMIT_MSG${NC}"
  
  # Commit durchführen
  git commit -m "$COMMIT_MSG"
  
  echo -e "${GREEN}Commit erfolgreich erstellt.${NC}"
  
  # Führe ggf. Post-Commit-Operationen durch
  echo -e "${BLUE}=== Git-Status nach Commit ===${NC}"
  git status
}

# Automatisches Mergen mit intelligenter Konfliktlösung
auto_merge() {
  TARGET_BRANCH="$1"
  
  if [ -z "$TARGET_BRANCH" ]; then
    echo -e "${RED}Fehler: Kein Ziel-Branch angegeben.${NC}"
    echo "Verwendung: ./git-automate.sh auto-merge <branch>"
    return 1
  fi
  
  echo -e "${BLUE}=== Automatisches Mergen mit $TARGET_BRANCH ===${NC}"
  
  # Prüfen, ob der Ziel-Branch existiert
  if ! git rev-parse --verify "$TARGET_BRANCH" &>/dev/null && ! git rev-parse --verify "origin/$TARGET_BRANCH" &>/dev/null; then
    echo -e "${RED}Ziel-Branch '$TARGET_BRANCH' existiert weder lokal noch remote.${NC}"
    return 1
  fi
  
  # Aktuelle Änderungen sichern
  if ! git diff --quiet; then
    echo -e "${YELLOW}Ungespeicherte Änderungen gefunden. Sichere mit temporärem Stash...${NC}"
    git stash push -m "Automatisches Stash vor Merge mit $TARGET_BRANCH"
    STASHED=1
  else
    STASHED=0
  fi
  
  # Aktuelle Branch speichern
  CURRENT_BRANCH=$(git branch --show-current)
  
  # Bei Remote-Branch: Aktualisieren
  if git rev-parse --verify "origin/$TARGET_BRANCH" &>/dev/null; then
    echo -e "${GREEN}Aktualisiere den lokalen Remote-Tracking-Branch...${NC}"
    git fetch origin "$TARGET_BRANCH:$TARGET_BRANCH" || git fetch origin
  fi
  
  # Versuche den Merge
  echo -e "${GREEN}Führe Merge mit $TARGET_BRANCH durch...${NC}"
  if git merge "$TARGET_BRANCH" --no-edit; then
    echo -e "${GREEN}Merge erfolgreich ohne Konflikte.${NC}"
  else
    echo -e "${YELLOW}Merge-Konflikte erkannt. Versuche automatische Lösung...${NC}"
    
    # Konfliktdateien finden
    CONFLICT_FILES=$(git diff --name-only --diff-filter=U)
    
    if [ -z "$CONFLICT_FILES" ]; then
      echo -e "${RED}Keine Konfliktdateien gefunden, obwohl Merge fehlgeschlagen ist. Breche ab...${NC}"
      git merge --abort
      
      # Stash wiederherstellen falls vorhanden
      if [ $STASHED -eq 1 ]; then
        echo -e "${GREEN}Stelle gesicherte Änderungen wieder her...${NC}"
        git stash pop
      fi
      
      return 1
    fi
    
    echo -e "${YELLOW}Konfliktdateien: $CONFLICT_FILES${NC}"
    
    # Für jede Konfliktdatei
    for file in $CONFLICT_FILES; do
      echo -e "${YELLOW}Automatische Lösung für $file...${NC}"
      
      # Spezifische Strategien je nach Dateityp
      if [[ "$file" == *.json ]]; then
        # Bei JSON-Dateien: Versuche ours-Strategie (behalte unsere Version)
        git checkout --ours "$file"
        git add "$file"
        echo -e "${GREEN}JSON-Konflikt in $file mit 'ours'-Strategie gelöst.${NC}"
      elif [[ "$file" == *.tsx || "$file" == *.jsx || "$file" == *.ts || "$file" == *.js ]]; then
        # Bei Code-Dateien: Versuche beide Änderungen zu behalten
        # Komplexere Logik wäre hier möglich, vereinfacht für dieses Beispiel
        git checkout --theirs "$file"
        git add "$file"
        echo -e "${GREEN}Code-Konflikt in $file gelöst (Theirs-Version beibehalten).${NC}"
      else
        # Standardstrategie: Theirs (neuere Änderungen)
        git checkout --theirs "$file"
        git add "$file"
        echo -e "${GREEN}Konflikt in $file mit 'theirs'-Strategie gelöst.${NC}"
      fi
    done
    
    # Commit nach Konfliktlösung
    git commit -m "Automatisches Merge von $TARGET_BRANCH in $CURRENT_BRANCH mit Konfliktlösung"
    echo -e "${GREEN}Merge mit automatischer Konfliktlösung abgeschlossen.${NC}"
  fi
  
  # Stash wiederherstellen falls vorhanden
  if [ $STASHED -eq 1 ]; then
    echo -e "${GREEN}Stelle gesicherte Änderungen wieder her...${NC}"
    if ! git stash pop; then
      echo -e "${YELLOW}Konflikt beim Wiederherstellen des Stash. Änderungen bleiben im Stash.${NC}"
      echo -e "${YELLOW}Sie können sie später mit 'git stash apply' wiederherstellen.${NC}"
    fi
  fi
}

# Synchronisiert mit Remote (Pull und Push)
auto_sync() {
  echo -e "${BLUE}=== Automatische Synchronisierung mit Remote ===${NC}"
  
  CURRENT_BRANCH=$(git branch --show-current)
  
  # Remote-Branch prüfen
  if ! git rev-parse --verify "@{u}" &>/dev/null; then
    echo -e "${YELLOW}Kein Upstream-Branch für '$CURRENT_BRANCH' gefunden.${NC}"
    
    # Frage nach Upstream-Setup
    echo -e "${GREEN}Möchten Sie den aktuellen Branch als origin/$CURRENT_BRANCH aufsetzen? (j/n)${NC}"
    read -r SETUP_UPSTREAM
    
    if [[ "$SETUP_UPSTREAM" == "j" || "$SETUP_UPSTREAM" == "J" || "$SETUP_UPSTREAM" == "y" || "$SETUP_UPSTREAM" == "Y" ]]; then
      echo -e "${GREEN}Setze origin/$CURRENT_BRANCH als Upstream...${NC}"
      git push -u origin "$CURRENT_BRANCH"
      echo -e "${GREEN}Upstream erfolgreich eingerichtet.${NC}"
      return 0
    else
      echo -e "${YELLOW}Abbruch der Synchronisierung.${NC}"
      return 1
    fi
  fi
  
  # Pull mit Rebase-Strategie
  echo -e "${GREEN}Aktualisiere von Remote (git pull --rebase)...${NC}"
  if ! git pull --rebase; then
    echo -e "${RED}Rebase fehlgeschlagen. Wahrscheinlich gibt es Konflikte.${NC}"
    
    # Konfliktdateien
    CONFLICT_FILES=$(git diff --name-only --diff-filter=U)
    
    if [ -n "$CONFLICT_FILES" ]; then
      echo -e "${YELLOW}Konfliktdateien: $CONFLICT_FILES${NC}"
      echo -e "${YELLOW}Sie müssen die Konflikte manuell lösen.${NC}"
      echo -e "${YELLOW}Nach der Lösung führen Sie aus: git rebase --continue${NC}"
      echo -e "${YELLOW}Oder brechen Sie ab mit: git rebase --abort${NC}"
    fi
    
    return 1
  fi
  
  # Push zum Remote
  echo -e "${GREEN}Sende Änderungen zum Remote (git push)...${NC}"
  if ! git push; then
    echo -e "${RED}Push fehlgeschlagen. Möglicherweise wurden neue Commits auf dem Remote hinzugefügt.${NC}"
    echo -e "${YELLOW}Versuche force-Push mit Lease (sicherer als force-Push)...${NC}"
    
    if ! git push --force-with-lease; then
      echo -e "${RED}Force-Push fehlgeschlagen. Sie sollten die Situation manuell überprüfen.${NC}"
      return 1
    else
      echo -e "${GREEN}Force-Push mit Lease erfolgreich.${NC}"
    fi
  else
    echo -e "${GREEN}Push erfolgreich.${NC}"
  fi
}

# Alles in einem Schritt: Commit und Sync
auto_all() {
  echo -e "${BLUE}=== Vollautomatisches Git-Workflow ===${NC}"
  
  # Zuerst .gitignore aktualisieren
  update_gitignore_for_nx
  
  # Dann committen
  auto_commit "$1"
  
  # Schließlich synchronisieren
  auto_sync
  
  echo -e "${GREEN}Vollautomatischer Git-Workflow abgeschlossen.${NC}"
}

# Pusht Commits zum Remote
push_commits() {
  echo -e "${BLUE}=== Push zum Remote ===${NC}"
  
  CURRENT_BRANCH=$(git branch --show-current)
  
  # Remote-Branch prüfen
  if ! git rev-parse --verify "@{u}" &>/dev/null; then
    echo -e "${YELLOW}Kein Upstream-Branch für '$CURRENT_BRANCH' gefunden.${NC}"
    
    # Frage nach Upstream-Setup
    echo -e "${GREEN}Möchten Sie den aktuellen Branch als origin/$CURRENT_BRANCH aufsetzen? (j/n)${NC}"
    read -r SETUP_UPSTREAM
    
    if [[ "$SETUP_UPSTREAM" == "j" || "$SETUP_UPSTREAM" == "J" || "$SETUP_UPSTREAM" == "y" || "$SETUP_UPSTREAM" == "Y" ]]; then
      echo -e "${GREEN}Setze origin/$CURRENT_BRANCH als Upstream...${NC}"
      git push -u origin "$CURRENT_BRANCH"
      echo -e "${GREEN}Upstream erfolgreich eingerichtet.${NC}"
      return 0
    else
      echo -e "${YELLOW}Abbruch des Push.${NC}"
      return 1
    fi
  fi
  
  # Push zum Remote
  echo -e "${GREEN}Sende Änderungen zum Remote (git push)...${NC}"
  if ! git push; then
    echo -e "${RED}Push fehlgeschlagen. Möglicherweise wurden neue Commits auf dem Remote hinzugefügt.${NC}"
    echo -e "${YELLOW}Versuche force-Push mit Lease (sicherer als force-Push)...${NC}"
    
    if ! git push --force-with-lease; then
      echo -e "${RED}Force-Push fehlgeschlagen. Sie sollten die Situation manuell überprüfen.${NC}"
      return 1
    else
      echo -e "${GREEN}Force-Push mit Lease erfolgreich.${NC}"
    fi
  else
    echo -e "${GREEN}Push erfolgreich.${NC}"
  fi
}

# Hauptlogik
if [ $# -eq 0 ]; then
  show_help
  exit 0
fi

COMMAND="$1"
shift

case "$COMMAND" in
  "auto-commit")
    auto_commit "$1"
    ;;
  "auto-merge")
    auto_merge "$1"
    ;;
  "auto-sync")
    auto_sync
    ;;
  "auto-all")
    auto_all "$1"
    ;;
  "ignore-nx")
    update_gitignore_for_nx
    ;;
  "push")
    push_commits
    ;;
  "help")
    show_help
    ;;
  *)
    echo -e "${RED}Unbekannter Befehl: $COMMAND${NC}"
    show_help
    exit 1
    ;;
esac
