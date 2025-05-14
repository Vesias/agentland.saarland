import {
  MeasurePerformanceInput,
  MeasurePerformanceOutput,
  PerformanceMetrics,
  QualityGuardTool,
} from '../types';
import { createLogger } from '@claude-framework/core';
import { performance } from 'perf_hooks'; // Für präzisere Zeitmessung als process.hrtime
import * as path from 'path';
import { fork } from 'child_process';

const toolLogger = createLogger('QualityGuardMCP-measurePerformance');

// Hilfsfunktion zum dynamischen Importieren und Ausführen der Zieloperation
async function executeOperation(
  targetComponentPath: string,
  operationName: string,
  payload?: Record<string, any>
): Promise<any> {
  try {
    // Stelle sicher, dass der Pfad relativ zum Projekt-Root ist, falls nötig
    // Hier wird angenommen, dass targetComponentPath bereits korrekt aufgelöst ist
    // oder relativ zum aktuellen Arbeitsverzeichnis des MCP-Servers ist.
    // Für eine robustere Lösung müsste der Pfad ggf. relativ zum Workspace-Root des Projekts
    // aufgelöst werden, was zusätzliche Konfiguration oder Kontext erfordern könnte.
    const componentModule = await import(targetComponentPath);
    const operation = componentModule[operationName];

    if (typeof operation !== 'function') {
      throw new Error(
        `Operation '${operationName}' not found or not a function in module '${targetComponentPath}'.`
      );
    }
    return await operation(payload);
  } catch (error: any) {
    toolLogger.error(`Error executing operation '${operationName}' in '${targetComponentPath}': ${error.message}`);
    throw error; // Fehler weiterleiten, um in der Hauptfunktion behandelt zu werden
  }
}


export const measurePerformanceTool: QualityGuardTool = {
  name: 'measurePerformance',
  description: 'Misst die Performance einer Komponente oder eines Workflows.',
  inputSchema: {
    type: 'object',
    properties: {
      operationName: { type: 'string', description: 'Name der zu messenden Operation.' },
      targetComponent: { type: 'string', description: 'Die Komponente/Funktion, die getestet wird (z.B. Modulpfad).' },
      iterations: { type: 'number', description: 'Anzahl der Wiederholungen zur Messung.', minimum: 1 },
      payload: { type: 'object', description: 'Optionale Eingabedaten für die Operation.', additionalProperties: true },
      environment: { type: 'string', enum: ['docker', 'local'], default: 'local', description: 'Ausführungsumgebung.' },
    },
    required: ['operationName', 'targetComponent', 'iterations'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['success', 'failure', 'error'], description: 'Status der Performancemessung.' },
      message: { type: 'string', description: 'Allgemeine Nachricht, z.B. bei Tool-Fehlern.' },
      metrics: {
        type: 'object',
        properties: {
          totalDurationMs: { type: 'number' },
          avgDurationMs: { type: 'number' },
          minDurationMs: { type: 'number' },
          maxDurationMs: { type: 'number' },
          iterations: { type: 'number' },
          successfulIterations: { type: 'number' },
          failedIterations: { type: 'number' },
          cpuUsage: { type: 'object' },
          memoryUsage: { type: 'object' },
          errorDetails: { type: 'array' },
          additionalNotes: { type: 'string' },
        },
        required: ['iterations', 'successfulIterations', 'failedIterations'],
        additionalProperties: true,
      },
    },
    required: ['status'],
  },
  execute: async (args: MeasurePerformanceInput): Promise<MeasurePerformanceOutput> => {
    toolLogger.info(`Tool 'measurePerformance' aufgerufen mit Argumenten: ${JSON.stringify(args)}`);
    const { operationName, targetComponent, iterations, payload, environment = 'local' } = args;

    if (environment === 'docker') {
      // TODO: Implementierung für Docker-Ausführung
      // Ähnlich wie bei executeTestSuite, könnte ein Skript im Docker-Container aufgerufen werden.
      // Dieses Skript würde dann die lokale Performance-Messung durchführen und die Ergebnisse zurückgeben.
      toolLogger.warn('Docker environment execution is not yet implemented for measurePerformance. Falling back to local.');
      // Fürs Erste als Fehler oder nicht implementiert behandeln:
      return {
        status: 'error',
        message: 'Docker environment execution is not yet implemented.',
        metrics: {
            iterations: args.iterations,
            successfulIterations: 0,
            failedIterations: args.iterations,
            additionalNotes: 'Docker environment not implemented.',
        }
      };
    }

    const timings: number[] = [];
    let successfulIterations = 0;
    let failedIterations = 0;
    const errorDetails: { iteration: number; error: string }[] = [];

    const initialCpuUsage = process.cpuUsage();
    const initialMemoryUsage = process.memoryUsage();

    let targetModulePath = targetComponent;
    // Einfache Annahme: Wenn es kein absoluter Pfad ist und nicht mit './' oder '../' beginnt,
    // nehmen wir an, es ist ein Modulname oder ein Pfad relativ zum Projekt-Root.
    // Für eine robustere Lösung wäre eine klare Konvention oder ein Basisverzeichnis nötig.
    // Hier wird `path.resolve` verwendet, um es relativ zum aktuellen Arbeitsverzeichnis aufzulösen,
    // was möglicherweise angepasst werden muss, je nachdem, wo der MCP-Server läuft.
    if (!path.isAbsolute(targetComponent) && !targetComponent.startsWith('./') && !targetComponent.startsWith('../')) {
        // Versuche, es relativ zum CWD aufzulösen. Dies ist eine Vereinfachung.
        // Im Idealfall würde man den Workspace-Root kennen und relativ dazu auflösen.
        targetModulePath = path.resolve(process.cwd(), targetComponent);
    }


    for (let i = 0; i < iterations; i++) {
      try {
        const startTime = performance.now();
        // Dynamischer Import und Ausführung der Operation
        // Annahme: targetComponent ist ein auflösbarer Modulpfad und operationName eine exportierte Funktion
        const module = await import(targetModulePath);
        if (typeof module[operationName] !== 'function') {
          throw new Error(`Operation '${operationName}' in module '${targetModulePath}' is not a function.`);
        }
        await module[operationName](payload);
        const endTime = performance.now();
        timings.push(endTime - startTime);
        successfulIterations++;
      } catch (error: any) {
        failedIterations++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        errorDetails.push({ iteration: i + 1, error: errorMessage });
        toolLogger.error(`Iteration ${i + 1} failed for ${operationName} on ${targetComponent}: ${errorMessage}`);
      }
    }

    const finalCpuUsage = process.cpuUsage(initialCpuUsage);
    const finalMemoryUsage = process.memoryUsage();
    // Differenz für MemoryUsage muss manuell berechnet werden für jede Eigenschaft
    const memoryUsageDiff: NodeJS.MemoryUsage = {
        rss: finalMemoryUsage.rss - initialMemoryUsage.rss,
        heapTotal: finalMemoryUsage.heapTotal - initialMemoryUsage.heapTotal,
        heapUsed: finalMemoryUsage.heapUsed - initialMemoryUsage.heapUsed,
        external: finalMemoryUsage.external - initialMemoryUsage.external,
        arrayBuffers: finalMemoryUsage.arrayBuffers - initialMemoryUsage.arrayBuffers,
    };


    if (successfulIterations === 0 && iterations > 0) {
      return {
        status: 'failure',
        message: `All ${iterations} iterations failed for ${operationName} on ${targetComponent}.`,
        metrics: {
          iterations,
          successfulIterations,
          failedIterations,
          cpuUsage: {
            start: initialCpuUsage,
            end: process.cpuUsage(), // Erneuter Aufruf für den Endwert des Prozesses
            diff: finalCpuUsage,
          },
          memoryUsage: {
            start: initialMemoryUsage,
            end: finalMemoryUsage,
            diff: memoryUsageDiff,
          },
          errorDetails,
          additionalNotes: 'CPU and memory usage are for the entire Node.js process and only indicative.',
        },
      };
    }
    
    const totalDurationMs = timings.reduce((acc, t) => acc + t, 0);
    const avgDurationMs = totalDurationMs / successfulIterations;
    const minDurationMs = Math.min(...timings);
    const maxDurationMs = Math.max(...timings);

    const metrics: PerformanceMetrics = {
      totalDurationMs: successfulIterations > 0 ? totalDurationMs : undefined,
      avgDurationMs: successfulIterations > 0 ? avgDurationMs : undefined,
      minDurationMs: successfulIterations > 0 ? minDurationMs : undefined,
      maxDurationMs: successfulIterations > 0 ? maxDurationMs : undefined,
      iterations,
      successfulIterations,
      failedIterations,
      cpuUsage: {
        start: initialCpuUsage,
        end: process.cpuUsage(), // Erneuter Aufruf für den Endwert des Prozesses
        diff: finalCpuUsage,
      },
      memoryUsage: {
        start: initialMemoryUsage,
        end: finalMemoryUsage,
        diff: memoryUsageDiff,
      },
      errorDetails: errorDetails.length > 0 ? errorDetails : undefined,
      additionalNotes: 'CPU and memory usage are for the entire Node.js process and only indicative. Dynamic import used for target component.',
    };

    return {
      status: 'success',
      metrics,
    };
  },
};