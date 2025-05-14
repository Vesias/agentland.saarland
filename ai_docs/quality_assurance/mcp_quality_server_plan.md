# Plan und Konzeption: MCP-Server für Qualitätssicherung im Projekt `agent.saarland` (Überarbeitet)

## 1. Definition klarer Qualitätskriterien

Die Qualitätskriterien leiten sich aus den Zielen des Projekts (Deployment-Ready, Sicherheit, Stabilität) und der angestrebten Benutzererfahrung ab.

*   **Performance:**
    *   **Messbare Metriken:**
        *   **Antwortzeiten:** Durchschnittliche und maximale Antwortzeiten kritischer API-Endpunkte (z.B. Agenten-Interaktionen, MCP-Anfragen, RAG-Abfragen) unter definierter Last.
        *   **Durchsatz:** Anzahl der erfolgreich verarbeiteten Anfragen pro Zeiteinheit für Kernfunktionen.
        *   **Ressourcennutzung:** CPU-, Speicher- und Netzwerkauslastung der Kernprozesse (`apps/cli`, `apps/api`, ggf. `apps/web`) während Lasttests.
        *   **Startzeiten:** Zeit, die benötigt wird, bis die CLI-Anwendung oder der API-Server betriebsbereit ist.
*   **Stabilität (Überarbeitet):**
    *   **Basis-Metriken:**
        *   **Fehlerrate:** Prozentsatz fehlgeschlagener Anfragen oder Operationen unter normalen und Stressbedingungen.
        *   **Mean Time Between Failures (MTBF):** Durchschnittliche Zeit zwischen Systemausfällen oder kritischen Fehlern während Langzeittests.
        *   **Recovery Time Objective (RTO):** Zeit, die das System benötigt, um sich nach einem Fehler automatisch oder manuell zu erholen.
        *   **Absturzfreiheit:** Keine unerwarteten Prozessabbrüche während definierter Testläufe.
        *   **Konsistenz der Datenverarbeitung:** Korrekte Verarbeitung von Anfragen auch bei nebenläufigen Zugriffen oder hoher Last.
    *   **Erweiterung 1: Robustheit gegenüber fehlerhaften Eingaben:**
        *   **Metriken:**
            *   Anzahl/Prozentsatz korrekt abgefangener ungültiger Eingaben.
            *   Prozentsatz der Komponenten ohne Absturz bei Fehleingaben (stattdessen definierte Fehlermeldung).
            *   Qualität der Fehlermeldungen (Klarheit, Nützlichkeit - qualitativ).
            *   Anzahl unkontrollierter Ausnahmen.
            *   Keine negativen Seiteneffekte auf andere Systemteile.
        *   **Testansätze:** Fuzz-Testing (API, CLI), Boundary Value Analysis, Invalid Type Testing, Malformed Data Testing, direkte Tests der Validierungslogik (`zod`, `ajv`).
    *   **Erweiterung 2: Fähigkeit zur Selbstheilung nach kleineren Fehlern:**
        *   **Metriken:**
            *   Anzahl/Prozentsatz erfolgreicher automatischer Wiederherstellungen nach transienten Fehlern.
            *   Time to Recover (TTR) für definierte, behebbare Fehler.
            *   Keine manuellen Eingriffe nötig für Wiederherstellung bekannter, kleinerer Fehler.
            *   Prozentsatz funktionierender Kern-Workflows trotz Ausfall nicht-kritischer Komponenten (Graceful Degradation).
            *   Korrekte Fehlerbehandlung und Retry-Mechanismen bei externen Aufrufen.
        *   **Testansätze:** Simulation transienter Fehler (Netzwerk, Ressourcen), Induzieren behebbarer Fehler, Testen von Retry-Logiken, Lasttests mit Ausfall nicht-kritischer Komponenten.
    *   **Erweiterung 3: Stabilität unter langanhaltender, variierender Last:**
        *   **Metriken:**
            *   Keine signifikante Performancedegradation über längeren Testzeitraum mit variierenden Lastprofilen.
            *   Keine Zunahme der Fehlerrate über Zeit unter Dauerlast.
            *   Stabile Ressourcennutzung ohne Memory Leaks.
            *   Erfolgreiche Verarbeitung von Lastspitzen.
            *   Konsistenz der Ergebnisse nach längerer Laufzeit.
        *   **Testansätze:** Soak Testing, Stress Testing mit variierenden Lastprofilen, Langzeittests ressourcenintensiver Workflows, Überwachung auf Memory Leaks, regelmäßige Datenkonsistenzprüfungen.
    *   **Erweiterung 4: Datenintegrität bei Fehlerszenarien:**
        *   **Metriken:**
            *   Keine Datenverluste/-beschädigungen nach simulierten Fehlern.
            *   Korrekte Datenwiederherstellung nach Fehler und Neustart.
            *   Datenkonsistenz über verschiedene Speicher hinweg nach Fehlern.
            *   Erfolgsrate der Datenvalidierung nach Wiederherstellung.
        *   **Testansätze:** Simulation von Systemabstürzen während Datenoperationen, Testen von Transaktionsmechanismen, Konsistenzvergleiche (Snapshots), Testen der Fehlerbehandlung bei I/O-Fehlern, Szenarien mit fehlschlagenden externen datenhaltenden MCPs.
*   **Sicherheit:** (Eng verknüpft mit den Zielen der "Audit v4 - Finalisierungs-Checkliste")
    *   **Messbare Metriken:**
        *   **Schwachstellen-Scan-Ergebnisse:** Anzahl und Schweregrad identifizierter Schwachstellen durch automatisierte Sicherheitstools (z.B. `npm audit`, statische Code-Analyse auf Sicherheitsprobleme).
        *   **Input-Validierung:** Erfolgsrate der Validierung von Eingabedaten gegen definierte Schemata (z.B. mit `zod` für Konfigurationen, `ajv` für API-Anfragen).
        *   **Authentifizierungs- & Autorisierungsprüfungen:** Erfolgreiche Abwehr unautorisierter Zugriffsversuche auf geschützte Ressourcen/Funktionen.
        *   **Abhängigkeitssicherheit:** Keine bekannten kritischen Schwachstellen in verwendeten Drittanbieter-Bibliotheken.
*   **Benutzerzufriedenheit:** (Indirekt messbar durch technische Kriterien, die die UX beeinflussen)
    *   **Messbare Metriken (technische Indikatoren):**
        *   **Zuverlässigkeit der Kernfunktionen:** Hohe Erfolgsrate bei der Ausführung der in `ai_docs/memory-bank/productContext.md` beschriebenen Kernnutzen.
        *   **Vorhersagbarkeit:** Konsistentes Verhalten des Systems unter gleichen Bedingungen.
        *   **Effizienz der CLI/API-Nutzung:** Geringe Latenz und hohe Erfolgsrate bei typischen Entwickler-Workflows.
        *   **Qualität der Log-Ausgaben:** Vollständigkeit und Klarheit der Logs zur Fehlerdiagnose.
        *   **Korrektheit der Dokumentation:** Übereinstimmung der Dokumentation mit der Funktionalität.

## 2. MCP-Server-Strategie

Ziel ist es, einen oder mehrere MCP-Server zu nutzen, um die oben genannten Qualitätskriterien automatisiert zu testen und zu überwachen.

*   **Analyse existierender MCP-Server:**
    *   `sequentialthinking`: Könnte potenziell für die Orchestrierung komplexer Testabläufe oder die Analyse von Testergebnissen verwendet werden, aber nicht direkt für die Testausführung selbst.
    *   `context7`: Dient dem Abruf von Dokumentation und ist für diese Aufgabe nicht direkt relevant.
    *   `desktop-commander`: Fokussiert auf Desktop-Automatisierung, was für Backend-Tests des Frameworks weniger relevant ist, es sei denn, UI-Tests der `apps/web` wären im Scope (aktuell nicht primär).
    *   `brave-search`: Für Websuchen, nicht relevant für Qualitätstests.
    *   `think-mcp`: Ähnlich wie `sequentialthinking`, eher für Planungs- und Denkprozesse.
    *   `@21st-dev/magic`: Fokussiert auf UI-Komponenten-Generierung, nicht relevant.
    *   **Fazit:** Keiner der *existierenden, genannten* MCP-Server ist direkt für die umfassende Testautomatisierung und Überwachung der definierten Qualitätskriterien ausgelegt.

*   **Anforderungen an einen neuen/anzupassenden MCP-Server (Nennen wir ihn "QualityGuard MCP"):**
    *   **Kernfunktionen:**
        *   **Testausführung:** Fähigkeit, definierte Test-Suiten (Unit, Integration, API-Tests, Lasttests) für das `agent.saarland` Framework auszuführen. Dies könnte die Interaktion mit dem Testrunner (Jest/Vitest) und Build-System (Nx) beinhalten.
        *   **Performance-Messung:** Tools zur Messung von Antwortzeiten, Durchsatz und Ressourcennutzung. Integration mit Monitoring-Tools oder Bibliotheken (z.B. Prometheus Client, `autocannon` für HTTP-Lasttests, `node:perf_hooks`).
        *   **Stabilitäts-Monitoring:** Erfassung von Fehlerraten, Abstürzen und System-Logs während der Testausführung.
        *   **Sicherheits-Scanning:** Integration von Tools wie `npm audit` oder Anstoßen von statischen Code-Analysen.
        *   **Konfigurationsmanagement für Tests:** Fähigkeit, verschiedene Testkonfigurationen (z.B. unterschiedliche Lastprofile, Feature-Flags) zu verwalten und anzuwenden.
        *   **Datenerfassung und -aggregation:** Sammeln der Testergebnisse und Metriken und Aufbereitung für die Analyse.
        *   **Reporting:** Generierung von zusammenfassenden Berichten über den Qualitätsstatus.
    *   **Schnittstellen:**
        *   Eine klar definierte API (gemäß MCP-Spezifikationen), um Tests zu starten, den Status abzufragen und Ergebnisse zu erhalten.
        *   Parameter könnten sein: zu testende Komponente/Workflow, Testtyp (Performance, Stabilität etc.), spezifische Konfigurationen.
    *   **Integration mit `agent.saarland`:**
        *   Der MCP-Server muss in der Lage sein, die `agent.saarland` Anwendungen (CLI, API) in einer kontrollierten Umgebung zu starten und zu interagieren.
        *   Zugriff auf Build-Artefakte und Konfigurationsdateien.
    *   **Technologie-Stack (Vorschlag):**
        *   Node.js und TypeScript, um konsistent mit dem Hauptprojekt zu bleiben und die Wiederverwendung von Code/Typen zu ermöglichen.
        *   Nutzung der im Projekt bereits etablierten Bibliotheken für Logging, Fehlerbehandlung etc.

    ```mermaid
    graph TD
        UserRequest[User Request via MCP Client] --> QualityGuardMCP{QualityGuard MCP Server}
        QualityGuardMCP -- Start Test --> TestExecutor[Test Executor]
        TestExecutor -- Interacts with --> AgentSaarland[agent.saarland Instance]
        AgentSaarland -- Metrics/Logs --> DataCollector[Data Collector]
        TestExecutor -- Results --> DataCollector
        DataCollector -- Aggregated Data --> QualityGuardMCP
        QualityGuardMCP -- Report --> UserRequest

        subgraph Test Infrastructure
            TestExecutor
            AgentSaarland
            DataCollector
        end
    ```

## 3. Testumgebungs-Konzept

Eine dedizierte und reproduzierbare Testumgebung ist entscheidend.

*   **Basis:**
    *   Containerisierung (Docker) wird dringend empfohlen. Jede Testausführung sollte in einer sauberen, isolierten Umgebung stattfinden.
    *   Ein Docker-Image, das das `agent.saarland` Framework mit allen Abhängigkeiten und den Test-Tools enthält.
    *   Separate Docker-Compose-Konfigurationen für verschiedene Testszenarien (z.B. API-Tests, CLI-Tests, Tests mit RAG-Datenbank).
*   **Komponenten:**
    *   **Test Controller:** Der "QualityGuard MCP" Server.
    *   **System Under Test (SUT):** Eine Instanz des `agent.saarland` Frameworks (CLI, API, ggf. Web-App), gestartet mit einer spezifischen Konfiguration.
    *   **Abhängigkeiten:** Ggf. gemockte oder reale Instanzen von externen Diensten (z.B. eine Test-Vektordatenbank für RAG, gemockte externe MCP-Server).
    *   **Monitoring-Tools:** Agenten oder Bibliotheken zur Erfassung von Performance-Metriken innerhalb der SUT-Container.
*   **Netzwerk:**
    *   Definierte Netzwerk-Konfiguration innerhalb von Docker, um die Kommunikation zwischen Test Controller, SUT und Abhängigkeiten zu ermöglichen.
*   **Daten:**
    *   Mechanismen zum Einspielen von Testdaten und zum Zurücksetzen des Zustands zwischen Testläufen.
*   **Automatisierung:**
    *   Die Testumgebung sollte vollständig durch den "QualityGuard MCP" Server auf- und abgebaut werden können.

## 4. Plan für Software-Komponenten-Tests

Die modulare Struktur des `agent.saarland` Frameworks eignet sich gut für gestaffelte Tests.

*   **Isolierte Komponententests (Unit-Tests & Integrationstests auf Bibliotheksebene):**
    *   **Fokus:** Testen einzelner Module/Bibliotheken aus `libs/` (z.B. `libs/core/src/config/config-manager.ts`, `libs/agents/src/a2a-manager.ts`, einzelne Agenten, RAG-Komponenten).
    *   **Methode:** Nutzung des bestehenden Test-Frameworks (Jest/Vitest). Diese Tests sind Teil der "Audit v4" Checkliste und sollten erweitert werden, um Qualitätsaspekte (z.B. Performance kleinerer Operationen, Fehlerbehandlung) abzudecken.
    *   Der "QualityGuard MCP" könnte diese Tests anstoßen und die Ergebnisse (inkl. Coverage) sammeln.
*   **Kombinierte Tests (Integrationstests auf Anwendungsebene):**
    *   **Fokus:** Testen des Zusammenspiels mehrerer Komponenten innerhalb einer Anwendung (z.B. API-Endpunkte in `apps/api`, die Agenten und RAG nutzen; CLI-Befehle in `apps/cli`).
    *   **Methode:**
        *   API-Tests: Verwendung von HTTP-Testbibliotheken (z.B. `supertest`) gegen die laufende `apps/api` Instanz.
        *   CLI-Tests: Ausführen von CLI-Befehlen und Überprüfung der Ausgaben und Seiteneffekte.
    *   Der "QualityGuard MCP" startet die jeweilige Anwendung und führt die Testskripte aus.
*   **End-to-End (E2E) Workflow-Tests:**
    *   **Fokus:** Testen vollständiger Benutzer-Workflows, die mehrere Agenten, MCP-Interaktionen und Systemkomponenten umfassen (z.B. ein SAAR-Workflow).
    *   **Methode:** Simulation von Benutzerinteraktionen (z.B. über API-Aufrufe, die einen komplexen Workflow auslösen).
    *   Hier kann der `sequentialthinking` MCP-Server ggf. helfen, komplexe Testsequenzen zu definieren, die dann vom "QualityGuard MCP" ausgeführt werden.
*   **Plugin-/Modul-Tests (spezifisch für "Software-Komponenten"):**
    *   Wenn "Plugins" oder "Mods" als separate, dynamisch ladbare Einheiten konzipiert sind (aktuell nicht explizit in der Memory Bank beschrieben, aber die agentenbasierte Architektur könnte dies unterstützen), müssten Tests für jede Komponente einzeln und in Kombination mit dem Kernframework definiert werden.
    *   Der "QualityGuard MCP" müsste Mechanismen bieten, um spezifische Plugins/Module für einen Testlauf zu aktivieren/deaktivieren.

## 5. Datenerfassungsstrategie

*   **Performance-Daten:**
    *   **APM-Tools/Bibliotheken:** Einsatz von leichtgewichtigen Application Performance Monitoring (APM) Bibliotheken innerhalb der Node.js-Anwendungen (z.B. Prometheus Client, OpenTelemetry SDK) zur Erfassung von Antwortzeiten, Transaktionsdetails, Ressourcennutzung.
    *   **Externe Lasttest-Tools:** Tools wie `k6`, `autocannon` oder `artillery` können Last erzeugen und Client-seitige Metriken (Antwortzeiten, Fehlerraten, Durchsatz) sammeln. Der "QualityGuard MCP" würde diese Tools steuern.
*   **Stabilitäts-Daten:**
    *   **Logging:** Zentrales Logging aller Anwendungen und Testkomponenten. Der "QualityGuard MCP" sammelt und analysiert Logs auf Fehler und Warnungen.
    *   **Fehler-Tracking:** Integration mit Fehler-Tracking-Diensten oder eigene Mechanismen zur Erfassung und Aggregation von Ausnahmen.
    *   **Health Checks:** Regelmäßige Abfrage von Health-Endpunkten der SUT-Komponenten.
*   **Sicherheits-Daten:**
    *   **Scan-Berichte:** Ergebnisse von `npm audit`, statischen Analysewerkzeugen (SAST) werden vom "QualityGuard MCP" gesammelt und gespeichert.
    *   **Testprotokolle:** Ergebnisse von Penetrationstests oder spezifischen Sicherheitstestfällen.
*   **Allgemeine Testergebnisse:**
    *   **Testrunner-Ausgaben:** Ergebnisse von Jest/Vitest (Pass/Fail, Coverage) werden im JSON-Format gesammelt.
*   **Speicherung und Visualisierung:**
    *   Die gesammelten Daten sollten in einer strukturierten Form gespeichert werden (z.B. Zeitreihendatenbank für Performance-Metriken wie Prometheus, relationale Datenbank oder NoSQL-Datenbank für Testergebnisse und Berichte).
    *   Ein Dashboard (z.B. Grafana, Kibana oder eine einfache Webanwendung, die vom "QualityGuard MCP" bereitgestellt wird) zur Visualisierung der Trends und Ergebnisse.

```mermaid
flowchart LR
    subgraph SUT [System Under Test (agent.saarland)]
        AppCLI[apps/cli]
        AppAPI[apps/api]
        AppWeb[apps/web]
        Libs[libs/*]
    end

    subgraph TestExecutionEnv [Test Execution Environment]
        QualityGuardMCP[QualityGuard MCP Server]
        TestRunner[Test Runner (Jest/Vitest)]
        LoadGenerator[Load Generator (k6/autocannon)]
        SecurityScanner[Security Scanner (npm audit)]
        MonitoringAgent[Monitoring Agent (Prometheus/OpenTelemetry)]
    end

    subgraph DataStorageAnalysis [Data Storage & Analysis]
        MetricsDB[(Time Series DB e.g. Prometheus)]
        ResultsDB[(Test Results DB)]
        Dashboard[Dashboard (Grafana/Custom)]
    end

    QualityGuardMCP -- controls --> TestRunner
    QualityGuardMCP -- controls --> LoadGenerator
    QualityGuardMCP -- controls --> SecurityScanner
    TestRunner -- tests --> SUT
    LoadGenerator -- generates load for --> AppAPI
    LoadGenerator -- generates load for --> AppWeb
    SecurityScanner -- scans --> SUT
    SUT -- metrics --> MonitoringAgent
    MonitoringAgent -- sends data --> MetricsDB
    TestRunner -- results --> ResultsDB
    LoadGenerator -- results --> ResultsDB
    SecurityScanner -- results --> ResultsDB
    MetricsDB --> Dashboard
    ResultsDB --> Dashboard
    QualityGuardMCP -- reports --> Dashboard