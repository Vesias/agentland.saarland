# Erweiterte Git-Automation für agentland.saarland

Dieses Dokument beschreibt die erweiterte Git-Automatisierung für das agentland.saarland Projekt. Mit den hier beschriebenen Werkzeugen können Sie Git-Operationen ohne manuelle Eingriffe durchführen und haben eine vollständige Lösung für den gesamten Git-Workflow.

> [!IMPORTANT]
> Die erweiterte Version des `git-automate.sh` Skripts bietet jetzt **neue fortgeschrittene Funktionen**:
> - Automatische Testausführung vor Commits
> - Semantische Versionierung (SemVer)
> - Automatisierte Changelog-Verwaltung
> - Release-Management-Integration
> - CI/CD-Pipeline-Integration

## Basis-Funktionen

Das `git-automate.sh` Skript stellt folgende Grundfunktionen bereit:

- **Automatisches Committen** (`auto-commit`): Committed alle Änderungen mit intelligenter Commit-Nachrichtengenerierung
- **Automatisches Mergen** (`auto-merge`): Merged Branches mit automatischer Konfliktlösung
- **Automatische Synchronisierung** (`auto-sync`): Führt Pull mit Rebase und Push aus
- **All-in-One** (`auto-all`): Kombiniert alle Schritte in einem Befehl
- **NX-Integration** (`ignore-nx`): Konfiguriert .gitignore für NX-Build-System-Dateien

```bash
# Alle Änderungen committen und pushen
./git-automate.sh auto-all "Implementierung der regionalen Integration"

# Nur committen
./git-automate.sh auto-commit "Verbesserung der Dashboard-Komponenten"

# Branch mergen mit automatischer Konfliktlösung
./git-automate.sh auto-merge main
```

## Erweiterte Funktionen

### Automatisierte Tests

```bash
./git-automate.sh run-tests
```

Führt automatisch alle Tests im Projekt aus und zeigt die Ergebnisse an. Das Skript erkennt automatisch, ob NX oder npm als Test-Runner verwendet werden soll.

Sie können Tests auch in den Commit-Prozess integrieren:

```bash
./git-automate.sh auto-commit-with-tests "Neue Feature-Implementation"
```

Dies führt erst die Tests aus und committet nur, wenn alle Tests bestanden wurden.

### Semantische Versionierung

```bash
./git-automate.sh bump-version [major|minor|patch]
```

Erhöht die Versionsnummer gemäß Semantic Versioning (SemVer):
- `major`: Erhöht die erste Ziffer (z.B. 1.0.0 → 2.0.0) für größere Änderungen, die nicht abwärtskompatibel sind
- `minor`: Erhöht die zweite Ziffer (z.B. 1.0.0 → 1.1.0) für neue Features, die abwärtskompatibel sind
- `patch`: Erhöht die dritte Ziffer (z.B. 1.0.0 → 1.0.1) für Bug-Fixes und kleinere Änderungen

Die Version wird sowohl in der `VERSION`-Datei als auch in `package.json` aktualisiert.

### Changelog-Management

```bash
./git-automate.sh update-changelog "Neue Dashboard-Komponenten hinzugefügt"
```

Aktualisiert automatisch den `CHANGELOG.md` mit strukturierter Formatierung:
- Fügt einen neuen Abschnitt für die aktuelle Version hinzu
- Datiert den Eintrag mit dem aktuellen Datum
- Formatiert die Änderungen als Liste
- Falls keine Änderungen angegeben, werden automatisch die Git-Commit-Logs seit dem letzten Tag verwendet

### Release-Management

```bash
./git-automate.sh create-release v1.2.0
```

Erstellt einen neuen Release mit folgenden Aktionen:
- Aktualisiert den Changelog für die neue Version
- Erstellt ein Git-Tag mit der angegebenen Version
- Committet die Änderungen

### CI/CD-Integration

```bash
./git-automate.sh ci-deploy staging
```

Startet den CI/CD-Deployment-Prozess für die angegebene Umgebung (z.B. staging, production). Das Tool erkennt automatisch:
- GitHub Actions Workflows
- GitLab CI Pipelines

Wenn die GitHub CLI oder GitLab CLI installiert ist, wird der Deployment-Prozess direkt gestartet, andernfalls wird ein Environment-Branch gepusht, der den CI/CD-Prozess auslöst.

## Komplette Beispiel-Workflows

### Täglicher Entwicklungsworkflow

```bash
# Arbeiten an Features...

# Tests ausführen und Änderungen committen
./git-automate.sh auto-commit-with-tests "Implementierung des neuen Login-Flows"

# Mit Remote synchronisieren
./git-automate.sh auto-sync
```

### Release-Workflow

```bash
# Version erhöhen (minor für neue Features)
./git-automate.sh bump-version minor

# Changelog aktualisieren (optional, wird auch von create-release gemacht)
./git-automate.sh update-changelog "
- Neuer Login-Flow implementiert
- Dashboard-UI verbessert
- Performance-Optimierungen
"

# Release erstellen
./git-automate.sh create-release v1.2.0

# Zum Remote pushen
./git-automate.sh push

# Deployment in Staging-Umgebung starten
./git-automate.sh ci-deploy staging
```

### Feature-Branch Workflow

```bash
# Neuen Feature-Branch erstellen
git checkout -b feature/neue-komponente

# An Features arbeiten...

# Committen mit Tests
./git-automate.sh auto-commit-with-tests "Neue Komponente implementiert"

# Mit Remote synchronisieren (erstellt auch den Branch remote)
./git-automate.sh auto-sync

# Zurück zum main-Branch wechseln
git checkout main

# Feature-Branch automatisch mergen
./git-automate.sh auto-merge feature/neue-komponente
```

## Konfliktlösung

Das Skript unterstützt automatische Konfliktlösung bei Merges:

- **JSON-Dateien**: Verwendet die eigene Version (ours)
- **Code-Dateien (TS, JS, TSX, JSX)**: Verwendet die eingehende Version (theirs)
- **Andere Dateien**: Verwendet die eingehende Version (theirs)

Die Konfliktlösungsstrategien können im Skript angepasst werden, um projektspezifische Bedürfnisse zu erfüllen.

## Integration mit staged-split-features.js

Für eine fortgeschrittenere Feature-basierte Gruppierung von Commits kann das `staged-split-features.js` Skript mit der erweiterten Automatisierung kombiniert werden:

```bash
# Feature-basierte Commits mit intelligenter Gruppierung
git add .
node tools/scripts/saar/git/staged-split-features.js --auto

# Mit Remote synchronisieren
./git-automate.sh auto-sync
```

## Konfiguration und Erweiterung

Die Funktionen des Systems können angepasst werden:

1. Test-Integration: Ändern Sie die `run_tests()` Funktion für spezifische Test-Frameworks
2. Changelog-Format: Passen Sie `update_changelog()` an Ihre Präferenzen an
3. CI/CD-Integration: Erweitern Sie `ci_deploy()` für andere CI/CD-Systeme
4. Konfliktlösungsstrategien: Ändern Sie die Strategien in `auto_merge()` für spezifische Dateitypen

## Fehlerbehebung

**Problem**: Tests schlagen fehl beim Commit  
**Lösung**: Beheben Sie die Testfehler oder verwenden Sie `auto-commit` statt `auto-commit-with-tests`, wenn Sie die Tests vorerst überspringen möchten

**Problem**: Versionierung funktioniert nicht  
**Lösung**: Stellen Sie sicher, dass Sie Schreibrechte für die `VERSION`-Datei und `package.json` haben

**Problem**: CI/CD-Deployment startet nicht  
**Lösung**: Prüfen Sie, ob die entsprechenden Workflows oder Pipelines konfiguriert sind und Sie über die nötigen Rechte verfügen

**Problem**: Release-Erstellung schlägt fehl  
**Lösung**: Stellen Sie sicher, dass Sie keine ungesicherten Änderungen haben und die Version nicht bereits als Tag existiert
