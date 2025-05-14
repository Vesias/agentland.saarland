import express, { Request, Response, NextFunction } from 'express';
// bodyParser wird nicht mehr benötigt, da express.json() verwendet wird
import { qualityGuardTools } from './tools';
import { QualityGuardServerConfig, QualityGuardTool } from './types';
import { createLogger, configManager, ConfigType } from '@claude-framework/core';

const serverLogger = createLogger('QualityGuardMCP-Server');

interface McpToolRequest {
  tool_name: string;
  arguments: Record<string, any>;
}

// Standardkonfiguration, falls keine übergeben wird
const DEFAULT_PORT = 3005; // Beispiel-Port, kann konfiguriert werden

export class QualityGuardMCP {
  private app: express.Express;
  private config: QualityGuardServerConfig;
  private tools: Map<string, QualityGuardTool> = new Map();

  constructor(config?: Partial<QualityGuardServerConfig>) {
    // Lade die MCP-Konfiguration, um an die Server-spezifischen Einstellungen zu gelangen
    const mcpConfig = configManager.getConfigValue<any>(ConfigType.MCP, 'servers');
    const qgSpecificConfig = mcpConfig?.quality_guard || {};


    this.config = {
      port: config?.port || qgSpecificConfig.port || DEFAULT_PORT,
      ...config, // Erlaube Überschreiben durch direkte Konfiguration
    };

    this.app = express();
    this.initializeMiddleware();
    this.registerTools();
    this.initializeRoutes();
  }

  private initializeMiddleware(): void {
    this.app.use(express.json()); // Verwende express.json() statt bodyParser.json()
    // Logging Middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      serverLogger.info(`[${req.method}] ${req.path} - Request Body: ${JSON.stringify(req.body)}`);
      res.on('finish', () => {
        serverLogger.info(`[${req.method}] ${req.path} - Response Status: ${res.statusCode}`);
      });
      next();
    });
  }

  private registerTools(): void {
    qualityGuardTools.forEach(tool => {
      this.tools.set(tool.name, tool);
      serverLogger.info(`Tool '${tool.name}' registriert.`);
    });
  }

  private initializeRoutes(): void {
    this.app.get('/', (req: Request, res: Response) => {
      res.send('QualityGuard MCP Server läuft!');
    });

    this.app.get('/tools', (req: Request, res: Response) => {
      const availableTools = Array.from(this.tools.values()).map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        outputSchema: tool.outputSchema,
      }));
      res.json(availableTools);
    });

    this.app.post('/use_tool', async (req: Request, res: Response) => {
      const { tool_name, arguments: args } = req.body as McpToolRequest;

      if (!tool_name || !args) {
        return res.status(400).json({ error: 'tool_name und arguments sind erforderlich.' });
      }

      const tool = this.tools.get(tool_name);
      if (!tool) {
        return res.status(404).json({ error: `Tool '${tool_name}' nicht gefunden.` });
      }

      try {
        // Hier könnte eine Schema-Validierung der 'args' gegen tool.inputSchema erfolgen
        // z.B. mit AJV, falls im Projekt vorhanden und gewünscht.
        // const validate = ajv.compile(tool.inputSchema);
        // if (!validate(args)) {
        //   return res.status(400).json({ error: 'Ungültige Eingabeparameter.', details: validate.errors });
        // }

        const result = await tool.execute(args);
        return res.json(result);
      } catch (error: any) {
        serverLogger.error(`Fehler bei der Ausführung von Tool '${tool_name}': ${error.message}`, { error });
        return res.status(500).json({ error: `Fehler bei der Ausführung von Tool '${tool_name}'.`, details: error.message });
      }
    });
  }

  public start(): void {
    this.app.listen(this.config.port, () => {
      serverLogger.info(`QualityGuard MCP Server gestartet auf Port ${this.config.port}`);
      serverLogger.info(`Verfügbare Tools: ${Array.from(this.tools.keys()).join(', ')}`);
    });
  }
}

// Ermöglicht den direkten Start des Servers, wenn die Datei ausgeführt wird.
if (require.main === module) {
  const server = new QualityGuardMCP();
  server.start();
}