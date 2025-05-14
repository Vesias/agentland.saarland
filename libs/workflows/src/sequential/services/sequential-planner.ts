
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
// Define a more specific type for the steps coming from MCP
type McpPlanStep = Partial<Omit<PlanStep, 'description' | 'id' | 'number' | 'status'>> & {
  description: string;
  id?: string; // MCP might provide an ID
  actionType?: ActionType; // MCP should provide this, but make it optional with fallback
  // other fields like estimatedDuration, dependencies, notes are truly optional from MCP
  estimatedDuration?: string;
  dependencies?: string[];
  notes?: string;
  data?: unknown;
};

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

    this.contextClient = context7Client || new ClaudeMcpClient({
      name: MCP_SERVER_CONTEXT7,
      baseUrl: process.env.MCP_CONTEXT7_BASE_URL || 'http://localhost:3031',
      apiKey: process.env.CONTEXT7_API_KEY || process.env.MCP_API_KEY,
    });
    this.uiMagicClient = magicClient || new ClaudeMcpClient({
      name: MCP_SERVER_21ST_MAGIC,
      baseUrl: process.env.MCP_21ST_MAGIC_BASE_URL ||'http://localhost:3032',
      apiKey: process.env.MAGIC_API_KEY || process.env.MCP_API_KEY,
    });
  }

  async generatePlan(goal: string, options: ExecutionOptions = {}): Promise<PlanStep[]> {
    if (!goal || goal.trim() === "") {
      logger.error('Goal is required and cannot be empty for plan generation.');
      throw new Error('Goal is required and cannot be empty');
    }
    
    try {
      const initialThought = `Goal: "${goal}". Generate an initial plan with approximately ${options.initialSteps || 3} high-level steps. Each step should have a clear description, an appropriate actionType (e.g., 'code-analysis', 'documentation-generate', 'cicd-pipeline-setup', 'data-query', 'ui-component-design', 'manual-review', 'context-search'), and any necessary input data. Consider dependencies between steps. Also include estimatedDuration (e.g., "1h", "2d"), notes, and dependencies (array of step numbers it depends on) if applicable.`;
      logger.info('Generating plan using MCP Sequential Thinking', { goal: goal.substring(0, 100), initialThought: initialThought.substring(0,100) });

      const mcpResponse = await this.sequentialThinkingClient.invoke<{ solution?: { plan?: { steps?: McpPlanStep[] } }, error?: string }>(
        MCP_TOOL_SEQUENTIALTHINKING,
        {
          thought: initialThought,
          nextThoughtNeeded: false,
          thoughtNumber: 1,
          totalThoughts: 1,
        }
      );

      if (mcpResponse?.error) {
        logger.error('MCP Sequential Thinking tool returned an error during plan generation', { error: mcpResponse.error, goal });
        throw new Error(`MCP plan generation failed: ${mcpResponse.error}`);
      }
      
      const responseSteps = mcpResponse?.solution?.plan?.steps;

      if (!responseSteps || !Array.isArray(responseSteps) || responseSteps.length === 0) {
        logger.warn('MCP generatePlan (invoke) did not return any valid steps. Generating a fallback plan.', { mcpResponse, goal });
        return this._generateFallbackPlan(goal, options.initialSteps || 3);
      }

      const steps: PlanStep[] = responseSteps.map((step, index) => ({
        id: step.id || uuidv4(),
        number: index + 1, // Ensure sequential numbering based on array order
        description: step.description, // This is guaranteed by McpPlanStep
        actionType: step.actionType || 'manual',
        status: 'pending',
        data: step.data || {},
        estimatedDuration: step.estimatedDuration, // Optional from McpPlanStep
        dependencies: step.dependencies || [],     // Optional from McpPlanStep
        notes: step.notes || `Generated by AI planner for goal: ${goal.substring(0,50)}...` // Optional from McpPlanStep
      }));
      
      logger.info(`Plan generated successfully via MCP for goal "${goal.substring(0,100)}"`, { stepCount: steps.length, firstStep: steps[0]?.description.substring(0,100) });
      return steps;

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorStack = err instanceof Error ? err.stack : undefined;
      logger.error('Error generating plan via MCP invoke', { error: errorMessage, stack: errorStack, goal });
      logger.info('Falling back to local plan generation due to MCP error.');
      return this._generateFallbackPlan(goal, options.initialSteps || 3);
    }
  }

  private _generateFallbackPlan(goal: string, numSteps: number): PlanStep[] {
    logger.info(`Generating fallback plan for goal: ${goal.substring(0,100)} with ${numSteps} steps.`);
    const steps: PlanStep[] = [];
    for (let i = 1; i <= numSteps; i++) {
      // Try to infer a more relevant actionType for the first step based on the goal
      let firstStepActionType: ActionType = 'manual';
      const goalLower = goal.toLowerCase();
      if (goalLower.includes('search') || goalLower.includes('find') || goalLower.includes('lookup')) firstStepActionType = 'context';
      else if (goalLower.includes('ui') || goalLower.includes('interface') || goalLower.includes('design')) firstStepActionType = 'ui';
      else if (goalLower.includes('code') || goalLower.includes('develop') || goalLower.includes('implement')) firstStepActionType = 'code';
      else if (goalLower.includes('doc') || goalLower.includes('readme')) firstStepActionType = 'documentation';
      else if (goalLower.includes('test') || goalLower.includes('build') || goalLower.includes('deploy')) firstStepActionType = 'cicd';
      else if (goalLower.includes('data') || goalLower.includes('analy') || goalLower.includes('report')) firstStepActionType = 'data';


      steps.push({
        id: uuidv4(),
        number: i,
        description: this._getStepDescription(i, i === 1 ? firstStepActionType : 'manual', goal, `Task ${i}`),
        actionType: i === 1 ? firstStepActionType : 'manual',
        status: 'pending',
        data: { goal, fallbackReason: "MCP plan generation failed or returned no steps." }
      });
    }
    return steps;
  }
  
  async continuePlanning(currentPlan: PlanStep[]): Promise<PlanStep[]> {
    if (!currentPlan || currentPlan.length === 0) {
      logger.error('Current plan is required and cannot be empty for continuation.');
      throw new Error('Current plan is required and cannot be empty');
    }
    
    try {
      const lastStep = currentPlan[currentPlan.length - 1];
      const lastStepNumber = lastStep.number;
      const thoughtForContinuation = `The current plan has ${currentPlan.length} steps. The last step (#${lastStep.number}) was "${lastStep.description.substring(0,100)}..." with status "${lastStep.status}". Based on this, generate the next logical 2-3 steps to achieve the overall goal. Ensure new steps have descriptions, actionTypes, and any relevant data. Also include estimatedDuration, notes, and dependencies if applicable.`;
      logger.info('Continuing plan using MCP Sequential Thinking', { currentStepCount: currentPlan.length, lastStepDescription: lastStep.description.substring(0,100), thoughtForContinuation: thoughtForContinuation.substring(0,100) });

      const mcpResponse = await this.sequentialThinkingClient.invoke<{ solution?: { plan?: { newSteps?: McpPlanStep[] } }, error?: string }>(
        MCP_TOOL_SEQUENTIALTHINKING,
        {
          thought: thoughtForContinuation,
          nextThoughtNeeded: false,
          thoughtNumber: lastStepNumber + 1,
          totalThoughts: lastStepNumber + 3,
        }
      );

      if (mcpResponse?.error) {
        logger.error('MCP Sequential Thinking tool returned an error during plan continuation', { error: mcpResponse.error });
        throw new Error(`MCP plan continuation failed: ${mcpResponse.error}`);
      }
      
      const responseNewSteps = mcpResponse?.solution?.plan?.newSteps;

      if (!responseNewSteps || !Array.isArray(responseNewSteps) || responseNewSteps.length === 0) {
        logger.warn('MCP continuePlanning (invoke) did not return new steps. Generating fallback continuation.', { mcpResponse });
        return this._generateFallbackContinuation(currentPlan);
      }

      const newSteps: PlanStep[] = responseNewSteps.map((step, index) => ({
        id: step.id || uuidv4(),
        number: lastStepNumber + 1 + index,
        description: step.description,
        actionType: step.actionType || 'manual',
        status: 'pending',
        data: step.data || {},
        estimatedDuration: step.estimatedDuration,
        dependencies: step.dependencies || [],
        notes: step.notes || `Generated by AI planner during continuation.`
      }));
      
      logger.info('Plan continued successfully via MCP', { newStepCount: newSteps.length, firstNewStep: newSteps[0]?.description.substring(0,100) });
      return newSteps;

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorStack = err instanceof Error ? err.stack : undefined;
      logger.error('Error continuing plan via MCP invoke', { error: errorMessage, stack: errorStack });
      logger.info('Falling back to local plan continuation due to MCP error.');
      return this._generateFallbackContinuation(currentPlan);
    }
  }

  private _generateFallbackContinuation(currentPlan: PlanStep[]): PlanStep[] {
    logger.info(`Generating fallback continuation for plan with ${currentPlan.length} steps.`);
    const newSteps: PlanStep[] = [];
    const startNumber = currentPlan.length + 1;
    const lastStep = currentPlan[currentPlan.length - 1];
    const goalFromLastStep = lastStep?.data?.goal || lastStep?.description || 'continued plan';

    for (let i = 0; i < 2; i++) {
      const stepNumber = startNumber + i;
      // Try to make the continuation step description slightly more relevant
      const keywords = `following up on "${lastStep.description.substring(0, 30)}..."`;
      newSteps.push({
        id: uuidv4(),
        number: stepNumber,
        description: this._getStepDescription(stepNumber, 'manual', goalFromLastStep, `Continuation Task ${i+1}`, keywords),
        actionType: 'manual', // Continuation steps are often manual reviews or adjustments
        status: 'pending',
        data: { originalPlanLength: currentPlan.length, fallbackReason: "MCP plan continuation failed or returned no new steps." }
      });
    }
    return newSteps;
  }
  
  async executeContextStep(searchTerm: string, libraryNameToResolve?: string): Promise<ExecutionResult> {
    if (!searchTerm || searchTerm.trim() === "") {
      logger.error('Search term is required and cannot be empty for context step.');
      throw new Error('Search term is required and cannot be empty');
    }
    
    try {
      logger.info('Executing context step via MCP Context7', { searchTerm: searchTerm.substring(0,100), libraryNameToResolve });
      
      let contextData: unknown = `No specific context found for "${searchTerm}".`;
      let sources: string[] = [];
      let success = false;
      let stepSummary = "";

      if (libraryNameToResolve) {
        logger.debug(`Attempting to resolve library ID for "${libraryNameToResolve}"`);
        const resolveResponse = await this.contextClient.invoke<{ results?: Array<{ id: string, name: string, description?: string, score?: number }>, error?: string }>(
            MCP_TOOL_RESOLVE_LIBRARY_ID,
            { libraryName: libraryNameToResolve }
        );

        if (resolveResponse?.error || !resolveResponse?.results || resolveResponse.results.length === 0) {
          const errorMsg = `Could not resolve library ID for "${libraryNameToResolve}". MCP Error: ${resolveResponse?.error || 'No results returned.'}`;
          logger.warn(errorMsg, { resolveResponse });
          contextData = errorMsg;
          stepSummary = `Library ID resolution failed for ${libraryNameToResolve}.`;
        } else {
          const bestMatch = resolveResponse.results.sort((a,b) => (b.score || 0) - (a.score || 0))[0];
          const libraryId = bestMatch.id;
          logger.info(`Resolved library "${libraryNameToResolve}" to ID: ${libraryId} (Matched: ${bestMatch.name})`);
          
          const docsResponse = await this.contextClient.invoke<{ documentation?: string, sources?: string[], error?: string }>(
            MCP_TOOL_GET_LIBRARY_DOCS,
            { context7CompatibleLibraryID: libraryId, topic: searchTerm, tokens: 7000 }
          );

          if (docsResponse?.error || !docsResponse?.documentation) {
            const errorMsg = `Failed to get documentation for topic "${searchTerm}" in library "${libraryId}". MCP Error: ${docsResponse?.error || 'No documentation returned.'}`;
            logger.warn(errorMsg, { docsResponse });
            contextData = errorMsg;
            stepSummary = `Documentation retrieval failed for ${searchTerm} in ${libraryId}.`;
          } else {
            contextData = docsResponse.documentation;
            sources = docsResponse.sources || [];
            success = true;
            stepSummary = `Successfully retrieved documentation for "${searchTerm}" in "${libraryId}". ${sources.length} sources.`;
            logger.info(stepSummary);
          }
        }
      } else {
        stepSummary = `Context search for "${searchTerm}" requires a library name. No library specified.`;
        logger.info(stepSummary);
        contextData = stepSummary;
        success = false;
      }

      return {
        type: 'context',
        success,
        data: { searchTerm, libraryResolved: libraryNameToResolve, context: contextData, sources },
        summary: stepSummary,
        error: success ? undefined : String(contextData)
      };

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorStack = err instanceof Error ? err.stack : undefined;
      logger.error('Unexpected error executing context step', { error: errorMessage, stack: errorStack, searchTerm, libraryNameToResolve });
      return {
        type: 'context',
        success: false,
        error: `Unexpected error during context search for "${searchTerm}": ${err instanceof Error ? err.message : String(err)}`,
        summary: `Context search for "${searchTerm}" failed due to an unexpected error.`,
        data: { searchTerm, libraryNameToResolve, error: err instanceof Error ? err.message : String(err) }
      };
    }
  }
  
  async executeUIStep(componentSpec: { message: string, searchQuery: string, context?: string }, currentFilePath: string, projectRootDir: string): Promise<ExecutionResult> {
    if (!componentSpec || !componentSpec.message || !componentSpec.searchQuery) {
      logger.error('Component specification (message and searchQuery) is required for UI step');
      throw new Error('Component specification (message and searchQuery) is required for UI step');
    }
     if (!currentFilePath || !projectRootDir) {
      logger.error('Current file path and project root directory are required for UI step context.');
      throw new Error('Current file path and project root directory are required for UI step context.');
    }
    
    try {
      const uiContext = componentSpec.context || `User requests a UI component for: "${componentSpec.searchQuery}". Full request: "${componentSpec.message.substring(0,150)}...". Generate a React component.`;
      logger.info('Executing UI step via MCP 21st Magic', { searchQuery: componentSpec.searchQuery.substring(0,100), uiContext: uiContext.substring(0,100) });

      const mcpResponse = await this.uiMagicClient.invoke<{ code?: string, componentName?: string, error?: string, instructions?: string }>(
        MCP_TOOL_MAGIC_COMPONENT_BUILDER,
        {
          message: componentSpec.message,
          searchQuery: componentSpec.searchQuery,
          absolutePathToCurrentFile: currentFilePath,
          absolutePathToProjectDirectory: projectRootDir,
          context: uiContext
        }
      );

      if (mcpResponse?.error || !mcpResponse?.code) {
        const errorMsg = `MCP UI generation failed for "${componentSpec.searchQuery}". Error: ${mcpResponse?.error || 'No code returned from MCP tool.'}`;
        logger.error(errorMsg, { mcpResponse, componentSpec });
        return {
          type: 'ui',
          success: false,
          error: errorMsg,
          summary: `UI component generation for "${componentSpec.searchQuery}" failed.`,
          data: { componentSpec, error: errorMsg, mcpDetails: mcpResponse }
        };
      }
      
      const componentCode = mcpResponse.code;
      const componentName = (typeof mcpResponse.componentName === 'string' && mcpResponse.componentName.trim() !== '')
                            ? mcpResponse.componentName.trim()
                            : `Generated_${componentSpec.searchQuery.replace(/\W+/g, '_') || 'Component'}`;
      
      const summary = `Successfully generated UI component "${componentName}" for query "${componentSpec.searchQuery}" via MCP.`;
      logger.info('UI step executed successfully via MCP', { componentName, summary });
      return {
        type: 'ui',
        success: true,
        data: { componentSpec, code: componentCode, name: componentName, instructions: mcpResponse.instructions },
        summary
      };

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorStack = err instanceof Error ? err.stack : undefined;
      logger.error('Unexpected error executing UI step via MCP', { error: errorMessage, stack: errorStack, componentSpec });
      return {
        type: 'ui',
        success: false,
        error: `Unexpected error generating UI component for "${componentSpec.searchQuery}": ${err instanceof Error ? err.message : String(err)}`,
        summary: `UI component generation for "${componentSpec.searchQuery}" failed due to an unexpected error.`,
        data: { componentSpec, error: err instanceof Error ? err.message : String(err) }
      };
    }
  }
  
  async generateSummary(executedSteps: PlanStep[]): Promise<string> {
    if (!executedSteps || executedSteps.length === 0) {
      return "No steps have been executed yet to summarize.";
    }
    
    try {
      const thoughtForSummary = `The following plan steps have been executed: ${JSON.stringify(executedSteps.map(s => ({ number: s.number, description: s.description.substring(0,100), status: s.status, resultSummary: s.result?.summary?.substring(0,100) })))}. Provide a concise overall summary of what was accomplished, the final status, and any key outcomes or errors.`;
      logger.info('Generating summary using MCP Sequential Thinking', { stepCount: executedSteps.length, thoughtForSummary: thoughtForSummary.substring(0,150) });
      
      const mcpResponse = await this.sequentialThinkingClient.invoke<{ solution?: { summaryText?: string }, error?: string }>(
         MCP_TOOL_SEQUENTIALTHINKING,
         {
           thought: thoughtForSummary,
           nextThoughtNeeded: false,
           thoughtNumber: 1,
           totalThoughts: 1,
         }
      );

      if (mcpResponse?.error || !mcpResponse?.solution?.summaryText) {
        const errorMsg = `MCP generateSummary failed or did not return a summary. Error: ${mcpResponse?.error || 'No summary text in response.'}`;
        logger.warn(errorMsg, { mcpResponse });
        return this._generateFallbackSummary(executedSteps);
      }
      
      const summaryText = mcpResponse.solution.summaryText;
      logger.info('Summary generated successfully via MCP', { summaryLength: summaryText.length });
      return summaryText;

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorStack = err instanceof Error ? err.stack : undefined;
      logger.error('Unexpected error generating summary via MCP', { error: errorMessage, stack: errorStack });
      logger.info('Falling back to local summary generation due to unexpected MCP error.');
      return this._generateFallbackSummary(executedSteps);
    }
  }

  private _generateFallbackSummary(executedSteps: PlanStep[]): string {
    logger.info(`Generating fallback summary for ${executedSteps.length} executed steps.`);
    if (!executedSteps || executedSteps.length === 0) {
        return "No steps were executed, so no summary can be generated.";
    }
    const totalSteps = executedSteps.length;
    const completedSteps = executedSteps.filter(s => s.status === 'completed').length;
    const failedSteps = executedSteps.filter(s => s.status === 'failed').length;
    const skippedSteps = executedSteps.filter(s => s.status === 'skipped').length;

    let summary = `Fallback Summary: ${totalSteps} step(s) processed.\n`;
    summary += `- ${completedSteps} completed successfully.\n`;
    if (failedSteps > 0) summary += `- ${failedSteps} failed.\n`;
    if (skippedSteps > 0) summary += `- ${skippedSteps} skipped.\n`;
    
    summary += "\nKey Step Details:\n";
    executedSteps.forEach(step => {
      summary += `  Step ${step.number}: "${step.description.substring(0, 70)}..." - Status: ${step.status}\n`;
      if (step.result?.summary) {
        summary += `    Outcome: ${step.result.summary.substring(0, 100)}...\n`;
      }
      if (step.result?.error) {
        summary += `    Error: ${step.result.error.substring(0, 100)}...\n`;
      }
    });
    return summary;
  }
  
  private _getStepDescription(stepNumber: number, actionType: ActionType, goal: string, taskName: string = `Task ${stepNumber}`, keywords?: string): string {
    const goalSnippet = goal.substring(0, 50) + (goal.length > 50 ? "..." : "");
    let baseDescription = "";

    switch (actionType) {
      case 'context':
        baseDescription = `Research and gather information about "${keywords || goalSnippet}".`;
        break;
      case 'ui':
        baseDescription = `Design and mock up a UI component related to "${keywords || goalSnippet}".`;
        break;
      case 'code':
        baseDescription = `Develop or modify code for "${keywords || goalSnippet}". Consider existing modules.`;
        break;
      case 'documentation':
        baseDescription = `Write or update documentation for "${keywords || goalSnippet}".`;
        break;
      case 'cicd':
        baseDescription = `Set up or run CI/CD pipeline tasks for "${keywords || goalSnippet}". This could involve testing, building, or deploying.`;
        break;
      case 'data':
        baseDescription = `Process, analyze, or report on data related to "${keywords || goalSnippet}".`;
        break;
      case 'manual':
      default:
        baseDescription = `Perform a manual review or task for "${keywords || goalSnippet}". This may involve planning next steps or verifying previous work.`;
        break;
    }
    return `Fallback Step ${stepNumber} (${taskName}): ${baseDescription}`;
  }
}

// Export singleton instance
// To allow for McpClient injection for testing, we might not want a direct singleton export here.
// Instead, the consuming module can create an instance.
// For now, maintaining the singleton pattern for consistency with original code.
export const sequentialPlanner = new SequentialPlanner();