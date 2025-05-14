#!/usr/bin/env node

/**
 * Simple Create .about Profile
 * ====================
 * 
 * Interactive script to create a .about profile for the user.
 * Simplified version with robust error handling.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const os = require('os');
const readline = require('readline');

// Process arguments
const args = process.argv.slice(2);
const userArg = args.find(arg => arg.startsWith('--user='));
const userId = userArg ? userArg.split('=')[1] : undefined;
const workdirArg = args.find(arg => arg.startsWith('--workdir='));
const customWorkdir = workdirArg ? workdirArg.split('=')[1] : undefined;

// Determine the working directory
const WORKSPACE_DIR = customWorkdir || process.env.WORKSPACE_DIR || process.cwd();
console.log(chalk.blue(`Working directory: ${WORKSPACE_DIR}`));

// Configuration paths
const CONFIG_DIR = process.env.CONFIG_DIR || path.join(WORKSPACE_DIR, 'configs');
const PROFILES_DIR = path.join(CONFIG_DIR, 'profiles');
const ABOUT_FILE = userId 
  ? path.join(PROFILES_DIR, `${userId}.about.json`)
  : path.join(CONFIG_DIR, 'user.about.json');

// Ensure the required directories exist
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

if (!fs.existsSync(PROFILES_DIR)) {
  fs.mkdirSync(PROFILES_DIR, { recursive: true });
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
function prompt(question, defaultValue = '') {
  return new Promise((resolve) => {
    const defaultText = defaultValue ? ` (${defaultValue})` : '';
    rl.question(`${question}${defaultText}: `, (answer) => {
      resolve(answer || defaultValue);
    });
  });
}

// Function to prompt for a list of items
async function promptList(question, defaultItems = []) {
  const defaultValue = defaultItems.length > 0 ? defaultItems.join(', ') : '';
  const answer = await prompt(question, defaultValue);
  return answer.split(',').map(item => item.trim()).filter(Boolean);
}

// Function to prompt for a choice
async function promptChoice(question, choices, defaultChoice) {
  console.log(`${question}`);
  choices.forEach((choice, index) => {
    const isDefault = choice === defaultChoice ? ' (Standard)' : '';
    console.log(`${index + 1}. ${choice}${isDefault}`);
  });
  
  const answer = await prompt('Nummer wählen', choices.indexOf(defaultChoice) + 1);
  const index = parseInt(answer, 10) - 1;
  
  if (index >= 0 && index < choices.length) {
    return choices[index];
  }
  return defaultChoice;
}

// Function to prompt for a yes/no question
async function promptYesNo(question, defaultYes = true) {
  const defaultText = defaultYes ? 'J/n' : 'j/N';
  const answer = await prompt(`${question} (${defaultText})`);
  
  if (!answer) return defaultYes;
  
  return answer.toLowerCase() === 'j' || answer.toLowerCase() === 'y';
}

/**
 * Interactive About Profile Creation
 */
async function createAboutInteractive() {
  console.log(chalk.bold('\n=== Claude Neural Framework - .about Profil Erstellung ===\n'));
  
  // Load current profile if it exists
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
  
  try {
    // Personal information
    const name = await prompt('Wie lautet Ihr Name?', currentProfile?.name || '');
    
    const goals = await promptList(
      'Was sind Ihre Ziele? (Komma-getrennte Liste)', 
      Array.isArray(currentProfile?.goals) ? currentProfile.goals : []
    );
    
    const companies = await promptList(
      'Für welche Unternehmen arbeiten Sie? (Komma-getrennte Liste)', 
      Array.isArray(currentProfile?.companies) ? currentProfile.companies : []
    );
    
    const expertise = await promptList(
      'In welchen Bereichen haben Sie Expertise? (Komma-getrennte Liste, z.B. javascript,python,algorithms)',
      Array.isArray(currentProfile?.expertise) ? currentProfile.expertise : []
    );
    
    // Debugging preferences
    const debugStrategy = await promptChoice(
      'Welche Debugging-Strategie bevorzugen Sie?',
      ['bottom-up', 'top-down'],
      currentProfile?.debug_preferences?.strategy || 'bottom-up'
    );
    
    const detailLevel = await promptChoice(
      'Welchen Detaillierungsgrad bevorzugen Sie bei Reports?',
      ['low', 'medium', 'high'],
      currentProfile?.debug_preferences?.detail_level || 'medium'
    );
    
    const autoFix = await promptYesNo(
      'Sollen Fehler automatisch behoben werden, wenn möglich?',
      currentProfile?.debug_preferences?.auto_fix !== undefined ? currentProfile.debug_preferences.auto_fix : true
    );
    
    // Theme preferences
    const theme = await promptChoice(
      'Welches Thema bevorzugen Sie?',
      ['light', 'dark'],
      currentProfile?.preferences?.theme || 'dark'
    );
    
    const lang = await promptChoice(
      'Welche Sprache bevorzugen Sie?',
      ['de', 'en'],
      currentProfile?.preferences?.lang || 'de'
    );
    
    // Color scheme
    console.log(chalk.cyan('\nFarbschema-Konfiguration:'));
    console.log(chalk.gray('Das Farbschema wird für alle UI-Komponenten und generierten Inhalte verwendet.'));
    
    const useCustomColors = await promptYesNo('Möchten Sie ein benutzerdefiniertes Farbschema erstellen?');
    
    let colorScheme = {
      primary: theme === 'light' ? '#2196f3' : '#3f51b5',
      secondary: theme === 'light' ? '#64b5f6' : '#7986cb',
      accent: '#ff4081'
    };
    
    if (useCustomColors) {
      console.log(chalk.yellow('\nBenutzerdefinierte Farben auswählen:'));
      
      const colorTemplates = {
        'blue': {
          primary: theme === 'light' ? '#2196f3' : '#3f51b5',
          secondary: theme === 'light' ? '#64b5f6' : '#7986cb',
          accent: '#ff4081'
        },
        'purple': {
          primary: '#9c27b0',
          secondary: '#ba68c8',
          accent: '#ffab00'
        },
        'green': {
          primary: '#4caf50',
          secondary: '#81c784',
          accent: '#ff4081'
        },
        'amber': {
          primary: '#ffc107',
          secondary: '#ffd54f',
          accent: '#ff5722'
        }
      };
      
      const templateChoice = await promptChoice(
        'Welche Farbvorlage möchten Sie verwenden?',
        ['blue', 'purple', 'green', 'amber', 'custom'],
        'blue'
      );
      
      if (templateChoice === 'custom') {
        colorScheme.primary = await prompt('Primärfarbe (hex, z.B. #3f51b5)', colorScheme.primary);
        colorScheme.secondary = await prompt('Sekundärfarbe (hex, z.B. #7986cb)', colorScheme.secondary);
        colorScheme.accent = await prompt('Akzentfarbe (hex, z.B. #ff4081)', colorScheme.accent);
      } else {
        colorScheme = colorTemplates[templateChoice];
      }
      
      console.log(chalk.green('\nFarbschema erfolgreich konfiguriert!'));
      console.log(chalk.cyan(`Primärfarbe: ${colorScheme.primary}`));
      console.log(chalk.cyan(`Sekundärfarbe: ${colorScheme.secondary}`));
      console.log(chalk.cyan(`Akzentfarbe: ${colorScheme.accent}`));
    }
    
    // Agent role
    const isAgent = await promptYesNo(
      'Soll dieses Profil für einen Agenten verwendet werden?',
      currentProfile?.is_agent !== undefined ? currentProfile.is_agent : false
    );
    
    // Create profile
    const profile = {
      user_id: currentProfile?.user_id || `user-${Date.now()}`,
      name: name,
      goals: goals,
      companies: companies,
      preferences: {
        theme: theme,
        lang: lang,
        colorScheme: colorScheme
      },
      expertise: expertise,
      debug_preferences: {
        strategy: debugStrategy,
        detail_level: detailLevel,
        auto_fix: autoFix
      },
      is_agent: isAgent
    };
    
    // Save profile
    fs.writeFileSync(ABOUT_FILE, JSON.stringify(profile, null, 2));
    console.log(chalk.green(`\n.about Profil erfolgreich gespeichert: ${ABOUT_FILE}`));
    
    // Show profile summary
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
    console.error(`Fehler beim Erstellen des Profils: ${err.message}`);
    console.error(err.stack);
    return null;
  } finally {
    rl.close();
  }
}

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

// Show help message
const showHelp = () => {
  console.log(`
${chalk.bold('About Profile Generator')}
${chalk.cyan('Usage:')} node create_about_simple.js [options]

${chalk.bold('Options:')}
  --user=USER_ID     User ID to create profile for
  --workdir=PATH     Custom workspace directory
  --non-interactive  Use default values without prompting
  --help, -h         Show this help message

${chalk.bold('Example:')}
  node create_about_simple.js --user=jan --workdir=/home/jan/projects/saar
  `);
};

// Direct invocation
if (require.main === module) {
  const args = parseArgs();
  
  if (args.help) {
    showHelp();
  } else if (args.nonInteractive && args.user) {
    createDefaultAbout(args.user, 'dark');
  } else {
    createAboutInteractive().catch(err => {
      console.error('Error in profile creation:', err);
      process.exit(1);
    });
  }
}

// For import
module.exports = {
  createAboutInteractive,
  createDefaultAbout
};