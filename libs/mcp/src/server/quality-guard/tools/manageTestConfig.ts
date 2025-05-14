import * as fs from 'fs/promises';
import * as path from 'path';
import {
  ManageTestConfigInput,
  ManageTestConfigOutput,
  QualityGuardTool,
} from '../types';
import { createLogger } from '@claude-framework/core';

const toolLogger = createLogger('QualityGuardMCP-manageTestConfig');

const DEFAULT_STORAGE_PATH = 'configs/qa_test_configs/';

// Helper function to ensure the storage path exists
async function ensureStoragePath(storagePath: string): Promise<void> {
  try {
    await fs.mkdir(storagePath, { recursive: true });
    toolLogger.info(`Storage path "${storagePath}" ensured.`);
  } catch (error: any) {
    toolLogger.error(`Error ensuring storage path "${storagePath}": ${error.message}`);
    throw new Error(`Could not create or access storage path: ${storagePath}`);
  }
}

// Helper function to resolve and validate file paths
function resolveConfigPath(basePath: string, configName: string): string {
  if (!configName.endsWith('.json')) {
    configName += '.json';
  }
  const resolvedPath = path.resolve(basePath, configName);
  // Basic path traversal check
  if (!resolvedPath.startsWith(path.resolve(basePath))) {
    throw new Error(`Invalid configName leading to path traversal: ${configName}`);
  }
  return resolvedPath;
}

export const manageTestConfigTool: QualityGuardTool = {
  name: 'manageTestConfig',
  description: 'Verwaltet Testkonfigurationen (erstellen, lesen, aktualisieren, löschen, auflisten).',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['create', 'read', 'update', 'delete', 'list'],
        description: 'Die auszuführende Aktion.',
      },
      configName: {
        type: 'string',
        description: 'Name der Konfiguration (erforderlich für create, read, update, delete).',
      },
      configData: {
        type: 'object',
        description: 'Daten der Konfiguration (erforderlich für create, update).',
        additionalProperties: true,
      },
      storagePath: {
        type: 'string',
        description: `Optionaler Basispfad für Konfigurationsdateien (Standard: ${DEFAULT_STORAGE_PATH}).`,
      },
    },
    required: ['action'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['success', 'failure'], description: 'Status der Operation.' },
      message: { type: 'string', description: 'Statusnachricht oder Fehlermeldung.' },
      configName: { type: 'string', description: 'Name der Konfiguration (bei create, read, update Erfolg).' },
      configData: { type: 'object', description: 'Daten der Konfiguration (bei read, create Erfolg).', additionalProperties: true },
      configsList: { type: 'array', items: { type: 'string' }, description: 'Liste der Konfigurationsnamen (bei list Erfolg).' },
    },
    required: ['status', 'message'],
  },
  execute: async (args: ManageTestConfigInput): Promise<ManageTestConfigOutput> => {
    toolLogger.info(`Tool 'manageTestConfig' aufgerufen mit Aktion '${args.action}' und Argumenten: ${JSON.stringify(args)}`);
    const storagePath = args.storagePath || DEFAULT_STORAGE_PATH;

    try {
      await ensureStoragePath(storagePath);

      switch (args.action) {
        case 'create':
          if (!args.configName || !args.configData) {
            return { status: 'failure', message: 'configName und configData sind erforderlich für Aktion "create".' };
          }
          const createFilePath = resolveConfigPath(storagePath, args.configName);
          try {
            await fs.writeFile(createFilePath, JSON.stringify(args.configData, null, 2), { flag: 'wx' });
            toolLogger.info(`Konfiguration "${args.configName}" erfolgreich in "${createFilePath}" erstellt.`);
            return { status: 'success', message: `Konfiguration "${args.configName}" erfolgreich erstellt.`, configName: args.configName, configData: args.configData };
          } catch (error: any) {
            if (error.code === 'EEXIST') {
              toolLogger.warn(`Konfiguration "${args.configName}" existiert bereits in "${createFilePath}".`);
              return { status: 'failure', message: `Konfiguration "${args.configName}" existiert bereits.` };
            }
            toolLogger.error(`Fehler beim Erstellen der Konfiguration "${args.configName}": ${error.message}`);
            return { status: 'failure', message: `Fehler beim Erstellen der Konfiguration: ${error.message}` };
          }

        case 'read':
          if (!args.configName) {
            return { status: 'failure', message: 'configName ist erforderlich für Aktion "read".' };
          }
          const readFilePath = resolveConfigPath(storagePath, args.configName);
          try {
            const data = await fs.readFile(readFilePath, 'utf-8');
            const configData = JSON.parse(data);
            toolLogger.info(`Konfiguration "${args.configName}" erfolgreich aus "${readFilePath}" gelesen.`);
            return { status: 'success', message: `Konfiguration "${args.configName}" erfolgreich gelesen.`, configName: args.configName, configData };
          } catch (error: any) {
            if (error.code === 'ENOENT') {
              toolLogger.warn(`Konfiguration "${args.configName}" nicht gefunden in "${readFilePath}".`);
              return { status: 'failure', message: `Konfiguration "${args.configName}" nicht gefunden.` };
            }
            toolLogger.error(`Fehler beim Lesen der Konfiguration "${args.configName}": ${error.message}`);
            return { status: 'failure', message: `Fehler beim Lesen der Konfiguration: ${error.message}` };
          }

        case 'update':
          if (!args.configName || !args.configData) {
            return { status: 'failure', message: 'configName und configData sind erforderlich für Aktion "update".' };
          }
          const updateFilePath = resolveConfigPath(storagePath, args.configName);
          try {
            // Stelle sicher, dass die Datei existiert, bevor sie überschrieben wird (optional, aber guter Stil für "update")
            await fs.access(updateFilePath); 
            await fs.writeFile(updateFilePath, JSON.stringify(args.configData, null, 2));
            toolLogger.info(`Konfiguration "${args.configName}" erfolgreich in "${updateFilePath}" aktualisiert.`);
            return { status: 'success', message: `Konfiguration "${args.configName}" erfolgreich aktualisiert.`, configName: args.configName, configData: args.configData };
          } catch (error: any) {
            if (error.code === 'ENOENT') {
              toolLogger.warn(`Konfiguration "${args.configName}" nicht gefunden für Update in "${updateFilePath}".`);
              return { status: 'failure', message: `Konfiguration "${args.configName}" nicht gefunden für Update.` };
            }
            toolLogger.error(`Fehler beim Aktualisieren der Konfiguration "${args.configName}": ${error.message}`);
            return { status: 'failure', message: `Fehler beim Aktualisieren der Konfiguration: ${error.message}` };
          }

        case 'delete':
          if (!args.configName) {
            return { status: 'failure', message: 'configName ist erforderlich für Aktion "delete".' };
          }
          const deleteFilePath = resolveConfigPath(storagePath, args.configName);
          try {
            await fs.unlink(deleteFilePath);
            toolLogger.info(`Konfiguration "${args.configName}" erfolgreich aus "${deleteFilePath}" gelöscht.`);
            return { status: 'success', message: `Konfiguration "${args.configName}" erfolgreich gelöscht.` };
          } catch (error: any) {
            if (error.code === 'ENOENT') {
              toolLogger.warn(`Konfiguration "${args.configName}" nicht gefunden zum Löschen in "${deleteFilePath}".`);
              return { status: 'failure', message: `Konfiguration "${args.configName}" nicht gefunden zum Löschen.` };
            }
            toolLogger.error(`Fehler beim Löschen der Konfiguration "${args.configName}": ${error.message}`);
            return { status: 'failure', message: `Fehler beim Löschen der Konfiguration: ${error.message}` };
          }

        case 'list':
          try {
            const files = await fs.readdir(storagePath);
            const jsonFiles = files.filter(file => file.endsWith('.json')).map(file => file.replace('.json', ''));
            toolLogger.info(`Konfigurationen im Pfad "${storagePath}" aufgelistet: ${jsonFiles.join(', ')}`);
            return { status: 'success', message: 'Konfigurationen erfolgreich aufgelistet.', configsList: jsonFiles };
          } catch (error: any) {
            toolLogger.error(`Fehler beim Auflisten der Konfigurationen im Pfad "${storagePath}": ${error.message}`);
            return { status: 'failure', message: `Fehler beim Auflisten der Konfigurationen: ${error.message}` };
          }

        default:
          // Dieser Fall sollte durch das JSON-Schema für 'action' eigentlich nicht erreicht werden.
          const exhaustiveCheck: never = args.action; 
          toolLogger.warn(`Unbekannte Aktion empfangen: ${exhaustiveCheck}`);
          return { status: 'failure', message: `Unbekannte Aktion: ${(args as any).action}` };
      }
    } catch (error: any) {
      toolLogger.error(`Unerwarteter Fehler im Tool 'manageTestConfig': ${error.message}`, error);
      return { status: 'failure', message: `Ein unerwarteter Fehler ist aufgetreten: ${error.message}` };
    }
  },
};