#!/usr/bin/env node

/**
 * A2A Security Admin CLI
 * ======================
 * 
 * Command-line tool for managing A2A security settings, including
 * agent registration, API key management, and security policy configuration.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import A2ASecurityMiddleware from '../../../libs/agents/src/security/a2a-security-middleware';
import { AgentAccessLevel } from '../../../libs/agents/src/security/a2a-security.types';
import { Logger } from '../../../libs/core/src/logging/logger';

// Configure logger
const logger = new Logger('a2a-security-admin');

// Create security middleware
const securityMiddleware = new A2ASecurityMiddleware({
  enableAuthentication: true,
  enableAuthorization: true,
  enableValidation: true,
  enablePrioritization: true,
  enableAuditLog: true,
  auditLogPath: path.resolve(process.cwd(), 'logs/a2a-security.log')
});

// Create program
const program = new Command();

program
  .version('1.0.0')
  .description('A2A Security Admin CLI - Manage agent security settings');

/**
 * Register an agent
 */
program
  .command('register-agent')
  .description('Register a new agent with API key')
  .option('-i, --id <id>', 'Agent identifier')
  .option('-a, --access-level <level>', 'Access level (public, protected, private, restricted)', 'public')
  .option('-r, --roles <roles>', 'Comma-separated roles', '')
  .option('-e, --expires-in <days>', 'Number of days until expiration (0 for no expiration)', '0')
  .action(async (options) => {
    try {
      // Get agent ID
      let agentId = options.id;
      
      if (!agentId) {
        const answer = await inquirer.prompt([{
          type: 'input',
          name: 'agentId',
          message: 'Enter agent identifier:',
          validate: (input) => input.trim() !== '' ? true : 'Agent identifier is required'
        }]);
        
        agentId = answer.agentId;
      }
      
      // Get access level
      let accessLevel = options.accessLevel.toLowerCase();
      
      if (!['public', 'protected', 'private', 'restricted'].includes(accessLevel)) {
        console.error(chalk.red(`Invalid access level: ${accessLevel}`));
        console.error(chalk.yellow('Valid access levels: public, protected, private, restricted'));
        process.exit(1);
      }
      
      // Map string to enum
      const accessLevelEnum = {
        'public': AgentAccessLevel.PUBLIC,
        'protected': AgentAccessLevel.PROTECTED,
        'private': AgentAccessLevel.PRIVATE,
        'restricted': AgentAccessLevel.RESTRICTED
      }[accessLevel];
      
      // Get roles
      const roles = options.roles.split(',')
        .map(role => role.trim())
        .filter(role => role !== '');
      
      // Get expiration
      const expiresInDays = parseInt(options.expiresIn, 10);
      
      if (isNaN(expiresInDays) || expiresInDays < 0) {
        console.error(chalk.red(`Invalid expiration days: ${options.expiresIn}`));
        console.error(chalk.yellow('Must be a non-negative integer'));
        process.exit(1);
      }
      
      // Generate API key
      const apiKey = await securityMiddleware.registerAgentApiKey(
        agentId,
        undefined, // Generate a new key
        accessLevelEnum,
        roles,
        expiresInDays
      );
      
      console.log(chalk.green('Agent registered successfully'));
      console.log(chalk.blue('Agent ID:'), agentId);
      console.log(chalk.blue('Access Level:'), accessLevel);
      console.log(chalk.blue('Roles:'), roles.length > 0 ? roles.join(', ') : '(none)');
      console.log(chalk.blue('Expires In:'), expiresInDays > 0 ? `${expiresInDays} days` : 'Never');
      console.log(chalk.blue('API Key:'), chalk.yellow(apiKey));
      console.log();
      console.log(chalk.yellow('Important:'), 'Store this API key securely. It will not be shown again.');
      
    } catch (error) {
      console.error(chalk.red('Error registering agent:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Generate JWT token
 */
program
  .command('generate-jwt')
  .description('Generate a JWT token for an agent')
  .option('-i, --id <id>', 'Agent identifier')
  .option('-a, --access-level <level>', 'Access level (public, protected, private, restricted)', 'public')
  .option('-r, --roles <roles>', 'Comma-separated roles', '')
  .option('-e, --expires-in <time>', 'Expiration time (e.g., 1h, 7d)', '1d')
  .action(async (options) => {
    try {
      // Get agent ID
      let agentId = options.id;
      
      if (!agentId) {
        const answer = await inquirer.prompt([{
          type: 'input',
          name: 'agentId',
          message: 'Enter agent identifier:',
          validate: (input) => input.trim() !== '' ? true : 'Agent identifier is required'
        }]);
        
        agentId = answer.agentId;
      }
      
      // Get access level
      let accessLevel = options.accessLevel.toLowerCase();
      
      if (!['public', 'protected', 'private', 'restricted'].includes(accessLevel)) {
        console.error(chalk.red(`Invalid access level: ${accessLevel}`));
        console.error(chalk.yellow('Valid access levels: public, protected, private, restricted'));
        process.exit(1);
      }
      
      // Map string to enum
      const accessLevelEnum = {
        'public': AgentAccessLevel.PUBLIC,
        'protected': AgentAccessLevel.PROTECTED,
        'private': AgentAccessLevel.PRIVATE,
        'restricted': AgentAccessLevel.RESTRICTED
      }[accessLevel];
      
      // Get roles
      const roles = options.roles.split(',')
        .map(role => role.trim())
        .filter(role => role !== '');
      
      // Generate JWT token
      const token = securityMiddleware.generateJwtToken(
        agentId,
        accessLevelEnum,
        roles,
        options.expiresIn
      );
      
      console.log(chalk.green('JWT token generated successfully'));
      console.log(chalk.blue('Agent ID:'), agentId);
      console.log(chalk.blue('Access Level:'), accessLevel);
      console.log(chalk.blue('Roles:'), roles.length > 0 ? roles.join(', ') : '(none)');
      console.log(chalk.blue('Expires In:'), options.expiresIn);
      console.log(chalk.blue('JWT Token:'), chalk.yellow(token));
      console.log();
      console.log(chalk.yellow('Important:'), 'Store this JWT token securely.');
      
    } catch (error) {
      console.error(chalk.red('Error generating JWT token:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Create credentials file
 */
program
  .command('create-credentials')
  .description('Create a credentials file for an agent')
  .option('-i, --id <id>', 'Agent identifier')
  .option('-t, --type <type>', 'Credential type (api_key, jwt)', 'api_key')
  .option('-o, --output <file>', 'Output file')
  .action(async (options) => {
    try {
      // Get agent ID
      let agentId = options.id;
      
      if (!agentId) {
        const answer = await inquirer.prompt([{
          type: 'input',
          name: 'agentId',
          message: 'Enter agent identifier:',
          validate: (input) => input.trim() !== '' ? true : 'Agent identifier is required'
        }]);
        
        agentId = answer.agentId;
      }
      
      // Get credential type
      let credentialType = options.type.toLowerCase();
      
      if (!['api_key', 'jwt'].includes(credentialType)) {
        console.error(chalk.red(`Invalid credential type: ${credentialType}`));
        console.error(chalk.yellow('Valid types: api_key, jwt'));
        process.exit(1);
      }
      
      // Generate credentials
      let credentials;
      
      if (credentialType === 'api_key') {
        // Generate API key
        const apiKey = await securityMiddleware.registerAgentApiKey(
          agentId,
          undefined, // Generate a new key
          AgentAccessLevel.PUBLIC,
          [],
          0 // Never expires
        );
        
        credentials = {
          type: 'api_key',
          value: apiKey,
          agentId
        };
      } else {
        // Generate JWT token
        const token = securityMiddleware.generateJwtToken(
          agentId,
          AgentAccessLevel.PUBLIC,
          [],
          '30d' // 30 days
        );
        
        credentials = {
          type: 'jwt',
          value: token,
          agentId
        };
      }
      
      // Save credentials
      let outputFile = options.output;
      
      if (!outputFile) {
        const answer = await inquirer.prompt([{
          type: 'input',
          name: 'outputFile',
          message: 'Enter output file path:',
          default: `${agentId}-credentials.json`
        }]);
        
        outputFile = answer.outputFile;
      }
      
      // Create directory if needed
      const outputDir = path.dirname(outputFile);
      await fs.mkdir(outputDir, { recursive: true });
      
      // Write credentials
      await fs.writeFile(outputFile, JSON.stringify(credentials, null, 2), 'utf-8');
      
      console.log(chalk.green('Credentials file created successfully'));
      console.log(chalk.blue('Agent ID:'), agentId);
      console.log(chalk.blue('Credential Type:'), credentialType);
      console.log(chalk.blue('Output File:'), outputFile);
      
    } catch (error) {
      console.error(chalk.red('Error creating credentials:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Main function
 */
async function main() {
  try {
    // Parse command line arguments
    await program.parseAsync(process.argv);
    
    // If no command is provided, show help
    if (process.argv.length <= 2) {
      program.help();
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run main function
main().catch(console.error);