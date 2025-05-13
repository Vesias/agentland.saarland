#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const toml = require('toml'); // Diese Abhängigkeit muss später installiert werden

function validateClauderules(filePath = './.clauderules') {
  const fullPath = path.resolve(filePath);
  const issues = [];

  if (!fs.existsSync(fullPath)) {
    console.error(`Fehler: Datei nicht gefunden unter ${fullPath}`);
    process.exit(1);
  }

  let rules;
  try {
    const fileContent = fs.readFileSync(fullPath, 'utf-8');
    rules = toml.parse(fileContent);
  } catch (error) {
    console.error(`Fehler beim Parsen der TOML-Datei: ${error.message}`);
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
    const aiDocsBasePath = rules.project?.docs_base || 'ai_docs/'; // Fallback, falls docs_base nicht definiert ist
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
        const filePath = path.join(rootDir, file);
        // Prüft, ob es eine Datei ist und ausführbar sein könnte (vereinfachte Prüfung)
        if (fs.lstatSync(filePath).isFile() && (path.extname(file) === '.sh' || path.extname(file) === '.js' || path.extname(file) === '')) {
          if (!allowedRootScripts.includes(file)) {
            // Zusätzliche Prüfung, um sicherzustellen, dass es sich um ein Skript handelt (heuristisch)
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                if (content.startsWith('#!/bin/bash') || content.startsWith('#!/usr/bin/env node')) {
                     issues.push(`Fehler: Unerlaubtes Skript '${file}' im Root-Verzeichnis gefunden. Nur '${allowedRootScripts.join(', ')}' sind erlaubt.`);
                }
            } catch(e) {
                // Datei konnte nicht gelesen werden, ignoriere
            }
          }
        }
      });
    }
  }


  if (issues.length > 0) {
    console.error("Validierung der .clauderules fehlgeschlagen:\n");
    issues.forEach(issue => console.error(`- ${issue}`));
    process.exit(1);
  } else {
    console.log(".clauderules erfolgreich validiert. Keine Probleme gefunden.");
  }
}

// Direkter Aufruf, wenn das Skript ausgeführt wird
if (require.main === module) {
  const filePathArg = process.argv[2];
  validateClauderules(filePathArg);
}

module.exports = { validateClauderules };