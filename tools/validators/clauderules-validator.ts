#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as toml from 'toml';

interface ProjectRules {
  name?: string;
  docs_base?: string;
  [key: string]: unknown; // Geändert von any zu unknown
}

interface AiDocsRules {
  readonly must_have?: readonly string[];
}

interface EnforceStructureRules {
  ai_docs?: AiDocsRules;
}

interface FoldersRules {
  enforce_structure?: EnforceStructureRules;
}

interface ScriptsRules {
  readonly only_root_script?: readonly string[];
  disallow_other_root_scripts?: boolean;
}

interface EnforceRules {
  scripts?: ScriptsRules;
}

interface ClaudeRules {
  project?: ProjectRules;
  folders?: FoldersRules;
  enforce?: EnforceRules;
  [key: string]: unknown; // Geändert von any zu unknown
}

export function validateClauderules(filePath: string = './.clauderules'): string[] {
  const fullPath = path.resolve(filePath);
  const issues: string[] = [];

  if (!fs.existsSync(fullPath)) {
    issues.push(`Fehler: Datei nicht gefunden unter ${fullPath}`);
    return issues;
  }

  let rules: ClaudeRules;
  try {
    const fileContent = fs.readFileSync(fullPath, 'utf-8');
    rules = toml.parse(fileContent);
  } catch (error: unknown) {
    let message = 'Unbekannter Fehler beim Parsen der TOML-Datei.';
    if (error instanceof Error) {
      message = error.message;
    }
    issues.push(`Fehler beim Parsen der TOML-Datei: ${message}`);
    return issues;
  }

  // --- Sektion [project] Prüfungen ---
  if (!rules.project) {
    issues.push("Fehler: Sektion [project] fehlt.");
  } else {
    if (!rules.project.name) {
      issues.push("Fehler: project.name in Sektion [project] fehlt.");
    }
    if (!rules.project.docs_base) {
      issues.push("Fehler: project.docs_base in Sektion [project] fehlt.");
    }
  }

  // --- Sektion [folders.enforce_structure.ai_docs] Prüfungen ---
  if (rules.folders?.enforce_structure?.ai_docs?.must_have) {
    const aiDocsBasePath = rules.project?.docs_base || 'ai_docs/'; // Fallback
    const mustHaveFolders = rules.folders.enforce_structure.ai_docs.must_have;
    mustHaveFolders.forEach(folder => {
      const folderPath = path.join(aiDocsBasePath, folder);
      if (!fs.existsSync(folderPath) || !fs.lstatSync(folderPath).isDirectory()) {
        issues.push(`Fehler: Das in [folders.enforce_structure.ai_docs].must_have definierte Verzeichnis '${folder}' existiert nicht unter '${aiDocsBasePath}'.`);
      }
    });
  }

  // --- Sektion [enforce.scripts] Prüfungen ---
  if (rules.enforce?.scripts?.only_root_script) {
    const allowedRootScripts = rules.enforce.scripts.only_root_script;
    allowedRootScripts.forEach(scriptName => {
      if (!fs.existsSync(path.resolve(scriptName))) {
        issues.push(`Fehler: Das in [enforce.scripts].only_root_script definierte Skript '${scriptName}' existiert nicht im Root-Verzeichnis.`);
      }
    });

    if (rules.enforce.scripts.disallow_other_root_scripts) {
      const rootDir = path.resolve('.');
      const rootFiles = fs.readdirSync(rootDir);
      rootFiles.forEach(file => {
        const currentFilePath = path.join(rootDir, file);
        if (fs.lstatSync(currentFilePath).isFile() && (path.extname(file) === '.sh' || path.extname(file) === '.js' || path.extname(file) === '')) {
          if (!allowedRootScripts.includes(file)) {
            try {
              const content = fs.readFileSync(currentFilePath, 'utf-8');
              if (content.startsWith('#!/bin/bash') || content.startsWith('#!/usr/bin/env node')) {
                issues.push(`Fehler: Unerlaubtes Skript '${file}' im Root-Verzeichnis gefunden. Nur '${allowedRootScripts.join(', ')}' sind erlaubt.`);
              }
            } catch (e) {
              // Datei konnte nicht gelesen werden oder ist kein Text, ignoriere
            }
          }
        }
      });
    }
  }

  return issues;
}

// Direkter Aufruf, wenn das Skript ausgeführt wird (CLI-Teil)
if (require.main === module) {
  const filePathArg = process.argv[2];
  const validationIssues = validateClauderules(filePathArg);

  if (validationIssues.length > 0) {
    console.error("Validierung der .clauderules fehlgeschlagen:\n");
    validationIssues.forEach(issue => console.error(`- ${issue}`));
    process.exit(1);
  } else {
    console.log(".clauderules erfolgreich validiert. Keine Probleme gefunden.");
  }
}
