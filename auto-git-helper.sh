#!/bin/bash

# Auto Git Helper - Automatisierte Git-Operationen
# Basierend auf den fortschrittlichen Git-Tools in agentland.saarland

set -e

# Farbcodes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verzeichnisse
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
TOOLS_DIR="$SCRIPT_DIR/tools/scripts"

# Prüfen, ob SAAR oder reguläre Tools-Verzeichnisstruktur verwendet wird
if [ -d "$TOOLS_DIR/saar/git" ]; then
  GIT_TOOLS_DIR="$TOOLS_DIR/saar/git"
  echo -e "${BLUE}SAAR Git-Tools gefunden.${NC}"
elif [ -d "$TOOLS_DIR/git" ]; then
  GIT_TOOLS_DIR="$TOOLS_DIR/git"
  echo -e "${BLUE}Standard Git-Tools gefunden.${NC}"
else
  echo -e "${RED}Konnte keine Git-Tools finden. Bitte stellen Sie sicher, dass das Repository korrekt eingerichtet ist.${NC}"
  exit 1
fi

# Prüfen, ob Node.js installiert ist
if ! command -v node &> /dev/null; then
  echo -e "${RED}Node.js ist nicht installiert. Die Git-Tools benötigen Node.js.${NC}"
  exit 1
fi

# Funktion zum Anzeigen der Hilfe
show_help() {
  echo -e "${BLUE}=== Automatisierter Git-Helfer ===${NC}"
  echo ""
  echo "Verwendung: ./auto-git-helper.sh [Befehl] [Optionen]"
  echo ""
  echo "Befehle:"
  echo "  commit                         Ändert einen intelligenten Commit basierend auf gestaged Änderungen"
  echo "  auto-commit                    Automatisch Änderungen stagen und committen (nach Features gruppiert)"
  echo "  merge <ziel-branch>            Führt einen intelligenten Merge durch und löst Konflikte automatisch"
  echo "  install-hooks                  Installiert Git-Hooks für automatisierte Workflows"
  echo "  lint                           Überprüft und korrigiert Commit-Nachrichten"
  echo "  fix-conflicts                  Versucht, Git-Konflikte automatisch zu lösen"
  echo "  cherry-pick <issue-nummer>     Cherry-picked Commits für eine bestimmte Issue-Nummer"
  echo "  status                         Zeigt einen verbesserten Git-Status mit Empfehlungen"
  echo "  help                           Zeigt diese Hilfe an"
  echo ""
  echo "Beispiele:"
  echo "  ./auto-git-helper.sh auto-commit"
  echo "  ./auto-git-helper.sh merge develop"
  echo "  ./auto-git-helper.sh cherry-pick 123"
}

# Aktuellen Status anzeigen (verbessert)
show_status() {
  echo -e "${BLUE}=== Verbesserter Git Status ===${NC}"
  
  # Standard Git-Status abrufen
  git status
  
  echo ""
  echo -e "${BLUE}=== Analyse und Empfehlungen ===${NC}"
  
  # Ändert Dateien
  CHANGED_FILES=$(git diff --name-only)
  STAGED_FILES=$(git diff --staged --name-only)
  UNTRACKED_FILES=$(git ls-files --others --exclude-standard)
  
  # Zählung
  CHANGED_COUNT=$(echo "$CHANGED_FILES" | grep -v "^$" | wc -l)
  STAGED_COUNT=$(echo "$STAGED_FILES" | grep -v "^$" | wc -l)
  UNTRACKED_COUNT=$(echo "$UNTRACKED_FILES" | grep -v "^$" | wc -l)
  
  # Empfehlungen anzeigen
  if [ $STAGED_COUNT -gt 0 ] && [ $CHANGED_COUNT -gt 0 ]; then
    echo -e "${YELLOW}Sie haben sowohl gestagte als auch nicht-gestagte Änderungen.${NC}"
    echo -e "Empfehlung: Führen Sie '${GREEN}./auto-git-helper.sh auto-commit${NC}' aus, um alle Änderungen intelligent zu gruppieren."
  elif [ $STAGED_COUNT -gt 0 ]; then
    echo -e "${GREEN}Sie haben $STAGED_COUNT Dateien für den Commit vorbereitet.${NC}"
    echo -e "Empfehlung: Führen Sie '${GREEN}./auto-git-helper.sh commit${NC}' aus für einen intelligenten Commit."
  elif [ $CHANGED_COUNT -gt 0 ]; then
    echo -e "${YELLOW}Sie haben $CHANGED_COUNT geänderte Dateien, die noch nicht gestaged sind.${NC}"
    echo -e "Empfehlung: Führen Sie '${GREEN}git add .${NC}' und dann '${GREEN}./auto-git-helper.sh commit${NC}' aus."
  elif [ $UNTRACKED_COUNT -gt 0 ]; then
    echo -e "${YELLOW}Sie haben $UNTRACKED_COUNT neue Dateien, die noch nicht zum Repository hinzugefügt wurden.${NC}"
    echo -e "Empfehlung: Führen Sie '${GREEN}git add .${NC}' und dann '${GREEN}./auto-git-helper.sh commit${NC}' aus."
  else
    echo -e "${GREEN}Ihr Arbeitsverzeichnis ist sauber. Keine Änderungen zum Committen.${NC}"
  fi
  
  # Branch-Informationen
  CURRENT_BRANCH=$(git branch --show-current)
  REMOTE_BRANCH=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "")
  
  if [ -n "$REMOTE_BRANCH" ]; then
    AHEAD=$(git rev-list --count $REMOTE_BRANCH..$CURRENT_BRANCH)
    BEHIND=$(git rev-list --count $CURRENT_BRANCH..$REMOTE_BRANCH)
    
    if [ $AHEAD -gt 0 ] && [ $BEHIND -gt 0 ]; then
      echo -e "${YELLOW}Ihr Branch ist $AHEAD Commits vor und $BEHIND Commits hinter dem Remote-Branch.${NC}"
      echo -e "Empfehlung: Führen Sie '${GREEN}./auto-git-helper.sh merge origin/$CURRENT_BRANCH${NC}' aus und dann '${GREEN}git push${NC}'."
    elif [ $AHEAD -gt 0 ]; then
      echo -e "${YELLOW}Ihr Branch ist $AHEAD Commits vor dem Remote-Branch.${NC}"
      echo -e "Empfehlung: Führen Sie '${GREEN}git push${NC}' aus."
    elif [ $BEHIND -gt 0 ]; then
      echo -e "${YELLOW}Ihr Branch ist $BEHIND Commits hinter dem Remote-Branch.${NC}"
      echo -e "Empfehlung: Führen Sie '${GREEN}git pull${NC}' oder '${GREEN}./auto-git-helper.sh merge origin/$CURRENT_BRANCH${NC}' aus."
    else
      echo -e "${GREEN}Ihr Branch ist synchron mit dem Remote-Branch.${NC}"
    fi
  else
    echo -e "${YELLOW}Ihr Branch '$CURRENT_BRANCH' hat keinen Upstream-Branch.${NC}"
    echo -e "Empfehlung: Führen Sie '${GREEN}git push -u origin $CURRENT_BRANCH${NC}' aus, um einen Upstream-Branch zu erstellen."
  fi
}

# Intelligenter Commit mit automatischer Gruppierung
smart_commit() {
  echo -e "${BLUE}=== Intelligenter Commit ===${NC}"
  
  if [ -f "$GIT_TOOLS_DIR/staged-split-features.js" ]; then
    # Mit dem fortschrittlichen staged-split Tool
    if [ "$1" == "--auto" ]; then
      echo -e "${GREEN}Führe automatischen Feature-basierten Commit durch...${NC}"
      node "$GIT_TOOLS_DIR/staged-split-features.js" --auto
    else
      echo -e "${GREEN}Analysiere gestaged Änderungen und erstelle Feature-basierte Commits...${NC}"
      node "$GIT_TOOLS_DIR/staged-split-features.js"
    fi
  else
    echo -e "${YELLOW}Fortschrittliches staged-split Tool nicht gefunden. Verwende Standard-Commit...${NC}"
    
    if [ -z "$1" ]; then
      echo -e "${YELLOW}Bitte geben Sie eine Commit-Nachricht an:${NC}"
      read -r COMMIT_MSG
    else
      COMMIT_MSG="$1"
    fi
    
    git commit -m "$COMMIT_MSG"
  fi
}

# Automatisches Stagen und Committen 
auto_commit() {
  echo -e "${BLUE}=== Automatisches Stagen und Committen ===${NC}"
  
  # Ändert Dateien zählen
  CHANGED_FILES=$(git diff --name-only)
  CHANGED_COUNT=$(echo "$CHANGED_FILES" | grep -v "^$" | wc -l)
  
  if [ $CHANGED_COUNT -eq 0 ]; then
    echo -e "${YELLOW}Keine Änderungen zum Committen gefunden.${NC}"
    return
  fi
  
  echo -e "${GREEN}Füge $CHANGED_COUNT geänderte Dateien zum Commit hinzu...${NC}"
  git add .
  
  # Intelligenten Commit durchführen
  smart_commit --auto
}

# Intelligenter Merge mit automatischer Konfliktlösung
smart_merge() {
  if [ -z "$1" ]; then
    echo -e "${RED}Fehler: Kein Ziel-Branch angegeben.${NC}"
    echo -e "Verwendung: ./auto-git-helper.sh merge <ziel-branch>"
    return 1
  fi
  
  TARGET_BRANCH="$1"
  
  echo -e "${BLUE}=== Intelligenter Merge von $TARGET_BRANCH ===${NC}"
  
  # Prüfen, ob der Ziel-Branch existiert
  if ! git rev-parse --verify "$TARGET_BRANCH" &>/dev/null; then
    echo -e "${RED}Ziel-Branch '$TARGET_BRANCH' existiert nicht.${NC}"
    return 1
  fi
  
  # Aktuellen Branch sichern
  CURRENT_BRANCH=$(git branch --show-current)
  
  echo -e "${GREEN}Versuche Merge von $TARGET_BRANCH in $CURRENT_BRANCH...${NC}"
  
  # Versuche zu mergen
  if git merge "$TARGET_BRANCH" --no-commit; then
    echo -e "${GREEN}Merge erfolgreich ohne Konflikte.${NC}"
    
    # Commit-Nachricht vorbereiten
    COMMIT_MSG="Merge branch '$TARGET_BRANCH' into $CURRENT_BRANCH"
    
    git commit -m "$COMMIT_MSG"
    echo -e "${GREEN}Merge-Commit erstellt.${NC}"
  else
    echo -e "${YELLOW}Merge-Konflikte gefunden. Versuche automatische Lösung...${NC}"
    
    # Liste der Konfliktdateien
    CONFLICT_FILES=$(git diff --name-only --diff-filter=U)
    
    if [ -z "$CONFLICT_FILES" ]; then
      echo -e "${RED}Konnte keine Konfliktdateien finden, obwohl Merge fehlgeschlagen ist.${NC}"
      echo -e "${YELLOW}Breche Merge ab...${NC}"
      git merge --abort
      return 1
    fi
    
    # Versuche Konflikte zu lösen
    RESOLVED=0
    FAILED=0
    
    echo -e "${BLUE}Konfliktdateien:${NC}"
    echo "$CONFLICT_FILES"
    
    for file in $CONFLICT_FILES; do
      echo -e "${YELLOW}Versuche Konflikt in $file zu lösen...${NC}"
      
      # JavaScript/TypeScript-Dateien
      if [[ "$file" == *.js || "$file" == *.ts || "$file" == *.jsx || "$file" == *.tsx ]]; then
        # Verwende git-helper, falls verfügbar
        if [ -f "$GIT_TOOLS_DIR/git-helper.js" ]; then
          node "$GIT_TOOLS_DIR/git-helper.js" resolve-conflict "$file"
          if [ $? -eq 0 ]; then
            RESOLVED=$((RESOLVED+1))
            echo -e "${GREEN}Konflikt in $file automatisch gelöst.${NC}"
            git add "$file"
            continue
          fi
        fi
      fi
      
      # Für einfache Konflikte: Behalte beide Versionen (ours then theirs)
      if grep -q "<<<<<<< HEAD" "$file"; then
        sed -i -e '/<<<<<<< HEAD/,/=======/!b' -e '/=======/,/>>>>>>>/!b' -e '/>>>>>>>/d' -e '/=======/d' -e '/<<<<<<< HEAD/d' "$file"
        if [ $? -eq 0 ]; then
          RESOLVED=$((RESOLVED+1))
          echo -e "${GREEN}Einfacher Konflikt in $file gelöst (beide Versionen behalten).${NC}"
          git add "$file"
          continue
        fi
      fi
      
      # Konflikt konnte nicht automatisch gelöst werden
      FAILED=$((FAILED+1))
      echo -e "${RED}Konnte Konflikt in $file nicht automatisch lösen.${NC}"
    done
    
    if [ $FAILED -eq 0 ]; then
      echo -e "${GREEN}Alle $RESOLVED Konflikte wurden automatisch gelöst.${NC}"
      git commit -m "Merge branch '$TARGET_BRANCH' into $CURRENT_BRANCH (auto-resolved)"
      echo -e "${GREEN}Merge-Commit erstellt.${NC}"
    else
      echo -e "${YELLOW}$RESOLVED Konflikte gelöst, aber $FAILED Konflikte konnten nicht automatisch gelöst werden.${NC}"
      echo -e "${YELLOW}Bitte lösen Sie die verbleibenden Konflikte manuell und führen Sie 'git commit' aus.${NC}"
      
      # Liste der verbleibenden Konfliktdateien anzeigen
      REMAINING_CONFLICTS=$(git diff --name-only --diff-filter=U)
      if [ -n "$REMAINING_CONFLICTS" ]; then
        echo -e "${YELLOW}Verbleibende Konfliktdateien:${NC}"
        echo "$REMAINING_CONFLICTS"
      fi
    fi
  fi
}

# Git-Hooks installieren
install_hooks() {
  echo -e "${BLUE}=== Installiere Git-Hooks ===${NC}"
  
  # Git-Hooks-Verzeichnis
  HOOKS_DIR=".git/hooks"
  
  if [ ! -d "$HOOKS_DIR" ]; then
    echo -e "${RED}Git-Repository nicht gefunden oder .git/hooks Verzeichnis existiert nicht.${NC}"
    return 1
  fi
  
  # Pre-Commit-Hook installieren
  PRE_COMMIT_PATH="$HOOKS_DIR/pre-commit"
  echo -e "${GREEN}Installiere pre-commit Hook...${NC}"
  
  cat > "$PRE_COMMIT_PATH" << 'EOF'
#!/bin/bash

# Pre-Commit-Hook für agentland.saarland
# Analysiert gestagte Änderungen und führt Qualitätschecks durch

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)/../../"

# Suche nach Debug-Skript in verschiedenen Verzeichnissen
DEBUG_WORKFLOW=""
for path in "$SCRIPT_DIR/tools/scripts/saar/debug_workflow_engine.js" "$SCRIPT_DIR/tools/scripts/debug_workflow_engine.js"; do
  if [ -f "$path" ]; then
    DEBUG_WORKFLOW="$path"
    break
  fi
done

# Für jede gestagte Code-Datei Pre-Commit-Checks durchführen
git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(js|jsx|ts|tsx|py|java|c|cpp)$' | while read -r file; do
  echo "Analysiere $file vor Commit..."
  
  # Führe Analyse durch, falls Debug-Workflow verfügbar ist
  if [ -n "$DEBUG_WORKFLOW" ]; then
    node "$DEBUG_WORKFLOW" run quick --file "$file" --output json || true
  fi
done

# Wenn staged-split verfügbar ist, Vorschlag anzeigen
STAGED_SPLIT=""
for path in "$SCRIPT_DIR/tools/scripts/saar/git/staged-split-features.js" "$SCRIPT_DIR/tools/scripts/git/staged-split-features.js"; do
  if [ -f "$path" ]; then
    STAGED_SPLIT="$path"
    break
  fi
done

if [ -n "$STAGED_SPLIT" ]; then
  echo ""
  echo "Tipp: Sie können intelligente Feature-basierte Commits mit diesem Befehl erstellen:"
  echo "node $STAGED_SPLIT"
  echo ""
fi

exit 0
EOF
  
  chmod +x "$PRE_COMMIT_PATH"
  echo -e "${GREEN}Pre-Commit-Hook installiert.${NC}"
  
  # Post-Merge-Hook installieren
  POST_MERGE_PATH="$HOOKS_DIR/post-merge"
  echo -e "${GREEN}Installiere post-merge Hook...${NC}"
  
  cat > "$POST_MERGE_PATH" << 'EOF'
#!/bin/bash

# Post-Merge-Hook für agentland.saarland
# Führt notwendige Aktualisierungen nach einem Merge durch

echo "Post-Merge-Hook wird ausgeführt..."

# Prüfen, ob package.json geändert wurde
if git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD | grep -q "package.json"; then
  echo "package.json wurde geändert. Führe npm install aus..."
  npm install
fi

# Prüfen, ob wichtige Konfigurationsdateien geändert wurden
if git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD | grep -q -E "configs/|.env|tsconfig"; then
  echo "Konfigurationsdateien wurden geändert. Bitte prüfen Sie, ob Ihre lokale Konfiguration aktualisiert werden muss."
fi

exit 0
EOF
  
  chmod +x "$POST_MERGE_PATH"
  echo -e "${GREEN}Post-Merge-Hook installiert.${NC}"
  
  echo -e "${GREEN}Alle Git-Hooks wurden erfolgreich installiert.${NC}"
}

# Hauptfunktion
main() {
  if [ $# -eq 0 ]; then
    show_help
    return 0
  fi
  
  COMMAND="$1"
  shift
  
  case "$COMMAND" in
    "commit")
      smart_commit "$@"
      ;;
    "auto-commit")
      auto_commit
      ;;
    "merge")
      smart_merge "$@"
      ;;
    "install-hooks")
      install_hooks
      ;;
    "status")
      show_status
      ;;
    "lint")
      if [ -f "$GIT_TOOLS_DIR/commit-lint.js" ]; then
        node "$GIT_TOOLS_DIR/commit-lint.js" "$@"
      else
        echo -e "${RED}commit-lint.js nicht gefunden.${NC}"
      fi
      ;;
    "fix-conflicts")
      # Diese Funktion wird durch smart_merge abgedeckt
      echo -e "${YELLOW}Bitte verwenden Sie 'merge' statt 'fix-conflicts'.${NC}"
      show_help
      ;;
    "cherry-pick")
      if [ -f "$GIT_TOOLS_DIR/issue-cherry-pick.js" ]; then
        node "$GIT_TOOLS_DIR/issue-cherry-pick.js" "$@"
      else
        echo -e "${RED}issue-cherry-pick.js nicht gefunden.${NC}"
      fi
      ;;
    "help")
      show_help
      ;;
    *)
      echo -e "${RED}Unbekannter Befehl: $COMMAND${NC}"
      show_help
      return 1
      ;;
  esac
}

main "$@"
