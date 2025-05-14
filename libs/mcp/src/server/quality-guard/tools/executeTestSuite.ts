import {
  ExecuteTestSuiteInput,
  ExecuteTestSuiteOutput,
  QualityGuardTool,
  TestSummary,
  TestError,
} from '../types';
import { createLogger } from '@claude-framework/core';
import { spawn } from 'child_process';
import * as path from 'path';

// Helper function to parse Jest JSON output
const parseJestOutput = (stdout: string): { summary: TestSummary, errors: TestError[], detailedResults: any } => {
  try {
    // Jest gibt möglicherweise mehrere JSON-Objekte aus, wenn --json verwendet wird,
    // oder Text vor/nach dem JSON. Wir versuchen, das relevante JSON-Objekt zu finden.
    const jsonOutputRegex = /{[\s\S]*"success":[\s\S]*}/;
    const match = stdout.match(jsonOutputRegex);

    if (!match || !match[0]) {
      // Fallback, wenn kein klares JSON-Objekt gefunden wird
      const lines = stdout.split('\n');
      const summary: TestSummary = { total: 0, passed: 0, failed: 0, skipped: 0 };
      const errors: TestError[] = [];

      let totalTestsLine = lines.find(line => line.includes('Tests:'));
      if (totalTestsLine) {
        const failedMatch = totalTestsLine.match(/(\d+)\s+failed/);
        const passedMatch = totalTestsLine.match(/(\d+)\s+passed/);
        const totalMatch = totalTestsLine.match(/(\d+)\s+total/);
        if (failedMatch) summary.failed = parseInt(failedMatch[1], 10);
        if (passedMatch) summary.passed = parseInt(passedMatch[1], 10);
        if (totalMatch) summary.total = parseInt(totalMatch[1], 10);
      }
      // Einfache Fehlererkennung
      if (summary.failed > 0) {
        errors.push({ message: 'Ein oder mehrere Tests sind fehlgeschlagen. Details siehe stdout.' });
      }

      return { summary, errors, detailedResults: { rawOutput: stdout } };
    }

    const jestResult = JSON.parse(match[0]);

    const summary: TestSummary = {
      total: jestResult.numTotalTests || 0,
      passed: jestResult.numPassedTests || 0,
      failed: jestResult.numFailedTests || 0,
      skipped: jestResult.numPendingTests || 0, // oder numTodoTests
      duration: jestResult.endTime && jestResult.startTime ? (jestResult.endTime - jestResult.startTime) / 1000 : undefined,
    };

    const errors: TestError[] = [];
    if (jestResult.testResults) {
      jestResult.testResults.forEach((suiteResult: any) => {
        if (suiteResult.assertionResults) {
          suiteResult.assertionResults.forEach((assertion: any) => {
            if (assertion.status === 'failed') {
              errors.push({
                testName: assertion.fullName || assertion.title,
                message: assertion.failureMessages?.join('\n') || 'Test fehlgeschlagen',
                stackTrace: assertion.failureDetails?.map((fd: any) => fd.stack).join('\n\n') || undefined,
              });
            }
          });
        }
      });
    }
    return { summary, errors, detailedResults: jestResult };
  } catch (e: any) {
    return {
      summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
      errors: [{ message: 'Fehler beim Parsen der Testausgabe.', stackTrace: e.stack }],
      detailedResults: { rawOutput: stdout, parsingError: e.message },
    };
  }
};


export const executeTestSuiteTool: QualityGuardTool = {
  name: 'executeTestSuite',
  description: 'Führt eine definierte Test-Suite aus (z.B. unit, integration, e2e) und gibt die Ergebnisse zurück.',
  inputSchema: {
    type: 'object',
    properties: {
      suiteName: { type: 'string', description: "Name der Test-Suite (z.B. 'unit', 'integration', 'e2e' oder spezifischer Pfad)." },
      targetComponent: { type: 'string', description: 'Optional: Die zu testende Komponente oder das Modul.' },
      environment: { type: 'string', enum: ['docker', 'local'], default: 'docker', description: 'Ausführungsumgebung.' },
      config: { type: 'object', description: 'Spezifische Testkonfiguration für den Testlauf.', additionalProperties: true },
      additionalArgs: { type: 'array', items: { type: 'string' }, description: 'Optionale zusätzliche Argumente für das Testausführungsskript.' },
    },
    required: ['suiteName'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['success', 'failure', 'error'], description: "Status der Testausführung ('error' bei Tool-Fehlern)." },
      testRunId: { type: 'string', description: 'Eindeutige ID des Testlaufs.' },
      summary: {
        type: 'object',
        properties: {
          total: { type: 'number' },
          passed: { type: 'number' },
          failed: { type: 'number' },
          skipped: { type: 'number' },
          duration: { type: 'number', description: 'Dauer in Sekunden' },
        },
        required: ['total', 'passed', 'failed', 'skipped'],
        description: 'Zusammenfassung der Testergebnisse.',
      },
      detailedResults: { type: 'object', description: 'Detaillierte, potenziell unstrukturierte Ergebnisse vom Testrunner.', additionalProperties: true },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            testName: { type: 'string' },
            message: { type: 'string' },
            stackTrace: { type: 'string' },
          },
          required: ['message'],
        },
        description: 'Strukturierte Fehler, falls das Parsen fehlschlägt oder Tests fehlschlagen.',
      },
      logs: {
        type: 'object',
        properties: {
          stdout: { type: 'string' },
          stderr: { type: 'string' },
          exitCode: { type: 'number' },
        },
        required: ['stdout', 'stderr', 'exitCode'],
        description: 'Standardausgabe, Standardfehlerausgabe und Exit-Code des Testskripts.',
      },
      message: { type: 'string', description: 'Allgemeine Nachricht, z.B. bei Tool-Fehlern.' },
    },
    required: ['status'],
  },
  execute: async (args: ExecuteTestSuiteInput): Promise<ExecuteTestSuiteOutput> => {
    const toolLogger = createLogger('QualityGuardMCP-executeTestSuite');
    toolLogger.info(`Tool 'executeTestSuite' aufgerufen mit Argumenten: ${JSON.stringify(args)}`);
    const testRunId = `test-${Date.now()}`;

    try {
      const { suiteName, targetComponent, environment = 'docker', config, additionalArgs = [] } = args;

      let scriptPath: string;
      const scriptArgs: string[] = [];

      if (environment === 'docker') {
        scriptPath = path.resolve(__dirname, '../../../../../../tools/scripts/qa/run_tests_in_docker.sh');
        // Docker-Skript erwartet möglicherweise keine direkten Suite-Namen als Argumente,
        // diese müssten innerhalb des Docker-Containers an den Testrunner übergeben werden.
        // Fürs Erste gehen wir davon aus, dass das Docker-Skript alle Tests ausführt oder
        // über Umgebungsvariablen (die hier nicht gesetzt werden) konfiguriert wird.
        // Wenn spezifische Suites/Komponenten im Docker-Kontext getestet werden sollen,
        // muss das run_tests_in_docker.sh Skript entsprechend angepasst werden,
        // um diese Parameter zu akzeptieren und an den Testrunner weiterzuleiten.
        // Beispiel: scriptArgs.push(suiteName); if (targetComponent) scriptArgs.push(targetComponent);
        // Diese werden dann im Dockerfile oder Entrypoint an Jest/Vitest übergeben.
        // Für dieses Beispiel fügen wir sie hinzu, aber das Docker-Skript muss sie verarbeiten können.
        scriptArgs.push(suiteName);
        if (targetComponent) {
          scriptArgs.push('--targetComponent', targetComponent);
        }
        if (config) {
           // Z.B. Umwandlung von config in Umgebungsvariablen oder eine temporäre Konfigurationsdatei
           toolLogger.warn('Die `config`-Option ist für Docker-Ausführung noch nicht vollständig implementiert und wird ignoriert.');
        }

      } else if (environment === 'local') {
        // Beispiel für lokale Ausführung (muss an das Projekt angepasst werden)
        // Annahme: Jest wird direkt aufgerufen
        scriptPath = 'npx'; // oder der direkte Pfad zu jest/vitest
        scriptArgs.push('jest'); // oder 'vitest'
        scriptArgs.push('--json'); // Für maschinenlesbare Ausgabe
        scriptArgs.push(suiteName); // z.B. Pfad zur Testdatei oder ein Muster
        if (targetComponent) {
          // Jest/Vitest spezifische Argumente für Komponentenfilterung
          // z.B. scriptArgs.push('--testPathPattern', targetComponent);
          toolLogger.warn(`targetComponent Filterung für lokale Ausführung ist beispielhaft und muss ggf. angepasst werden.`);
          scriptArgs.push(targetComponent); // Vereinfacht, könnte ein Pfad sein
        }
        // Weitere Konfigurationen für Jest/Vitest könnten hier hinzugefügt werden
        // z.B. scriptArgs.push('--config', JSON.stringify(config));
      } else {
        toolLogger.error(`Unbekannte Umgebung: ${environment}`);
        return {
          status: 'error',
          testRunId,
          message: `Unbekannte Umgebung: ${environment}. Unterstützt werden 'docker' und 'local'.`,
        };
      }

      scriptArgs.push(...additionalArgs);

      toolLogger.info(`Führe Skript aus: ${scriptPath} mit Argumenten: ${scriptArgs.join(' ')}`);

      return new Promise((resolve) => {
        const process = spawn(scriptPath, scriptArgs, { shell: true }); // shell: true für npx und Pfadauflösung
        let stdout = '';
        let stderr = '';

        process.stdout.on('data', (data) => {
          stdout += data.toString();
          toolLogger.debug(`stdout: ${data.toString()}`);
        });

        process.stderr.on('data', (data) => {
          stderr += data.toString();
          toolLogger.error(`stderr: ${data.toString()}`);
        });

        process.on('close', (exitCode) => {
          toolLogger.info(`Skript beendet mit Exit-Code: ${exitCode}`);
          const logs = { stdout, stderr, exitCode: exitCode ?? -1 };

          if (exitCode !== 0 && environment === 'docker') {
             // Docker-Skript gibt Exit-Code des Test-Containers zurück.
             // Ein Exit-Code != 0 bedeutet meist Testfehler.
            const parsedOutput = parseJestOutput(stdout); // Versuche trotzdem zu parsen
            resolve({
              status: 'failure',
              testRunId,
              summary: parsedOutput.summary,
              detailedResults: parsedOutput.detailedResults,
              errors: parsedOutput.errors.length > 0 ? parsedOutput.errors : [{ message: `Testlauf fehlgeschlagen. Exit-Code: ${exitCode}. Siehe Logs.`}],
              logs,
              message: `Testlauf in Docker fehlgeschlagen. Exit-Code: ${exitCode}.`,
            });
            return;
          } else if (exitCode !== 0 && environment === 'local') {
             const parsedOutput = parseJestOutput(stdout);
             resolve({
              status: 'failure',
              testRunId,
              summary: parsedOutput.summary,
              detailedResults: parsedOutput.detailedResults,
              errors: parsedOutput.errors.length > 0 ? parsedOutput.errors : [{ message: `Testlauf fehlgeschlagen. Exit-Code: ${exitCode}. Siehe Logs.`}],
              logs,
              message: `Lokaler Testlauf fehlgeschlagen. Exit-Code: ${exitCode}.`,
            });
            return;
          }


          // Versuche, die Ausgabe zu parsen, auch wenn der Exit-Code 0 ist
          // (manchmal geben Testrunner 0 zurück, auch wenn es Warnungen/Skipped Tests gibt)
          const parsedOutput = parseJestOutput(stdout);

          if (parsedOutput.summary.failed > 0 || parsedOutput.errors.length > 0) {
             resolve({
              status: 'failure',
              testRunId,
              summary: parsedOutput.summary,
              detailedResults: parsedOutput.detailedResults,
              errors: parsedOutput.errors,
              logs,
            });
          } else {
            resolve({
              status: 'success',
              testRunId,
              summary: parsedOutput.summary,
              detailedResults: parsedOutput.detailedResults,
              errors: [],
              logs,
            });
          }
        });

        process.on('error', (err) => {
          toolLogger.error(`Fehler beim Starten des Skripts: ${err.message}`);
          resolve({
            status: 'error',
            testRunId,
            message: `Fehler beim Starten des Testskripts: ${err.message}`,
            logs: { stdout, stderr, exitCode: -1 },
            errors: [{ message: `Fehler beim Starten des Testskripts: ${err.message}`, stackTrace: err.stack }],
          });
        });
      });
    } catch (error: any) {
      toolLogger.error(`Unerwarteter Fehler im Tool executeTestSuite: ${error.message}`, error);
      return {
        status: 'error',
        testRunId,
        message: `Unerwarteter Fehler im Tool: ${error.message}`,
        errors: [{ message: `Unerwarteter Fehler: ${error.message}`, stackTrace: error.stack }],
      };
    }
  },
};