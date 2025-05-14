import { Plan, PlanStep } from "../types";
import { BasePlanner } from './base-planner';
import configManager from '../../../../core/src/config/config-manager';
import { Logger } from '../../../../core/src/logging/logger';

/**
 * Documentation-specific planning implementation.
 * Specialized in planning documentation generation tasks.
 */
export class DocumentationPlanner extends BasePlanner {
  private logger: Logger;

  constructor() {
    super('documentation');
    this.logger = new Logger('DocumentationPlanner');
  }

  private _addDefaultDocumentationSteps(steps: PlanStep[], params: Record<string, any>, docConfig: any): void {
    steps.push(
      {
        id: 'analyze',
        number: steps.length + 1,
        name: 'Analyze codebase structure',
        description: 'Scan codebase to identify components requiring documentation',
        actionType: 'code_analysis',
        status: 'pending',
        data: {
          patterns: params.patterns || docConfig.defaultPatterns || ['**/*.ts', '**/*.js'],
          excludePatterns: params.excludePatterns || docConfig.excludePatterns || ['**/node_modules/**']
        }
      },
      {
        id: 'extract',
        number: steps.length + 2,
        name: 'Extract documentation from code',
        description: 'Parse JSDoc, TSDoc and other documentation comments',
        actionType: 'extract',
        status: 'pending',
        dependsOn: ['analyze'],
        data: {
          extractComments: true,
          extractTypes: true,
          extractExamples: params.extractExamples !== false
        }
      },
      {
        id: 'generate',
        number: steps.length + 3,
        name: 'Generate documentation',
        description: 'Create documentation files based on extracted information',
        actionType: 'documentation',
        status: 'pending',
        dependsOn: ['extract'],
        data: {
          format: params.format || docConfig.defaultFormat || 'markdown',
          outputDir: params.outputDir || docConfig.outputDir || './docs',
          templates: params.templates || docConfig.templates
        }
      },
      {
        id: 'validate',
        number: steps.length + 4,
        name: 'Validate documentation',
        description: 'Check for completeness and correctness of generated docs',
        actionType: 'test',
        status: 'pending',
        dependsOn: ['generate'],
        data: {
          validateLinks: true,
          validateExamples: params.validateExamples !== false,
          validateCoverage: params.validateCoverage !== false
        }
      }
    );
  }

  private _addApiDocsStep(steps: PlanStep[], params: Record<string, any>, docConfig: any): void {
    if (params.includeApi || docConfig.includeApi) {
      steps.push({
        id: 'api-docs',
        number: steps.length + 1,
        name: 'Generate API documentation',
        description: 'Create API reference documentation',
        actionType: 'documentation',
        status: 'pending',
        dependsOn: ['extract'], // Should this depend on 'generate' instead or run in parallel?
        data: {
          format: params.apiFormat || docConfig.apiFormat || 'html',
          outputDir: params.apiOutputDir || docConfig.apiOutputDir || './docs/api'
        }
      });
    }
  }

  /**
   * Creates a documentation generation plan based on input parameters
   *
   * @param params Planning parameters specific to documentation
   * @returns A complete documentation generation plan
   */
  async createPlan(params: Record<string, any>): Promise<Plan> {
    this.logger.debug('Creating documentation plan', { params });

    const config = configManager.getConfig('global' as any); // Adjust if a specific 'documentation' config type exists
    const docConfig = (config as any).documentation || {};
    const steps: PlanStep[] = [];

    this._addDefaultDocumentationSteps(steps, params, docConfig);
    this._addApiDocsStep(steps, params, docConfig);

    return {
      id: `doc-plan-${Date.now()}`,
      name: params.name || 'Documentation Generation Plan',
      description: params.description || 'Plan for generating project documentation',
      domain: this.domain,
      steps,
      createdAt: new Date(),
      status: 'created'
    };
  }
}