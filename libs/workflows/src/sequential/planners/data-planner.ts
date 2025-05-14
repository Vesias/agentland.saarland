import { Plan, PlanStep } from "../types";
import { BasePlanner } from './base-planner';
import configManager from '../../../../core/src/config/config-manager';
import { Logger } from '../../../../core/src/logging/logger';

/**
 * Data-specific planning implementation.
 * Specialized in planning data processing, analysis and transformation tasks.
 */
export class DataPlanner extends BasePlanner {
  private logger: Logger;

  constructor() {
    super('data');
    this.logger = new Logger('DataPlanner');
  }

  private _getWorkflowType(params: Record<string, any>, dataConfig: any): string {
    return params.workflowType || dataConfig.defaultWorkflowType || 'processing';
  }

  private _addDefaultDataSteps(steps: PlanStep[], params: Record<string, any>, dataConfig: any): void {
    steps.push(
      {
        id: 'collect',
        number: steps.length + 1,
        name: 'Collect data',
        description: 'Gather data from specified sources',
        actionType: 'extract',
        status: 'pending',
        data: {
          sources: params.sources || dataConfig.defaultSources || ['local'],
          formats: params.formats || dataConfig.formats || ['json', 'csv']
        }
      },
      {
        id: 'validate',
        number: steps.length + 2,
        name: 'Validate data',
        description: 'Ensure data quality and integrity',
        actionType: 'code_analysis',
        status: 'pending',
        dependsOn: ['collect'],
        data: {
          validateSchema: params.validateSchema !== false,
          checkCompleteness: params.checkCompleteness !== false,
          checkConsistency: params.checkConsistency !== false
        }
      },
      {
        id: 'transform',
        number: steps.length + 3,
        name: 'Transform data',
        description: 'Process and transform the data',
        actionType: 'transform',
        status: 'pending',
        dependsOn: ['validate'],
        data: {
          transformations: params.transformations || dataConfig.defaultTransformations || ['normalize', 'filter'],
          inPlace: params.inPlace || false
        }
      }
    );
  }

  private _addAnalysisSteps(steps: PlanStep[], workflowType: string, params: Record<string, any>, dataConfig: any): void {
    if (workflowType === 'analysis' || workflowType === 'complete') {
      steps.push(
        {
          id: 'analyze',
          number: steps.length + 1,
          name: 'Analyze data',
          description: 'Perform data analysis',
          actionType: 'code_analysis',
          status: 'pending',
          dependsOn: ['transform'],
          data: {
            analysisTypes: params.analysisTypes || dataConfig.analysisTypes || ['statistical', 'exploratory'],
            generateReports: params.generateReports !== false
          }
        },
        {
          id: 'visualize',
          number: steps.length + 2,
          name: 'Visualize results',
          description: 'Create visualizations of analysis results',
          actionType: 'manual',
          status: 'pending',
          dependsOn: ['analyze'],
          data: {
            visualizationTypes: params.visualizationTypes || dataConfig.visualizationTypes || ['charts', 'graphs'],
            interactive: params.interactive !== false
          }
        }
      );
    }
  }

  private _addStoreStep(steps: PlanStep[], workflowType: string, params: Record<string, any>, dataConfig: any): void {
    steps.push({
      id: 'store',
      number: steps.length + 1,
      name: 'Store processed data',
      description: 'Save the processed data to the target location',
      actionType: 'load',
      status: 'pending',
      dependsOn: workflowType === 'analysis' || workflowType === 'complete' ? ['visualize'] : ['transform'],
      data: {
        destination: params.destination || dataConfig.defaultDestination || './data/processed',
        format: params.outputFormat || dataConfig.outputFormat || 'json',
        compression: params.compression || dataConfig.compression || 'none'
      }
    });
  }

  /**
   * Creates a data processing plan based on input parameters
   *
   * @param params Planning parameters specific to data processing
   * @returns A complete data processing plan
   */
  async createPlan(params: Record<string, any>): Promise<Plan> {
    this.logger.debug('Creating data processing plan', { params });

    const config = configManager.getConfig('global' as any); // Adjust if a specific 'data' config type exists
    const dataConfig = (config as any).data || {};
    const steps: PlanStep[] = [];

    const workflowType = this._getWorkflowType(params, dataConfig);
    this._addDefaultDataSteps(steps, params, dataConfig);
    this._addAnalysisSteps(steps, workflowType, params, dataConfig);
    this._addStoreStep(steps, workflowType, params, dataConfig);

    return {
      id: `data-plan-${Date.now()}`,
      name: params.name || `Data ${workflowType} Plan`,
      description: params.description || `Plan for ${workflowType} data workflow`,
      domain: this.domain,
      steps,
      createdAt: new Date(),
      status: 'created'
    };
  }
}