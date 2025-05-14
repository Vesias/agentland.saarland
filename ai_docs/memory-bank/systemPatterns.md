# System Patterns: Claude Neural Framework (agent.saarland)

## 1. Gesamtarchitektur

Das Claude Neural Framework ist als **Monorepo** konzipiert und wird mit **Nx** verwaltet. Es folgt den Prinzipien einer **modularen Architektur**, mit einer klaren Trennung von Bibliotheken (`libs/`) und Anwendungen (`apps/`). Die Struktur deutet auf eine Anlehnung an die **Hexagonal Architecture (Ports and Adapters)** hin, bei der die Kernlogik in den Bibliotheken liegt und die Anwendungen als Adapter für verschiedene Schnittstellen (CLI, Web, API) dienen.

## 2. Schlüsselmodule und Bibliotheken (`libs/`)

*   **`libs/core`**: Enthält die grundlegende Funktionalität des Frameworks.
    *   **Konfigurationsmanagement** (`config/config-manager.ts`): Zentrales Laden und Validieren von Konfigurationen.
    *   **Fehlerbehandlung** (`error/error-handler.ts`): Standardisierter Umgang mit Fehlern.
    *   **Internationalisierung (i18n)**: Unterstützung für Mehrsprachigkeit.
    *   **Logging** (`logging/logger.ts`): Systemweites Logging.
    *   **Sicherheit** (`security/`): Sicherheitsfunktionen, Typisierungen und API-Absicherung.
*   **`libs/agents`**: Implementiert das Agenten-System.
    *   **A2A-Manager** (`a2a-manager.ts`): Zentraler Hub für die Agent-zu-Agent-Kommunikation (siehe auch `ai_docs/a2a_protocol_guide.md`).
    *   **Basis-Agent** (`agent-base/`): Abstrakte Klasse oder Interface für Agenten.
    *   **Spezialisierte Agenten**: Debug-, Dokumentations-, Git-Agenten.
    *   **Orchestrator**: Koordiniert die Aktivitäten der Agenten.
*   **`libs/mcp`**: Verantwortlich für die Integration des Model Context Protocol.
    *   **MCP-Client** (`client/claude-mcp-client.ts`): Client zur Kommunikation mit MCP-Servern.
    *   **MCP-Server-Implementierung** (`server/`): Eigene MCP-Server-Logik (falls vorhanden).
    *   **Fallbacks, Routen, Services**: Unterstützung für die MCP-Kommunikation.
    *   Referenzierte MCP-Server (aus `ai_docs/CLAUDE.md`): `sequentialthinking`, `context7`, `desktop-commander`, `brave-search`, `think-mcp`.
*   **`libs/rag`**: Stellt das Retrieval Augmented Generation Framework bereit.
    *   **Embeddings**: Generierung von Vektor-Embeddings.
    *   **Vectorstore-Integration**: Anbindung an Vektordatenbanken.
*   **`libs/shared`**: Beinhaltet gemeinsam genutzte Utilities.
    *   **Testing Utilities**: Hilfsfunktionen für Tests.
    *   **Types**: Gemeinsam genutzte TypeScript-Typdefinitionen.
    *   **Utils**: Allgemeine Hilfsfunktionen.
*   **`libs/workflows`**: Implementiert verschiedene Workflow-Engines.
    *   **Debugging-Workflows**.
    *   **SAAR-Workflows** (Simplified Agent Architecture and Routing): Vereinfachte Konfiguration und Nutzung.
    *   **Sequentielle Ausführung**: Planer (`planners/`) und Executoren (`executors/`) für schrittweise Aufgabenabarbeitung.

## 3. Anwendungsebenen (`apps/`)

*   **`apps/cli`**: Kommandozeileninterface für das Framework.
*   **`apps/api`**: Stellt eine REST-API bereit.
*   **`apps/web`**: Web-Interface, vermutlich auf React basierend (enthält `components/`, `contexts/`, `hooks/`).

## 4. Konfigurationsmanagement

*   Konfigurationen sind zentral im Verzeichnis `configs/` abgelegt und nach Modulen/Aspekten strukturiert.
*   Das Laden und die Validierung erfolgen über `libs/core/src/config/config-manager.ts`.
*   Die Audit v4 Checkliste empfiehlt die Nutzung von `zod` für die Validierung.

## 5. Wichtige Design Patterns und Prinzipien

*   **Monorepo**: Verwaltung des gesamten Codes in einem einzigen Repository mit Nx.
*   **Modularität**: Starke Kapselung von Funktionalität in wiederverwendbaren Bibliotheken und klar abgegrenzten Anwendungen.
*   **Agentenbasierte Architektur**: Aufgaben werden von spezialisierten, autonom agierenden Agenten bearbeitet, die über ein standardisiertes Protokoll (A2A) kommunizieren.
*   **Dependency Injection**: Wird laut `ai_docs/CLAUDE.md` für bessere Testbarkeit eingesetzt.
*   **Nachrichtenbasierte Kommunikation**: Das A2A-Protokoll ist ein Beispiel für dieses Muster.
*   **Strikte Typisierung**: Durchgängige Verwendung von TypeScript.

## 6. Wichtige Technische Entscheidungen (Historisch und Empfohlen)

*   **Primärsprache**: TypeScript.
*   **Monorepo-Management**: Nx.
*   **Validierungsbibliothek (empfohlen)**: `zod` für Konfigurationen und Eingaben.
*   **Schema-Validierung (empfohlen)**: `ajv` für JSON-Schemata.
*   **CLI-Framework (empfohlen)**: `commander` für alle CLI-Tools.
*   **Dokumentationszentrale**: `ai_docs/` als primärer Ort für Projektdokumentation.

## 7. Hochrangige Komponentenbeziehungen (Beispiele)

*   Anwendungen in `apps/` nutzen die Funktionalitäten der Bibliotheken in `libs/`.
*   Agenten (`libs/agents/`) kommunizieren über den A2A-Manager.
*   MCP-Clients (`libs/mcp/`) ermöglichen die Interaktion mit externen oder internen MCP-Servern.
*   Workflows (`libs/workflows/`) orchestrieren Operationen, die Agenten, Kernfunktionen und andere Bibliotheksdienste involvieren können.
*   Das RAG-System (`libs/rag/`) stellt Kontext für Agenten oder andere Prozesse bereit.
*   Das Sicherheitssystem (`libs/core/src/security/`) wird von verschiedenen Komponenten genutzt, um Operationen abzusichern.

## 8. Strukturierungsentscheidungen (aus `ai_docs/PROJECT-STRUCTURE-AUDIT.md`)

*   Dokumentation zentralisiert in `ai_docs/`.
*   Skripte thematisch in Modulverzeichnisse oder `tools/scripts/` verschoben.
*   `mcp_servers/` in `libs/mcp/` integriert.
*   `projects/` aufgeteilt in `apps/` und `configs/`.
