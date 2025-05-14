#!/bin/bash

# Skript zum Ausführen der Tests innerhalb der Docker-Umgebung
# Dieses Skript baut das Docker-Image (falls noch nicht vorhanden oder veraltet)
# und startet den Test-Container über docker-compose.

# Stellt sicher, dass das Skript bei Fehlern abbricht
set -e

# Wechselt in das Root-Verzeichnis des Projekts, falls das Skript von woanders aufgerufen wird
# Dies stellt sicher, dass Docker Compose die docker-compose.yml im Root findet.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)" # Geht drei Ebenen hoch von tools/scripts/qa zu .
cd "${PROJECT_ROOT}"

echo "Root-Verzeichnis des Projekts: $(pwd)"
echo "Starte Tests in Docker..."

# Optionale Argumente für docker-compose up
# --build: Erzwingt das Neubauden der Images
# --abort-on-container-exit: Beendet docker-compose, sobald ein Container stoppt (nützlich für Testläufe)
# --exit-code-from agent-saarland-tests: Gibt den Exit-Code des Test-Containers zurück
DOCKER_COMPOSE_ARGS="--build --abort-on-container-exit --exit-code-from agent-saarland-tests"

# Führe Docker Compose aus
# Der Service-Name 'agent-saarland-tests' muss mit dem in docker-compose.yml übereinstimmen
docker-compose up ${DOCKER_COMPOSE_ARGS} agent-saarland-tests

# Der Exit-Code von `docker-compose up` wird automatisch weitergegeben,
# wenn `--exit-code-from` verwendet wird.
# Ein explizites `exit $?` ist daher nicht unbedingt nötig, kann aber zur Verdeutlichung dienen.
# exit $?

echo "Tests in Docker abgeschlossen."