// Placeholder für spezifische Typen des QualityGuard MCP Servers

/**
 * Eingabeparameter für das Tool executeTestSuite.
 */
export interface ExecuteTestSuiteInput {
  suiteName: string; // z.B. 'unit', 'integration', 'e2e', oder ein spezifischer Test-Suite-Name/Pfad
  targetComponent?: string; // Optional, um Tests für eine bestimmte Komponente/Modul auszuführen
  environment?: 'docker' | 'local'; // Optional, Standard ist 'docker'
  config?: Record<string, any>; // Spezifische Testkonfiguration für den Testlauf
  additionalArgs?: string[]; // Optionale zusätzliche Argumente für das Testausführungsskript
}

/**
 * Ausgabeparameter für das Tool executeTestSuite.
 */
export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration?: number; // in Sekunden
}

export interface TestError {
  testName?: string;
  message: string;
  stackTrace?: string;
}

export interface ExecuteTestSuiteOutput {
  status: 'success' | 'failure' | 'error'; // 'error' für Ausführungsfehler des Tools selbst
  testRunId?: string;
  summary?: TestSummary;
  detailedResults?: any; // Detaillierte, potenziell unstrukturierte Ergebnisse vom Testrunner
  errors?: TestError[]; // Strukturierte Fehler, falls das Parsen fehlschlägt oder Tests fehlschlagen
  logs?: {
    stdout: string;
    stderr: string;
    exitCode: number;
  };
  message?: string; // Allgemeine Nachricht, z.B. bei Tool-Fehlern
}

/**
 * Eingabeparameter für das Tool measurePerformance.
 */
export interface MeasurePerformanceInput {
  operationName: string; // Name der zu messenden Operation
  targetComponent: string; // Die Komponente/Funktion, die getestet wird (z.B. Modulpfad)
  iterations: number; // Anzahl der Wiederholungen zur Messung
  payload?: Record<string, any>; // Optionale Eingabedaten für die Operation
  environment?: 'docker' | 'local'; // Optional, z.B. "docker", "local", Standard: 'local'
}

/**
 * Ausgabeparameter für das Tool measurePerformance.
 */
export interface PerformanceMetrics {
  totalDurationMs?: number;
  avgDurationMs?: number;
  minDurationMs?: number;
  maxDurationMs?: number;
  iterations: number;
  successfulIterations: number;
  failedIterations: number;
  cpuUsage?: { // Grober Indikator der CPU-Auslastung des Gesamtprozesses
    start?: NodeJS.CpuUsage;
    end?: NodeJS.CpuUsage;
    diff?: NodeJS.CpuUsage;
  };
  memoryUsage?: { // Grober Indikator der Speichernutzung des Gesamtprozesses
    start?: NodeJS.MemoryUsage;
    end?: NodeJS.MemoryUsage;
    diff?: NodeJS.MemoryUsage;
  };
  errorDetails?: { iteration: number; error: string }[];
  additionalNotes?: string; // z.B. Hinweis zur Ungenauigkeit von CPU/Speicher
  [key: string]: any; // Für weitere spezifische Metriken
}

export interface MeasurePerformanceOutput {
  status: 'success' | 'failure' | 'error'; // 'error' für Ausführungsfehler des Tools selbst
  message?: string; // Allgemeine Nachricht, z.B. bei Tool-Fehlern
  metrics?: PerformanceMetrics;
}

/**
 * Eingabeparameter für das Tool monitorStability.
 */
export interface MonitorStabilityInput {
  targetComponent: string; // Die zu überwachende Komponente/System (z.B. URL, Prozessname, Skriptpfad)
  duration: string; // Dauer der Überwachung (z.B. "30s", "5m", "1h")
  checkInterval?: string; // Wie oft Checks durchgeführt werden (z.B. "5s", "1m", Standard: "10s")
  loadProfile?: 'light' | 'moderate' | 'heavy' | Record<string, any>; // Optionales Lastprofil
  failureConditions?: string[]; // Optionale Fehlerbedingungen (z.B. "errorRate > 5%", "avgResponseTime > 2000ms")
  environment?: 'docker' | 'local'; // Optional, Standard ist 'local'
}

/**
 * Details zu einem während der Stabilitätsüberwachung gefundenen Problem.
 */
export interface StabilityIssue {
  timestamp: string; // ISO 8601 Datumsstring
  severity: 'error' | 'warning' | 'info';
  description: string;
  details?: Record<string, any>; // z.B. spezifische Metriken zum Zeitpunkt des Fehlers, Log-Auszüge
  conditionTriggered?: string; // Welche failureCondition wurde ausgelöst
}

/**
 * Struktur des Stabilitätsberichts.
 */
export interface StabilityReport {
  targetComponent: string;
  monitoringDurationSeconds: number;
  checkIntervalSeconds?: number;
  loadProfileApplied?: 'light' | 'moderate' | 'heavy' | Record<string, any>;
  failureConditionsEvaluated?: string[];
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  uptimePercentage: number; // 0-100
  errorRatePercentage: number; // 0-100
  issuesFound: StabilityIssue[];
  resourceUsageSummary?: Partial<PerformanceMetrics>; // Wiederverwendung/Anlehnung an PerformanceMetrics
  logSummary?: string[]; // Wichtige Log-Ausschnitte oder Zusammenfassung
  finalStatus: 'stable' | 'unstable' | 'degraded';
  summaryMessage: string;
}

/**
 * Ausgabeparameter für das Tool monitorStability.
 */
export interface MonitorStabilityOutput {
  status: 'success' | 'failure' | 'error'; // 'error' für Ausführungsfehler des Tools selbst
  message?: string; // Allgemeine Nachricht, z.B. bei Tool-Fehlern
  stabilityReport?: StabilityReport;
}

/**
 * Eingabeparameter für das Tool scanSecurity.
 */
export interface ScanSecurityInput {
  target: string; // Modulpfad, URL, Docker-Image-Name etc.
  scanProfile: 'basic' | 'dependency_check' | 'sast' | 'dast' | 'full';
  configPath?: string; // Optionaler Pfad zu einer spezifischen Scan-Konfigurationsdatei
  environment?: 'docker' | 'local'; // Optional, Standard ist 'local'
}

/**
 * Struktur für eine gefundene Schwachstelle.
 */
export interface Vulnerability {
  id?: string; // Eindeutige ID der Schwachstelle (z.B. CVE-Nummer)
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string; // Kurze Beschreibung der Schwachstelle
  description?: string; // Detailliertere Beschreibung
  recommendation?: string; // Empfehlung zur Behebung
  filePath?: string; // Datei, in der die Schwachstelle gefunden wurde (für SAST)
  lineNumber?: number; // Zeilennummer (für SAST)
  packageName?: string; // Betroffenes Paket (für Dependency Check)
  packageVersion?: string; // Version des betroffenen Pakets
  remediation?: { // Informationen zur Behebung
    fixVersion?: string; // Version mit Fix (für Dependency Check)
    details?: string; // Weitere Details zur Behebung
  };
  cvssScore?: number; // CVSS Score
  referenceUrls?: string[]; // Links zu weiteren Informationen
}

/**
 * Ausgabeparameter für das Tool scanSecurity.
 */
export interface ScanSecurityOutput {
  success: boolean;
  message?: string; // Allgemeine Nachricht oder Fehlermeldung bei Tool-Fehlern
  summary: {
    profileUsed: ScanSecurityInput['scanProfile'];
    targetScanned: string;
    vulnerabilitiesFound: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    durationMs?: number; // Dauer des Scans in Millisekunden
  };
  vulnerabilities: Vulnerability[];
  reportUrl?: string; // Optionaler Link zu einem detaillierten HTML/JSON Bericht
  errorLog?: string[]; // Log der Fehler während des Scans
}

/**
 * Eingabeparameter für das Tool manageTestConfig.
 */
export interface ManageTestConfigInput {
  action: 'create' | 'read' | 'update' | 'delete' | 'list';
  configName?: string; // Erforderlich für create, read, update, delete
  configData?: Record<string, any>; // Erforderlich für create, update
  storagePath?: string; // Optionaler Basispfad für Konfigurationsdateien
}

/**
 * Ausgabeparameter für das Tool manageTestConfig.
 */
export interface ManageTestConfigOutput {
  status: 'success' | 'failure';
  message: string; // Statusnachricht oder Fehlermeldung
  configName?: string; // Bei create, read, update Erfolg
  configData?: Record<string, any>; // Bei read, create Erfolg
  configsList?: string[]; // Bei list Erfolg
}

/**
 * Definiert eine Datenquelle für das collectTestData Tool.
 */
export type DataSource =
  | {
      type: 'file';
      path: string;
      format: 'json' | 'text'; // Format der Datei
      id?: string; // Optionale ID zur Identifizierung der Quelle in den Ergebnissen
    }
  | {
      type: 'mcp_tool_output';
      toolName: string; // Name des MCP-Tools, dessen Ausgabe abgerufen werden soll
      executionId: string; // Eindeutige ID der Tool-Ausführung
      id?: string; // Optionale ID zur Identifizierung der Quelle in den Ergebnissen
    };

/**
 * Eingabeparameter für das Tool collectTestData.
 */
export interface CollectTestDataInput {
  sources: DataSource[]; // Array von Datenquellen
  aggregationStrategy?: 'merge' | 'list' | 'summary_only'; // Wie Daten aggregiert werden sollen
  outputFormat?: 'json_array' | 'single_json_object'; // Gewünschtes Ausgabeformat der aggregierten Daten
}

/**
 * Metadaten über den Sammelprozess.
 */
export interface CollectionMetadata {
  totalSources: number;
  processedSources: number;
  failedSources: number;
  errors: { sourceId?: string; message: string; details?: any }[];
}

/**
 * Ausgabeparameter für das Tool collectTestData.
 */
export interface CollectTestDataOutput {
  status: 'success' | 'partial_success' | 'failure'; // Status der Datensammlung
  data: any; // Die gesammelten und aggregierten Daten
  metadata: CollectionMetadata; // Metadaten über den Sammelprozess
  message?: string; // Zusätzliche Nachricht oder Fehlerdetails
}


/**
 * Eingabeparameter für das Tool generateReport.
 */
export interface GenerateReportInput {
  collectedDataExecutionId?: string; // ID der Ausführung des collectTestData-Tools
  inputData?: any; // Alternative zu collectedDataExecutionId, falls Daten direkt übergeben werden
  reportType:
    | 'summary'
    | 'detailed_html'
    | 'markdown_comparison'
    | 'detailed' // Beibehalten für mögliche spezifische Detailberichte
    | 'performance' // Beibehalten für spezifische Performance-Berichte
    | 'stability' // Beibehalten für spezifische Stabilitäts-Berichte
    | 'security'; // Beibehalten für spezifische Sicherheits-Berichte
  templateName?: string; // Optionaler Name einer Vorlage für den Bericht
  outputFileName?: string; // Optionaler Name der zu erstellenden Berichtsdatei (ohne Pfad, nur Dateiname)
}

/**
 * Metadaten für einen generierten Bericht.
 */
export interface ReportMetadata {
  reportType: GenerateReportInput['reportType'];
  generatedAt: string; // ISO 8601 Datumsstring
  sourceDataId?: string; // z.B. collectedDataExecutionId
  templateUsed?: string;
  fileSizeBytes?: number;
  [key: string]: any; // Für zusätzliche Metadaten
}

/**
 * Ausgabeparameter für das Tool generateReport.
 */
export interface GenerateReportOutput {
  status: 'success' | 'failure' | 'error'; // 'error' für Ausführungsfehler des Tools selbst
  reportPath?: string; // Pfad zur generierten Berichtsdatei
  reportData?: any; // Direkte Berichtsdaten (z.B. für 'summary' oder wenn keine Datei geschrieben wird)
  reportMetadata?: ReportMetadata; // Metadaten über den generierten Bericht
  message?: string; // Allgemeine Nachricht oder Fehlermeldung
}

// Allgemeine Tool-Definition für den QualityGuard MCP
export interface QualityGuardTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>; // JSON Schema für die Eingabe
  outputSchema: Record<string, any>; // JSON Schema für die Ausgabe
  execute: (args: any) => Promise<any>;
}

export interface QualityGuardServerConfig {
  port: number;
  // Weitere Konfigurationsoptionen für den Server
}