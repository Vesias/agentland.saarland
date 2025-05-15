# Automatisierter Git-Workflow für agentland.saarland

Dieses Dokument beschreibt den automatisierten Git-Workflow für das agentland.saarland Projekt. Mit den hier beschriebenen Werkzeugen können Sie Git-Operationen ohne manuelle Eingriffe bei Diffs durchführen und haben eine modernisierte Lösung für Commits, Merges und Konfliktlösungen.

## Hauptfunktionen

Das `auto-git-helper.sh` Skript bietet folgende automatisierte Git-Funktionen:

1. **Intelligente Commits**: Analyse der Änderungen und automatisches Gruppieren nach Features
2. **Automatische Konfliktlösung**: Smarte Lösung von Merge-Konflikten
3. **Statusanalyse**: Verbesserter Git-Status mit Empfehlungen
4. **Git-Hooks**: Automatische Qualitätschecks vor Commits und nach Merges
5. **Cherry-Picking**: Intelligentes Cherry-Picking von Commits für bestimmte Issues

## Schnellstart

```bash
# Git-Hooks installieren (einmalig)
./auto-git-helper.sh install-hooks

# Status mit Empfehlungen anzeigen
./auto-git-helper.sh status

# Alle Änderungen automatisch committen (gruppiert nach Features)
./auto-git-helper.sh auto-commit

# Intelligenten Merge durchführen
./auto-git-helper.sh merge develop
```

## Detaillierte Befehlsübersicht

### Intelligente Commits

```bash
# Änderungen manuell stagen (git add)
git add .

# Intelligenten Commit durchführen (interaktiv)
./auto-git-helper.sh commit

# Alle Änderungen automatisch stagen und committen
./auto-git-helper.sh auto-commit
```

Der intelligente Commit analysiert Ihre Änderungen mithilfe des `staged-split-features.js` Tools und gruppiert sie automatisch in logische Feature-Commits. Dies führt zu einer saubereren Commit-Historie und besserer Nachvollziehbarkeit.

### Intelligenter Merge

```bash
# Von einem anderen Branch mergen
./auto-git-helper.sh merge develop

# Von Remote mergen
./auto-git-helper.sh merge origin/main
```

Der intelligente Merge versucht, Konflikte automatisch zu lösen. Es werden verschiedene Strategien angewendet:
- Für Nicht-Code-Dateien: Die neuere Version wird bevorzugt
- Für Code-Dateien: Beide Änderungen werden intelligent kombiniert
- Für komplexere Konflikte: Beide Versionen werden beibehalten

### Git-Hooks

```bash
# Git-Hooks installieren
./auto-git-helper.sh install-hooks
```

Installiert folgende Git-Hooks:
- **Pre-Commit**: Führt Qualitätschecks für Ihre Änderungen durch
- **Post-Merge**: Aktualisiert Abhängigkeiten automatisch nach Merges

### Cherry-Picking

```bash
# Commits für Issue #123 cherry-picken
./auto-git-helper.sh cherry-pick 123
```

Findet und cherry-pickt Commits, die mit einer bestimmten Issue-Nummer zusammenhängen, und löst dabei Konflikte automatisch.

### Commit-Lint

```bash
# Commit-Nachrichten prüfen
./auto-git-helper.sh lint

# Commit-Nachrichten automatisch korrigieren
./auto-git-helper.sh lint --fix
```

Überprüft Commit-Nachrichten auf Einhaltung der Konventionen und korrigiert sie bei Bedarf.

## Fortgeschrittene Funktionen

Das Skript nutzt das umfangreiche Git-Toolkit des agentland.saarland Projekts:

- **Code-Analyse**: Erkennt zusammengehörige Codeänderungen
- **Commit-Nachrichtengenerierung**: Erstellt sinnvolle Commit-Nachrichten basierend auf den Änderungen
- **Konfliktlösung**: Intelligente Strategien zur Lösung von Merge-Konflikten
- **Statische Analyse**: Qualitätschecks vor dem Commit

## Integration mit dem agentland.saarland Projekt

Das Skript integriert sich nahtlos mit den bestehenden agentland.saarland Git-Werkzeugen:

- Verwendet die SAAR Git-Skripte, falls verfügbar (unter `/tools/scripts/saar/git/`)
- Fällt auf die Standard-Git-Tools zurück (unter `/tools/scripts/git/`)
- Unterstützt die Debug-Workflow-Engine für Codeanalyse

## Fehlerbehebung

Falls Probleme auftreten:

1. Stellen Sie sicher, dass Node.js installiert ist
2. Überprüfen Sie, ob die Git-Werkzeuge vorhanden sind
3. Bei Merge-Konflikten, die nicht automatisch gelöst werden können, zeigt das Tool die betroffenen Dateien an

## Weitere Informationen

Weitere Details zu den fortschrittlichen Git-Werkzeugen finden Sie in der Dokumentation:
- `/tools/scripts/git/README.md` (Standard Git-Tools)
- `/tools/scripts/saar/git/README.md` (SAAR Git-Tools)
