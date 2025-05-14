import { validateClauderules } from './clauderules-validator';
import * as fs from 'fs';
import * as path from 'path';

// Mocken des fs-Moduls
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

// Mocken des path-Moduls für path.resolve, um Konsistenz zu gewährleisten
const actualPath = jest.requireActual('path');
const mockResolve = (...paths: string[]) => actualPath.resolve(...paths); // Behält die echte Funktionalität für resolve bei

jest.mock('path', () => ({
  ...jest.requireActual('path'), // Behält alle echten path-Funktionen bei
  resolve: jest.fn((...paths: string[]) => mockResolve(...paths)), // Mockt nur resolve
}));


describe('validateClauderules', () => {
  const mockFilePath = './.clauderules';
  const mockResolvedPath = actualPath.resolve(mockFilePath);

  beforeEach(() => {
    // Setzt alle Mocks vor jedem Test zurück
    jest.clearAllMocks();
    // Standard-Mock für path.resolve
    (path.resolve as jest.Mock).mockImplementation((fp) => fp === mockFilePath ? mockResolvedPath : actualPath.resolve(fp));
  });

  test('sollte einen Fehler zurückgeben, wenn die Datei nicht existiert', () => {
    mockedFs.existsSync.mockReturnValue(false);
    const issues = validateClauderules(mockFilePath);
    expect(issues).toContain(`Fehler: Datei nicht gefunden unter ${mockResolvedPath}`);
  });

  test('sollte einen Fehler zurückgeben, wenn die TOML-Datei ungültig ist', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue('invalid toml content');
    // Die toml.parse-Funktion wird hier implizit durch den ungültigen Inhalt getestet
    const issues = validateClauderules(mockFilePath);
    expect(issues.some(issue => issue.startsWith('Fehler beim Parsen der TOML-Datei:'))).toBe(true);
  });

  describe('Projekt-Sektion Validierung', () => {
    beforeEach(() => {
        mockedFs.existsSync.mockReturnValue(true);
    });

    test('sollte einen Fehler zurückgeben, wenn die [project]-Sektion fehlt', () => {
      mockedFs.readFileSync.mockReturnValue(''); // Leere Datei, keine Sektionen
      const issues = validateClauderules(mockFilePath);
      expect(issues).toContain('Fehler: Sektion [project] fehlt.');
    });

    test('sollte einen Fehler zurückgeben, wenn project.name fehlt', () => {
      const content = `
[project]
docs_base = "ai_docs/"
      `;
      mockedFs.readFileSync.mockReturnValue(content);
      const issues = validateClauderules(mockFilePath);
      expect(issues).toContain('Fehler: project.name in Sektion [project] fehlt.');
    });

    test('sollte einen Fehler zurückgeben, wenn project.docs_base fehlt', () => {
      const content = `
[project]
name = "Test Project"
      `;
      mockedFs.readFileSync.mockReturnValue(content);
      const issues = validateClauderules(mockFilePath);
      expect(issues).toContain('Fehler: project.docs_base in Sektion [project] fehlt.');
    });
  });

  describe('folders.enforce_structure.ai_docs Validierung', () => {
    const aiDocsPath = 'docs_test';
    beforeEach(() => {
        mockedFs.existsSync.mockImplementation((p) => p === mockResolvedPath); // Nur die .clauderules-Datei existiert initial
        const content = `
[project]
name = "Test Project"
docs_base = "${aiDocsPath}"

[folders.enforce_structure.ai_docs]
must_have = ["folder1", "folder2"]
        `;
        mockedFs.readFileSync.mockReturnValue(content);
    });

    test('sollte Fehler zurückgeben, wenn must_have Ordner nicht existieren', () => {
      // Simulieren, dass folder1 nicht existiert
      mockedFs.existsSync.mockImplementation(p => {
        if (p === mockResolvedPath) return true;
        if (p === actualPath.join(aiDocsPath, 'folder1')) return false;
        if (p === actualPath.join(aiDocsPath, 'folder2')) return true; // folder2 existiert
        return false;
      });
      mockedFs.lstatSync.mockImplementation(p => {
        if (p === actualPath.join(aiDocsPath, 'folder2')) return { isDirectory: () => true } as fs.Stats;
        throw new Error('File not found for lstatSync');
      });

      const issues = validateClauderules(mockFilePath);
      expect(issues).toContain(`Fehler: Das in [folders.enforce_structure.ai_docs].must_have definierte Verzeichnis 'folder1' existiert nicht unter '${aiDocsPath}'.`);
      expect(issues).not.toContain(`Fehler: Das in [folders.enforce_structure.ai_docs].must_have definierte Verzeichnis 'folder2' existiert nicht unter '${aiDocsPath}'.`);
    });

     test('sollte Fehler zurückgeben, wenn ein must_have Eintrag keine Datei ist', () => {
      mockedFs.existsSync.mockImplementation(p => {
        if (p === mockResolvedPath) return true;
        if (p === actualPath.join(aiDocsPath, 'folder1')) return true; // folder1 existiert
        if (p === actualPath.join(aiDocsPath, 'folder2')) return true; // folder2 existiert
        return false;
      });
      mockedFs.lstatSync.mockImplementation(p => {
        if (p === actualPath.join(aiDocsPath, 'folder1')) return { isDirectory: () => false } as fs.Stats; // folder1 ist keine Datei
        if (p === actualPath.join(aiDocsPath, 'folder2')) return { isDirectory: () => true } as fs.Stats;
        throw new Error('File not found for lstatSync');
      });

      const issues = validateClauderules(mockFilePath);
      expect(issues).toContain(`Fehler: Das in [folders.enforce_structure.ai_docs].must_have definierte Verzeichnis 'folder1' existiert nicht unter '${aiDocsPath}'.`);
    });


    test('sollte keine Fehler zurückgeben, wenn alle must_have Ordner existieren und Verzeichnisse sind', () => {
      mockedFs.existsSync.mockImplementation(p => {
        if (p === mockResolvedPath) return true;
        if (p === actualPath.join(aiDocsPath, 'folder1')) return true;
        if (p === actualPath.join(aiDocsPath, 'folder2')) return true;
        return false;
      });
      mockedFs.lstatSync.mockImplementation(p => {
         if (p === actualPath.join(aiDocsPath, 'folder1')) return { isDirectory: () => true } as fs.Stats;
         if (p === actualPath.join(aiDocsPath, 'folder2')) return { isDirectory: () => true } as fs.Stats;
        throw new Error('File not found for lstatSync');
      });
      const issues = validateClauderules(mockFilePath);
      expect(issues.filter(issue => issue.includes('folders.enforce_structure.ai_docs'))).toHaveLength(0);
    });

    test('sollte den Fallback "ai_docs/" für docs_base verwenden, wenn nicht in project definiert', () => {
      const customContent = `
[project]
name = "Test Project Without Docs Base"
# docs_base fehlt

[folders.enforce_structure.ai_docs]
must_have = ["fallback_folder"]
      `;
      mockedFs.readFileSync.mockReturnValue(customContent);
      mockedFs.existsSync.mockImplementation(p => {
        if (p === mockResolvedPath) return true;
        // Prüft, ob der Fallback-Pfad verwendet wird
        if (p === actualPath.join('ai_docs/', 'fallback_folder')) return true;
        return false;
      });
      mockedFs.lstatSync.mockImplementation(p => {
        if (p === actualPath.join('ai_docs/', 'fallback_folder')) return { isDirectory: () => true } as fs.Stats;
        throw new Error('File not found for lstatSync in fallback test');
      });

      const issues = validateClauderules(mockFilePath);
      expect(issues.filter(issue => issue.includes('fallback_folder'))).toHaveLength(0);
      expect(mockedFs.existsSync).toHaveBeenCalledWith(actualPath.join('ai_docs/', 'fallback_folder'));
    });
  });

  describe('enforce.scripts Validierung', () => {
    const rootScript1 = 'run.sh';
    const rootScript2 = 'test.js';
    const otherScript = 'other.sh';

    beforeEach(() => {
      const content = `
[project]
name = "Test Project"
docs_base = "docs/"

[enforce.scripts]
only_root_script = ["${rootScript1}", "${rootScript2}"]
disallow_other_root_scripts = true
      `;
      mockedFs.readFileSync.mockImplementation((p) => {
        if (p === mockResolvedPath) return content;
        if (p === actualPath.resolve(rootScript1)) return '#!/bin/bash\necho "run"';
        if (p === actualPath.resolve(rootScript2)) return '#!/usr/bin/env node\nconsole.log("test")';
        if (p === actualPath.resolve(otherScript)) return '#!/bin/bash\necho "other"';
        throw new Error(`Unexpected readFileSync call: ${p}`);
      });

      // Mock für Existenz der Skripte und Root-Verzeichnis-Inhalt
      mockedFs.existsSync.mockImplementation(p => {
        if (p === mockResolvedPath) return true;
        if (p === actualPath.resolve(rootScript1)) return true;
        if (p === actualPath.resolve(rootScript2)) return true;
        if (p === actualPath.resolve(otherScript)) return true; // Das "unerlaubte" Skript existiert auch
        return false;
      });
      mockedFs.readdirSync.mockReturnValue([rootScript1, rootScript2, otherScript, 'README.md'] as any); // Zurück zu any wegen Mock-Typisierung
      mockedFs.lstatSync.mockImplementation(p => {
        const fileName = actualPath.basename(p.toString());
        if (fileName.endsWith('.sh') || fileName.endsWith('.js')) {
          return { isFile: () => true, isDirectory: () => false } as fs.Stats;
        }
        return { isFile: () => false, isDirectory: () => false } as fs.Stats; // z.B. für README.md
      });
    });

    test('sollte Fehler zurückgeben, wenn ein in only_root_script definiertes Skript nicht existiert', () => {
      mockedFs.existsSync.mockImplementation(p => {
        if (p === mockResolvedPath) return true;
        if (p === actualPath.resolve(rootScript1)) return false; // rootScript1 existiert nicht
        if (p === actualPath.resolve(rootScript2)) return true;
        return false;
      });
      const issues = validateClauderules(mockFilePath);
      expect(issues).toContain(`Fehler: Das in [enforce.scripts].only_root_script definierte Skript '${rootScript1}' existiert nicht im Root-Verzeichnis.`);
    });

    test('sollte Fehler zurückgeben für unerlaubte Skripte im Root, wenn disallow_other_root_scripts true ist', () => {
      const issues = validateClauderules(mockFilePath);
      expect(issues).toContain(`Fehler: Unerlaubtes Skript '${otherScript}' im Root-Verzeichnis gefunden. Nur '${rootScript1}, ${rootScript2}' sind erlaubt.`);
    });

    test('sollte keine Fehler für erlaubte Skripte zurückgeben', () => {
      const issues = validateClauderules(mockFilePath);
      // Sicherstellen, dass KEINE Fehler für rootScript1 gemeldet werden, die NICHT "existiert nicht" sind.
      expect(issues.filter(issue => issue.includes(`'${rootScript1}'`) && !issue.includes('existiert nicht im Root-Verzeichnis'))).toHaveLength(0);
      // Sicherstellen, dass KEINE Fehler für rootScript2 gemeldet werden, die NICHT "existiert nicht" sind.
      expect(issues.filter(issue => issue.includes(`'${rootScript2}'`) && !issue.includes('existiert nicht im Root-Verzeichnis'))).toHaveLength(0);
    });

    test('sollte keine Fehler zurückgeben, wenn disallow_other_root_scripts false ist und unerlaubte Skripte existieren', () => {
        const newContent = `
[project]
name = "Test Project"
docs_base = "docs/"

[enforce.scripts]
only_root_script = ["${rootScript1}"]
disallow_other_root_scripts = false # Geändert
        `;
        mockedFs.readFileSync.mockImplementation((p) => {
            if (p === mockResolvedPath) return newContent;
            if (p === actualPath.resolve(rootScript1)) return '#!/bin/bash\necho "run"';
            if (p === actualPath.resolve(otherScript)) return '#!/bin/bash\necho "other"';
            throw new Error(`Unexpected readFileSync call: ${p}`);
        });
        mockedFs.existsSync.mockImplementation(p => {
            if (p === mockResolvedPath) return true;
            if (p === actualPath.resolve(rootScript1)) return true;
            if (p === actualPath.resolve(otherScript)) return true;
            return false;
        });
        mockedFs.readdirSync.mockReturnValue([rootScript1, otherScript] as any); // Zurück zu any


        const issues = validateClauderules(mockFilePath);
        expect(issues.filter(issue => issue.includes('Unerlaubtes Skript'))).toHaveLength(0);
    });
  });


  test('sollte keine Fehler zurückgeben für eine valide .clauderules-Datei', () => {
    const validContent = `
[project]
name = "Valid Project"
docs_base = "ai_docs/"

[folders.enforce_structure.ai_docs]
must_have = ["introduction", "usage"]

[enforce.scripts]
only_root_script = ["start.sh"]
disallow_other_root_scripts = true
    `;
    mockedFs.existsSync.mockImplementation(p => {
      if (p === mockResolvedPath) return true; // .clauderules
      if (p === actualPath.join('ai_docs/', 'introduction')) return true;
      if (p === actualPath.join('ai_docs/', 'usage')) return true;
      if (p === actualPath.resolve('start.sh')) return true;
      return false;
    });
    mockedFs.lstatSync.mockImplementation(p => {
      if (p === actualPath.join('ai_docs/', 'introduction') || p === actualPath.join('ai_docs/', 'usage')) {
        return { isDirectory: () => true } as fs.Stats;
      }
      if (p === actualPath.resolve('start.sh')) {
          return { isFile: () => true, isDirectory: () => false } as fs.Stats;
      }
      // Behandelt andere Dateien wie README.md, die keine Skripte sind
      if (fs.existsSync(p.toString()) && fs.lstatSync(p.toString()).isFile()) {
        return { isFile: () => true, isDirectory: () => false } as fs.Stats;
      }
      return { isFile: () => false, isDirectory: () => false } as fs.Stats; // Fallback für andere Pfade
    });
    mockedFs.readFileSync.mockImplementation((p) => {
        if (p === mockResolvedPath) return validContent;
        if (p === actualPath.resolve('start.sh')) return '#!/bin/bash\necho "start"';
        throw new Error(`Unexpected readFileSync call: ${p}`);
    });
    mockedFs.readdirSync.mockReturnValue(['start.sh', 'README.md'] as any); // Zurück zu any


    const issues = validateClauderules(mockFilePath);
    expect(issues).toHaveLength(0);
  });
});
