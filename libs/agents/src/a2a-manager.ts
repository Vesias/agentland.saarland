#!/usr/bin/env node

/**
 * A2A Manager
 * ===========
 * 
 * Manages agent-to-agent communication in the Claude Neural Framework.
 * Routes messages between agents, validates message format,
 * and handles agent discovery.
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';
import { Command } from 'commander';

// Agent modules
// @ts-ignore
import * as gitAgent from '../mcp/src/services/git_agent';

// Agent registry
const AGENT_REGISTRY = {
  'git-agent': gitAgent.handleA2AMessage
};

/**
 * A2A Manager class
 */
class A2AManager {
  private conversations: Map<string, Array<{ timestamp: Date; message: any }>>;

  constructor() {
    this.conversations = new Map<string, Array<{ timestamp: Date; message: any }>>();
  }

  /**
   * Register an agent with the manager
   * @param {String} agentId - Agent identifier
   * @param {Function} handler - A2A message handler function
   */
  registerAgent(agentId, handler) {
    AGENT_REGISTRY[agentId] = handler;
  }

  private _prepareMessage(message: any): any {
    this.validateMessage(message);
    if (!message.conversationId) {
      message.conversationId = uuidv4();
    }
    this.storeMessage(message);
    return message;
  }

  private _handleAgentNotFound(message: any, targetAgent: string): any {
    const notFoundResponse = {
      to: message.from,
      from: 'a2a-manager',
      conversationId: message.conversationId,
      task: 'error',
      params: {
        status: 'error',
        error: `Agent not found: ${targetAgent}`,
        code: 404
      }
    };
    this.storeMessage(notFoundResponse);
    return notFoundResponse;
  }

  private async _routeMessageToAgent(message: any, targetAgent: string): Promise<any> {
    const response = await AGENT_REGISTRY[targetAgent](message);
    if (!response || !response.to || !response.from) {
      throw new Error('Invalid response from agent');
    }
    this.storeMessage(response);
    return response;
  }

  private _handleAgentError(message: any, targetAgent: string, error: Error): any {
    const errorResponse = {
      to: message.from,
      from: targetAgent,
      conversationId: message.conversationId,
      task: 'error',
      params: {
        status: 'error',
        error: error.message,
        code: 500
      }
    };
    this.storeMessage(errorResponse);
    return errorResponse;
  }

  private _handleManagerError(message: any, error: Error): any {
    return {
      to: message.from || 'unknown',
      from: 'a2a-manager',
      conversationId: message.conversationId || uuidv4(), // Ensure conversationId is present
      task: 'error',
      params: {
        status: 'error',
        error: `A2A manager error: ${error.message}`,
        code: 500
      }
    };
  }

  /**
   * Send a message to an agent
   * @param {Object} message - A2A message to send
   * @returns {Promise<Object>} - Agent response
   */
  async sendMessage(message: any): Promise<any> {
    let preparedMessage;
    try {
      preparedMessage = this._prepareMessage(message);
      const targetAgent = preparedMessage.to;

      if (!AGENT_REGISTRY[targetAgent]) {
        return this._handleAgentNotFound(preparedMessage, targetAgent);
      }

      try {
        return await this._routeMessageToAgent(preparedMessage, targetAgent);
      } catch (agentError: any) {
        return this._handleAgentError(preparedMessage, targetAgent, agentError);
      }
    } catch (managerError: any) {
      // Ensure message is defined for _handleManagerError, even if _prepareMessage failed early
      const msgForErrorHandler = preparedMessage || message || {};
      return this._handleManagerError(msgForErrorHandler, managerError);
    }
  }

  /**
   * Validate a message format
   * @param {Object} message - A2A message to validate
   * @throws {Error} - If message is invalid
   */
  validateMessage(message) {
    // Required fields
    if (!message.to) {
      throw new Error('Missing required field: to');
    }
    
    if (!message.task) {
      throw new Error('Missing required field: task');
    }
    
    // Check params
    if (!message.params) {
      message.params = {};
    }
    
    // Add default from if not present
    if (!message.from) {
      message.from = 'user-agent';
    }
  }

  /**
   * Store a message in the conversation history
   * @param {Object} message - A2A message to store
   */
  storeMessage(message) {
    const { conversationId } = message;
    
    if (!this.conversations.has(conversationId)) {
      this.conversations.set(conversationId, []);
    }
    
    this.conversations.get(conversationId)!.push({
      timestamp: new Date(),
      message
    });
  }

  /**
   * Get conversation history
   * @param {String} conversationId - Conversation identifier
   * @returns {Array} - Conversation history
   */
  getConversation(conversationId) {
    return this.conversations.get(conversationId) || [];
  }

  /**
   * List available agents
   * @returns {Array} - List of available agent IDs
   */
  listAgents() {
    return Object.keys(AGENT_REGISTRY);
  }
}

// Singleton instance
const a2aManager = new A2AManager();

/**
 * Process A2A request from command line
 */
interface CliOptions {
  to?: string;
  task?: string;
  from: string;
  params: string;
  conversationId?: string;
  listAgents?: boolean;
  [key: string]: any;
}

function _parseCliOptions(): { options: CliOptions, program: Command } {
  const program = new Command();
  program
    .version('1.0.0')
    .description('A2A Manager CLI - Manages agent-to-agent communication.')
    .option('--to <agent-id>', 'Target agent identifier (required)')
    .option('--task <task>', 'Task or action to perform (required)')
    .option('--from <agent-id>', 'Source agent identifier', 'user-agent')
    .option('--params <json-string>', 'JSON string containing parameters', '{}')
    .option('--conversationId <id>', 'Conversation identifier for related messages')
    .option('--list-agents', 'List available agents');
  program.parse(process.argv);
  return { options: program.opts() as CliOptions, program };
}

function _handleListAgentsOption(options: CliOptions, manager: A2AManager): boolean {
  if (options.listAgents) {
    console.log('Available agents:');
    const agents = manager.listAgents();
    agents.forEach(agent => {
      console.log(`  - ${agent}`);
    });
    return true;
  }
  return false;
}

function _validateRequiredCliOptions(options: CliOptions, program: Command): boolean {
  if (!options.to || !options.task) {
    console.error(chalk.red('Error: --to and --task are required options.'));
    program.help();
    return true; // Indicates validation failed, stop execution
  }
  return false; // Indicates validation passed
}

function _buildMessageFromCliOptions(options: CliOptions): any {
  const message: {
    to?: string;
    task?: string;
    from: string;
    params: any;
    conversationId?: string;
  } = {
    from: options.from,
    params: {},
  };

  if (options.to) message.to = options.to;
  if (options.task) message.task = options.task;
  if (options.conversationId) message.conversationId = options.conversationId;

  try {
    message.params = JSON.parse(options.params);
  } catch (error: any) {
    console.error(chalk.red('Error parsing params JSON:'), error.message);
    process.exit(1);
  }
  return message;
}

async function _sendAndPrintResponse(manager: A2AManager, message: any): Promise<void> {
  try {
    const response = await manager.sendMessage(message);

    console.log('--- A2A Response ---');
    console.log(`From: ${response.from}`);
    console.log(`Task: ${response.task}`);
    console.log(`Status: ${response.params?.status || '-'}`);

    if (response.params?.output) {
      console.log('');
      console.log(response.params.output);
    }

    // In the original code, response.error was checked.
    // The refactored sendMessage now wraps agent errors and manager errors
    // into a consistent error structure within response.params.error.
    if (response.task === 'error' && response.params?.error) {
      console.error(chalk.red(`Error: ${response.params.error}`));
      // Determine exit code based on error code if available, otherwise default to 1
      const exitCode = typeof response.params.code === 'number' && response.params.code >= 400 ? 1 : 0;
      if (exitCode !== 0) process.exit(exitCode); // Exit only on actual errors
    } else if (response.error) { // Fallback for older error format if any
        console.error(chalk.red(`Error: ${response.error}`));
        process.exit(1);
    }

  } catch (error: any) { // Catch errors from sendMessage itself, though it's designed to return error objects
    console.error(chalk.red(`Critical A2A Manager Error: ${error.message}`));
    process.exit(1);
  }
}

async function processFromCommandLine() {
  const { options, program } = _parseCliOptions();

  if (_handleListAgentsOption(options, a2aManager)) {
    return;
  }

  if (_validateRequiredCliOptions(options, program)) {
    return;
  }
  
  const message = _buildMessageFromCliOptions(options);
  await _sendAndPrintResponse(a2aManager, message);
}

// Export A2A manager
export default a2aManager;

// When run directly
const currentFileUrl = import.meta.url;
const entryPointScript = process.argv[1];
const isDirectRun = path.resolve(entryPointScript) === path.resolve(new URL(currentFileUrl).pathname);

if (isDirectRun) {
  processFromCommandLine().catch(console.error);
}