#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as toml from 'toml'; // Diese Abhängigkeit muss später installiert werden, ggf. mit Typen: npm install toml @types/toml

interface ProjectRules {
  name?: string;
  docs_base?: string;
}

interface AiDocsRules {
  must_have?: string[];
}

interface EnforceStructureRules {
  ai_docs?: AiDocsRules;
}

interface FoldersRules {
  enforce_structure?: EnforceStructureRules;
}

interface ScriptsRules {
  only_root_script?: string[];
  disallow_other_root_scripts?: boolean;
}

interface EnforceRules {
  scripts?: ScriptsRules;
}

interface ClauderulesConfig {
  project?: ProjectRules;
  folders?: FoldersRules;
  enforce?: EnforceRules;
  [key: string]: any; // Für andere mögliche Top-Level-Sektionen
}

export function validateClauderules(filePath: string = './.clauderules'): void {
  const fullPath: string = path.resolve(filePath);
  const issues: string[] = [];

  if (!fs.existsSync(fullPath)) {
    console.error(`Fehler: Datei nicht gefunden unter ${fullPath}`);
    process.exit(1);
  }

  let rules: ClauderulesConfig;
  try {
    const fileContent: string = fs.readFileSync(fullPath, 'utf-8');
    rules = toml.parse(fileContent) as ClauderulesConfig;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Fehler beim Parsen der TOML-Datei: ${message}`);
    process.exit(1);
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
    // Weitere Pflichtfelder für [project] können hier hinzugefügt werden
  }

  // --- Sektion [folders.enforce_structure.ai_docs] Prüfungen ---
  if (rules.folders?.enforce_structure?.ai_docs?.must_have) {
    const aiDocsBasePath: string = rules.project?.docs_base || 'ai_docs/'; // Fallback, falls docs_base nicht definiert ist
    const mustHaveFolders: string[] = rules.folders.enforce_structure.ai_docs.must_have;
    mustHaveFolders.forEach((folder: string) => {
      const folderPath: string = path.join(aiDocsBasePath, folder);
      if (!fs.existsSync(folderPath) || !fs.lstatSync(folderPath).isDirectory()) {
        issues.push(`Fehler: Das in [folders.enforce_structure.ai_docs].must_have definierte Verzeichnis '${folder}' existiert nicht unter '${aiDocsBasePath}'.`);
      }
    });
  }

  // --- Sektion [enforce.scripts] Prüfungen ---
  if (rules.enforce?.scripts?.only_root_script) {
    const allowedRootScripts: string[] = rules.enforce.scripts.only_root_script;
    allowedRootScripts.forEach((scriptName: string) => {
      if (!fs.existsSync(path.resolve(scriptName))) {
        issues.push(`Fehler: Das in [enforce.scripts].only_root_script definierte Skript '${scriptName}' existiert nicht im Root-Verzeichnis.`);
      }
    });

    if (rules.enforce.scripts.disallow_other_root_scripts) {
      const rootDir: string = path.resolve('.');
      const rootFiles: string[] = fs.readdirSync(rootDir);
      rootFiles.forEach((file: string) => {
        const filePathInRoot: string = path.join(rootDir, file);
        // Prüft, ob es eine Datei ist und ausführbar sein könnte (vereinfachte Prüfung)
        if (fs.lstatSync(filePathInRoot).isFile() && (path.extname(file) === '.sh' || path.extname(file) === '.js' || path.extname(file) === '')) {
          if (!allowedRootScripts.includes(file)) {
            // Zusätzliche Prüfung, um sicherzustellen, dass es sich um ein Skript handelt (heuristisch)
            try {
                const content: string = fs.readFileSync(filePathInRoot, 'utf-8');
                if (content.startsWith('#!/bin/bash') || content.startsWith('#!/usr/bin/env node')) {
                     issues.push(`Fehler: Unerlaubtes Skript '${file}' im Root-Verzeichnis gefunden. Nur '${allowedRootScripts.join(', ')}' sind erlaubt.`);
                }
            } catch(e: unknown) {
                // Datei konnte nicht gelesen werden oder anderer Fehler, ignoriere für diese spezielle Prüfung
                // In einem robusten Szenario könnte hier spezifischer geloggt oder behandelt werden.
            }
          }
        }
      });
    }
  }


  if (issues.length > 0) {
    console.error("Validierung der .clauderules fehlgeschlagen:\n");
    issues.forEach((issue: string) => console.error(`- ${issue}`));
    process.exit(1);
  } else {
    console.log(".clauderules erfolgreich validiert. Keine Probleme gefunden.");
  }
}

// Direkter Aufruf, wenn das Skript ausgeführt wird
// Überprüfung, ob das Modul direkt ausgeführt wird.
// In TypeScript ist `require.main === module` nicht direkt verfügbar oder die empfohlene Methode.
// Eine gängige Alternative ist, dies in einer separaten Datei zu behandeln oder
// die Ausführung basierend auf process.argv zu steuern, wenn es als CLI-Tool gedacht ist.
// Für dieses Beispiel lassen wir den direkten Aufruf ähnlich wie im JS-Original,
// aber in einer realen TS-Anwendung würde man dies ggf. anders strukturieren.
if (process.argv[1] && (process.argv[1].endsWith('clauderules-validator.ts') || process.argv[1].endsWith('clauderules-validator.js'))) {
  // Annahme: Wenn das Skript mit ts-node oder direkt mit node (nach Transpilierung) ausgeführt wird.
  const filePathArg: string | undefined = process.argv[2];
  validateClauderules(filePathArg);
}