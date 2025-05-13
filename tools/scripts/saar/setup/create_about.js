#!/usr/bin/env node

/**
 * Create .about Profile
 * ====================
 * 
 * Interactive script to create a .about profile for the user.
 * Includes color schema configuration.
 */

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const os = require('os');

// Process arguments
const args = process.argv.slice(2);
const userArg = args.find(arg => arg.startsWith('--user='));
const userId = userArg ? userArg.split('=')[1] : undefined;
const workdirArg = args.find(arg => arg.startsWith('--workdir='));
const customWorkdir = workdirArg ? workdirArg.split('=')[1] : undefined;

// Determine the working directory - check for environment variable, argument, or use default
const WORKSPACE_DIR = customWorkdir || process.env.WORKSPACE_DIR || process.cwd();
console.log(chalk.blue(`Working directory: ${WORKSPACE_DIR}`));

// Try to import color schema manager from various possible locations
let colorSchemaManager;
try {
  // First try local import
  colorSchemaManager = require('../../../src/core/mcp/color_schema_manager');
} catch (e) {
  try {
    // Try absolute path import from workspace
    colorSchemaManager = require(path.join(WORKSPACE_DIR, 'libs/core/src/mcp/color_schema_manager'));
  } catch (e) {
    // Fallback to mock
    console.warn(chalk.yellow('Warning: Could not import color_schema_manager, using mock version'));
    colorSchemaManager = {
      getColorSchema: () => ({
        colors: {
          primary: '#3f51b5',
          secondary: '#7986cb', 
          accent: '#ff4081'
        }
      })
    };
  }
}

// Konfigurationspfade
const CONFIG_DIR = process.env.CONFIG_DIR || path.join(WORKSPACE_DIR, 'configs');
const PROFILES_DIR = path.join(CONFIG_DIR, 'profiles');
const ABOUT_FILE = userId 
  ? path.join(PROFILES_DIR, `${userId}.about.json`)
  : path.join(CONFIG_DIR, 'user.about.json');

// Sicherstellen, dass die benötigten Verzeichnisse existieren
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

if (!fs.existsSync(PROFILES_DIR)) {
  fs.mkdirSync(PROFILES_DIR, { recursive: true });
}

/**
 * Interaktive About-Profil-Erstellung
 */
async function createAboutInteractive() {
  console.log(chalk.bold('\n=== Claude Neural Framework - .about Profil Erstellung ===\n'));
  
  // Aktuelles Profil laden, falls vorhanden
  let currentProfile = null;
  try {
    if (fs.existsSync(ABOUT_FILE)) {
      const profileData = fs.readFileSync(ABOUT_FILE, 'utf8');
      currentProfile = JSON.parse(profileData);
      console.log(chalk.green('Bestehendes .about Profil gefunden. Werte werden als Standardwerte verwendet.'));
    }
  } catch (err) {
    console.warn(`Konnte bestehendes Profil nicht laden: ${err.message}`);
  }

  // Ensure arrays are properly handled
  const getArrayDefault = (array) => {
    if (!array) return '';
    if (Array.isArray(array)) return array.join(', ');
    if (typeof array === 'string') return array;
    return '';
  };

  // Benutzerinformationen
  const personalInfo = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Wie lautet Ihr Name?',
      default: currentProfile?.name || ''
    },
    {
      type: 'input',
      name: 'goals',
      message: 'Was sind Ihre Ziele? (Komma-getrennte Liste)',
      default: getArrayDefault(currentProfile?.goals),
      filter: input => input.split(',').map(goal => goal.trim()).filter(Boolean)
    },
    {
      type: 'input',
      name: 'companies',
      message: 'Für welche Unternehmen arbeiten Sie? (Komma-getrennte Liste)',
      default: getArrayDefault(currentProfile?.companies),
      filter: input => input.split(',').map(company => company.trim()).filter(Boolean)
    }
  ]);

  // Expertise
  const expertiseInfo = await inquirer.prompt([
    {
      type: 'input',
      name: 'expertise',
      message: 'In welchen Bereichen haben Sie Expertise? (Komma-getrennte Liste, z.B. javascript,python,algorithms)',
      default: getArrayDefault(currentProfile?.expertise),
      filter: input => input.split(',').map(area => area.trim()).filter(Boolean)
    }
  ]);

  // Debugging-Präferenzen
  const debuggingInfo = await inquirer.prompt([
    {
      type: 'list',
      name: 'strategy',
      message: 'Welche Debugging-Strategie bevorzugen Sie?',
      choices: [
        { name: 'Bottom-Up (von Details zum Gesamtbild)', value: 'bottom-up' },
        { name: 'Top-Down (vom Gesamtbild zu Details)', value: 'top-down' }
      ],
      default: currentProfile?.debug_preferences?.strategy || 'bottom-up'
    },
    {
      type: 'list',
      name: 'detail_level',
      message: 'Welchen Detaillierungsgrad bevorzugen Sie bei Reports?',
      choices: [
        { name: 'Niedrig (nur wesentliche Informationen)', value: 'low' },
        { name: 'Mittel (ausgewogenes Verhältnis)', value: 'medium' },
        { name: 'Hoch (detaillierte Informationen)', value: 'high' }
      ],
      default: currentProfile?.debug_preferences?.detail_level || 'medium'
    },
    {
      type: 'confirm',
      name: 'auto_fix',
      message: 'Sollen Fehler automatisch behoben werden, wenn möglich?',
      default: currentProfile?.debug_preferences?.auto_fix !== undefined ? 
               currentProfile.debug_preferences.auto_fix : true
    }
  ]);

  // Präferenzen
  const prefInfo = await inquirer.prompt([
    {
      type: 'list',
      name: 'theme',
      message: 'Welches Thema bevorzugen Sie?',
      choices: [
        { name: 'Hell', value: 'light' },
        { name: 'Dunkel', value: 'dark' }
      ],
      default: currentProfile?.preferences?.theme || 'dark'
    },
    {
      type: 'list',
      name: 'lang',
      message: 'Welche Sprache bevorzugen Sie?',
      choices: [
        { name: 'Deutsch', value: 'de' },
        { name: 'Englisch', value: 'en' }
      ],
      default: currentProfile?.preferences?.lang || 'de'
    }
  ]);

  // Farbschema-Konfiguration
  console.log(chalk.cyan('\nFarbschema-Konfiguration:'));
  console.log(chalk.gray('Das Farbschema wird für alle UI-Komponenten und generierten Inhalte verwendet.'));
  
  const { useColorSchemaManager } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useColorSchemaManager',
      message: 'Möchten Sie den Farbschema-Manager für detaillierte Anpassungen öffnen?',
      default: true
    }
  ]);

  let colorScheme = null;
  
  if (useColorSchemaManager) {
    // Benutzer möchte detaillierte Farbschema-Anpassungen
    console.log(chalk.yellow('\nInteraktive Farbschema-Konfiguration\n'));
    
    // Implementiere einen einfachen Farbschema-Manager direkt hier
    try {
      // Lade Standard-Farbschema basierend auf dem ausgewählten Thema
      let defaultColorScheme = {
        primary: prefInfo.theme === 'light' ? '#2196f3' : '#3f51b5',
        secondary: prefInfo.theme === 'light' ? '#64b5f6' : '#7986cb',
        accent: '#ff4081'
      };
      
      // Aktuelle Werte anzeigen
      console.log(chalk.cyan('Aktuelles Farbschema:'));
      console.log(chalk.blue(`Primärfarbe: ${defaultColorScheme.primary}`));
      console.log(chalk.blue(`Sekundärfarbe: ${defaultColorScheme.secondary}`));
      console.log(chalk.blue(`Akzentfarbe: ${defaultColorScheme.accent}`));
      
      // Interaktive Farbauswahl
      const colorChoices = await inquirer.prompt([
        {
          type: 'list',
          name: 'colorTemplate',
          message: 'Welche Farbvorlage möchten Sie verwenden?',
          choices: [
            { name: 'Standard Blau (empfohlen)', value: 'blue' },
            { name: 'Material Purple', value: 'purple' },
            { name: 'Material Green', value: 'green' },
            { name: 'Material Amber', value: 'amber' },
            { name: 'Benutzerdefiniert', value: 'custom' }
          ],
          default: 'blue'
        }
      ]);
      
      // Vordefinierte Farbschemata
      const templates = {
        blue: {
          primary: prefInfo.theme === 'light' ? '#2196f3' : '#3f51b5',
          secondary: prefInfo.theme === 'light' ? '#64b5f6' : '#7986cb',
          accent: '#ff4081'
        },
        purple: {
          primary: '#9c27b0',
          secondary: '#ba68c8',
          accent: '#ffab00'
        },
        green: {
          primary: '#4caf50',
          secondary: '#81c784',
          accent: '#ff4081'
        },
        amber: {
          primary: '#ffc107',
          secondary: '#ffd54f',
          accent: '#ff5722'
        }
      };
      
      // Farbe basierend auf Vorlage oder benutzerdefiniert festlegen
      if (colorChoices.colorTemplate === 'custom') {
        // Benutzerdefinierte Eingabe für Farben
        const customColors = await inquirer.prompt([
          {
            type: 'input',
            name: 'primary',
            message: 'Primärfarbe (hex, z.B. #3f51b5):',
            default: defaultColorScheme.primary,
            validate: input => /^#[0-9A-Fa-f]{6}$/.test(input) ? true : 'Bitte geben Sie einen gültigen Hex-Farbcode ein (z.B. #3f51b5)'
          },
          {
            type: 'input',
            name: 'secondary',
            message: 'Sekundärfarbe (hex, z.B. #7986cb):',
            default: defaultColorScheme.secondary,
            validate: input => /^#[0-9A-Fa-f]{6}$/.test(input) ? true : 'Bitte geben Sie einen gültigen Hex-Farbcode ein (z.B. #7986cb)'
          },
          {
            type: 'input',
            name: 'accent',
            message: 'Akzentfarbe (hex, z.B. #ff4081):',
            default: defaultColorScheme.accent,
            validate: input => /^#[0-9A-Fa-f]{6}$/.test(input) ? true : 'Bitte geben Sie einen gültigen Hex-Farbcode ein (z.B. #ff4081)'
          }
        ]);
        
        colorScheme = customColors;
      } else {
        colorScheme = templates[colorChoices.colorTemplate];
      }
      
      // Zeige ausgewähltes Farbschema
      console.log(chalk.green('\nFarbschema erfolgreich konfiguriert!'));
      console.log(chalk.cyan(`Primärfarbe: ${colorScheme.primary}`));
      console.log(chalk.cyan(`Sekundärfarbe: ${colorScheme.secondary}`));
      console.log(chalk.cyan(`Akzentfarbe: ${colorScheme.accent}`));
      
    } catch (err) {
      console.error(`Fehler bei der Farbschema-Konfiguration: ${err.message}`);
      
      // Use default color scheme
      colorScheme = {
        primary: '#3f51b5',
        secondary: '#7986cb',
        accent: '#ff4081'
      };
    }
  } else {
    // Standard color scheme based on theme
    const themeName = prefInfo.theme;
    
    // Try to load theme config from different possible paths
    let themeConfig;
    try {
      themeConfig = require(path.join(WORKSPACE_DIR, 'configs/color-schema/config.json'));
    } catch (e) {
      try {
        themeConfig = require(path.join(WORKSPACE_DIR, 'libs/core/src/config/color_schema_config.json'));
      } catch (e) {
        // Default theme config if none found
        themeConfig = {
          themes: {
            light: {
              colors: {
                primary: '#2196f3',
                secondary: '#64b5f6',
                accent: '#ff4081'
              }
            },
            dark: {
              colors: {
                primary: '#3f51b5',
                secondary: '#7986cb',
                accent: '#ff4081'
              }
            }
          }
        };
      }
    }
    
    colorScheme = themeConfig.themes[themeName]?.colors || themeConfig.themes.dark.colors;
    
    console.log(chalk.cyan('\nStandardfarbschema für das Thema wird verwendet.'));
    console.log(chalk.cyan(`Primärfarbe: ${colorScheme.primary}`));
    console.log(chalk.cyan(`Sekundärfarbe: ${colorScheme.secondary}`));
    console.log(chalk.cyan(`Akzentfarbe: ${colorScheme.accent}`));
  }

  // Agentenrolle
  const agentInfo = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'is_agent',
      message: 'Soll dieses Profil für einen Agenten verwendet werden?',
      default: currentProfile?.is_agent !== undefined ? currentProfile.is_agent : true
    }
  ]);

  // Profil erstellen
  const profile = {
    user_id: currentProfile?.user_id || `user-${Date.now()}`,
    name: personalInfo.name,
    goals: personalInfo.goals,
    companies: personalInfo.companies,
    preferences: {
      theme: prefInfo.theme,
      lang: prefInfo.lang,
      colorScheme: colorScheme
    },
    expertise: expertiseInfo.expertise,
    debug_preferences: {
      strategy: debuggingInfo.strategy,
      detail_level: debuggingInfo.detail_level,
      auto_fix: debuggingInfo.auto_fix
    },
    is_agent: agentInfo.is_agent
  };

  // Profil speichern
  try {
    fs.writeFileSync(ABOUT_FILE, JSON.stringify(profile, null, 2));
    console.log(chalk.green(`\n.about Profil erfolgreich gespeichert: ${ABOUT_FILE}`));
    
    // Profil anzeigen
    console.log(chalk.yellow('\nProfil-Zusammenfassung:'));
    console.log(chalk.cyan(`Name: ${profile.name}`));
    console.log(chalk.cyan(`Ziele: ${profile.goals.join(', ')}`));
    console.log(chalk.cyan(`Unternehmen: ${profile.companies.join(', ')}`));
    console.log(chalk.cyan(`Expertise: ${profile.expertise.join(', ')}`));
    console.log(chalk.cyan(`Debugging-Strategie: ${profile.debug_preferences.strategy}`));
    console.log(chalk.cyan(`Thema: ${profile.preferences.theme}`));
    console.log(chalk.cyan(`Sprache: ${profile.preferences.lang}`));
    console.log(chalk.cyan(`Agentenrolle: ${profile.is_agent ? 'Ja' : 'Nein'}`));
    
    return profile;
  } catch (err) {
    console.error(`Fehler beim Speichern des Profils: ${err.message}`);
    return null;
  }
}

// Parse command line arguments
const parseArgs = () => {
  const args = process.argv.slice(2);
  const result = {
    user: undefined,
    workdir: undefined,
    help: false,
    nonInteractive: false
  };
  
  args.forEach(arg => {
    if (arg.startsWith('--user=')) {
      result.user = arg.split('=')[1];
    } else if (arg.startsWith('--workdir=')) {
      result.workdir = arg.split('=')[1];
    } else if (arg === '--help' || arg === '-h') {
      result.help = true;
    } else if (arg === '--non-interactive') {
      result.nonInteractive = true;
    }
  });
  
  return result;
};

/**
 * Create default about profile non-interactively
 */
const createDefaultAbout = (userId, theme = 'dark') => {
  console.log(chalk.bold(`\nGenerating default .about profile for user ${userId}...\n`));
  
  const profile = {
    user_id: userId || `user-${Date.now()}`,
    name: "Default User",
    goals: ["Setup Agentic OS", "Build advanced AI agents"],
    companies: ["SAAR Framework"],
    preferences: {
      theme: theme,
      lang: "de",
      colorScheme: {
        primary: '#3f51b5',
        secondary: '#7986cb',
        accent: '#ff4081'
      }
    },
    expertise: ["JavaScript", "Python", "AI"],
    debug_preferences: {
      strategy: "bottom-up",
      detail_level: "medium",
      auto_fix: true
    },
    is_agent: false
  };
  
  // Create directory if it doesn't exist
  const aboutDir = path.dirname(ABOUT_FILE);
  if (!fs.existsSync(aboutDir)) {
    fs.mkdirSync(aboutDir, { recursive: true });
  }
  
  // Save profile
  try {
    fs.writeFileSync(ABOUT_FILE, JSON.stringify(profile, null, 2));
    console.log(chalk.green(`\n.about Profile saved to: ${ABOUT_FILE}`));
    return profile;
  } catch (err) {
    console.error(`Error saving profile: ${err.message}`);
    return null;
  }
};

// Show help message
const showHelp = () => {
  console.log(`
${chalk.bold('About Profile Generator')}
${chalk.cyan('Usage:')} node create_about.js [options]

${chalk.bold('Options:')}
  --user=USER_ID     User ID to create profile for
  --workdir=PATH     Custom workspace directory
  --non-interactive  Use default values without prompting
  --help, -h         Show this help message

${chalk.bold('Example:')}
  node create_about.js --user=jan --workdir=/home/jan/projects/saar
  `);
};

// Direkter Aufruf
if (require.main === module) {
  const args = parseArgs();
  
  if (args.help) {
    showHelp();
  } else if (args.nonInteractive && args.user) {
    createDefaultAbout(args.user, 'dark');
  } else {
    createAboutInteractive().catch(console.error);
  }
}

// Für Import
module.exports = {
  createAboutInteractive,
  createDefaultAbout
};