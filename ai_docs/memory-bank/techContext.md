---
title: "Technical Context"
date: "2025-05-15"
status: "current"
updated_by: "Claude"
version: "1.0"
---

# Technical Context: Claude Neural Framework (agent.saarland)

## 1. Kerntechnologien

*   **Programmiersprache:** TypeScript (durchgängig mit strikter Typisierung).
*   **Laufzeitumgebung:** Node.js.
*   **Monorepo-Management:** Nx.

## 2. Wichtige Frameworks und Bibliotheken

*   **Frontend (`apps/web`):** React (impliziert durch die Erwähnung von Komponenten, Hooks und Contexts in der Struktur).
*   **Testing:**
    *   Jest oder Vitest (gemäß Audit v4 Checkliste für Test-Framework Setup).
*   **CLI-Entwicklung:**
    *   `commander` (empfohlen in Audit v4 Checkliste für alle CLI-Tools).
*   **Validierung:**
    *   `zod` (empfohlen in Audit v4 Checkliste für Konfigurations- und Eingabevalidierung).
    *   `ajv` (empfohlen in Audit v4 Checkliste für JSON-Schema-Validierung, z.B. in `schema-loader.ts`).
*   **Model Context Protocol (MCP) Server Integration:**
    *   Das Framework integriert sich mit verschiedenen MCP-Servern, darunter (gemäß `ai_docs/CLAUDE.md`):
        *   `sequentialthinking`
        *   `context7`
        *   `desktop-commander`
        *   `brave-search`
        *   `think-mcp`

## 3. Entwicklungsumgebung und Werkzeuge

*   **Paketmanager:** npm (ersichtlich aus den Basisbefehlen in `ai_docs/CLAUDE.md`).
*   **Build-System:**
    *   Nx (`nx build [project-name]`).
    *   TypeScript Compiler (`tsc`).
*   **Linting:**
    *   ESLint (erwähnt in Audit v4 Checkliste im Kontext des `finalize.sh` Skripts).
*   **Code-Formatierung:**
    *   Prettier (erwähnt in Audit v4 Checkliste im Kontext des `finalize.sh` Skripts).
*   **Versionskontrolle:** Git.
*   **Shell-Skripting:** Bash (für diverse Setup- und Hilfsskripte, z.B. in `libs/rag/scripts/`).

## 4. Entwicklungskonventionen (Auszug aus `ai_docs/CLAUDE.md`)

*   Bevorzugung funktionaler Programmiermuster, wo sinnvoll.
*   Anlehnung an die Hexagonale Architektur.
*   Nutzung von Dependency Injection zur Verbesserung der Testbarkeit.
*   Dokumentation öffentlicher APIs mittels JSDoc/TSDoc.
*   Aktualität von README-Dateien.
*   Dokumentation von Architekturentscheidungen.

## 5. Build- und Deployment-Prozess

*   **Build-Befehle:** `npm run build` (global), `nx build [project-name]` (projektspezifisch).
*   **Continuous Integration (CI):**
    *   GitHub Actions (gemäß Audit v4 Checkliste, z.B. `.github/workflows/test.yml`).
    *   Empfehlung zur Integration von `nx affected:build` zur Optimierung der Build-Zeiten.
*   **Containerisierung (Optional/Empfohlen):**
    *   Dockerfile für `apps/cli` (Vorschlag aus Audit v4 Checkliste).

## 6. Technische Einschränkungen und Herausforderungen (aus Audit v4 Checkliste)

*   **Pfadmanagement im Build-Prozess:** Besondere Aufmerksamkeit ist auf die Pfadlogik (insbesondere bei `__dirname` oder relativen Pfaden zu Konfigurations-/Locale-Dateien) im Kontext der Transpilierung von TypeScript zu JavaScript und der resultierenden Verzeichnisstruktur zu legen. Dies betrifft z.B. `config-manager.ts`, `i18n.ts`, `schema-loader.ts`.
*   **Vervollständigung von Mock-Implementierungen:** Mock-Logik in Executor-Klassen und im `SequentialPlanner` muss durch reale Implementierungen ersetzt werden.
*   **Korrektur von Shell-Skript-Fehlern:** Diverse Pfadfehler und Inkonsistenzen in Shell-Skripten (z.B. `setup_rag.sh`, `check_python_env.sh`) müssen behoben werden. Die Verwendung von `set -e` wird für robustere Fehlerbehandlung erwogen.
*   **Typsicherheit:** Eliminierung aller `any`-Typen und Ersetzung durch spezifischere Typen.

## 7. Hauptabhängigkeiten (Generisch und aus Dokumenten abgeleitet)

Eine detaillierte Liste aller Abhängigkeiten ist den `package.json`-Dateien des Hauptprojekts sowie der einzelnen Bibliotheken und Anwendungen zu entnehmen. Zu den Kernabhängigkeiten gehören voraussichtlich:

*   `typescript`
*   `@nrwl/cli` / `@nx/cli` (und andere Nx-spezifische Pakete)
*   `jest` und/oder `vitest` (Test-Runner)
*   `eslint` (Linter)
*   `prettier` (Formatter)
*   `zod` (Validierung)
*   `ajv` (Schema-Validierung)
*   `commander` (CLI-Framework)
*   `react`, `react-dom` (für `apps/web`)
*   Diverse Typisierungsdateien (`@types/...`)

Die spezifischen Versionen und weitere produktive sowie Entwicklungsabhängigkeiten sind in den jeweiligen `package.json` Dateien definiert.

<memory_update date="2025-05-15" source="Initial Setup" trigger="Memory-Bank-Einrichtung">
Der technische Kontext wurde mit YAML-Frontmatter für die Agent-Kompatibilität aktualisiert. Dieses Dokument bietet einen Überblick über die technischen Grundlagen des Claude Neural Framework, einschließlich der verwendeten Technologien, Bibliotheken und Entwicklungswerkzeuge.

Diese Dokumentation sollte aktualisiert werden, wenn sich die technische Basis des Projekts ändert, beispielsweise durch die Integration neuer Bibliotheken oder die Aktualisierung bestehender Abhängigkeiten. Bei der Implementierung der Audit v4-Checkliste sollte besonderes Augenmerk auf die Behebung der dokumentierten technischen Herausforderungen gelegt werden, wie z.B. die Korrektur von Pfadfehlern in Shell-Skripten und die Ersetzung von Mock-Implementierungen.

Zukünftige Aktualisierungen sollten auch die konkreten Versionen der Kernabhängigkeiten dokumentieren, um eine vollständige technische Referenz zu bieten.
</memory_update>

<memory_update date="2025-05-15" source="System Enhancement" trigger="Memory Controller Erweiterung">
Der technische Kontext wurde in das erweiterte Memory-Bank-System integriert, mit Versions-Tracking im YAML-Frontmatter und dem erweiterten Format für <memory_update> Tags.

Diese Verbesserung ermöglicht eine präzisere Dokumentation technischer Änderungen, mit klaren Angaben zu Quelle und Auslöser. Bei der Umsetzung der "Audit v4 - Finalisierungs-Checkliste" wird dies besonders wichtig sein, da die Checkliste zahlreiche technische Änderungen vorsieht, wie:

1. Vervollständigung der TypeScript-Typisierung und Eliminierung von `any`-Typen
2. Migration von JavaScript nach TypeScript (z.B. `clauderules-validator.js`)
3. Implementierung robusterer Validierungsmechanismen mit `zod` und `ajv`
4. Korrektur von Pfadfehlern in Shell-Skripten
5. Ersetzung von Mock-Implementierungen durch reale Logik

Jede dieser Änderungen wird nun systematisch mit Quell- und Auslöserangaben dokumentiert, was eine bessere Nachverfolgbarkeit und Begründung technischer Entscheidungen ermöglicht.
</memory_update>
