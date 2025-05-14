import { Plan, PlanStep } from "../types";
import { BasePlanner } from './base-planner';
import configManager from '../../../../core/src/config/config-manager';
import { Logger } from '../../../../core/src/logging/logger';

/**
 * CI/CD-specific planning implementation.
 * Specialized in planning continuous integration and deployment tasks.
 */
export class CICDPlanner extends BasePlanner {
  private logger: Logger;

  constructor() {
    super('cicd');
    this.logger = new Logger('CICDPlanner');
  }

  /**
   * Determines the pipeline type based on parameters and configuration.
   * @param params Planning parameters.
   * @param cicdConfig CI/CD specific configuration.
   * @returns The determined pipeline type.
   */
  private _getPipelineType(params: Record<string, unknown>, cicdConfig: Record<string, unknown>): string {
    return params.pipelineType as string || cicdConfig.defaultPipelineType as string || 'standard';
  }

  /**
   * Adds default CI/CD steps (lint, test, build) to the plan.
   * @param steps Array of plan steps to add to.
   * @param params Planning parameters.
   * @param cicdConfig CI/CD specific configuration.
   */
  private _addDefaultSteps(steps: PlanStep[], params: Record<string, unknown>, cicdConfig: Record<string, unknown>): void {
    steps.push(
      {
        id: 'lint',
        number: steps.length + 1,
        name: 'Lint code',
        description: 'Run code linting to ensure code quality',
        actionType: 'code_analysis',
        status: 'pending',
        data: {
          linters: params.linters || cicdConfig.linters || ['eslint'],
          fix: params.autoFix || cicdConfig.autoFix || false
        }
      },
      {
        id: 'test',
        number: steps.length + 2,
        name: 'Run tests',
        description: 'Execute test suite',
        actionType: 'test',
        status: 'pending',
        dependsOn: ['lint'],
        data: {
          testTypes: params.testTypes || cicdConfig.testTypes || ['unit', 'integration'],
          coverage: params.coverage !== false,
          coverageThreshold: params.coverageThreshold || cicdConfig.coverageThreshold || 80
        }
      },
      {
        id: 'build',
        number: steps.length + 3,
        name: 'Build project',
        description: 'Compile and build the project',
        actionType: 'build',
        status: 'pending',
        dependsOn: ['test'],
        data: {
          production: params.production !== false,
          optimize: params.optimize !== false
        }
      }
    );
  }

  /**
   * Adds deployment-related steps to the plan if applicable.
   * @param steps Array of plan steps to add to.
   * @param pipelineType The type of the pipeline.
   * @param params Planning parameters.
   * @param cicdConfig CI/CD specific configuration.
   */
  private _addDeploymentSteps(steps: PlanStep[], pipelineType: string, params: Record<string, unknown>, cicdConfig: Record<string, unknown>): void {
    if (pipelineType === 'deployment' || pipelineType === 'complete') {
      steps.push(
        {
          id: 'deploy',
          number: steps.length + 1,
          name: 'Deploy project',
          description: 'Deploy the built project to target environment',
          actionType: 'deploy',
          status: 'pending',
          dependsOn: ['build'],
          data: {
            environment: params.environment || cicdConfig.defaultEnvironment || 'staging',
            strategy: params.deployStrategy || cicdConfig.deployStrategy || 'standard'
          }
        },
        {
          id: 'verify',
          number: steps.length + 2,
          name: 'Verify deployment',
          description: 'Verify the deployment was successful',
          actionType: 'test',
          status: 'pending',
          dependsOn: ['deploy'],
          data: {
            healthChecks: params.healthChecks !== false,
            smokeTests: params.smokeTests !== false
          }
        }
      );
    }
  }

  /**
   * Adds a notification step to the plan if configured.
   * @param steps Array of plan steps to add to.
   * @param pipelineType The type of the pipeline.
   * @param params Planning parameters.
   * @param cicdConfig CI/CD specific configuration.
   */
  private _addNotificationStep(steps: PlanStep[], pipelineType: string, params: Record<string, unknown>, cicdConfig: Record<string, unknown>): void {
    if (params.notifications || cicdConfig.notifications) { // Assuming notifications is boolean or truthy/falsy
      steps.push({
        id: 'notify',
        number: steps.length + 1,
        name: 'Send notifications',
        description: 'Notify team members about pipeline results',
        actionType: 'manual',
        status: 'pending',
        dependsOn: (pipelineType === 'deployment' || pipelineType === 'complete') ? ['verify'] : ['build'],
        data: {
          channels: params.notificationChannels || cicdConfig.notificationChannels || ['email'],
          onlyOnFailure: params.notifyOnlyOnFailure || cicdConfig.notifyOnlyOnFailure || false
        }
      });
    }
  }

  /**
   * Creates a CI/CD workflow plan based on input parameters
   *
   * @param params Planning parameters specific to CI/CD workflows
   * @returns A complete CI/CD workflow plan
   */
  async createPlan(params: Record<string, any>): Promise<Plan> {
    this.logger.debug('Creating CI/CD plan', { params });

    const config = configManager.getConfig('global' as any); // Using 'global' as a placeholder, adjust if needed for specific cicd config
    const cicdConfig = (config as any).cicd || {};
    const steps: PlanStep[] = [];

    const pipelineType = this._getPipelineType(params, cicdConfig);
    this._addDefaultSteps(steps, params, cicdConfig);
    this._addDeploymentSteps(steps, pipelineType, params, cicdConfig);
    this._addNotificationStep(steps, pipelineType, params, cicdConfig);

    return {
      id: `cicd-plan-${Date.now()}`,
      name: params.name || `CI/CD ${pipelineType} Pipeline`,
      description: params.description || `Plan for ${pipelineType} CI/CD workflow`,
      domain: this.domain,
      steps,
      createdAt: new Date(),
      status: 'created'
    };
  }
}