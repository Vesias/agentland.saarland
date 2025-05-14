import {
  ScanSecurityInput,
  ScanSecurityOutput,
  QualityGuardTool,
  Vulnerability,
} from '../types';
import { createLogger } from '@claude-framework/core';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const toolLogger = createLogger('QualityGuardMCP-scanSecurity');

// Helper function to parse npm audit output
const parseNpmAudit = (jsonOutput: string): Vulnerability[] => {
  const vulnerabilities: Vulnerability[] = [];
  try {
    const auditData = JSON.parse(jsonOutput);
    // Simplified parsing, a real implementation would be more robust
    for (const advisoryId in auditData.advisories) {
      const advisory = auditData.advisories[advisoryId];
      vulnerabilities.push({
        id: advisory.id?.toString() || advisoryId, // advisory.id might be a number
        severity: advisory.severity as Vulnerability['severity'],
        title: advisory.title || advisory.module_name,
        description: advisory.overview,
        recommendation: advisory.recommendation,
        packageName: advisory.module_name,
        // packageVersion: 'N/A', // npm audit JSON doesn't always provide this directly per advisory in older versions
        cvssScore: advisory.cvss?.score,
        referenceUrls: advisory.references ? advisory.references.split('\\n') : [],
      });
    }
  } catch (error) {
    toolLogger.error('Fehler beim Parsen der npm audit Ausgabe:', error);
    // Return an empty array or throw, depending on desired error handling
  }
  return vulnerabilities;
};


export const scanSecurityTool: QualityGuardTool = {
  name: 'scanSecurity',
  description: 'Führt Sicherheitsscans für ein Ziel (Modulpfad, URL, Docker-Image) durch.',
  inputSchema: {
    type: 'object',
    properties: {
      target: { type: 'string', description: 'Das zu scannende Ziel (z.B. Modulpfad, URL, Docker-Image-Name).' },
      scanProfile: {
        type: 'string',
        enum: ['basic', 'dependency_check', 'sast', 'dast', 'full'],
        description: 'Art des Scans (z.B. "basic", "dependency_check", "sast", "dast", "full").'
      },
      configPath: { type: 'string', description: 'Optionaler Pfad zu einer spezifischen Scan-Konfigurationsdatei.' },
      environment: { type: 'string', enum: ['docker', 'local'], description: 'Optionale Ausführungsumgebung (Standard: "local").' },
    },
    required: ['target', 'scanProfile'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', description: 'Status des Sicherheitsscans (erfolgreich/fehlgeschlagen).' },
      message: { type: 'string', description: 'Allgemeine Nachricht oder Fehlermeldung.' },
      summary: {
        type: 'object',
        properties: {
          profileUsed: { type: 'string' },
          targetScanned: { type: 'string' },
          vulnerabilitiesFound: { type: 'number' },
          critical: { type: 'number' },
          high: { type: 'number' },
          medium: { type: 'number' },
          low: { type: 'number' },
          info: { type: 'number' },
          durationMs: { type: 'number' },
        },
        required: ['profileUsed', 'targetScanned', 'vulnerabilitiesFound', 'critical', 'high', 'medium', 'low', 'info'],
      },
      vulnerabilities: {
        type: 'array',
        items: {
          // Verweis auf die Vulnerability-Definition (kann komplex sein in JSON Schema, hier vereinfacht)
          type: 'object',
          properties: {
            id: { type: 'string' },
            severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low', 'info'] },
            title: { type: 'string' },
            // ... weitere Eigenschaften von Vulnerability
          }
        }
      },
      reportUrl: { type: 'string', description: 'Optionaler Link zu einem detaillierten Bericht.' },
      errorLog: { type: 'array', items: { type: 'string' }, description: 'Log der Fehler während des Scans.' },
    },
    required: ['success', 'summary', 'vulnerabilities'],
  },
  execute: async (args: ScanSecurityInput): Promise<ScanSecurityOutput> => {
    toolLogger.info(`Tool 'scanSecurity' aufgerufen mit Argumenten: ${JSON.stringify(args)}`);
    const startTime = Date.now();
    const { target, scanProfile, configPath, environment = 'local' } = args;

    let vulnerabilities: Vulnerability[] = [];
    let success = true;
    let message = `Sicherheitsscan (${scanProfile}) für "${target}" gestartet.`;
    const errorLog: string[] = [];

    try {
      switch (scanProfile) {
        case 'dependency_check':
        case 'basic': // 'basic' könnte als Alias für 'dependency_check' dienen
        case 'full': // 'full' schließt dependency_check mit ein
          toolLogger.info(`Führe Dependency Check für Target: ${target} aus...`);
          // Annahme: target ist ein Pfad zu einem Node.js Projekt für npm audit
          // In einer realen Implementierung müsste hier der Paketmanager (npm, yarn, pnpm)
          // und der Projekttyp erkannt werden.
          // Für Docker-Umgebungen müsste der Befehl im Container ausgeführt werden.
          if (environment === 'docker') {
            // TODO: Implement Docker execution logic, e.g., docker exec <container_id> npm audit --json
            message = `Dependency Check in Docker-Umgebung für ${target} ist noch nicht implementiert.`;
            toolLogger.warn(message);
            vulnerabilities.push({
                id: 'docker-dep-check-todo',
                severity: 'info',
                title: 'Docker Dependency Check nicht implementiert',
                description: `Der Dependency Check in einer Docker-Umgebung für das Target ${target} muss noch implementiert werden.`,
            });
            // success bleibt true, da es ein Implementierungs-TODO ist, kein Scan-Fehler
          } else {
            try {
              // Versuche, im Zielverzeichnis auszuführen, falls es ein lokaler Pfad ist.
              // Dies ist eine Vereinfachung. Besser wäre es, den Pfad zum package.json zu ermitteln.
              const command = `npm audit --json --prefix "${target}"`;
              toolLogger.info(`Führe Befehl aus: ${command}`);
              const { stdout, stderr } = await execAsync(command).catch(err => {
                // npm audit gibt exit code > 0 zurück, wenn Schwachstellen gefunden werden.
                // Wir fangen den Fehler ab, um stdout (JSON-Ausgabe) trotzdem zu verarbeiten.
                if (err.stdout) {
                  return { stdout: err.stdout, stderr: err.stderr || '' };
                }
                throw err; // Echter Ausführungsfehler
              });

              if (stderr) {
                toolLogger.warn(`Fehler bei npm audit (stderr): ${stderr}`);
                errorLog.push(`npm audit stderr: ${stderr}`);
              }
              vulnerabilities = vulnerabilities.concat(parseNpmAudit(stdout));
              message = `Dependency Check für "${target}" abgeschlossen.`;
            } catch (err: any) {
              toolLogger.error(`Fehler beim Ausführen von npm audit für ${target}:`, err);
              errorLog.push(`npm audit execution error: ${err.message}`);
              message = `Fehler beim Dependency Check für "${target}".`;
              success = false; // Fehler bei der Ausführung des Scans
            }
          }
          if (scanProfile !== 'full') break; // Nur fortfahren, wenn 'full'
          // Fallthrough zu SAST/DAST wenn 'full'

        case 'sast':
          toolLogger.info(`Führe SAST für Target: ${target} aus... (Platzhalter)`);
          // TODO: Integrate with actual SAST tool (e.g., SonarQube, ESLint security plugins)
          // Beispiel: await runSastTool(target, configPath, environment);
          vulnerabilities.push({
            id: 'sast-placeholder',
            severity: 'info',
            title: 'SAST Scan (Platzhalter)',
            description: `Dies ist ein Platzhalter für einen SAST-Scan auf ${target}. Die tatsächliche Integration eines SAST-Tools steht noch aus.`,
            recommendation: 'Implementieren Sie die SAST-Tool-Integration.',
          });
          message += ` SAST-Scan (Platzhalter) für "${target}" hinzugefügt.`;
          if (scanProfile !== 'full') break;

        case 'dast':
          toolLogger.info(`Führe DAST für Target: ${target} aus... (Platzhalter)`);
          // TODO: Integrate with actual DAST tool (e.g., OWASP ZAP)
          // Dies ist komplexer, da es eine laufende Anwendung erfordert.
          // Beispiel: await runDastTool(target, configPath, environment);
          if (target.startsWith('http://') || target.startsWith('https://')) {
            vulnerabilities.push({
              id: 'dast-placeholder',
              severity: 'info',
              title: 'DAST Scan (Platzhalter)',
              description: `Dies ist ein Platzhalter für einen DAST-Scan auf die URL ${target}. Die tatsächliche Integration eines DAST-Tools steht noch aus.`,
              recommendation: 'Implementieren Sie die DAST-Tool-Integration.',
            });
            message += ` DAST-Scan (Platzhalter) für "${target}" hinzugefügt.`;
          } else {
            toolLogger.warn(`DAST-Scan für Target "${target}" übersprungen, da es keine URL ist.`);
            message += ` DAST-Scan für "${target}" übersprungen (keine URL).`;
            errorLog.push(`DAST Scan skipped for target "${target}" as it is not a URL.`);
          }
          if (scanProfile !== 'full') break;
          break;

        default:
          message = `Unbekannter scanProfile: ${scanProfile}`;
          toolLogger.warn(message);
          success = false;
          errorLog.push(message);
      }
    } catch (error: any) {
      toolLogger.error('Unerwarteter Fehler während des Sicherheitsscans:', error);
      message = `Allgemeiner Fehler während des Scans: ${error.message}`;
      success = false;
      errorLog.push(message);
    }

    const durationMs = Date.now() - startTime;
    const summary = {
      profileUsed: scanProfile,
      targetScanned: target,
      vulnerabilitiesFound: vulnerabilities.length,
      critical: vulnerabilities.filter(v => v.severity === 'critical').length,
      high: vulnerabilities.filter(v => v.severity === 'high').length,
      medium: vulnerabilities.filter(v => v.severity === 'medium').length,
      low: vulnerabilities.filter(v => v.severity === 'low').length,
      info: vulnerabilities.filter(v => v.severity === 'info').length,
      durationMs,
    };

    toolLogger.info(`Scan abgeschlossen. Erfolg: ${success}, Zusammenfassung: ${JSON.stringify(summary)}`);

    return {
      success,
      message: success && vulnerabilities.length === 0 ? `Sicherheitsscan (${scanProfile}) für "${target}" erfolgreich und ohne Befund.` : message,
      summary,
      vulnerabilities,
      errorLog: errorLog.length > 0 ? errorLog : undefined,
      // reportUrl: 'placeholder/report.html' // Optional
    };
  },
};