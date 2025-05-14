import { program } from 'commander';
// Mocken der Abhängigkeiten, bevor sie von security-check importiert werden
const mockRunValidators = jest.fn().mockResolvedValue({
  summary: {
    vulnerabilitiesCount: 0,
    findingsCount: 0,
    passedValidators: 1,
    totalValidators: 1,
    securityScore: 100,
  },
  reportPath: 'mock-report.json',
  recommendations: [],
  vulnerabilities: [],
  findings: [],
});

jest.mock('./security-review', () => ({
  SecurityReview: jest.fn().mockImplementation(() => ({
    runValidators: mockRunValidators,
  })),
}));

jest.mock('../logging/logger', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

// Importiere die zu testende Funktion/Modul NACH den Mocks
// Die runSecurityCheck Funktion ist nicht direkt exportiert,
// das Skript wird ausgeführt, wenn es importiert wird.
// Wir müssen den Aufruf von runSecurityCheck mocken oder das gesamte Skript anders behandeln.

// Da security-check.ts als Skript konzipiert ist (mit #!/usr/bin/env node und direktem Aufruf von runSecurityCheck),
// ist es schwierig, runSecurityCheck direkt zu testen, ohne das Skript auszuführen.
// Eine Möglichkeit wäre, den Inhalt von security-check.ts so zu refaktorisieren,
// dass runSecurityCheck exportiert wird, oder wir testen die Commander-Konfiguration
// und die Interaktion mit SecurityReview.

// Für diesen Test mocken wir process.exit und console.log/error,
// und rufen dann die Hauptlogik indirekt über program.parse auf.

describe('Security Check CLI', () => {
  let originalArgv: string[];
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mocks zurücksetzen
    jest.clearAllMocks();
    mockRunValidators.mockClear();

    // process.argv sichern und für Tests manipulieren
    originalArgv = [...process.argv];
    // Commander parst process.argv, daher müssen wir es für jeden Test setzen
    // Die ersten beiden Argumente sind normalerweise 'node' und der Pfad zum Skript
    process.argv = ['node', 'security-check.ts'];

    // Konsolenausgaben und process.exit mocken
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {}) as (code?: string | number | null | undefined) => never);

    // Commander Instanz für jeden Test neu laden, um Seiteneffekte zu vermeiden
    // Dies ist notwendig, da Commander globalen Zustand hat.
    jest.resetModules(); // Wichtig, um das Modul neu zu laden
  });

  afterEach(() => {
    // process.argv wiederherstellen
    process.argv = originalArgv;
    // Spione wiederherstellen
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  async function runCliWithOptions(options: string[]) {
    process.argv.push(...options);
    // Das Modul importieren/ausführen, nachdem process.argv gesetzt wurde
    // und die Mocks aktiv sind.
    // require stellt sicher, dass das Skript ausgeführt wird.
    await import('./security-check');
  }

  it('should run with default options and exit with 0 if no issues', async () => {
    mockRunValidators.mockResolvedValueOnce({
      summary: { vulnerabilitiesCount: 0, findingsCount: 0, passedValidators: 1, totalValidators: 1, securityScore: 100 },
      reportPath: 'test-report.json',
      recommendations: [],
      vulnerabilities: [],
      findings: [],
    });
    await runCliWithOptions([]);
    expect(mockRunValidators).toHaveBeenCalledWith(expect.objectContaining({
      targetDir: process.cwd(), // Standardwert
    }));
    expect(processExitSpy).toHaveBeenCalledWith(0);
  });

  it('should use provided directory option', async () => {
    await runCliWithOptions(['-d', './test-dir']);
    expect(mockRunValidators).toHaveBeenCalledWith(expect.objectContaining({
      targetDir: './test-dir',
    }));
  });

  it('should use provided files option', async () => {
    await runCliWithOptions(['-f', 'file1.ts,file2.js']);
    expect(mockRunValidators).toHaveBeenCalledWith(expect.objectContaining({
      targetFiles: ['file1.ts', 'file2.js'],
    }));
  });

  it('should use provided exclude option', async () => {
    await runCliWithOptions(['-e', '*.spec.ts,*.test.ts']);
    expect(mockRunValidators).toHaveBeenCalledWith(expect.objectContaining({
      excludePatterns: ['*.spec.ts', '*.test.ts'],
    }));
  });

  it('should set autofix option in SecurityReview', async () => {
    const { SecurityReview } = await import('./security-review');
    await runCliWithOptions(['-a']);
    expect(SecurityReview).toHaveBeenCalledWith(expect.objectContaining({
      autoFix: true,
    }));
  });

  it('should set relaxed mode (strictMode=false) in SecurityReview', async () => {
    const { SecurityReview } = await import('./security-review');
    await runCliWithOptions(['-r']);
    expect(SecurityReview).toHaveBeenCalledWith(expect.objectContaining({
      strictMode: false,
    }));
  });

  it('should exit with 1 if vulnerabilities are found and not in relaxed mode', async () => {
    mockRunValidators.mockResolvedValueOnce({
      summary: { vulnerabilitiesCount: 1, findingsCount: 0, passedValidators: 0, totalValidators: 1, securityScore: 50 },
      reportPath: 'test-report.json',
      recommendations: [],
      vulnerabilities: [{ title: 'Vuln', description: '', location: '', severity: 'high' }],
      findings: [],
    });
    await runCliWithOptions([]);
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should exit with 1 if findings are found and not in relaxed mode', async () => {
    mockRunValidators.mockResolvedValueOnce({
      summary: { vulnerabilitiesCount: 0, findingsCount: 1, passedValidators: 0, totalValidators: 1, securityScore: 70 },
      reportPath: 'test-report.json',
      recommendations: [],
      vulnerabilities: [],
      findings: [{ title: 'Finding', description: '', location: '', validator: '' }],
    });
    await runCliWithOptions([]);
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should exit with 0 if findings are found but in relaxed mode', async () => {
    mockRunValidators.mockResolvedValueOnce({
      summary: { vulnerabilitiesCount: 0, findingsCount: 1, passedValidators: 0, totalValidators: 1, securityScore: 70 },
      reportPath: 'test-report.json',
      recommendations: [],
      vulnerabilities: [],
      findings: [{ title: 'Finding', description: '', location: '', validator: '' }],
    });
    await runCliWithOptions(['-r']); // Relaxed mode
    expect(processExitSpy).toHaveBeenCalledWith(0);
  });

  it('should handle errors during security review and exit with 1', async () => {
    mockRunValidators.mockRejectedValueOnce(new Error('Test Review Error'));
    await runCliWithOptions([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error: Test Review Error'));
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should show verbose output if -v is passed (simulated by checking console output)', async () => {
    // This test is a bit indirect as printDetailedResults is internal.
    // We check if console.log was called more often, implying details were printed.
    // A more robust test would involve spying on printDetailedResults if it were exported.
    consoleLogSpy.mockClear(); // Clear previous calls
    mockRunValidators.mockResolvedValueOnce({
      summary: { vulnerabilitiesCount: 1, findingsCount: 1, passedValidators: 0, totalValidators: 1, securityScore: 50 },
      reportPath: 'test-report.json',
      recommendations: [{ title: 'Rec', description: '', type: 'finding' }],
      vulnerabilities: [{ title: 'Vuln', description: '', location: '', severity: 'high', recommendation: 'Fix it' }],
      findings: [{ title: 'Finding', description: '', location: '', validator: 'TestValidator' }],
    });

    const initialLogCount = consoleLogSpy.mock.calls.length;
    await runCliWithOptions(['-v']);
    // Erwarten, dass console.log für detaillierte Ausgaben aufgerufen wurde
    // Die genaue Anzahl der Aufrufe hängt von der Implementierung von printDetailedResults ab.
    // Wir prüfen, ob es mehr Aufrufe gab als nur für die Zusammenfassung.
    expect(consoleLogSpy.mock.calls.length).toBeGreaterThan(initialLogCount + 5); // Annahme: Zusammenfassung + Details
    expect(processExitSpy).toHaveBeenCalledWith(1); // Da Probleme gefunden wurden
  });

  it('should correctly parse and pass output file option', async () => {
    const { SecurityReview } = await import('./security-review');
    await runCliWithOptions(['-o', 'my-custom-report.json']);
    expect(SecurityReview).toHaveBeenCalledWith(expect.objectContaining({
      reportPath: 'my-custom-report.json',
    }));
  });
});