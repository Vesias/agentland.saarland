# Testausführung in Docker für agent.saarland

Dieses Verzeichnis enthält Skripte zur Automatisierung der Testausführung für das `agent.saarland` Projekt innerhalb einer Docker-Umgebung.

## Übersicht

Die Testumgebung basiert auf Docker und Docker Compose, um reproduzierbare und isolierte Testläufe zu gewährleisten.

*   **`../../../../Dockerfile`**: Definiert das Docker-Image, das die notwendige Umgebung (Node.js, Abhängigkeiten) für das Projekt aufsetzt, das Projekt baut und die Tests ausführt.
*   **`../../../../docker-compose.yml`**: Konfiguriert den Docker Compose Dienst, um das Test-Image zu bauen und den Test-Container zu starten.
*   **`run_tests_in_docker.sh`**: Ein Shell-Skript, das den Aufbau der Docker-Umgebung und die Ausführung der Tests automatisiert.
*   **`workflows/daily_smoke_test.sh`**: Ein Shell-Skript zur Durchführung des täglichen Smoke-Test-Workflows unter Verwendung der QualityGuard MCP-Tools.

## Voraussetzungen

*   Docker muss installiert und lauffähig sein.
*   Docker Compose muss installiert sein.

## Verwendung

Um alle Tests innerhalb der Docker-Umgebung auszuführen, führen Sie das folgende Skript vom Root-Verzeichnis des Projekts aus:

```bash
./tools/scripts/qa/run_tests_in_docker.sh
```

Das Skript wird:
1.  Das Docker-Image `agent-saarland-tests:latest` bauen (oder neu bauen, falls Änderungen vorliegen).
2.  Einen Container basierend auf diesem Image starten.
3.  Den Befehl `npm run test` (definiert im `Dockerfile`) innerhalb des Containers ausführen.
4.  Den Exit-Code des Testlaufs zurückgeben.
5.  Alle Ausgaben des Testlaufs in der Konsole anzeigen.

## Anpassungen

### Spezifische Test-Suites

Um spezifische Test-Suites auszuführen, können Sie entweder:
1.  Den `CMD` im `Dockerfile` anpassen (weniger flexibel).
2.  Den `command` im `docker-compose.yml` für den `agent-saarland-tests`-Dienst überschreiben.
3.  Das `run_tests_in_docker.sh`-Skript erweitern, um Argumente an `docker-compose run` oder den Testbefehl im Container weiterzugeben. Zum Beispiel könnte man `nx run-many --target=test --projects=core,api` verwenden, um nur Tests für bestimmte Projekte auszuführen.

### Umgebungsvariablen

Test-spezifische Umgebungsvariablen können in der `docker-compose.yml` unter der Sektion `environment` für den `agent-saarland-tests`-Dienst definiert werden.

### Python-Abhängigkeiten für RAG

Das aktuelle `Dockerfile` berücksichtigt primär die Node.js-Umgebung. Falls Tests für RAG-Komponenten Python-Abhängigkeiten erfordern, müsste das `Dockerfile` erweitert werden, um auch Python, pip und die notwendigen Python-Pakete zu installieren. Dies könnte über ein Multi-Stage-Build oder durch Hinzufügen der Python-Setup-Schritte zum bestehenden Image geschehen. Die Skripte unter `libs/rag/scripts/` ([`libs/rag/scripts/setup_rag.sh`](libs/rag/scripts/setup_rag.sh:0), [`libs/rag/setup/check_python_env.sh`](libs/rag/setup/check_python_env.sh:0)) geben Hinweise auf die benötigte Python-Umgebung.

## QA Workflows

### Täglicher Smoke-Test Workflow

Das Skript [`workflows/daily_smoke_test.sh`](tools/scripts/qa/workflows/daily_smoke_test.sh:0) implementiert den im [`qa_workflow_plan.md`](ai_docs/quality_assurance/qa_workflow_plan.md:0) definierten täglichen Smoke-Test.

**Zweck:** Dieses Skript führt eine Reihe von Schritten aus, um einen schnellen Gesundheitscheck des Systems durchzuführen. Es nutzt (simulierte oder direkte Aufrufe von) MCP-Tools des "QualityGuard"-Servers.

**Ausführung:**

```bash
./tools/scripts/qa/workflows/daily_smoke_test.sh
```

**Schritte des Workflows:**

1.  **Testkonfiguration laden:** Lädt optional eine spezifische Konfiguration für den Smoke-Test (z.B. `smoke_default`) über das `manageTestConfig`-Tool.
2.  **Test-Suite ausführen:** Führt eine definierte Smoke-Test-Suite (z.B. mit `suiteName: "smoke"`) über das `executeTestSuite`-Tool aus. Die Ergebnisse werden in einem temporären Verzeichnis gespeichert.
3.  **Testdaten sammeln:** Sammelt die Ergebnisse des Testlaufs über das `collectTestData`-Tool.
4.  **Bericht generieren:** Erstellt einen einfachen Summary-Bericht der Testergebnisse über das `generateReport`-Tool. Der Bericht wird im Verzeichnis `reports/qa/smoke_tests/` mit einem Zeitstempel gespeichert.

**Annahmen und Implementierungsdetails:**

*   Das Skript geht davon aus, dass es vom Root-Verzeichnis des Projekts ausgeführt wird.
*   Es wird versucht, die TypeScript-Dateien der QualityGuard MCP-Tools ([`libs/mcp/src/server/quality-guard/tools/`](libs/mcp/src/server/quality-guard/tools/)) direkt mittels `ts-node` auszuführen.
   *   Dies erfordert, dass `ts-node` global oder als Projektabhängigkeit verfügbar und korrekt konfiguriert ist.
   *   Die einzelnen Tool-Skripte (`manageTestConfig.ts`, `executeTestSuite.ts`, `collectTestData.ts`, `generateReport.ts`) müssen so implementiert sein, dass sie über die Kommandozeile mit Parametern aufgerufen werden können (z.B. durch Verwendung von `process.argv` oder einer CLI-Argument-Parsing-Bibliothek wie `yargs` oder `commander`).
*   Bei Fehlern in einem der Schritte bricht das Skript ab (`set -e`).
*   Ausgaben der einzelnen Schritte werden auf der Konsole protokolliert.
*   Der finale Bericht wird unter `reports/qa/smoke_tests/daily_smoke_test_summary_<TIMESTAMP>.txt` gespeichert.

**Anpassung:**

*   **Tool-Aufrufe:** Die genaue Methode zum Aufrufen der MCP-Tools (Parameter, erwartete Ausgaben) ist im Skript definiert und basiert auf Annahmen über die Implementierung der Tools. Falls die Tools eine andere Schnittstelle haben (z.B. ein dediziertes CLI-Tool `qualityguard-cli call <tool_name> ...`), muss die Funktion `run_mcp_tool` im Skript angepasst werden.
*   **Konfigurationswerte:** Variablen wie `SMOKE_TEST_CONFIG_NAME`, `SMOKE_TEST_SUITE_NAME`, `REPORTS_DIR` können am Anfang des Skripts angepasst werden.