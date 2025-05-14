/**
 * Sequential Planner Service
 * 
 * This service provides sequential planning capabilities by integrating with
 * Claude AI models through the MCP protocol. It generates plans, continues plans, 
 * executes context searches, and generates UI components based on step descriptions.
 */

import { PlanStep, ExecutionOptions, ExecutionResult, ActionType } from "../types"; // Corrected path
import { v4 as uuidv4 } from 'uuid';
import { Logger, createLogger as createCoreLogger } from '../../../../core/src/logging/logger'; // Assuming core logger path
import { ClaudeMcpClient, createSequentialThinkingClient } from '../../../../mcp/src/client/claude-mcp-client'; // Corrected import, added factory

const logger: Logger = createCoreLogger('sequential-planner'); // Use core logger

// MCP Server and Tool names (constants for clarity)
const MCP_SERVER_SEQUENTIAL_THINKING = 'server-sequential-thinking'; // Replace with actual server name if different
const MCP_TOOL_SEQUENTIALTHINKING = 'sequentialthinking';

const MCP_SERVER_CONTEXT7 = 'github.com/upstash/context7-mcp'; // Replace with actual server name
const MCP_TOOL_GET_LIBRARY_DOCS = 'get-library-docs'; // For context search
const MCP_TOOL_RESOLVE_LIBRARY_ID = 'resolve-library-id';


const MCP_SERVER_21ST_MAGIC = '@21st-dev/magic'; // Replace with actual server name
const MCP_TOOL_MAGIC_COMPONENT_BUILDER = '21st_magic_component_builder';

/**
 * Sequential Planner class
 */
export class SequentialPlanner {
  private sequentialThinkingClient: ClaudeMcpClient;
  private contextClient: ClaudeMcpClient;
  private uiMagicClient: ClaudeMcpClient;

  constructor(
    seqThinkingClient?: ClaudeMcpClient,
    context7Client?: ClaudeMcpClient,
    magicClient?: ClaudeMcpClient
  ) {
    this.sequentialThinkingClient = seqThinkingClient || createSequentialThinkingClient();

    // Placeholder configurations for other clients. These should be ideally configurable.
    // The baseUrl for these clients needs to point to the actual running MCP server instances.
    this.contextClient = context7Client || new ClaudeMcpClient({
      name: MCP_SERVER_CONTEXT7,
      baseUrl: process.env.MCP_CONTEXT7_BASE_URL || 'http://localhost:3031', // Example placeholder URL
      apiKey: process.env.CONTEXT7_API_KEY || process.env.MCP_API_KEY, // Ensure API key is available if needed
    });
    this.uiMagicClient = magicClient || new ClaudeMcpClient({
      name: MCP_SERVER_21ST_MAGIC,
      baseUrl: process.env.MCP_21ST_MAGIC_BASE_URL ||'http://localhost:3032', // Example placeholder URL
      apiKey: process.env.MAGIC_API_KEY || process.env.MCP_API_KEY, // Ensure API key is available if needed
    });
  }

  /**
   * Generate a plan for a goal
   * @param goal - The goal to plan for
   * @param options - Planning options
   * @returns The generated plan
   */
  async generatePlan(goal: string, options: ExecutionOptions = {}): Promise<PlanStep[]> {
    if (!goal) {
      throw new Error('Goal is required');
    }
    
    try {
      logger.info('Generating plan using MCP', {
        goalPrefix: goal.substring(0, 50),
        options
      });
      
      // Using invoke method of ClaudeMcpClient
      const mcpResponse = await this.sequentialThinkingClient.invoke<{ steps?: any[] }>(
        MCP_TOOL_SEQUENTIALTHINKING, // This is the 'method' parameter for invoke
        { // These are the 'params' for invoke
          thought: `Initial goal: ${goal}. Generate a plan with ${options.initialSteps || 3} steps.`,
          nextThoughtNeeded: false,
          thoughtNumber: 1,
          totalThoughts: 1,
          // Ensure these params match what the sequentialthinking tool expects via /api/invoke
        }
      );
      
      // The actual response structure from invoke will be mcpResponse directly, not mcpResponse.payload
      const responseSteps = mcpResponse?.steps;

      // TODO: Adapt this based on the actual structure of responseSteps from the sequentialthinking tool
      const steps: PlanStep[] = (responseSteps || []).map((step: any, index: number) => ({
        id: uuidv4(),
        number: index + 1,
        description: step.description || `Generated step ${index + 1}`,
        actionType: step.actionType || 'manual',
        status: 'pending',
        data: step.data || {}
      }));
      
      if (steps.length === 0) {
        logger.warn('MCP generatePlan (invoke) did not return any steps. Generating a fallback plan.');
        return this._generateFallbackPlan(goal, options.initialSteps || 3);
      }

      logger.info('Plan generated via MCP invoke', { stepCount: steps.length });
      return steps;

    } catch (err) {
      logger.error('Error generating plan via MCP invoke', { error: (err instanceof Error ? err.message : String(err)) });
      logger.info('Falling back to local plan generation due to MCP error.');
      return this._generateFallbackPlan(goal, options.initialSteps || 3); // Fallback
    }
  }

  private _generateFallbackPlan(goal: string, numSteps: number): PlanStep[] {
    const steps: PlanStep[] = [];
    for (let i = 1; i <= numSteps; i++) {
      let actionType: ActionType = 'manual';
      if (i === 1 && goal.toLowerCase().includes('search')) actionType = 'context';
      if (i === 1 && goal.toLowerCase().includes('ui')) actionType = 'ui';
      steps.push({
        id: uuidv4(),
        number: i,
        description: `Fallback Step ${i}: ${this._getStepDescription(i, actionType, goal)}`,
        actionType,
        status: 'pending'
      });
    }
    return steps;
  }
  
  /**
   * Continue planning with more steps
   * @param currentPlan - The current plan to continue
   * @returns The new steps to add to the plan
   */
  async continuePlanning(currentPlan: PlanStep[]): Promise<PlanStep[]> {
    if (!currentPlan || currentPlan.length === 0) {
      throw new Error('Current plan is required');
    }
    
    try {
      logger.info('Continuing plan using MCP', { currentStepCount: currentPlan.length });
      
      const mcpResponse = await this.sequentialThinkingClient.invoke<{ newSteps?: any[] }>(
        MCP_TOOL_SEQUENTIALTHINKING,
        {
          thought: `Continuing plan. Current steps: ${JSON.stringify(currentPlan.map(s => s.description))}. Generate 2 more steps.`,
          nextThoughtNeeded: false,
          thoughtNumber: currentPlan.length + 1,
          totalThoughts: currentPlan.length + 3,
        }
      );
      
      const responseNewSteps = mcpResponse?.newSteps;

      // TODO: Adapt this based on the actual structure of responseNewSteps
      const newSteps: PlanStep[] = (responseNewSteps || []).map((step: any, index: number) => ({
        id: uuidv4(),
        number: currentPlan.length + 1 + index,
        description: step.description || `Generated continuation step ${index + 1}`,
        actionType: step.actionType || 'manual',
        status: 'pending',
        data: step.data || {}
      }));

      if (newSteps.length === 0) {
        logger.warn('MCP continuePlanning (invoke) did not return new steps. Generating fallback continuation.');
        return this._generateFallbackContinuation(currentPlan);
      }
      
      logger.info('Plan continued via MCP invoke', { newStepCount: newSteps.length });
      return newSteps;

    } catch (err) {
      logger.error('Error continuing plan via MCP invoke', { error: (err instanceof Error ? err.message : String(err)) });
      logger.info('Falling back to local plan continuation due to MCP error.');
      return this._generateFallbackContinuation(currentPlan); // Fallback
    }
  }

  private _generateFallbackContinuation(currentPlan: PlanStep[]): PlanStep[] {
    const newSteps: PlanStep[] = [];
    const startNumber = currentPlan.length + 1;
    for (let i = 0; i < 2; i++) {
      const stepNumber = startNumber + i;
      newSteps.push({
        id: uuidv4(),
        number: stepNumber,
        description: `Fallback Continuation Step ${stepNumber}: Additional ${this._getStepDescription(stepNumber, 'manual', 'continued plan')}`,
        actionType: 'manual',
        status: 'pending'
      });
    }
    return newSteps;
  }
  
  /**
   * Execute a context search step
   * @param searchTerm - The term to search for context (can be a library name or general topic)
   * @returns The execution result
   */
  async executeContextStep(searchTerm: string, libraryNameToResolve?: string): Promise<ExecutionResult> {
    if (!searchTerm) {
      throw new Error('Search term is required for context step');
    }
    
    try {
      logger.info('Executing context step via MCP', { searchTerm, libraryNameToResolve });
      
      let contextData: any = `No specific context found for "${searchTerm}".`;
      let sources: string[] = [];
      let success = false;

      if (libraryNameToResolve) {
        logger.info(`Attempting to resolve library ID for "${libraryNameToResolve}" using client for ${this.contextClient.getConfig().name}`);
        const resolveResponse = await this.contextClient.invoke<{ results: Array<{ id: string, name: string, description: string }> }>(
            MCP_TOOL_RESOLVE_LIBRARY_ID,
            { libraryName: libraryNameToResolve }
        );

        if (resolveResponse?.results && resolveResponse.results.length > 0) {
          const libraryId = resolveResponse.results[0].id;
          logger.info(`Resolved library "${libraryNameToResolve}" to ID: ${libraryId}`);
          
          const docsResponse = await this.contextClient.invoke<{ documentation: string, sources: string[] }>(
            MCP_TOOL_GET_LIBRARY_DOCS,
            { context7CompatibleLibraryID: libraryId, topic: searchTerm }
          );
          contextData = docsResponse?.documentation || `No documentation found for topic "${searchTerm}" in library "${libraryId}".`;
          sources = docsResponse?.sources || [];
          success = true;
        } else {
           logger.warn(`Could not resolve library ID for "${libraryNameToResolve}".`);
           contextData = `Could not resolve library ID for "${libraryNameToResolve}".`;
           success = false;
        }
      } else {
        logger.info('No specific library provided for context search. General search not implemented with current client structure.');
        contextData = `General context search for "${searchTerm}" requires a general search MCP tool and client.`;
        success = true; // Or false if this is considered a failure
      }

      const result: ExecutionResult = {
        type: 'context',
        success,
        data: {
          searchTerm,
          context: contextData,
          sources,
        },
        summary: `Context search for "${searchTerm}" processed. Success: ${success}. ${sources.length} sources considered.`
      };
      
      logger.info('Context step executed via MCP invoke', { resultSummary: result.summary });
      return result;

    } catch (err) {
      logger.error('Error executing context step via MCP invoke', { error: (err instanceof Error ? err.message : String(err)) });
      return {
        type: 'context',
        success: false,
        error: `Failed to execute context search: ${(err instanceof Error ? err.message : String(err))}`,
        summary: `Context search for "${searchTerm}" failed.`,
        data: { searchTerm, error: (err instanceof Error ? err.message : String(err)) }
      };
    }
  }
  
  /**
   * Execute a UI component generation step
   * @param componentSpec - The component specification (user message, search query, etc.)
   * @param currentFilePath - Absolute path to the current file for context
   * @param projectRootDir - Absolute path to the project root
   * @returns The execution result
   */
  async executeUIStep(componentSpec: { message: string, searchQuery: string, context?: string }, currentFilePath: string, projectRootDir: string): Promise<ExecutionResult> {
    if (!componentSpec || !componentSpec.message || !componentSpec.searchQuery) {
      throw new Error('Component specification (message and searchQuery) is required for UI step');
    }
     if (!currentFilePath || !projectRootDir) {
      throw new Error('Current file path and project root directory are required for UI step context.');
    }
    
    try {
      logger.info('Executing UI step via MCP', { searchQuery: componentSpec.searchQuery });

      // Similar to context step, ClaudeMcpClient's `invoke` might be used,
      // but it's not a direct `useTool` equivalent.
      // This requires adaptation.
      // Ensure this.uiMagicClient is configured with the correct baseUrl for MCP_SERVER_21ST_MAGIC
      logger.info(`Attempting UI component generation for "${componentSpec.searchQuery}" using client for ${this.uiMagicClient.getConfig().name}`);
      
      const mcpResponse = await this.uiMagicClient.invoke<{ code?: string, componentName?: string, error?: string }>(
        MCP_TOOL_MAGIC_COMPONENT_BUILDER, // Method name for invoke
        { // Params for invoke
          message: componentSpec.message,
          searchQuery: componentSpec.searchQuery,
          absolutePathToCurrentFile: currentFilePath,
          absolutePathToProjectDirectory: projectRootDir,
          context: componentSpec.context || `Generate a React component based on the query: ${componentSpec.searchQuery}`
        }
      );

      if (mcpResponse?.error || !mcpResponse?.code) {
        const errorMsg = `MCP UI generation failed: ${mcpResponse?.error || 'No code returned'}`;
        logger.error(errorMsg, { mcpResponse });
        return {
          type: 'ui',
          success: false,
          error: errorMsg,
          summary: `UI component generation for "${componentSpec.searchQuery}" failed.`,
          data: { componentSpec, error: errorMsg }
        };
      }
      
      const componentCode = mcpResponse.code;
      const componentName = mcpResponse.componentName || 'GeneratedComponent';
      
      const result: ExecutionResult = {
        type: 'ui',
        success: true,
        data: {
          componentSpec,
          code: componentCode,
          name: componentName
        },
        summary: `Generated UI component "${componentName}" via MCP invoke.`
      };
      
      logger.info('UI step executed via MCP invoke', { componentName });
      return result;

    } catch (err) {
      logger.error('Error executing UI step via MCP invoke', { error: (err instanceof Error ? err.message : String(err)) });
      return {
        type: 'ui',
        success: false,
        error: `Failed to generate UI component: ${(err instanceof Error ? err.message : String(err))}`,
        summary: `UI component generation for "${componentSpec.searchQuery}" failed.`,
        data: { componentSpec, error: (err instanceof Error ? err.message : String(err)) }
      };
    }
  }
  
  /**
   * Generate a summary of executed steps
   * @param executedSteps - The executed steps
   * @returns The summary string
   */
  async generateSummary(executedSteps: PlanStep[]): Promise<string> {
    if (!executedSteps || executedSteps.length === 0) {
      return "No steps have been executed yet.";
    }
    
    try {
      logger.info('Generating summary using MCP', { stepCount: executedSteps.length });

      const mcpResponse = await this.sequentialThinkingClient.invoke<{ summary?: string }>(
         MCP_TOOL_SEQUENTIALTHINKING,
         {
           thought: `Summarize the following executed plan steps: ${JSON.stringify(executedSteps.map(s => ({ num: s.number, desc: s.description, status: s.status})))}`,
           nextThoughtNeeded: false,
           thoughtNumber: 1,
           totalThoughts: 1,
         }
      );

      const summary = mcpResponse?.summary;

      if (!summary) {
        logger.warn('MCP generateSummary (invoke) did not return a summary. Generating fallback summary.');
        return this._generateFallbackSummary(executedSteps);
      }
      
      logger.info('Summary generated via MCP invoke', { summaryLength: summary.length });
      return summary;

    } catch (err) {
      logger.error('Error generating summary via MCP invoke', { error: (err instanceof Error ? err.message : String(err)) });
      logger.info('Falling back to local summary generation due to MCP error.');
      return this._generateFallbackSummary(executedSteps);
    }
  }

  private _generateFallbackSummary(executedSteps: PlanStep[]): string {
    const statusCounts = executedSteps.reduce((counts, step) => {
      counts[step.status] = (counts[step.status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    const typeCounts = executedSteps.reduce((counts, step) => {
      counts[step.actionType] = (counts[step.actionType] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    let summary = `Fallback Summary - Executed ${executedSteps.length} steps:\n`;
    summary += `- Status: ${Object.entries(statusCounts).map(([status, count]) => `${count} ${status}`).join(', ')}\n`;
    summary += `- Types: ${Object.entries(typeCounts).map(([type, count]) => `${count} ${type}`).join(', ')}\n\nSteps:\n`;
    executedSteps.forEach(step => {
      summary += `${step.number}. [${step.status}] ${step.description}\n`;
    });
    return summary;
  }
  
  /**
   * Get a step description based on step number, type, and goal
   * @private
   */
  private _getStepDescription(stepNumber: number, actionType: ActionType, goal: string): string {
    switch (actionType) {
      case 'context':
        return `Search for information about "${goal}" (Step ${stepNumber})`;
      case 'ui':
        return `Generate UI component for "${goal}" (Step ${stepNumber})`;
      default:
        return `Execute task related to "${goal}" (Step ${stepNumber})`;
    }
  }
}

// Export singleton instance
// To allow for McpClient injection for testing, we might not want a direct singleton export here.
// Instead, the consuming module can create an instance.
// For now, maintaining the singleton pattern for consistency with original code.
export const sequentialPlanner = new SequentialPlanner();