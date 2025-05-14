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

// Import security middleware
import A2ASecurityMiddleware from './security/a2a-security-middleware';
import A2APriorityManager from './security/a2a-priority-manager';
import { 
  AgentAccessLevel, 
  MessagePriority, 
  SecureA2AMessage,
  A2ASecurityConfig
} from './security/a2a-security.types';

// Import logger
import { Logger } from '../../core/src/logging/logger';

// Agent modules
// @ts-ignore
import * as gitAgent from '../mcp/src/services/git_agent';

// Agent registry
const AGENT_REGISTRY: Record<string, (message: SecureA2AMessage) => Promise<any>> = {
  'git-agent': gitAgent.handleA2AMessage
};

/**
 * A2A Manager class
 */
class A2AManager {
  private conversations: Map<string, Array<{ timestamp: Date; message: SecureA2AMessage | unknown }>>; // message can be SecureA2AMessage or a more generic unknown for flexibility
  private securityMiddleware: A2ASecurityMiddleware;
  private priorityManager: A2APriorityManager;
  private logger: Logger;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor(securityConfig: Partial<A2ASecurityConfig> = {}) {
    this.conversations = new Map<string, Array<{ timestamp: Date; message: SecureA2AMessage | unknown }>>();
    this.securityMiddleware = new A2ASecurityMiddleware(securityConfig);
    this.priorityManager = new A2APriorityManager();
    this.logger = new Logger('a2a-manager');
      
    // Setup system agents with default access
    this.registerSystemAgents();
    
    // Start message processing loop if prioritization is enabled
    if (securityConfig.enablePrioritization !== false) {
      this.startMessageProcessing();
    }
    
    this.logger.info('A2A Manager initialized with security middleware and priority manager');
  }
  
  /**
   * Start message processing loop for prioritized messages
   * @private
   */
  private startMessageProcessing(): void {
    if (this.processingInterval) {
      return;
    }
    
    this.processingInterval = setInterval(() => {
      this.processNextMessageInQueue();
    }, 50); // Process every 50ms
  }
  
  /**
   * Stop message processing loop
   * @private
   */
  private stopMessageProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }
  
  /**
   * Process the next message in the priority queue
   * @private
   */
  private async processNextMessageInQueue(): Promise<void> {
    // Get highest priority message from priority manager
    const message = this.priorityManager.dequeueMessage();
    
    if (!message) {
      return; // No messages in queues
    }
    
    try {
      // Get target agent
      const targetAgent = message.to;
      const handler = AGENT_REGISTRY[targetAgent];
      
      if (!handler) {
        this.logger.warn(`Agent not found: ${targetAgent}`);
        return;
      }
      
      // Process message
      const response = await handler(message);
      if (response) {
        this.storeMessage(response);
      }
    } catch (error) {
      this.logger.error('Error processing queued message', {
        error,
        message
      });
    }
  }

  /**
   * Register an agent with the manager
   * @param {String} agentId - Agent identifier
   * @param {Function} handler - A2A message handler function
   */
  registerAgent(agentId: string, handler: (message: SecureA2AMessage) => Promise<any>): void {
    AGENT_REGISTRY[agentId] = handler;
    this.logger.info(`Agent registered: ${agentId}`);
  }
  
  /**
   * Register agent with API key
   * @param {String} agentId - Agent identifier
   * @param {String} apiKey - API key
   * @param {AgentAccessLevel} accessLevel - Access level
   * @param {String[]} roles - Agent roles
   */
  registerAgentWithApiKey(
    agentId: string, 
    apiKey: string, 
    accessLevel: AgentAccessLevel = AgentAccessLevel.PUBLIC,
    roles: string[] = []
  ): void {
    // Register agent API key with security middleware
    this.securityMiddleware.registerAgentApiKey(agentId, apiKey, accessLevel, roles);
    this.logger.info(`Agent API key registered: ${agentId}`, { accessLevel, roles });
  }

  /**
   * Register system agents with default access levels
   * @private
   */
  private async registerSystemAgents(): Promise<void> {
    // System agents with private access
    const systemAgents = [
      { id: 'a2a-manager', accessLevel: AgentAccessLevel.RESTRICTED, roles: ['system', 'admin'] },
      { id: 'git-agent', accessLevel: AgentAccessLevel.PRIVATE, roles: ['system', 'git'] }
    ];
    
    // Generate API keys and register agents
    for (const agent of systemAgents) {
      try {
        const apiKey = await this.securityMiddleware.registerAgentApiKey(
          agent.id, 
          undefined, // Generate a new key
          agent.accessLevel, 
          agent.roles,
          0 // Never expires
        );
        
        this.logger.info(`Registered system agent: ${agent.id}`, { 
          accessLevel: agent.accessLevel, 
          roles: agent.roles 
        });
      } catch (error) {
        this.logger.error(`Failed to register system agent: ${agent.id}`, { error });
      }
    }
  }

  private _prepareMessage(message: SecureA2AMessage): SecureA2AMessage {
    this.validateMessage(message);
    if (!message.conversationId) {
      message.conversationId = uuidv4();
    }
    this.storeMessage(message);
    return message;
  }

  private _handleAgentNotFound(message: SecureA2AMessage, targetAgent: string): SecureA2AMessage {
    const notFoundResponse: SecureA2AMessage = {
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

  private async _routeMessageToAgent(message: SecureA2AMessage, targetAgent: string): Promise<SecureA2AMessage> {
    // Route message based on priority
    if (message.priority !== undefined && message.priority !== MessagePriority.NORMAL) {
      // Add to priority queue using priority manager
      const enqueued = this.priorityManager.enqueueMessage(message);
      
      if (enqueued) {
        // For high priority messages, we return a confirmation immediately
        if (message.priority >= MessagePriority.HIGH) {
          return {
            to: message.from,
            from: 'a2a-manager',
            conversationId: message.conversationId,
            task: 'confirmation',
            params: {
              status: 'queued',
              priority: message.priority,
              message: 'Message queued for high-priority processing'
            }
          };
        }
      } else {
        this.logger.warn(`Failed to enqueue message with priority ${MessagePriority[message.priority || MessagePriority.NORMAL]}`);
      }
    }
    
    // For normal priority or if priority queuing is disabled, process now
    const response = await AGENT_REGISTRY[targetAgent](message);
    if (!response || !response.to || !response.from) {
      throw new Error('Invalid response from agent');
    }
    this.storeMessage(response);
    return response;
  }

  private _handleAgentError(message: SecureA2AMessage, targetAgent: string, error: Error): SecureA2AMessage {
    const errorResponse: SecureA2AMessage = {
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

  private _handleManagerError(message: SecureA2AMessage | Partial<SecureA2AMessage>, error: Error): SecureA2AMessage {
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
  async sendMessage(message: SecureA2AMessage): Promise<SecureA2AMessage> {
    let preparedMessage: SecureA2AMessage | undefined = undefined;
    try {
      // Pass message through security middleware
      const secureMessage = await this.securityMiddleware.processMessage(message);
      
      // If message was rejected by security middleware
      if (!secureMessage) {
        return {
          to: message.from,
          from: 'a2a-manager',
          conversationId: message.conversationId || uuidv4(),
          task: 'error',
          params: {
            status: 'error',
            error: 'Message rejected by security middleware',
            code: 403
          }
        };
      }
      
      preparedMessage = this._prepareMessage(secureMessage);
      const targetAgent = preparedMessage.to;

      if (!AGENT_REGISTRY[targetAgent]) {
        return this._handleAgentNotFound(preparedMessage, targetAgent);
      }

      try {
        return await this._routeMessageToAgent(preparedMessage, targetAgent);
      } catch (agentError: unknown) {
        const errorToHandle = agentError instanceof Error ? agentError : new Error(String(agentError));
        // preparedMessage will be defined here if the error is from _routeMessageToAgent
        return this._handleAgentError(preparedMessage!, targetAgent, errorToHandle);
      }
    } catch (managerError: unknown) {
      const errorToHandle = managerError instanceof Error ? managerError : new Error(String(managerError));
      // Use original message if preparedMessage is not available (e.g., error in _prepareMessage)
      const msgForErrorHandler = preparedMessage || message;
      return this._handleManagerError(msgForErrorHandler, errorToHandle);
    }
  }

  /**
   * Validate a message format
   * @param {Object} message - A2A message to validate
   * @throws {Error} - If message is invalid
   */
  validateMessage(message: SecureA2AMessage): void {
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
  storeMessage(message: SecureA2AMessage): void {
    const { conversationId } = message;
    
    if (!conversationId) {
      return; // Skip messages without conversation ID
    }
    
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
  getConversation(conversationId: string): Array<{ timestamp: Date; message: SecureA2AMessage | unknown }> {
    return this.conversations.get(conversationId) || [];
  }

  /**
   * List available agents
   * @returns {Array} - List of available agent IDs
   */
  listAgents(): string[] {
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
  priority?: string; // Explicitly define priority as it's used
  [key: string]: unknown; // Keep for other potential CLI options
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
    .option('--priority <level>', 'Message priority (1-5, higher is more important)', '3')
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

function _buildMessageFromCliOptions(options: CliOptions): SecureA2AMessage {
  const message: SecureA2AMessage = {
    to: options.to || '',
    task: options.task || '',
    from: options.from,
    params: {},
  };

  if (options.conversationId) message.conversationId = options.conversationId;
  
  // Add priority if specified
  if (options.priority) {
    const priorityNum = typeof options.priority === 'string' ? parseInt(options.priority, 10) : NaN;
    if (!isNaN(priorityNum) && priorityNum >= 1 && priorityNum <= 5) {
      message.priority = priorityNum as MessagePriority;
    }
  }

  try {
    message.params = JSON.parse(options.params);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(chalk.red('Error parsing params JSON:'), error.message);
    } else {
      console.error(chalk.red('Error parsing params JSON:'), String(error));
    }
    process.exit(1);
  }
  return message;
}

async function _sendAndPrintResponse(manager: A2AManager, message: SecureA2AMessage): Promise<void> {
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

    if (response.task === 'error' && response.params?.error) {
      console.error(chalk.red(`Error: ${response.params.error}`));
      // Determine exit code based on error code if available, otherwise default to 1
      const exitCode = typeof response.params.code === 'number' && response.params.code >= 400 ? 1 : 0;
      if (exitCode !== 0) process.exit(exitCode); // Exit only on actual errors
    }

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(chalk.red(`Critical A2A Manager Error: ${error.message}`));
    } else {
      console.error(chalk.red('Critical A2A Manager Error:'), String(error));
    }
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