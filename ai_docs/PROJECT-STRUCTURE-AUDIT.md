# Audit der Projektstruktur-Optimierung

Dieses Dokument dient als Referenz für die durchgeführten Optimierungen an der Projektstruktur und soll zukünftigen Entwicklern helfen, die getroffenen Entscheidungen nachzuvollziehen und die Struktur beizubehalten.

## 1. Optimierungsziele

Die primären Ziele dieser Strukturoptimierung waren:

*   **Modulare Organisation:** Schaffung einer klareren Trennung von Verantwortlichkeiten und thematisch zusammengehörigen Code-Bestandteilen.
*   **Verbesserte Übersichtlichkeit:** Reduktion der Komplexität im Root-Verzeichnis und logischere Gruppierung von Dateien und Verzeichnissen.
*   **Reduzierte Redundanz:** Konsolidierung von ähnlichen Funktionalitäten und Vermeidung von doppelten Strukturen.

## 2. Durchgeführte Änderungen

Im Folgenden werden die wesentlichen Änderungen an der Projektstruktur detailliert aufgelistet:

### 2.1 Dokumentations-Migration
*   **Aktion:** Verschiebung von 76 Dokumentationsdateien aus dem Verzeichnis `docs/` in das neu erstellte Verzeichnis `ai_docs/`.
*   **Ergebnis:** Das Verzeichnis `docs/` wurde anschließend entfernt. Alle projektspezifischen Dokumentationen und KI-bezogenen Artefakte sind nun zentral in `ai_docs/` zu finden.

### 2.2 Skript-Reorganisation
*   **Aktion:** Verschiebung von 5 Skripten, die sich zuvor im Root-Verzeichnis befanden, in thematisch passendere Modulverzeichnisse (z.B. unter `libs/workflows/src/saar/scripts/` oder `tools/scripts/`).
*   **Ergebnis:** Lediglich das Haupt-Skript `saar.sh` verbleibt im Root-Verzeichnis. Dies dient einer besseren Auffindbarkeit und thematischen Kapselung von Skripten.

### 2.3 Verzeichnisbereinigung und -konsolidierung
*   **Aktion:** Auflösung des Verzeichnisses `mcp_servers/`. Die Inhalte wurden in `libs/mcp/` integriert, um alle MCP-bezogenen Bibliotheken und Server-Komponenten zu bündeln.
*   **Aktion:** Migration der Inhalte des Verzeichnisses `projects/`. Anwendungsspezifische Projekte wurden nach `apps/` verschoben, während Konfigurationsdateien in `configs/` überführt wurden.
*   **Aktion:** Aufnahme des Verzeichnisses `logs/` in die `.gitignore` und `.claudeignore` Dateien, um sicherzustellen, dass Log-Dateien nicht versioniert werden.
*   **Aktion:** Das `tools/` Verzeichnis wurde beibehalten. Eine geplante Unterteilung in `scripts/` und `generators/` wurde in Betracht gezogen. Die aktuelle Struktur von `tools/` sollte überprüft und diese Dokumentation ggf. angepasst werden, insbesondere hinsichtlich der Existenz eines `generators/` Unterverzeichnisses.

## 3. Neue Verzeichnisstruktur

Die aktuelle oberste Ebene der Verzeichnisstruktur stellt sich wie folgt dar (basierend auf den bereitgestellten Informationen):

```
/home/jan/Dokumente/agent.saarland/
├── .claude
├── .github
├── .venv
├── ai_docs/
├── apps/
├── configs/
├── libs/
├── logs/
├── specs/
├── tools/
├── .claudeignore
├── .clauderules
├── .gitignore
├── about-schema-de.json
├── mcp_config.json
├── mcp_servers_backup.tar.gz
├── nx.json
├── package.json
├── processes.json
├── README.md
├── saar.sh
└── tsconfig.base.json
```
*(Hinweis: Die Verzeichnisse `projects/` und `docs/` sind nicht mehr vorhanden. `mcp_servers/` wurde integriert.)*

Detailliertere Unterverzeichnisstrukturen sind in den jeweiligen Hauptverzeichnissen (`apps/`, `configs/`, `libs/`, `ai_docs/`, `tools/`) zu finden und folgen den oben beschriebenen Optimierungszielen.

## 4. Entscheidungsdokumentation

### 4.1 Begründungen
*   **`ai_docs/` statt `docs/`:** Um eine klare Trennung zwischen allgemeiner technischer Dokumentation (falls zukünftig benötigt und extern gehalten) und der spezifischen, oft KI-generierten oder -relevanten Projektdokumentation zu schaffen.
*   **Zentralisierung von Skripten:** Skripte, die spezifisch zu einem Modul oder einer Library gehören (z.B. Build-Skripte, Test-Runner für ein bestimmtes `lib`), sollten bei diesem Modul liegen. Globale Utility-Skripte finden sich in `tools/scripts/`.
*   **`apps/` und `configs/`:** Diese Trennung folgt gängigen Monorepo-Praktiken und verbessert die Unterscheidung zwischen ausführbaren Anwendungen und deren Konfigurationen.
*   **Integration von `mcp_servers/` in `libs/mcp/`:** Da MCP-Server Kernbestandteile der Bibliotheksfunktionalität darstellen, ist eine gemeinsame Verortung logisch und reduziert die Verzeichnisanzahl auf der obersten Ebene.

### 4.2 Vorteile
*   Verbesserte Navigation und schnelleres Auffinden von relevanten Dateien.
*   Reduzierte kognitive Last für neue Entwickler, die sich im Projekt zurechtfinden müssen.
*   Klarere Verantwortlichkeiten und einfachere Wartung durch modulare Struktur.
*   Bessere Skalierbarkeit des Projekts durch eine wohldefinierte Organisation.

### 4.3 Risikominimierung
*   Durch die schrittweise Migration und klare Dokumentation der Änderungen wurde das Risiko von Fehlern oder Brüchen in der Funktionalität minimiert.
*   Die Beibehaltung des `saar.sh` Skripts im Root stellt sicher, dass der Haupteinstiegspunkt für das System unverändert bleibt und bestehende Workflows nicht sofort angepasst werden müssen.

## 5. Wartungsempfehlungen

### 5.1 Best Practices
*   **Konsistenz:** Neue Module, Anwendungen oder Bibliotheken sollten sich an der etablierten Struktur orientieren.
*   **Granularität:** Bei der Erstellung neuer Verzeichnisse auf eine sinnvolle Granularität achten, um eine übermäßige Verschachtelung oder zu große Verzeichnisse zu vermeiden.
*   **Dokumentation:** Änderungen an der Struktur sollten zeitnah in diesem Dokument oder in relevanten READMEs festgehalten werden.

### 5.2 Wartungsrichtlinien
*   Regelmäßige Überprüfung der Struktur auf mögliche Vereinfachungen oder notwendige Anpassungen, insbesondere wenn neue große Features oder Komponenten hinzugefügt werden.
*   Vermeidung der Platzierung von Dateien im Root-Verzeichnis, es sei denn, es handelt sich um absolut notwendige Einstiegspunkte oder Konfigurationsdateien auf Projektebene (z.B. `package.json`, `.gitignore`).

### 5.3 Zukünftige Optimierungen
*   Evaluierung der `tools/` Struktur: Sicherstellen, dass die Unterteilung in `scripts/` und `generators/` den Anforderungen entspricht und ggf. weitere logische Unterteilungen (z.B. `linters/`, `formatters/`) eingeführt werden.
*   Überprüfung der `configs/` Struktur auf weitere Konsolidierungs- oder Modularisierungspotenziale, insbesondere wenn die Anzahl der Konfigurationsdateien stark wächst.
*   Periodische Überprüfung, ob alle Skripte optimal platziert sind oder ob einige in spezifischere Module verschoben werden können.