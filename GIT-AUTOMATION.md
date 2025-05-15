# Automatisierter Git-Workflow für agentland.saarland

Dieses Dokument beschreibt den automatisierten Git-Workflow für das agentland.saarland Projekt. Mit den hier beschriebenen Werkzeugen können Sie Git-Operationen ohne manuelle Eingriffe bei Diffs durchführen und haben eine modernisierte Lösung für Commits, Merges und Konfliktlösungen.

> [!NOTE]
> Ein **neues, verbessertes Tool** `git-automate.sh` wurde entwickelt, um den Workflow zu optimieren.
> Siehe den Abschnitt "Neues Git-Automatisierungs-Tool" unten für weitere Details.

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

---

# Neues Git-Automatisierungs-Tool

## Einführung zu git-automate.sh

Das neue `git-automate.sh` Skript bietet einen noch optimierteren und zuverlässigeren Git-Workflow für agentland.saarland. Es wurde entwickelt, um die bestehenden Funktionen zu verbessern und gleichzeitig die Benutzung zu vereinfachen.

## Hauptverbesserungen gegenüber auto-git-helper.sh

- **Verbesserte Zuverlässigkeit**: Robustere Fehlerbehandlung und -prüfung
- **NX-Build-Optimierung**: Automatische Erkennung und korrekte Behandlung von NX-Build-Dateien
- **Vereinfachte Befehle**: Intuitivere Befehlsstruktur
- **Intelligentere Konfliktlösung**: Typ-basierte Strategien für verschiedene Dateitypen
- **Bessere Remote-Synchronisierung**: Sichere Push- und Pull-Strategien

## Schnellstart für git-automate.sh

```bash
# Alle Änderungen automatisch committen und zum Remote pushen (All-in-One)
./git-automate.sh auto-all

# Nur Änderungen committen mit automatischer Nachrichtengenerierung
./git-automate.sh auto-commit

# Automatisch mit einem anderen Branch mergen
./git-automate.sh auto-merge feature-branch

# Aktuelle Änderungen mit Remote synchronisieren
./git-automate.sh auto-sync
```

## Befehle im Detail

### auto-commit [nachricht]

Fügt alle Änderungen zum Staging-Bereich hinzu und erstellt einen Commit. Die Nachricht ist optional - ohne Angabe wird eine intelligente Commit-Nachricht basierend auf den Änderungen generiert.

```bash
./git-automate.sh auto-commit "Verbesserungen am Dashboard hinzugefügt"
```

Das Skript erkennt:
- UI-Komponenten-Updates
- API-Änderungen
- Konfigurationsänderungen
- Styling-Updates

### auto-merge [branch]

Führt einen Merge mit dem angegebenen Branch durch und löst Konflikte automatisch.

```bash
./git-automate.sh auto-merge develop
```

Die Konfliktlösung verwendet verschiedene Strategien je nach Dateityp:
- JSON: "Ours"-Strategie, behält lokale Änderungen
- Code-Dateien: "Theirs"-Strategie, übernimmt die neueren Änderungen
- Andere Dateien: Standard-"Theirs"-Strategie

### auto-sync

Synchronisiert mit dem Remote-Repository (pull mit rebase und push).

```bash
./git-automate.sh auto-sync
```

Falls Konflikte auftreten, werden Anweisungen zur Auflösung angezeigt.

### auto-all [nachricht]

Kombiniert alle Funktionen: Aktualisiert .gitignore für NX-Dateien, committet alle Änderungen und synchronisiert mit dem Remote.

```bash
./git-automate.sh auto-all "Wöchentliches Update"
```

### ignore-nx

Aktualisiert die .gitignore, um NX-Build-Dateien auszuschließen und entfernt eventuell bereits im Repository verfolgte NX-Dateien.

```bash
./git-automate.sh ignore-nx
```

## Integration mit staged-split-features.js

Für eine fortgeschrittenere Feature-basierte Gruppierung von Commits kann das `staged-split-features.js` Skript mit der neuen Automatisierung kombiniert werden:

### Integration mit einem Skript

Erstellen Sie ein neues Skript namens `feature-commit.sh`:

```bash
#!/bin/bash
# Feature-basierte Commits mit intelligenter Gruppierung
git add .
node tools/scripts/saar/git/staged-split-features.js --auto

# Mit Remote synchronisieren
./git-automate.sh auto-sync
```

Machen Sie es ausführbar mit:
```bash
chmod +x feature-commit.sh
```

## Anpassen und Erweitern

Die Git-Automatisierung kann erweitert werden:

1. Passen Sie die Kategorisierungslogik in `auto_commit()` an für domainspezifische Commit-Nachrichten
2. Fügen Sie neue Konfliktlösungsstrategien in `auto_merge()` für projektspezifische Dateitypen hinzu
3. Integrieren Sie mit CI/CD-Systemen durch zusätzliche Skripte oder Post-Commit-Hooks

## Fehlerbehebung

**Problem**: Probleme beim Synchronisieren mit Remote
**Lösung**: Prüfen Sie Ihre Git-Konfiguration mit `git remote -v` und stellen Sie sicher, dass Sie die richtigen Berechtigungen haben

**Problem**: Automatische Konfliktlösung funktioniert nicht wie erwartet
**Lösung**: Bei komplexen Konflikten verwenden Sie `git merge --abort` und führen Sie dann einen manuellen Merge durch

**Problem**: staged-split-features.js Integration funktioniert nicht
**Lösung**: Überprüfen Sie den Pfad zum Skript und stellen Sie sicher, dass die erforderlichen Node.js-Module installiert sind
