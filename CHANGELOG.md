# Changelog

Alle wichtigen Änderungen an diesem Projekt werden hier dokumentiert.

## [0.1.2] - 2023-05-30

### Hinzugefügt
- Erweiterte Git-Automatisierung mit fortgeschrittenen Features:
  - Automatische Test-Integration vor Commits
  - Semantic Versioning (SemVer) Unterstützung
  - Automatisches Changelog-Management
  - Release-Management mit Tagging
  - CI/CD-Integration (GitHub Actions und GitLab CI)
- NX Build-Dateien-Integration in .gitignore
- Verbesserte Fehlerbehandlung im gesamten Skript

### Fehlerbehebung
- Fix für OS-Modul-Import in debug_workflow_engine.js
- Korrektur der VERSION Validierung
- Behebung von Syntaxproblemen im git-automate.sh

## [0.1.0] - 2023-05-15

### Hinzugefügt
- Initialer Release
- Implementierung der regionalen Integration: PublicBenefitImpactMetrics und SovereignAIComplianceCheck Komponenten mit API-Endpunkten
- Git-Automatisierungsskript für vereinfachte Workflows
- Workflow-Tracking-Komponenten für das Dashboard

### Geändert
- Verbesserung der AgentOnboardingFlow-Komponente: Standardeinstellungen für A2A-Kommunikation, erweiterte UI für Capability-Auswahl und MCP-Tool-Zugriff
- Verbesserung der PromptEngineeringSuite: Implementierung eines Tab-Systems und Umstrukturierung der Rendering-Logik
- Erweiterte Gitignore-Einstellungen für NX-Build-System

### Behoben
- ReferenceError in debug_workflow_engine.js durch Korrektur des os-Modul-Imports
