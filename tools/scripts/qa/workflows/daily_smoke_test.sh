#!/bin/bash

# Tägliches Smoke-Test Workflow Skript
#
# Dieses Skript automatisiert den täglichen Smoke-Test-Workflow durch Aufruf
# der relevanten MCP-Tools des "QualityGuard"-Servers.
#
# Annahmen:
# 1. Das Skript wird aus dem Root-Verzeichnis des Projekts ausgeführt.
# 2. `ts-node` ist verfügbar und korrekt konfiguriert, um TypeScript-Dateien direkt auszuführen.
#    Alternativ müssten die QualityGuard-Tools zuerst gebaut und dann als JavaScript ausgeführt werden.
# 3. Die MCP-Tools des QualityGuard-Servers befinden sich unter `libs/mcp/src/server/quality-guard/tools/`.
# 4. Die Ausgabe der Tools erfolgt auf stdout (für Erfolgsmeldungen/Daten) und stderr (für Fehler).
#    Erfolgreiche Ausführung wird mit Exit-Code 0 signalisiert, Fehler mit einem Exit-Code != 0.

set -e # Bricht das Skript bei Fehlern sofort ab
set -o pipefail # Stellt sicher, dass Fehler in Pipelines korrekt behandelt werden

# --- Konfiguration ---
SMOKE_TEST_CONFIG_NAME="smoke_default"
SMOKE_TEST_SUITE_NAME="smoke"
REPORTS_DIR="reports/qa/smoke_tests"
REPORT_FILE_PREFIX="daily_smoke_test_summary"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
FINAL_REPORT_PATH="${REPORTS_DIR}/${REPORT_FILE_PREFIX}_${TIMESTAMP}.txt"

# Basisverzeichnis für die QualityGuard MCP Tools
MCP_TOOLS_BASE_PATH="libs/mcp/src/server/quality-guard/tools"

# --- Hilfsfunktionen ---

# Funktion zum Ausführen eines QualityGuard MCP-Tools via ts-node
# Parameter:
#   $1: Name des Tool-Skripts (z.B. manageTestConfig.ts)
#   $2...: Argumente für das Tool-Skript
run_mcp_tool() {
    local tool_script_name="$1"
    shift # Entfernt den ersten Parameter (tool_script_name), Rest sind Argumente für das Tool
    local tool_path="${MCP_TOOLS_BASE_PATH}/${tool_script_name}"

    echo "INFO: Führe MCP-Tool '${tool_script_name}' aus mit Argumenten: $@"
    if [ ! -f "$tool_path" ]; then
        echo "FEHLER: Tool-Skript '${tool_path}' nicht gefunden."
        return 1
    fi

    # Annahme: Die Tools sind als exportierte Funktionen implementiert und benötigen einen Runner
    # oder können direkt mit ts-node ausgeführt werden, wenn sie eine CLI-Schnittstelle haben.
    # Für diesen Entwurf wird angenommen, dass sie direkt mit ts-node und Parametern aufgerufen werden können.
    # Beispiel: npx ts-node "${tool_path}" --param1 value1 --param2 value2
    # Die genaue Aufrufsyntax hängt von der Implementierung der einzelnen Tools ab.
    # Hier wird ein generischer Aufruf simuliert.
    if npx ts-node "${tool_path}" "$@"; then
        echo "INFO: MCP-Tool '${tool_script_name}' erfolgreich ausgeführt."
        return 0
    else
        echo "FEHLER: MCP-Tool '${tool_script_name}' fehlgeschlagen."
        return 1
    fi
}

# --- Workflow Schritte ---

echo "INFO: Starte täglichen Smoke-Test-Workflow..."

# 1. Testkonfiguration laden (optional)
# Annahme: manageTestConfig.ts akzeptiert --configName als Parameter
echo "SCHRITT 1: Lade Smoke-Test-Konfiguration..."
if run_mcp_tool "manageTestConfig.ts" --configName "${SMOKE_TEST_CONFIG_NAME}"; then
    echo "INFO: Testkonfiguration '${SMOKE_TEST_CONFIG_NAME}' geladen/verarbeitet."
else
    echo "FEHLER: Laden der Testkonfiguration fehlgeschlagen. Workflow wird abgebrochen."
    exit 1
fi
echo "--------------------------------------------------"

# 2. Test-Suite ausführen
# Annahme: executeTestSuite.ts akzeptiert --suiteName als Parameter
echo "SCHRITT 2: Führe Smoke-Test-Suite '${SMOKE_TEST_SUITE_NAME}' aus..."
# Die Ausgabe von executeTestSuite (z.B. ein Pfad zu Roh-Ergebnisdaten oder eine ID)
# könnte hier in einer Variablen gespeichert werden, falls collectTestData dies benötigt.
TEST_EXECUTION_OUTPUT_DIR="test_results/smoke/${TIMESTAMP}" # Beispielhafter Pfad
mkdir -p "${TEST_EXECUTION_OUTPUT_DIR}"
# Simulierter Aufruf, der Ergebnisse in das Verzeichnis schreibt oder eine ID zurückgibt.
# Für eine echte Implementierung müsste das Tool executeTestSuite.ts entsprechend angepasst werden
# oder die Ausgabe hier geparst werden.
if run_mcp_tool "executeTestSuite.ts" --suiteName "${SMOKE_TEST_SUITE_NAME}" --outputDir "${TEST_EXECUTION_OUTPUT_DIR}"; then
    echo "INFO: Smoke-Test-Suite '${SMOKE_TEST_SUITE_NAME}' erfolgreich ausgeführt. Ergebnisse in '${TEST_EXECUTION_OUTPUT_DIR}'."
else
    echo "FEHLER: Ausführung der Smoke-Test-Suite fehlgeschlagen. Workflow wird abgebrochen."
    exit 1
fi
echo "--------------------------------------------------"

# 3. Testdaten sammeln
# Annahme: collectTestData.ts akzeptiert --source (z.B. ID oder Pfad von executeTestSuite)
# und --destination für die gesammelten Daten.
COLLECTED_DATA_PATH="collected_test_data/smoke/${TIMESTAMP}/data.json" # Beispielhafter Pfad
mkdir -p "$(dirname "${COLLECTED_DATA_PATH}")"
echo "SCHRITT 3: Sammle Testdaten..."
if run_mcp_tool "collectTestData.ts" --sourceDir "${TEST_EXECUTION_OUTPUT_DIR}" --outputFile "${COLLECTED_DATA_PATH}"; then
    echo "INFO: Testdaten erfolgreich gesammelt und unter '${COLLECTED_DATA_PATH}' gespeichert."
else
    echo "FEHLER: Sammeln der Testdaten fehlgeschlagen. Workflow wird abgebrochen."
    exit 1
fi
echo "--------------------------------------------------"

# 4. Bericht generieren
# Annahme: generateReport.ts akzeptiert --inputData (Pfad zu gesammelten Daten)
# und --reportPath für den finalen Bericht.
mkdir -p "$(dirname "${FINAL_REPORT_PATH}")"
echo "SCHRITT 4: Generiere Smoke-Test-Bericht..."
if run_mcp_tool "generateReport.ts" --inputData "${COLLECTED_DATA_PATH}" --reportPath "${FINAL_REPORT_PATH}" --reportType "summary"; then
    echo "INFO: Smoke-Test-Bericht erfolgreich generiert: ${FINAL_REPORT_PATH}"
else
    echo "FEHLER: Generierung des Berichts fehlgeschlagen. Workflow wird abgebrochen."
    exit 1
fi
echo "--------------------------------------------------"

echo "INFO: Täglicher Smoke-Test-Workflow erfolgreich abgeschlossen."
echo "INFO: Finaler Bericht gespeichert unter: ${FINAL_REPORT_PATH}"

exit 0