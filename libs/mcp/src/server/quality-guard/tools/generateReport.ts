import {
  GenerateReportInput,
  GenerateReportOutput,
  QualityGuardTool,
  ReportMetadata, // Import ReportMetadata
  CollectTestDataOutput, // Angenommen für inputData Struktur
} from '../types';
import { createLogger } from '@claude-framework/core';
import * as fs from 'fs/promises';
import * as path from 'path';

const toolLogger = createLogger('QualityGuardMCP-generateReport');

// Hilfsfunktion zum Erstellen von Verzeichnissen, falls nicht vorhanden
async function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  try {
    await fs.access(dirname);
  } catch (e) {
    await fs.mkdir(dirname, { recursive: true });
  }
}

export const generateReportTool: QualityGuardTool = {
  name: 'generateReport',
  description:
    'Generiert einen Bericht basierend auf gesammelten Testdaten oder direkt übergebenen Daten.',
  inputSchema: {
    type: 'object',
    properties: {
      collectedDataExecutionId: {
        type: 'string',
        description:
          'ID der Ausführung des collectTestData-Tools, dessen Ergebnis als Datenbasis dient.',
      },
      inputData: {
        type: 'object',
        description:
          'Alternative zu collectedDataExecutionId, falls Daten direkt übergeben werden (z.B. Ausgabe von collectTestData).',
        additionalProperties: true,
      },
      reportType: {
        type: 'string',
        enum: [
          'summary',
          'detailed_html',
          'markdown_comparison',
          'detailed',
          'performance',
          'stability',
          'security',
        ],
        description: 'Art des zu generierenden Berichts.',
      },
      templateName: {
        type: 'string',
        description: 'Optionaler Name einer Vorlage für den Bericht.',
      },
      outputFileName: {
        type: 'string',
        description:
          'Optionaler Name der zu erstellenden Berichtsdatei (ohne Pfad, nur Dateiname).',
      },
    },
    required: ['reportType'],
    // Stellt sicher, dass entweder collectedDataExecutionId oder inputData vorhanden ist
    anyOf: [
      { required: ['collectedDataExecutionId'] },
      { required: ['inputData'] },
    ],
  },
  outputSchema: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success', 'failure', 'error'],
        description: 'Status der Berichtsgenerierung.',
      },
      reportPath: {
        type: 'string',
        description: 'Pfad zur generierten Berichtsdatei.',
      },
      reportData: {
        type: 'object',
        description:
          'Die direkten Berichtsdaten (z.B. für summary oder wenn keine Datei geschrieben wird).',
        additionalProperties: true,
      },
      reportMetadata: {
        type: 'object',
        description: 'Metadaten über den generierten Bericht.',
        properties: {
            reportType: { type: 'string' },
            generatedAt: { type: 'string', format: 'date-time' },
            sourceDataId: { type: 'string' },
            templateUsed: { type: 'string' },
            fileSizeBytes: { type: 'number' },
        },
        required: ['reportType', 'generatedAt'],
      },
      message: {
        type: 'string',
        description: 'Zusätzliche Nachricht oder Fehlerdetails.',
      },
    },
    required: ['status'],
  },
  execute: async (args: GenerateReportInput): Promise<GenerateReportOutput> => {
    toolLogger.info(
      `Tool 'generateReport' aufgerufen. Parameter: ${JSON.stringify(args)}`
    );

    let reportContent: string | Record<string, any> = '';
    let resolvedInputData: CollectTestDataOutput['data'] | any = args.inputData; // Typ anpassen, falls CollectTestDataOutput['data'] genauer definiert ist
    const reportFileName = args.outputFileName || `${args.reportType}_report_${Date.now()}`;
    let reportExtension = '.txt'; // Standard-Erweiterung

    try {
      // 1. Datenbeschaffung
      if (args.collectedDataExecutionId && !args.inputData) {
        // TODO: Implementiere Logik zum Abrufen von Daten basierend auf collectedDataExecutionId
        // Dies erfordert Zugriff auf vergangene Tool-Ausführungen.
        // Fürs Erste wird ein Fehler geworfen, wenn inputData fehlt und collectedDataExecutionId genutzt werden soll.
        toolLogger.warn(
          `Datenabruf für collectedDataExecutionId '${args.collectedDataExecutionId}' ist noch nicht implementiert. Bitte 'inputData' bereitstellen.`
        );
        // resolvedInputData = await retrieveDataFromExecution(args.collectedDataExecutionId); // Platzhalter
        return {
          status: 'error',
          message: `Datenabruf für collectedDataExecutionId '${args.collectedDataExecutionId}' ist noch nicht implementiert. Bitte 'inputData' direkt bereitstellen.`,
        };
      } else if (!args.inputData && !args.collectedDataExecutionId) {
        return {
            status: 'error',
            message: 'Weder collectedDataExecutionId noch inputData wurden bereitgestellt.',
        };
      }

      // TODO: Vorlagenlogik (optional)
      if (args.templateName) {
        toolLogger.info(`Versuche Vorlage zu laden: ${args.templateName}`);
        // TODO: Implementiere das Laden und Anwenden von Vorlagen aus z.B. templates/reports/
        // reportContent = await applyTemplate(args.templateName, resolvedInputData);
        toolLogger.warn(`Vorlagen-Feature (templateName: ${args.templateName}) ist noch nicht implementiert.`);
      }

      // 2. Berichtsgenerierung basierend auf reportType
      switch (args.reportType) {
        case 'summary':
          reportExtension = '.md';
          if (resolvedInputData && typeof resolvedInputData === 'object') {
            let summaryText = `# Zusammenfassender Bericht\n\n`;
            summaryText += `Generiert am: ${new Date().toISOString()}\n\n`;
            if (args.collectedDataExecutionId) {
              summaryText += `Basierend auf Daten von Ausführung: ${args.collectedDataExecutionId}\n`;
            }
            summaryText += `## Datenübersicht:\n`;
            // Einfache Darstellung der obersten Ebene der Daten
            for (const key in resolvedInputData) {
              if (Object.prototype.hasOwnProperty.call(resolvedInputData, key)) {
                const value = resolvedInputData[key];
                summaryText += `- **${key}**: ${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}\n`;
              }
            }
            // Beispiel: Wenn inputData die Struktur von CollectTestDataOutput hat
            if (resolvedInputData.metadata && resolvedInputData.metadata.processedSources) {
                summaryText += `\n## Metadaten der Datensammlung:\n`;
                summaryText += `- Verarbeitete Quellen: ${resolvedInputData.metadata.processedSources}\n`;
                if (resolvedInputData.metadata.failedSources > 0) {
                    summaryText += `- Fehlgeschlagene Quellen: ${resolvedInputData.metadata.failedSources}\n`;
                }
            }
            reportContent = summaryText;
          } else {
            reportContent = `# Zusammenfassender Bericht\n\nKeine detaillierten Eingabedaten für die Zusammenfassung gefunden. Generische Zusammenfassung.`;
          }
          break;
        case 'detailed_html':
          reportExtension = '.html';
          // TODO: Implementiere die Generierung eines einfachen HTML-Berichts
          reportContent = `<html><head><title>Detaillierter HTML Bericht</title></head><body><h1>Detaillierter HTML Bericht</h1><p>Daten: ${JSON.stringify(resolvedInputData, null, 2)}</p><p>TODO: Komplexere HTML-Generierung.</p></body></html>`;
          toolLogger.warn("Die Generierung für 'detailed_html' ist ein Platzhalter.");
          break;
        case 'markdown_comparison':
          reportExtension = '.md';
          // TODO: Implementiere die Generierung eines Markdown-Vergleichsberichts
          // Dies würde typischerweise zwei Sätze von inputData erfordern.
          reportContent = `# Markdown Vergleichsbericht\n\nTODO: Implementierung des Vergleichs. Daten: ${JSON.stringify(resolvedInputData, null, 2)}`;
          toolLogger.warn("Die Generierung für 'markdown_comparison' ist ein Platzhalter.");
          break;
        // Beibehaltung der alten Fälle als TODOs oder für spezifischere Implementierungen
        case 'detailed':
        case 'performance':
        case 'stability':
        case 'security':
          toolLogger.warn(`Berichtstyp '${args.reportType}' ist noch nicht vollständig implementiert und verwendet eine Standardbehandlung.`);
          reportContent = `Bericht für ${args.reportType}:\n${JSON.stringify(resolvedInputData, null, 2)}\n\nTODO: Spezifische Implementierung für diesen Berichtstyp.`;
          break;
        default:
          toolLogger.error(`Unbekannter Berichtstyp: ${args.reportType}`);
          return {
            status: 'error',
            message: `Unbekannter Berichtstyp: ${args.reportType}`,
          };
      }

      // 3. Bericht speichern (optional, wenn outputFileName gegeben ist)
      const reportBaseDir = path.resolve(process.cwd(), 'reports', 'quality_guard');
      const finalReportPath = path.join(reportBaseDir, `${reportFileName}${reportExtension}`);
      
      await ensureDirectoryExistence(finalReportPath);
      await fs.writeFile(finalReportPath, typeof reportContent === 'string' ? reportContent : JSON.stringify(reportContent, null, 2));
      toolLogger.info(`Bericht erfolgreich gespeichert unter: ${finalReportPath}`);

      const stats = await fs.stat(finalReportPath);

      const metadata: ReportMetadata = {
        reportType: args.reportType,
        generatedAt: new Date().toISOString(),
        sourceDataId: args.collectedDataExecutionId || (args.inputData ? 'direct_input' : undefined),
        templateUsed: args.templateName || undefined,
        fileSizeBytes: stats.size,
      };

      return {
        status: 'success',
        reportPath: finalReportPath,
        reportData: typeof reportContent !== 'string' ? reportContent : undefined, // Nur wenn es ein Objekt ist und nicht nur Text
        reportMetadata: metadata,
        message: `Bericht vom Typ "${args.reportType}" erfolgreich generiert und gespeichert unter ${finalReportPath}.`,
      };
    } catch (error: any) {
      toolLogger.error('Fehler bei der Berichtsgenerierung:', error);
      return {
        status: 'error',
        message: `Fehler bei der Berichtsgenerierung: ${error.message}`,
        reportMetadata: { // Auch bei Fehlern grundlegende Metadaten liefern
            reportType: args.reportType,
            generatedAt: new Date().toISOString(),
            sourceDataId: args.collectedDataExecutionId || (args.inputData ? 'direct_input' : undefined),
            templateUsed: args.templateName || undefined,
        }
      };
    }
  },
};