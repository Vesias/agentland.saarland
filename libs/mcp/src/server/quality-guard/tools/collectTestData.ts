import {
  CollectTestDataInput,
  CollectTestDataOutput,
  QualityGuardTool,
  DataSource,
  CollectionMetadata,
} from '../types';
import { createLogger } from '@claude-framework/core';
import * as fs from 'fs/promises';
import * as path from 'path';

const toolLogger = createLogger('QualityGuardMCP-collectTestData');

// Hilfsfunktion zum Lesen von Dateien
async function readFileContent(filePath: string, format: 'json' | 'text'): Promise<any> {
  try {
    const absolutePath = path.resolve(filePath); // Sicherstellen, dass der Pfad absolut ist
    const content = await fs.readFile(absolutePath, 'utf-8');
    if (format === 'json') {
      return JSON.parse(content);
    }
    return content;
  } catch (error: any) {
    toolLogger.error(`Fehler beim Lesen der Datei ${filePath} (Format: ${format}): ${error.message}`);
    throw new Error(`Konnte Datei nicht lesen: ${filePath}. Fehler: ${error.message}`);
  }
}

export const collectTestDataTool: QualityGuardTool = {
  name: 'collectTestData',
  description: 'Sammelt und aggregiert Testdaten aus verschiedenen Quellen wie Dateien oder MCP Tool Ausgaben.',
  inputSchema: {
    type: 'object',
    properties: {
      sources: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['file', 'mcp_tool_output'] },
            id: { type: 'string', description: 'Optionale ID zur Identifizierung der Quelle in den Ergebnissen.' },
            // Für 'file'
            path: { type: 'string', description: 'Pfad zur Datei (nur für type="file").' },
            format: { type: 'string', enum: ['json', 'text'], description: 'Format der Datei (nur für type="file").' },
            // Für 'mcp_tool_output'
            toolName: { type: 'string', description: 'Name des MCP-Tools (nur für type="mcp_tool_output").' },
            executionId: { type: 'string', description: 'Eindeutige ID der Tool-Ausführung (nur für type="mcp_tool_output").' },
          },
          required: ['type'],
          // Bedingte Anforderungen basierend auf 'type'
          // Dies kann in JSON Schema 7 mit 'if/then/else' oder 'dependentSchemas' implementiert werden,
          // aber für die Einfachheit hier als Kommentar belassen. Validierung erfolgt in der Logik.
        },
        description: 'Array von Datenquellen, die gesammelt werden sollen.',
      },
      aggregationStrategy: {
        type: 'string',
        enum: ['merge', 'list', 'summary_only'],
        description: 'Strategie zur Aggregation der Daten (optional, Standard: "list").',
        default: 'list',
      },
      outputFormat: {
        type: 'string',
        enum: ['json_array', 'single_json_object'],
        description: 'Gewünschtes Ausgabeformat der aggregierten Daten (optional, Standard: "json_array" für "list", "single_json_object" für "merge").',
      },
    },
    required: ['sources'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['success', 'partial_success', 'failure'], description: 'Status der Datensammlung.' },
      data: { type: 'object', description: 'Die gesammelten und aggregierten Daten.', additionalProperties: true },
      metadata: {
        type: 'object',
        properties: {
          totalSources: { type: 'number' },
          processedSources: { type: 'number' },
          failedSources: { type: 'number' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                sourceId: { type: 'string' },
                message: { type: 'string' },
                details: { type: 'object', additionalProperties: true },
              },
              required: ['message'],
            },
          },
        },
        required: ['totalSources', 'processedSources', 'failedSources', 'errors'],
        description: 'Metadaten über den Sammelprozess.',
      },
      message: { type: 'string', description: 'Zusätzliche Nachricht oder Fehlerdetails.' },
    },
    required: ['status', 'data', 'metadata'],
  },
  execute: async (args: CollectTestDataInput): Promise<CollectTestDataOutput> => {
    toolLogger.info(`Tool 'collectTestData' aufgerufen mit ${args.sources.length} Quellen und Strategie '${args.aggregationStrategy}'.`);

    const collectedData: any[] = [];
    const metadata: CollectionMetadata = {
      totalSources: args.sources.length,
      processedSources: 0,
      failedSources: 0,
      errors: [],
    };

    for (const source of args.sources) {
      const sourceId = source.id || (source.type === 'file' ? source.path : `${source.type}:${source.toolName || 'unknown'}`);
      try {
        if (source.type === 'file') {
          if (!source.path || !source.format) {
            throw new Error("Für 'file'-Quellen müssen 'path' und 'format' angegeben werden.");
          }
          const fileData = await readFileContent(source.path, source.format);
          collectedData.push({ sourceId, data: fileData });
          metadata.processedSources++;
        } else if (source.type === 'mcp_tool_output') {
          // TODO: Implementierung für das Abrufen von MCP-Tool-Ausgaben
          // Dies erfordert eine Methode, um auf vergangene Tool-Ausführungen zuzugreifen
          // (z.B. über eine In-Memory-Speicherung oder eine persistentere Lösung).
          toolLogger.warn(`Datensammlung für MCP-Tool-Ausgabe (Tool: ${source.toolName}, ID: ${source.executionId}) ist noch nicht implementiert.`);
          throw new Error(`Sammeln von MCP-Tool-Ausgaben (Tool: ${source.toolName}) ist noch nicht implementiert.`);
        } else {
          // @ts-expect-error Unbekannter Quelltyp zur Laufzeit
          throw new Error(`Unbekannter Quellentyp: ${source.type}`);
        }
      } catch (error: any) {
        toolLogger.error(`Fehler beim Verarbeiten der Quelle ${sourceId}: ${error.message}`);
        metadata.failedSources++;
        metadata.errors.push({
          sourceId: sourceId,
          message: `Fehler bei Quelle '${sourceId}': ${error.message}`,
          details: error.stack,
        });
      }
    }

    let aggregatedData: any;
    const strategy = args.aggregationStrategy || 'list';
    const defaultOutputFormat = strategy === 'merge' ? 'single_json_object' : 'json_array';
    const outputFormat = args.outputFormat || defaultOutputFormat;

    try {
      switch (strategy) {
        case 'merge':
          aggregatedData = {};
          for (const item of collectedData) {
            if (typeof item.data === 'object' && !Array.isArray(item.data) && item.data !== null) {
              // Einfaches flaches Merging
              aggregatedData = { ...aggregatedData, ...item.data };
            } else {
              // Wenn Daten kein Objekt sind, fügen Sie sie unter ihrer sourceId hinzu
              aggregatedData[item.sourceId || `data_${collectedData.indexOf(item)}`] = item.data;
              toolLogger.warn(`Daten von Quelle '${item.sourceId}' sind kein Objekt und wurden unter einem Schlüssel hinzugefügt, anstatt gemerged zu werden.`);
            }
          }
          if (outputFormat === 'json_array' && typeof aggregatedData === 'object' && aggregatedData !== null) {
             // Wenn json_array explizit gefordert wird, aber wir ein Objekt haben
            aggregatedData = [aggregatedData];
          }
          break;
        case 'summary_only':
          // TODO: Implementierung für 'summary_only'
          // Aktuell verhält es sich wie 'list', da "Zusammenfassungsfelder" nicht definiert sind.
          toolLogger.warn("Aggregationsstrategie 'summary_only' ist noch nicht vollständig implementiert und verhält sich wie 'list'.");
          // Fall through to 'list' for now
        case 'list':
        default:
          aggregatedData = collectedData.map(item => item.data);
          if (outputFormat === 'single_json_object' && Array.isArray(aggregatedData)) {
            // Wenn single_json_object gefordert wird, aber wir ein Array haben
            // Versuche, es in ein Objekt mit Indizes als Schlüssel umzuwandeln
            const tempObject: Record<string, any> = {};
            aggregatedData.forEach((val, index) => {
                const source = collectedData[index];
                tempObject[source?.sourceId || `item_${index}`] = val;
            });
            aggregatedData = tempObject;
          }
          break;
      }
    } catch (aggregationError: any) {
        toolLogger.error(`Fehler bei der Datenaggregation mit Strategie '${strategy}': ${aggregationError.message}`);
        metadata.errors.push({
            message: `Aggregationsfehler: ${aggregationError.message}`,
            details: aggregationError.stack,
        });
        return {
            status: 'failure',
            data: null,
            metadata,
            message: `Fehler bei der Datenaggregation: ${aggregationError.message}`,
        };
    }


    let status: CollectTestDataOutput['status'] = 'failure';
    if (metadata.processedSources === metadata.totalSources && metadata.failedSources === 0) {
      status = 'success';
    } else if (metadata.processedSources > 0) {
      status = 'partial_success';
    }

    return {
      status,
      data: aggregatedData,
      metadata,
      message: status === 'success' ? 'Alle Daten erfolgreich gesammelt und aggregiert.' :
               status === 'partial_success' ? 'Daten teilweise gesammelt. Siehe Metadaten für Fehler.' :
               'Fehler beim Sammeln der Daten. Siehe Metadaten.',
    };
  },
};