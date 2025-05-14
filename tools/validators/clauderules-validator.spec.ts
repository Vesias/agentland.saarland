import * as fs from 'fs';
import * as path from 'path';
import { validateClauderules } from './clauderules-validator';

// Mock fs module
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('validateClauderules', () => {
  const mockClauderulesPath = './.clauderules';
  const mockResolvedPath = path.resolve(mockClauderulesPath);

  beforeEach(() => {
    // Reset mocks before each test
    mockedFs.existsSync.mockReset();
    mockedFs.readFileSync.mockReset();
    mockedFs.lstatSync.mockReset();
    mockedFs.readdirSync.mockReset();
  });

  test('should return no issues for a valid .clauderules file', () => {
    const validTomlContent = `
[project]
name = "Test Project"
docs_base = "ai_docs/"

[folders.enforce_structure.ai_docs]
must_have = ["folder1", "folder2"]

[enforce.scripts]
only_root_script = ["main.sh"]
disallow_other_root_scripts = true
`;
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(validTomlContent);
    // Mock lstatSync for folder checks
    mockedFs.lstatSync.mockImplementation((p) => {
      const stats = { isDirectory: () => false, isFile: () => false, isSymbolicLink: () => false } as fs.Stats;
      const resolvedP = path.resolve(p.toString()); // Ensure path is resolved for comparison

      if (resolvedP === path.resolve(path.join('ai_docs/', 'folder1')) || resolvedP === path.resolve(path.join('ai_docs/', 'folder2'))) {
        (stats as any).isDirectory = () => true;
      }
      if (resolvedP === path.resolve('main.sh')) {
        (stats as any).isFile = () => true;
      }
      // For otherfile.txt in the root
      if (resolvedP === path.resolve('otherfile.txt')) {
        (stats as any).isFile = () => true;
      }
      return stats;
    });
    // Mock readdirSync for script checks - should return strings as per default fs.readdirSync behavior
    mockedFs.readdirSync.mockReturnValue(['main.sh', 'otherfile.txt'] as any);


    const issues = validateClauderules(mockClauderulesPath);
    expect(issues).toEqual([]);
    expect(mockedFs.existsSync).toHaveBeenCalledWith(mockResolvedPath);
    expect(mockedFs.readFileSync).toHaveBeenCalledWith(mockResolvedPath, 'utf-8');
  });

  test('should return an issue if .clauderules file is not found', () => {
    mockedFs.existsSync.mockReturnValue(false);
    const issues = validateClauderules(mockClauderulesPath);
    expect(issues).toEqual([`Fehler: Datei nicht gefunden unter ${mockResolvedPath}`]);
    expect(mockedFs.existsSync).toHaveBeenCalledWith(mockResolvedPath);
  });

  test('should return an issue if .clauderules file is invalid TOML', () => {
    const invalidTomlContent = `
[project
name = "Test Project"
`;
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(invalidTomlContent);
    const issues = validateClauderules(mockClauderulesPath);
    expect(issues.length).toBe(1);
    expect(issues[0]).toMatch(/Fehler beim Parsen der TOML-Datei:/);
  });

  // --- Tests für [project] Sektion ---
  test('should return an issue if [project] section is missing', () => {
    const tomlContent = `
# No project section
`;
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(tomlContent);
    const issues = validateClauderules(mockClauderulesPath);
    expect(issues).toContain("Fehler: Sektion [project] fehlt.");
  });

  test('should return an issue if project.name is missing', () => {
    const tomlContent = `
[project]
docs_base = "ai_docs/"
`;
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(tomlContent);
    const issues = validateClauderules(mockClauderulesPath);
    expect(issues).toContain("Fehler: project.name in Sektion [project] fehlt.");
  });

  test('should return an issue if project.docs_base is missing', () => {
    const tomlContent = `
[project]
name = "Test Project"
`;
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(tomlContent);
    const issues = validateClauderules(mockClauderulesPath);
    expect(issues).toContain("Fehler: project.docs_base in Sektion [project] fehlt.");
  });


  // --- Tests für [folders.enforce_structure.ai_docs] Sektion ---
  test('should return an issue if a must_have folder is missing', () => {
    const tomlContent = `
[project]
name = "Test Project"
docs_base = "docs_test/"

[folders.enforce_structure.ai_docs]
must_have = ["existing_folder", "missing_folder"]
`;
    mockedFs.existsSync.mockImplementation((p) => {
      if (p === mockResolvedPath || p === path.join('docs_test/', 'existing_folder')) {
        return true;
      }
      return false;
    });
    mockedFs.readFileSync.mockReturnValue(tomlContent);
    mockedFs.lstatSync.mockImplementation((p) => {
      if (p === path.join('docs_test/', 'existing_folder')) {
        return { isDirectory: () => true } as fs.Stats;
      }
      return { isDirectory: () => false } as fs.Stats; // missing_folder
    });

    const issues = validateClauderules(mockClauderulesPath);
    expect(issues).toContain("Fehler: Das in [folders.enforce_structure.ai_docs].must_have definierte Verzeichnis 'missing_folder' existiert nicht unter 'docs_test/'.");
  });

  test('should not return an issue if all must_have folders exist', () => {
    const tomlContent = `
[project]
name = "Test Project"
docs_base = "docs_test/"

[folders.enforce_structure.ai_docs]
must_have = ["folder1", "folder2"]
`;
    mockedFs.existsSync.mockReturnValue(true); // General existence for .clauderules and folders
    mockedFs.readFileSync.mockReturnValue(tomlContent);
    mockedFs.lstatSync.mockReturnValue({ isDirectory: () => true } as fs.Stats); // All are directories

    const issues = validateClauderules(mockClauderulesPath);
    expect(issues.filter(issue => issue.startsWith("Fehler: Das in [folders.enforce_structure.ai_docs].must_have definierte Verzeichnis"))).toEqual([]);
  });


  // --- Tests für [enforce.scripts] Sektion ---
  test('should return an issue if an only_root_script is missing', () => {
    const tomlContent = `
[project]
name = "Test Project"
docs_base = "ai_docs/"

[enforce.scripts]
only_root_script = ["existing.sh", "missing.sh"]
disallow_other_root_scripts = false
`;
    mockedFs.existsSync.mockImplementation((p) => {
      if (p === mockResolvedPath || p === path.resolve('existing.sh')) {
        return true;
      }
      return false; // missing.sh does not exist
    });
    mockedFs.readFileSync.mockReturnValue(tomlContent);

    const issues = validateClauderules(mockClauderulesPath);
    expect(issues).toContain("Fehler: Das in [enforce.scripts].only_root_script definierte Skript 'missing.sh' existiert nicht im Root-Verzeichnis.");
  });

  test('should return an issue if an disallowed root script is found', () => {
    const tomlContent = `
[project]
name = "Test Project"
docs_base = "ai_docs/"

[enforce.scripts]
only_root_script = ["allowed.sh"]
disallow_other_root_scripts = true
`;
    mockedFs.existsSync.mockReturnValue(true); // All files exist for simplicity here
    mockedFs.readFileSync.mockImplementation((p, encoding) => {
      if (p === mockResolvedPath) return tomlContent;
      if (p === path.join(path.resolve('.'), 'disallowed.sh')) return '#!/bin/bash\necho "disallowed"';
      if (p === path.join(path.resolve('.'), 'allowed.sh')) return '#!/bin/bash\necho "allowed"';
      return '';
    });
    mockedFs.lstatSync.mockImplementation((p) => {
        const stats = { isFile: () => false, isDirectory: () => false, isSymbolicLink: () => false } as fs.Stats;
        const resolvedP = path.resolve(p.toString());
        if (resolvedP === path.resolve('allowed.sh') || resolvedP === path.resolve('disallowed.sh') || resolvedP === path.resolve('README.md')) {
            (stats as any).isFile = () => true;
        }
        return stats;
    });
    mockedFs.readdirSync.mockReturnValue(['allowed.sh', 'disallowed.sh', 'README.md'] as any);

    const issues = validateClauderules(mockClauderulesPath);
    expect(issues).toContain("Fehler: Unerlaubtes Skript 'disallowed.sh' im Root-Verzeichnis gefunden. Nur 'allowed.sh' sind erlaubt.");
  });

   test('should not return an issue for non-script files when disallow_other_root_scripts is true', () => {
    const tomlContent = `
[project]
name = "Test Project"
docs_base = "ai_docs/"

[enforce.scripts]
only_root_script = ["allowed.sh"]
disallow_other_root_scripts = true
`;
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockImplementation((p, encoding) => {
      if (p === mockResolvedPath) return tomlContent;
      if (p === path.join(path.resolve('.'), 'allowed.sh')) return '#!/bin/bash\necho "allowed"';
      if (p === path.join(path.resolve('.'), 'config.json')) return '{"key": "value"}'; // Non-script
      return '';
    });
    mockedFs.lstatSync.mockImplementation((p) => {
        const stats = { isFile: () => false, isDirectory: () => false, isSymbolicLink: () => false } as fs.Stats;
        const resolvedP = path.resolve(p.toString());
        if (resolvedP === path.resolve('allowed.sh') || resolvedP === path.resolve('config.json')) {
            (stats as any).isFile = () => true;
        }
        return stats;
    });
    mockedFs.readdirSync.mockReturnValue(['allowed.sh', 'config.json'] as any);

    const issues = validateClauderules(mockClauderulesPath);
    expect(issues.filter(issue => issue.startsWith("Fehler: Unerlaubtes Skript"))).toEqual([]);
  });

  test('should handle empty or undefined rules gracefully', () => {
    const emptyTomlContent = ``;
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(emptyTomlContent);
    const issues = validateClauderules(mockClauderulesPath);
    // Expect specific errors for missing mandatory sections
    expect(issues).toContain("Fehler: Sektion [project] fehlt.");
  });

  test('should correctly use fallback for docs_base if not defined in project section for folder checks', () => {
    const tomlContent = `
[project]
name = "Test Project"
# docs_base is missing

[folders.enforce_structure.ai_docs]
must_have = ["my_folder"]
`;
    mockedFs.existsSync.mockImplementation((p) => {
        // mockResolvedPath is for .clauderules itself
        // path.join('ai_docs/', 'my_folder') is for the default fallback path
        return p === mockResolvedPath || p === path.join('ai_docs/', 'my_folder');
    });
    mockedFs.readFileSync.mockReturnValue(tomlContent);
    mockedFs.lstatSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);

    const issues = validateClauderules(mockClauderulesPath);
    // Check that it doesn't complain about missing 'my_folder' under the fallback 'ai_docs/'
    // It will complain about missing project.docs_base, which is a separate check.
    expect(issues).toContain("Fehler: project.docs_base in Sektion [project] fehlt.");
    expect(issues.find(issue => issue.includes("'my_folder' existiert nicht unter 'ai_docs/'"))).toBeUndefined();
  });

});
