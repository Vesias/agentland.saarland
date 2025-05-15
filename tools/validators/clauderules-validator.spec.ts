import * as fs from 'fs';
import * as path from 'path';
import { validateClauderules } from './clauderules-validator'; // Assuming the validator exports this

// Mock the 'fs' module
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

// Mock 'path' module specifically for path.resolve to control base path for tests
jest.mock('path', () => {
  const originalPathModule = jest.requireActual('path');
  const { join: originalJoin, isAbsolute: originalIsAbsolute, resolve: originalResolve, ...restOfPath } = originalPathModule;

  return {
    ...restOfPath, // Spread all other functions/properties
    join: originalJoin, // Explicitly use original join
    isAbsolute: originalIsAbsolute, // Explicitly use original isAbsolute
    resolve: jest.fn((...args: string[]) => { 
      // Custom mock logic for resolve
      if (args.length > 0 && args[0] === '.') {
        return originalJoin('/mock/project/root', ...args.slice(1));
      }
      if (args.length === 1 && !originalIsAbsolute(args[0])) {
        return originalJoin('/mock/project/root', args[0]);
      }
      return originalResolve(...args); 
    }),
  };
});


describe('validateClauderules', () => {
  const mockClauderulesPath = '/mock/project/root/.clauderules';
  const mockAiDocsPath = '/mock/project/root/ai_docs/';

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
must_have = ["guide/"]

[enforce.scripts]
only_root_script = ["main.sh"]
disallow_other_root_scripts = true
`;
    mockedFs.existsSync.mockImplementation((p) => {
      if (p === mockClauderulesPath) return true;
      // The validator uses path.join relative to project root for these checks
      if (p === 'ai_docs/guide/') return true; 
      if (p === '/mock/project/root/main.sh') return true; // main.sh is resolved from root
      return false;
    });
    mockedFs.readFileSync.mockReturnValue(validTomlContent);
    mockedFs.lstatSync.mockImplementation((p) => ({
      isDirectory: () => p === 'ai_docs/guide/',
      isFile: () => p === '/mock/project/root/main.sh' || (typeof p === 'string' && p.includes('other.sh')),
    } as fs.Stats));
    // The validator's readdirSync call does not use withFileTypes, so it expects string[]
    mockedFs.readdirSync.mockReturnValue(['main.sh', '.clauderules'] as any); // No disallowed scripts

    const issues = validateClauderules(mockClauderulesPath);
    expect(issues).toEqual([]);
  });

  test('should return issue if .clauderules file not found', () => {
    mockedFs.existsSync.mockReturnValue(false);
    const issues = validateClauderules(mockClauderulesPath);
    expect(issues).toContain(`Fehler: Datei nicht gefunden unter ${mockClauderulesPath}`);
  });

  test('should return issue for invalid TOML syntax', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue('invalid toml content =');
    const issues = validateClauderules(mockClauderulesPath);
    expect(issues.some(issue => issue.startsWith('Fehler beim Parsen der TOML-Datei:'))).toBe(true);
  });

  test('should return issue if [project] section is missing', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue('[folders]'); // Missing [project]
    const issues = validateClauderules(mockClauderulesPath);
    expect(issues).toContain('Fehler: Sektion [project] fehlt.');
  });

  test('should return issue if project.name is missing', () => {
    const tomlContent = `
[project]
docs_base = "ai_docs/"
`;
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(tomlContent);
    const issues = validateClauderules(mockClauderulesPath);
    expect(issues).toContain('Fehler: project.name in Sektion [project] fehlt.');
  });

    test('should return issue if project.docs_base is missing', () => {
    const tomlContent = `
[project]
name = "Test Project"
`;
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(tomlContent);
    const issues = validateClauderules(mockClauderulesPath);
    expect(issues).toContain('Fehler: project.docs_base in Sektion [project] fehlt.');
  });


  test('should return issue if a must_have folder is missing', () => {
    const tomlContent = `
[project]
name = "Test Project"
docs_base = "ai_docs/"

[folders.enforce_structure.ai_docs]
must_have = ["non_existent_folder/"]
`;
    mockedFs.existsSync.mockImplementation((p) => p === mockClauderulesPath); // Only .clauderules exists
    mockedFs.readFileSync.mockReturnValue(tomlContent);
    const issues = validateClauderules(mockClauderulesPath);
    expect(issues).toContain("Fehler: Das in [folders.enforce_structure.ai_docs].must_have definierte Verzeichnis 'non_existent_folder/' existiert nicht unter 'ai_docs/'.");
  });

  test('should return issue if only_root_script is missing', () => {
    const tomlContent = `
[project]
name = "Test Project"
docs_base = "ai_docs/"

[enforce.scripts]
only_root_script = ["missing_script.sh"]
`;
    mockedFs.existsSync.mockImplementation((p) => p === mockClauderulesPath); // Only .clauderules exists
    mockedFs.readFileSync.mockReturnValue(tomlContent);
    const issues = validateClauderules(mockClauderulesPath);
    expect(issues).toContain("Fehler: Das in [enforce.scripts].only_root_script definierte Skript 'missing_script.sh' existiert nicht im Root-Verzeichnis.");
  });

  test('should return issue if disallowed root scripts are present', () => {
    const tomlContent = `
[project]
name = "Test Project"
docs_base = "ai_docs/"

[enforce.scripts]
only_root_script = ["main.sh"]
disallow_other_root_scripts = true
`;
    mockedFs.existsSync.mockImplementation((p) => {
        if (p === mockClauderulesPath) return true;
        if (p === '/mock/project/root/main.sh') return true;
        if (p === '/mock/project/root/other.sh') return true; // Disallowed script
        return false;
    });
    mockedFs.readFileSync.mockImplementation((p) => {
        if (p === mockClauderulesPath) return tomlContent;
        if (p === '/mock/project/root/other.sh') return '#!/bin/bash\necho "other"'; // Shebang to identify as script
        return '';
    });
    mockedFs.lstatSync.mockImplementation((p) => ({
      isDirectory: () => false,
      isFile: () => true,
    } as fs.Stats));
    // The validator's readdirSync call does not use withFileTypes, so it expects string[]
    mockedFs.readdirSync.mockReturnValue(['main.sh', 'other.sh', '.clauderules'] as any);

    const issues = validateClauderules(mockClauderulesPath);
    expect(issues).toContain("Fehler: Unerlaubtes Skript 'other.sh' im Root-Verzeichnis gefunden. Nur 'main.sh' sind erlaubt.");
  });
  
  test('should handle TOML parsing errors gracefully', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue('project.name = "Test"\ninvalid_toml_line');
    const issues = validateClauderules(mockClauderulesPath);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]).toMatch(/Fehler beim Parsen der TOML-Datei:/);
  });
});
