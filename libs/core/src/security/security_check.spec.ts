/**
 * @file Unit tests for the Security Check CLI tool.
 * @description Ensures that the security_check.ts script correctly processes options,
 * interacts with SecurityReview, and handles different outcomes.
 */

import { jest } from '@jest/globals';
import chalk from 'chalk';
import type { ValidatorResults, SecurityFinding, Recommendation } from './security.types';

// Mocken von SecurityReview, bevor es importiert wird
const mockRunValidators = jest.fn<() => Promise<ValidatorResults>>(); // Korrekter Typ für Mock: Funktion, die ein Promise von ValidatorResults zurückgibt
const mockSecurityReviewInstance = {
  runValidators: mockRunValidators,
};
const mockSecurityReviewConstructor = jest.fn(() => mockSecurityReviewInstance);

jest.mock('./security_review', () => ({
  SecurityReview: mockSecurityReviewConstructor,
}));

// Mocken von process.exit und console.log/error
const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined): never => {
  throw new Error(`process.exit: ${code ?? 0}`);
});
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Importiere die zu testende Funktion/Modul NACH den Mocks
// Die CLI-Logik ist in security_check.ts, die direkt ausgeführt wird.
// Wir müssen einen Weg finden, runSecurityCheck isoliert zu testen oder das Modul so zu importieren,
// dass es nicht sofort ausgeführt wird. Für dieses Beispiel nehmen wir an,
// `runSecurityCheck` ist exportiert oder wir können das Modul importieren und seine Hauptfunktion triggern.
// Da `program.parse(process.argv)` am Ende von security_check.ts steht,
// müssen wir `runSecurityCheck` direkt testen, falls es exportiert wird.
// Für dieses Beispiel nehmen wir an, `runSecurityCheck` ist NICHT direkt exportiert,
// und wir testen die CLI-Ausführung durch Manipulation von `process.argv`.

describe('Security Check CLI (security_check.ts)', () => {
  let originalArgv: string[];

  beforeEach(() => {
    jest.clearAllMocks();
    originalArgv = [...process.argv];
    // Standard-Mock-Implementierung für runValidators
    const defaultValidatorResults: ValidatorResults = {
      summary: {
        securityScore: 100,
        passedValidators: 1,
        totalValidators: 1,
        vulnerabilitiesCount: 0,
        findingsCount: 0,
      },
      reportPath: 'mock-report.json',
      vulnerabilities: [] as ReadonlyArray<SecurityFinding>, // Expliziter Typ
      findings: [] as ReadonlyArray<SecurityFinding>,       // Expliziter Typ
      recommendations: [] as ReadonlyArray<Recommendation>, // Expliziter Typ
    };
    mockRunValidators.mockResolvedValue(defaultValidatorResults);
  });

  afterEach(() => {
    process.argv = originalArgv; // Wiederherstellen der ursprünglichen Argumente
  });

  async function runCliWithArgs(args: string[]): Promise<void> {
    process.argv = ['node', 'security_check.ts', ...args];
    // Importiere das Modul hier, damit es die modifizierten process.argv verwendet
    // und die Commander-Logik ausgeführt wird.
    // Durch das jest.resetModules() stellen wir sicher, dass das Modul jedes Mal neu geladen wird.
    jest.resetModules();
    await import('./security_check');
  }

  it('should initialize SecurityReview with default options', async () => {
    await runCliWithArgs([]);
    expect(mockSecurityReviewConstructor).toHaveBeenCalledWith({
      autoFix: undefined, // Commander setzt es auf undefined, wenn nicht angegeben
      strictMode: true, // !options.relaxed -> !undefined -> true
      reportPath: expect.stringContaining('security-report.json'),
    });
  });

  it('should initialize SecurityReview with --autofix option', async () => {
    await runCliWithArgs(['--autofix']);
    expect(mockSecurityReviewConstructor).toHaveBeenCalledWith(
      expect.objectContaining({ autoFix: true })
    );
  });

  it('should initialize SecurityReview with --relaxed option (strictMode false)', async () => {
    await runCliWithArgs(['--relaxed']);
    expect(mockSecurityReviewConstructor).toHaveBeenCalledWith(
      expect.objectContaining({ strictMode: false })
    );
  });

  it('should initialize SecurityReview with --output option', async () => {
    await runCliWithArgs(['--output', 'custom-report.json']);
    expect(mockSecurityReviewConstructor).toHaveBeenCalledWith(
      expect.objectContaining({ reportPath: 'custom-report.json' })
    );
  });

  it('should call runValidators with correct context', async () => {
    await runCliWithArgs(['--dir', './test-dir', '--files', 'a.js,b.js', '--exclude', '*.test.js']);
    expect(mockRunValidators).toHaveBeenCalledWith({
      targetDir: './test-dir',
      targetFiles: ['a.js', 'b.js'],
      excludePatterns: ['*.test.js'],
    });
  });

  it('should exit with 0 if no issues are found', async () => {
    const results: ValidatorResults = {
      summary: { vulnerabilitiesCount: 0, findingsCount: 0, securityScore: 100, passedValidators: 1, totalValidators: 1 },
      reportPath: 'report.json',
    };
    mockRunValidators.mockResolvedValue(results);
    await expect(runCliWithArgs([])).rejects.toThrow('process.exit: 0');
    expect(mockProcessExit).toHaveBeenCalledWith(0);
  });

  it('should exit with 1 if vulnerabilities are found in strict mode', async () => {
    const results: ValidatorResults = {
      summary: { vulnerabilitiesCount: 1, findingsCount: 0, securityScore: 80, passedValidators: 0, totalValidators: 1 },
      reportPath: 'report.json',
    };
    mockRunValidators.mockResolvedValue(results);
    // Standard ist strict mode (kein --relaxed)
    await expect(runCliWithArgs([])).rejects.toThrow('process.exit: 1');
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it('should exit with 1 if findings are found in strict mode', async () => {
    const results: ValidatorResults = {
      summary: { vulnerabilitiesCount: 0, findingsCount: 1, securityScore: 90, passedValidators: 0, totalValidators: 1 },
      reportPath: 'report.json',
    };
    mockRunValidators.mockResolvedValue(results);
    await expect(runCliWithArgs([])).rejects.toThrow('process.exit: 1');
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it('should exit with 0 if findings are found in relaxed mode', async () => {
    const results: ValidatorResults = {
      summary: { vulnerabilitiesCount: 0, findingsCount: 1, securityScore: 90, passedValidators: 0, totalValidators: 1 },
      reportPath: 'report.json',
    };
    mockRunValidators.mockResolvedValue(results);
    await expect(runCliWithArgs(['--relaxed'])).rejects.toThrow('process.exit: 0');
    expect(mockProcessExit).toHaveBeenCalledWith(0);
  });

  it('should exit with 1 if vulnerabilities are found even in relaxed mode', async () => {
    const results: ValidatorResults = {
      summary: { vulnerabilitiesCount: 1, findingsCount: 0, securityScore: 80, passedValidators: 0, totalValidators: 1 },
      reportPath: 'report.json',
    };
    mockRunValidators.mockResolvedValue(results);
    await expect(runCliWithArgs(['--relaxed'])).rejects.toThrow('process.exit: 1');
    expect(mockProcessExit).toHaveBeenCalledWith(1); // Strict mode ist hier irrelevant, da relaxed nur findings betrifft
  });


  it('should print detailed results if --verbose is used', async () => {
    const detailedResults: ValidatorResults = {
      summary: { vulnerabilitiesCount: 0, findingsCount: 0, securityScore: 100, passedValidators: 1, totalValidators: 1 },
      reportPath: 'report.json',
      vulnerabilities: [{ title: 'Mock Vuln', description: 'Desc', location: 'loc', severity: 'high' }] as ReadonlyArray<SecurityFinding>,
      findings: [{ title: 'Mock Finding', description: 'Desc', location: 'loc', severity: 'medium', validator: 'mock-validator' }] as ReadonlyArray<SecurityFinding>,
      recommendations: [{ title: 'Mock Rec', description: 'Desc', type: 'general' }] as ReadonlyArray<Recommendation>,
    };
    mockRunValidators.mockResolvedValue(detailedResults);
    await expect(runCliWithArgs(['--verbose'])).rejects.toThrow('process.exit: 0');
    // Überprüfen, ob console.log Aufrufe für Details gemacht wurden.
    // Dies ist eine vereinfachte Prüfung. Man könnte spezifischer prüfen, ob die Detail-Header geloggt werden.
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Detailed Security Review Results:'));
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Vulnerabilities:'));
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Findings:'));
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Recommendations:'));
  });

  it('should handle errors during SecurityReview construction', async () => {
    mockSecurityReviewConstructor.mockImplementationOnce(() => {
      throw new Error('Test construction error');
    });
    await expect(runCliWithArgs([])).rejects.toThrow('process.exit: 1');
    expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('Error: Test construction error'));
  });

  it('should handle errors during runValidators', async () => {
    mockRunValidators.mockRejectedValueOnce(new Error('Test runValidators error'));
    await expect(runCliWithArgs([])).rejects.toThrow('process.exit: 1');
    expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('Error: Test runValidators error'));
  });
});