import { validateClauderules } from './clauderules-validator';
import * as fs from 'fs';
import * as path from 'path';
import * as toml from 'toml';

// Mock fs module
jest.mock('fs');
// Mock path module (teilweise, um path.resolve und path.join beizubehalten, aber ggf. für Tests anpassbar)
// jest.mock('path'); // Vorerst nicht komplett mocken, da resolve und join benötigt werden.

const mockExistsSync = fs.existsSync as jest.Mock;
const mockReadFileSync = fs.readFileSync as jest.Mock;
const mockLstatSync = fs.lstatSync as jest.Mock;
const mockReaddirSync = fs.readdirSync as jest.Mock;

describe('validateClauderules', () => {
  let mockProcessExit: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;
  let mockConsoleLog: jest.SpyInstance;

  const defaultClauderulesPath = path.resolve('./.clauderules');

  beforeEach(() => {
    // Reset mocks
    mockExistsSync.mockReset();
    mockReadFileSync.mockReset();
    mockLstatSync.mockReset();
    mockReaddirSync.mockReset();

    // Mock process.exit
    mockProcessExit = jest.spyOn(process, 'exit').mockImplementation((code?: number | string | null) => {
      throw new Error(`process.exit: ${code ?? 'undefined'}`);
    });

    // Mock console.error and console.log
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original implementations
    mockProcessExit.mockRestore();
    mockConsoleError.mockRestore();
    mockConsoleLog.mockRestore();
  });

  // Helper to create TOML content
  const createTomlContent = (config: any): string => {
    // Super simple TOML stringify for test purposes, real toml.stringify might be complex
    let content = "";
    if (config.project) {
      content += "[project]\n";
      if (config.project.name) content += `name = "${config.project.name}"\n`;
      if (config.project.docs_base) content += `docs_base = "${config.project.docs_base}"\n`;
      content += "\n";
    }
    if (config.folders?.enforce_structure?.ai_docs) {
      content += "[folders.enforce_structure.ai_docs]\n";
      if (config.folders.enforce_structure.ai_docs.must_have) {
        content += `must_have = ${JSON.stringify(config.folders.enforce_structure.ai_docs.must_have)}\n`;
      }
      content += "\n";
    }
    if (config.enforce?.scripts) {
      content += "[enforce.scripts]\n";
      if (config.enforce.scripts.only_root_script) {
        content += `only_root_script = ${JSON.stringify(config.enforce.scripts.only_root_script)}\n`;
      }
      if (typeof config.enforce.scripts.disallow_other_root_scripts === 'boolean') {
        content += `disallow_other_root_scripts = ${config.enforce.scripts.disallow_other_root_scripts}\n`;
      }
      content += "\n";
    }
    return content;
  };

  test('sollte erfolgreich validieren, wenn alle Regeln erfüllt sind', () => {
    const validConfig = {
      project: { name: "TestProject", docs_base: "docs_test/" },
      folders: {
        enforce_structure: {
          ai_docs: { must_have: ["folder1", "folder2"] }
        }
      },
      enforce: {
        scripts: {
          only_root_script: ["run.sh"],
          disallow_other_root_scripts: true
        }
      }
    };
    mockExistsSync.mockImplementation((p: string) => {
      if (p === defaultClauderulesPath) return true;
      if (p === path.resolve('docs_test/folder1')) return true;
      if (p === path.resolve('docs_test/folder2')) return true;
      if (p === path.resolve('run.sh')) return true;
      return false;
    });
    mockReadFileSync.mockReturnValueOnce(createTomlContent(validConfig));
    mockLstatSync.mockReturnValue({ isDirectory: () => true, isFile: () => true }); // Vereinfacht
    mockReaddirSync.mockReturnValueOnce(["run.sh", "README.md"]); // Nur erlaubte Skripte und andere Dateien

    expect(() => validateClauderules()).not.toThrow();
    expect(mockConsoleLog).toHaveBeenCalledWith(".clauderules erfolgreich validiert. Keine Probleme gefunden.");
    expect(mockConsoleError).not.toHaveBeenCalled();
    expect(mockProcessExit).not.toHaveBeenCalled();
  });

  test('sollte mit Fehler beenden, wenn die .clauderules Datei nicht existiert', () => {
    mockExistsSync.mockReturnValue(false);
    expect(() => validateClauderules()).toThrow("process.exit: 1");
    expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining(`Fehler: Datei nicht gefunden unter ${defaultClauderulesPath}`));
  });

  test('sollte mit Fehler beenden, wenn die TOML-Datei ungültig ist', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue("invalid toml content = = ="); // Ungültige Syntax
    expect(() => validateClauderules()).toThrow("process.exit: 1");
    expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining("Fehler beim Parsen der TOML-Datei:"));
  });

  describe('Sektion [project]', () => {
    test('sollte Fehler melden, wenn Sektion [project] fehlt', () => {
      const invalidConfig = {}; // Leere Konfiguration
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(createTomlContent(invalidConfig));
      expect(() => validateClauderules()).toThrow("process.exit: 1");
      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining("Validierung der .clauderules fehlgeschlagen:"));
      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining("- Fehler: Sektion [project] fehlt."));
    });

    test('sollte Fehler melden, wenn project.name fehlt', () => {
      const invalidConfig = { project: { docs_base: "docs/" } };
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(createTomlContent(invalidConfig));
      expect(() => validateClauderules()).toThrow("process.exit: 1");
      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining("- Fehler: project.name in Sektion [project] fehlt."));
    });

    test('sollte Fehler melden, wenn project.docs_base fehlt', () => {
      const invalidConfig = { project: { name: "Test" } };
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(createTomlContent(invalidConfig));
      expect(() => validateClauderules()).toThrow("process.exit: 1");
      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining("- Fehler: project.docs_base in Sektion [project] fehlt."));
    });
  });

  describe('Sektion [folders.enforce_structure.ai_docs]', () => {
    const projectConfig = { project: { name: "TestProject", docs_base: "ai_docs_test/" } };

    test('sollte Fehler melden, wenn ein must_have Verzeichnis fehlt', () => {
      const config = {
        ...projectConfig,
        folders: { enforce_structure: { ai_docs: { must_have: ["existing_folder", "missing_folder"] } } }
      };
      mockExistsSync.mockImplementation((p: string) => {
        if (p === defaultClauderulesPath) return true;
        if (p === path.resolve('ai_docs_test/existing_folder')) return true;
        // missing_folder wird als nicht existent simuliert
        return false;
      });
      mockReadFileSync.mockReturnValue(createTomlContent(config));
      mockLstatSync.mockReturnValue({ isDirectory: () => true });

      expect(() => validateClauderules()).toThrow("process.exit: 1");
      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining("- Fehler: Das in [folders.enforce_structure.ai_docs].must_have definierte Verzeichnis 'missing_folder' existiert nicht unter 'ai_docs_test/'."));
    });

    test('sollte Fallback für docs_base verwenden, wenn nicht in [project] definiert', () => {
        const configWithoutDocsBase = {
          project: { name: "TestProject" }, // docs_base fehlt
          folders: { enforce_structure: { ai_docs: { must_have: ["some_folder"] } } }
        };
        mockExistsSync.mockImplementation((p: string) => {
          if (p === defaultClauderulesPath) return true;
          // Prüfen, ob der Fallback-Pfad verwendet wird
          if (p === path.resolve('ai_docs/some_folder')) return false; // Simuliere, dass es fehlt
          return false;
        });
        mockReadFileSync.mockReturnValue(createTomlContent(configWithoutDocsBase));
        mockLstatSync.mockReturnValue({ isDirectory: () => true });

        expect(() => validateClauderules()).toThrow("process.exit: 1");
        expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining("- Fehler: Das in [folders.enforce_structure.ai_docs].must_have definierte Verzeichnis 'some_folder' existiert nicht unter 'ai_docs/'."));
      });
  });

  describe('Sektion [enforce.scripts]', () => {
    const projectConfig = { project: { name: "TestProject", docs_base: "docs/" } };

    test('sollte Fehler melden, wenn ein only_root_script fehlt', () => {
      const config = {
        ...projectConfig,
        enforce: { scripts: { only_root_script: ["existing.sh", "missing.sh"] } }
      };
      mockExistsSync.mockImplementation((p: string) => {
        if (p === defaultClauderulesPath) return true;
        if (p === path.resolve('existing.sh')) return true;
        // missing.sh wird als nicht existent simuliert
        return false;
      });
      mockReadFileSync.mockReturnValue(createTomlContent(config));

      expect(() => validateClauderules()).toThrow("process.exit: 1");
      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining("- Fehler: Das in [enforce.scripts].only_root_script definierte Skript 'missing.sh' existiert nicht im Root-Verzeichnis."));
    });

    test('sollte Fehler melden, wenn disallow_other_root_scripts true ist und unerlaubte Skripte existieren', () => {
      const config = {
        ...projectConfig,
        enforce: {
          scripts: {
            only_root_script: ["allowed.sh"],
            disallow_other_root_scripts: true
          }
        }
      };
      mockExistsSync.mockImplementation((p: string) => p === defaultClauderulesPath || p === path.resolve("allowed.sh"));
      mockReadFileSync.mockImplementation((p: string) => {
        if (p === defaultClauderulesPath) return createTomlContent(config);
        if (p === path.resolve("disallowed.sh")) return "#!/bin/bash\necho 'disallowed'"; // Shebang
        return "";
      });
      mockLstatSync.mockImplementation((p: string) => ({
        isFile: () => p === path.resolve("allowed.sh") || p === path.resolve("disallowed.sh") || p === path.resolve("another.js"),
        isDirectory: () => false,
      }));
      // Enthält ein unerlaubtes Skript mit Shebang und eines mit .js Endung
      mockReaddirSync.mockReturnValue(["allowed.sh", "disallowed.sh", "another.js", "README.md"]);

      expect(() => validateClauderules()).toThrow("process.exit: 1");
      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining("- Fehler: Unerlaubtes Skript 'disallowed.sh' im Root-Verzeichnis gefunden. Nur 'allowed.sh' sind erlaubt."));
      // Je nach Implementierung der Skript-Erkennung könnte auch another.js einen Fehler werfen.
      // Die aktuelle Implementierung prüft auf Shebang, daher sollte another.js ohne Shebang nicht als Fehler gelten,
      // es sei denn, die Heuristik wird erweitert.
      // Die Heuristik in clauderules-validator.ts prüft auf .sh, .js oder leere Extension UND Shebang.
      // Da "another.js" keinen Shebang in diesem Mock hat, wird es nicht als Fehler gemeldet.
      // Um das zu testen, müsste der Mock für readFileSync für "another.js" auch einen Shebang liefern.
    });
    
    test('sollte Fehler melden, wenn disallow_other_root_scripts true ist und unerlaubtes .js Skript mit Shebang existiert', () => {
        const config = {
          ...projectConfig,
          enforce: {
            scripts: {
              only_root_script: ["allowed.sh"],
              disallow_other_root_scripts: true
            }
          }
        };
        mockExistsSync.mockImplementation((p: string) => p === defaultClauderulesPath || p === path.resolve("allowed.sh"));
        mockReadFileSync.mockImplementation((p: string) => {
          if (p === defaultClauderulesPath) return createTomlContent(config);
          if (p === path.resolve("disallowed.js")) return "#!/usr/bin/env node\nconsole.log('disallowed');"; // Shebang
          return "";
        });
        mockLstatSync.mockImplementation((p: string) => ({
          isFile: () => p === path.resolve("allowed.sh") || p === path.resolve("disallowed.js"),
          isDirectory: () => false,
        }));
        mockReaddirSync.mockReturnValue(["allowed.sh", "disallowed.js", "README.md"]);
  
        expect(() => validateClauderules()).toThrow("process.exit: 1");
        expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining("- Fehler: Unerlaubtes Skript 'disallowed.js' im Root-Verzeichnis gefunden. Nur 'allowed.sh' sind erlaubt."));
      });

    test('sollte keinen Fehler melden, wenn disallow_other_root_scripts true ist und nur erlaubte Skripte existieren', () => {
      const config = {
        ...projectConfig,
        enforce: {
          scripts: {
            only_root_script: ["allowed.sh", "another_allowed.js"],
            disallow_other_root_scripts: true
          }
        }
      };
      mockExistsSync.mockImplementation(p => p === defaultClauderulesPath || p === path.resolve("allowed.sh") || p === path.resolve("another_allowed.js"));
      mockReadFileSync.mockImplementation((p: string) => {
        if (p === defaultClauderulesPath) return createTomlContent(config);
        if (p === path.resolve("allowed.sh")) return "#!/bin/bash\necho 'allowed'";
        if (p === path.resolve("another_allowed.js")) return "#!/usr/bin/env node\nconsole.log('allowed');";
        return "";
      });
      mockLstatSync.mockReturnValue({ isFile: () => true, isDirectory: () => false });
      mockReaddirSync.mockReturnValue(["allowed.sh", "another_allowed.js", "README.md", "config.json"]);

      expect(() => validateClauderules()).not.toThrow();
      expect(mockConsoleLog).toHaveBeenCalledWith(".clauderules erfolgreich validiert. Keine Probleme gefunden.");
    });

    test('sollte keinen Fehler melden für andere Dateien, wenn disallow_other_root_scripts true ist', () => {
        const config = {
          ...projectConfig,
          enforce: {
            scripts: {
              only_root_script: ["allowed.sh"],
              disallow_other_root_scripts: true
            }
          }
        };
        mockExistsSync.mockImplementation(p => p === defaultClauderulesPath || p === path.resolve("allowed.sh"));
        mockReadFileSync.mockImplementation((p: string) => {
          if (p === defaultClauderulesPath) return createTomlContent(config);
          if (p === path.resolve("allowed.sh")) return "#!/bin/bash\necho 'allowed'";
          if (p === path.resolve("config.json")) return "{}"; // Kein Skript
          return "";
        });
        mockLstatSync.mockImplementation((p: string) => ({
          isFile: () => p === path.resolve("allowed.sh") || p === path.resolve("config.json"),
          isDirectory: () => false,
        }));
        mockReaddirSync.mockReturnValue(["allowed.sh", "config.json", "README.md"]);
  
        expect(() => validateClauderules()).not.toThrow();
        expect(mockConsoleLog).toHaveBeenCalledWith(".clauderules erfolgreich validiert. Keine Probleme gefunden.");
      });
  });

  test('sollte einen benutzerdefinierten Dateipfad verwenden, wenn einer angegeben ist', () => {
    const customPath = './custom/.clauderules-config';
    const resolvedCustomPath = path.resolve(customPath);
    const validConfig = { project: { name: "Test", docs_base: "docs/" } };

    mockExistsSync.mockImplementation((p: string) => p === resolvedCustomPath);
    mockReadFileSync.mockReturnValue(createTomlContent(validConfig));

    expect(() => validateClauderules(customPath)).not.toThrow();
    expect(mockExistsSync).toHaveBeenCalledWith(resolvedCustomPath);
    expect(mockReadFileSync).toHaveBeenCalledWith(resolvedCustomPath, 'utf-8');
    expect(mockConsoleLog).toHaveBeenCalledWith(".clauderules erfolgreich validiert. Keine Probleme gefunden.");
  });
});