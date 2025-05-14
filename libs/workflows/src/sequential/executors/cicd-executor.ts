import { PlanStep, ExecutionResult } from "../types";
import { BaseExecutor } from './base-executor';
import configManager, { ConfigType } from '../../../../core/src/config/config-manager';
import { ClaudeError } from '../../../../core/src/error/error-handler';
import { spawn } from 'child_process';
import fetch from 'node-fetch';
import * as fs from 'fs/promises';
import * as path from 'path';

interface EslintFileResult {
  filePath: string;
  messages: { line?: number; column?: number; severity?: number; message?: string; ruleId?: string }[];
  errorCount: number;
  warningCount: number;
  fixableErrorCount?: number;
  fixableWarningCount?: number;
  source?: string;
}

interface HealthCheckDetail {
  endpoint: string;
  url: string;
  status?: number;
  success: boolean;
  duration?: number;
  error?: string;
}

interface HealthCheckResults {
  passed: number;
  failed: number;
  checked: number;
  details: HealthCheckDetail[];
  message?: string;
  success?: boolean; // Added for clarity, though calculated externally
}

interface SmokeTestResultsData {
  success: boolean;
  message: string;
  rawStdout: string;
  rawStderr: string;
  exitCode: number;
  testsRun: number;
  passed: number;
  failed: number;
  error?: string;
}

/**
 * CI/CD-specific execution implementation.
 * Handles the execution of continuous integration and deployment steps.
 */
export class CICDExecutor extends BaseExecutor {
  constructor() {
    super('cicd');
  }

  /**
   * Executes a CI/CD workflow step
   * 
   * @param step The plan step to execute
   * @param context Execution context with data from previous steps
   * @returns Result of the execution
   */
  async executeStep(step: PlanStep, context: Record<string, unknown>): Promise<ExecutionResult> { // context: Record<string, any> zu Record<string, unknown>
    this.logger.debug(`Executing CI/CD step: ${step.id}`, { step });
    
    try {
      const config = configManager.getConfig(ConfigType.GLOBAL); // Assuming GLOBAL config is needed, adjust if specific one is required.
      
      switch(step.id) {
        case 'lint':
          return await this.lintCode(step, context);
        case 'test':
          return await this.runTests(step, context);
        case 'build':
          return await this.buildProject(step, context);
        case 'deploy':
          return await this.deployProject(step, context);
        case 'verify':
          return await this.verifyDeployment(step, context);
        case 'notify':
          return await this.sendNotifications(step, context);
        default:
          throw new ClaudeError(`Unknown CI/CD step: ${step.id}`);
      }
    } catch (error: unknown) { // error: any zu error: unknown
      this.logger.error(`Error executing CI/CD step ${step.id}`, { error });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        type: step.actionType || step.id,
        success: false,
        stepId: step.id,
        error: errorMessage,
        summary: `Error in step ${step.id}: ${errorMessage}`,
        data: { error }
      };
    }
  }

  /**
   * Lints code to ensure code quality
   */
  private async lintCode(step: PlanStep, context: Record<string, unknown>): Promise<ExecutionResult> { // context: Record<string, any> zu Record<string, unknown>
    this.logger.info('Linting code', { linters: step.data?.linters, fix: step.data?.fix });

    const linter = step.data?.linter || 'eslint'; // Default to eslint
    const fix = step.data?.fix || false;
    const args = ['.', '--format=json'];
    if (fix) {
      args.push('--fix');
    }

    try {
      const process = spawn(linter, args);

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      return new Promise((resolve) => {
        process.on('close', (code) => {
          if (stderr && code !== 0) { // ESLint often outputs to stderr even on success with warnings
            this.logger.warn(`Linter ${linter} stderr:`, { stderr });
          }

          let lintResults: Record<string, unknown> = {};
          let filesWithIssues = 0;
          let errors = 0;
          let warnings = 0;
          let issuesFixed = 0; // This is harder to get accurately without parsing specific linter output

          try {
            const parsedOutput = JSON.parse(stdout);
            // Assuming ESLint JSON format: Array of objects, each with filePath, messages, errorCount, warningCount, fixableErrorCount, fixableWarningCount
            parsedOutput.forEach((fileResultUntyped: Record<string, unknown>) => {
              const fileResult = fileResultUntyped as unknown as EslintFileResult;
              if (fileResult.errorCount > 0 || fileResult.warningCount > 0) {
                filesWithIssues++;
              }
              errors += fileResult.errorCount;
              warnings += fileResult.warningCount;
              // ESLint's output doesn't directly say "issuesFixed" in a simple summary for --fix.
              // It modifies files in place. We might need a more complex way to track this if essential.
              // For now, we'll rely on the error/warning counts after --fix.
            });
            lintResults = {
              totalFiles: parsedOutput.length,
              filesWithIssues,
              issuesBySeverity: { error: errors, warning: warnings, info: 0 }, // Info not typically in ESLint JSON
              issuesFixed: fix ? 'attempted' : 0, // Placeholder, as direct count is complex
              rawOutput: parsedOutput,
            };
          } catch (e: unknown) { // e: any zu e: unknown
            const parseErrorMsg = e instanceof Error ? e.message : 'Unknown JSON parse error';
            this.logger.error('Failed to parse linter output as JSON', { stdout, error: parseErrorMsg });
            // If JSON parsing fails, use the exit code and stderr
            const success = code === 0;
            const message = success ? 'Linting completed (unable to parse JSON output).' : `Linting failed with code ${code}.`;
            resolve({
              type: 'lint',
              success,
              stepId: step.id,
              message,
              summary: message,
              error: success ? undefined : stderr || 'Linter execution failed.',
              data: { rawStdout: stdout, rawStderr: stderr, exitCode: code }
            });
            return;
          }

          const success = code === 0 || (fix && errors === 0); // Success if exit code is 0, or if --fix was used and no errors remain
          const message = success
            ? `Linting completed. Files checked: ${lintResults.totalFiles}. Errors: ${errors}, Warnings: ${warnings}.`
            : `Linting found ${errors} errors and ${warnings} warnings.`;

          resolve({
            type: 'lint',
            success,
            stepId: step.id,
            message,
            summary: message,
            error: !success ? stderr || `${linter} exited with code ${code}` : undefined,
            data: { lintResults, exitCode: code }
          });
        });

        process.on('error', (err) => {
          this.logger.error(`Failed to start linter ${linter}`, { error: err });
          resolve({
            type: 'lint',
            success: false,
            stepId: step.id,
            message: `Failed to start linter ${linter}: ${err.message}`,
            summary: `Failed to start linter ${linter}.`,
            error: err.message,
            data: { error: err }
          });
        });
      });
    } catch (error: unknown) { // error: any zu error: unknown
      this.logger.error('Error during lintCode execution setup', { error });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during lint setup';
      return {
        type: 'lint',
        success: false,
        stepId: step.id,
        error: errorMessage,
        summary: `Error setting up lint step: ${errorMessage}`,
        data: { error }
      };
    }
  }

  /**
   * Runs test suite
   */
  private async runTests(step: PlanStep, context: Record<string, unknown>): Promise<ExecutionResult> { // context: Record<string, any> zu Record<string, unknown>
    this.logger.info('Running tests', { testTypes: step.data?.testTypes, coverage: step.data?.coverage });

    const testCommand = step.data?.testCommand || 'npm'; // Default to npm
    const testArgs = step.data?.testArgs || ['test']; // Default to 'test' for npm
    const coverage = step.data?.coverage || false;
    const jestJsonOutput = step.data?.jestJsonOutput || '--json'; // Specific to Jest, adjust if using other runners

    const finalArgs = [...testArgs];
    if (coverage) {
      finalArgs.push('--coverage');
    }
    // Add Jest's JSON output flag if not already present and if it's likely Jest
    if (testCommand.includes('jest') || (testCommand === 'npm' && testArgs.includes('test'))) {
        if(!finalArgs.find(arg => arg.startsWith('--json'))) {
            finalArgs.push(jestJsonOutput);
            finalArgs.push('--outputFile=test-results.json'); // Direct Jest JSON output to a file
        }
    }


    try {
      const process = spawn(testCommand, finalArgs);
      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      return new Promise((resolve) => {
        process.on('close', async (code) => { // Make this async to read the file
          if (stderr && code !== 0) {
            this.logger.warn(`Test runner ${testCommand} stderr:`, { stderr });
          }

          let testResults: Record<string, unknown> = {};
          let numTotalTests = 0;
          let numPassedTests = 0;
          let numFailedTests = 0;
          let numPendingTests = 0; // Jest calls skipped tests "pending" in some contexts
          let coverageData: Record<string, unknown> | undefined = undefined;

          // Attempt to read and parse Jest's JSON output
          // Note: Jest with --json might print to stdout or a file. Here we assume file.
          // If it prints to stdout, parsing `stdout` directly would be the approach.
          let rawJsonOutput = '';
          try {
            // Check if test-results.json was created
            // fs is now globally imported as import * as fs from 'fs/promises';
            try {
                rawJsonOutput = await fs.readFile('test-results.json', 'utf-8');
                const parsedOutput = JSON.parse(rawJsonOutput);

                numTotalTests = parsedOutput.numTotalTests || 0;
                numPassedTests = parsedOutput.numPassedTests || 0;
                numFailedTests = parsedOutput.numFailedTests || 0;
                numPendingTests = parsedOutput.numPendingTests || 0;

                if (parsedOutput.coverageMap && coverage) {
                    // Simplified coverage summary; real parsing is more complex
                    // This is a placeholder. Actual Jest coverage reporters output detailed HTML/JSON.
                    // For a simple summary, you might need to parse text output or use a specific Jest reporter.
                    coverageData = {
                        // Example: extract global statement coverage if available
                        statements: parsedOutput.coverageMap?.data ? (parsedOutput.coverageMap.getCoverageSummary().statements.pct) : 'N/A',
                        // ... other coverage metrics
                        passesThreshold: true, // This would need to be determined based on configured thresholds
                    };
                }
                testResults = parsedOutput; // Store the full parsed output
            } catch (fileError: unknown) {
                 const fileErrorMsg = fileError instanceof Error ? fileError.message : String(fileError);
                 this.logger.warn('Could not read or parse test-results.json, attempting to parse stdout for Jest JSON', { fileError: fileErrorMsg, stdout });
                 // Fallback to parsing stdout if file read fails
                 if (stdout.trim()) {
                    try {
                        const parsedStdout = JSON.parse(stdout);
                        numTotalTests = parsedStdout.numTotalTests || 0;
                        numPassedTests = parsedStdout.numPassedTests || 0;
                        numFailedTests = parsedStdout.numFailedTests || 0;
                        numPendingTests = parsedStdout.numPendingTests || 0;
                        if (parsedStdout.coverageMap && coverage) {
                             coverageData = {
                                statements: parsedStdout.coverageMap?.data ? (parsedStdout.coverageMap.getCoverageSummary().statements.pct) : 'N/A',
                                passesThreshold: true,
                            };
                        }
                        testResults = parsedStdout;
                    } catch(stdoutParseError: unknown) {
                        const stdoutParseErrorMsg = stdoutParseError instanceof Error ? stdoutParseError.message : String(stdoutParseError);
                        this.logger.error('Failed to parse test runner stdout as JSON', { stdout, error: stdoutParseErrorMsg });
                    }
                 } else {
                    this.logger.info('No test-results.json found and stdout is empty.');
                 }
            }


          } catch (e: unknown) {
            const errorMsg = e instanceof Error ? e.message : String(e);
            this.logger.error('Failed to parse test runner output as JSON', { rawJsonOutput, stdout, error: errorMsg });
            // If JSON parsing fails, rely on exit code and stderr
          }

          // If parsing failed or didn't provide counts, use exit code as primary indicator
          if (numTotalTests === 0 && code !== 0 && !rawJsonOutput && !stdout.trim()) { // Added check for rawJsonOutput and stdout
             const success = code === 0;
             const message = success ? 'Tests completed (unable to parse JSON output).' : `Tests failed with code ${code}.`;
             resolve({
                type: 'test',
                success,
                stepId: step.id,
                message,
                summary: message,
                error: success ? undefined : stderr || 'Test execution failed.',
                data: { rawStdout: stdout, rawStderr: stderr, exitCode: code }
            });
            return;
          }


          const success = code === 0 && numFailedTests === 0; // Exit code 0 and no failed tests
          let message = `${numPassedTests}/${numTotalTests} tests passed.`;
          if (numFailedTests > 0) message += ` ${numFailedTests} failed.`;
          if (numPendingTests > 0) message += ` ${numPendingTests} skipped.`;
          if (coverage && coverageData) {
            message += ` Coverage: ${coverageData.statements}%.`;
            if (coverageData.passesThreshold === false) { // Explicitly check for false
              message += ' Coverage threshold not met.';
            }
          }
          if (!success && !message.includes('failed')) {
              message = `Tests failed (exit code ${code}). ` + message;
          }


          resolve({
            type: 'test',
            success,
            stepId: step.id,
            message,
            summary: message,
            error: !success ? stderr || `${testCommand} exited with code ${code}` : undefined,
            data: { testResults, coverageData, exitCode: code, rawStdout: stdout, rawStderr: stderr },
          });
        });

        process.on('error', (err) => {
          this.logger.error(`Failed to start test runner ${testCommand}`, { error: err });
          resolve({
            type: 'test',
            success: false,
            stepId: step.id,
            message: `Failed to start test runner ${testCommand}: ${err.message}`,
            summary: `Failed to start test runner ${testCommand}.`,
            error: err.message,
            data: { error: err }
          });
        });
      });
    } catch (error: unknown) { // error: any zu error: unknown
      this.logger.error('Error during runTests execution setup', { error });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during test setup';
      return {
        type: 'test',
        success: false,
        stepId: step.id,
        error: errorMessage,
        summary: `Error setting up test step: ${errorMessage}`,
        data: { error }
      };
    }
  }

  /**
   * Builds the project
   */
  private async buildProject(step: PlanStep, context: Record<string, unknown>): Promise<ExecutionResult> { // context: Record<string, any> zu Record<string, unknown>
    this.logger.info('Building project', { production: step.data?.production, optimize: step.data?.optimize });

    const buildCommand = step.data?.buildCommand || 'npm'; // Default to npm
    const buildArgs = step.data?.buildArgs || ['run', 'build']; // Default to 'run build' for npm
    const production = step.data?.production || false; // Assume development build by default
    const optimize = step.data?.optimize || false;

    const finalArgs = [...buildArgs];
    if (production) {
      // Add production flags if applicable, this is highly dependent on the build tool
      // For example, webpack might use '--mode production'
      // For npm scripts, it's assumed the script itself handles production builds
      this.logger.info('Production build flag set, ensure your build script handles this.');
    }
    if (optimize) {
      // Add optimization flags if applicable
      this.logger.info('Optimization flag set, ensure your build script handles this.');
    }

    const startTime = Date.now();

    try {
      const process = spawn(buildCommand, finalArgs);
      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
        this.logger.debug('Build stdout:', data.toString());
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
        this.logger.debug('Build stderr:', data.toString());
      });

      return new Promise((resolve) => {
        process.on('close', async (code) => { // Make this callback async
          const duration = (Date.now() - startTime) / 1000; // Duration in seconds
          if (code !== 0) {
            const buildErrorMessage = `Project build failed with code ${code}.`;
            this.logger.error(buildErrorMessage, { stderr, stdout });
            resolve({
              type: 'build',
              success: false,
              stepId: step.id,
              message: buildErrorMessage,
              error: stderr || 'Build process exited with an error.',
              summary: buildErrorMessage,
              data: { buildResults: { success: false, duration }, rawStdout: stdout, rawStderr: stderr, exitCode: code }
            });
            return;
          }

          const artifacts = await this.findBuildArtifacts();
          const totalSize = artifacts.reduce((sum, art) => sum + art.size, 0);

          const buildResults = {
            success: true,
            duration,
            artifacts,
            totalSize,
            optimizationLevel: optimize ? 'high' : 'standard', // Reflect input
            productionBuild: production, // Reflect input
          };

          const successMessage = `Build completed in ${buildResults.duration.toFixed(2)}s. ${buildResults.artifacts.length} artifacts produced (${(buildResults.totalSize / (1024 * 1024)).toFixed(2)}MB).`;
          this.logger.info(successMessage, { buildResults });
          resolve({
            type: 'build',
            success: true,
            stepId: step.id,
            message: successMessage,
            summary: successMessage,
            data: { buildResults, rawStdout: stdout, exitCode: code },
          });
        });

        process.on('error', (err) => {
          const duration = (Date.now() - startTime) / 1000;
          this.logger.error(`Failed to start build command ${buildCommand}`, { error: err });
          resolve({
            type: 'build',
            success: false,
            stepId: step.id,
            message: `Failed to start build command ${buildCommand}: ${err.message}`,
            summary: `Failed to start build command ${buildCommand}.`,
            error: err.message,
            data: { error: err, duration }
          });
        });
      });
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      this.logger.error('Error during buildProject execution setup', { error });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during build setup';
      return {
        type: 'build',
        success: false,
        stepId: step.id,
        error: errorMessage,
        summary: `Error setting up build step: ${errorMessage}`,
        data: { error, duration }
      };
    }
  }

  /**
   * Deploys the project to target environment
   */
  private async deployProject(step: PlanStep, context: Record<string, unknown>): Promise<ExecutionResult> {
    const environment = step.data?.environment || 'staging';
    const strategy = step.data?.strategy || 'default'; // Default strategy
    // Default to saar.sh script, can be overridden by step.data
    const deployCommand = step.data?.deployCommand || './saar.sh';
    // Default args for saar.sh, can be overridden. Example: ['setup', '--env', environment]
    const defaultArgs = step.data?.defaultDeployArgs || ['setup', '--environment', environment];
    const deployArgs = step.data?.deployArgs || defaultArgs;
    const expectedUrlPattern = step.data?.expectedUrlPattern as string | undefined; // e.g., "Deployment URL: (https?://[^\\s]+)"

    this.logger.info('Deploying project', { environment, strategy, command: deployCommand, args: deployArgs });

    const previousBuildStep = Object.values(context).find(s => (s as ExecutionResult).type === 'build') as ExecutionResult | undefined;
    if (!previousBuildStep || !previousBuildStep.success || !previousBuildStep.data?.buildResults?.success) {
      const errorMsg = 'Cannot deploy: previous build step failed or build artifacts are missing.';
      this.logger.error(errorMsg, { buildContext: previousBuildStep });
      return {
        type: 'deploy',
        success: false,
        stepId: step.id,
        error: errorMsg,
        message: errorMsg,
        summary: errorMsg,
        data: { error: errorMsg }
      };
    }
    
    const artifactsToDeploy = previousBuildStep.data?.buildResults?.artifacts;
    if (!artifactsToDeploy || !Array.isArray(artifactsToDeploy) || artifactsToDeploy.length === 0) {
        const errorMsg = 'No artifacts found from build step to deploy, or artifacts are not in expected array format.';
        this.logger.error(errorMsg, { buildContextData: previousBuildStep.data });
        return {
            type: 'deploy',
            success: false,
            stepId: step.id,
            error: errorMsg,
            message: errorMsg,
            summary: errorMsg,
            data: { error: errorMsg }
        };
    }

    this.logger.info('Artifacts to deploy (from build step):', { artifacts: artifactsToDeploy.map((art: { name: string }) => art.name) });

    const startTime = Date.now();

    try {
      const process = spawn(deployCommand, deployArgs, { shell: deployCommand.endsWith('.sh') || deployCommand.endsWith('.bat') }); // Use shell for .sh scripts
      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        const outData = data.toString();
        stdout += outData;
        this.logger.debug('Deploy stdout:', outData);
      });

      process.stderr.on('data', (data) => {
        const errData = data.toString();
        stderr += errData;
        this.logger.debug('Deploy stderr:', errData);
      });

      return new Promise((resolve) => {
        process.on('close', (code) => {
          const duration = (Date.now() - startTime) / 1000;
          let deploymentUrl: string | undefined = step.data?.fixedDeploymentUrl as string | undefined;

          if (code !== 0) {
            const deployErrorMessage = `Deployment to ${environment} using ${deployCommand} failed with code ${code}.`;
            this.logger.error(deployErrorMessage, { stderr, stdout });
            resolve({
              type: 'deploy',
              success: false,
              stepId: step.id,
              message: deployErrorMessage,
              error: stderr || stdout || 'Deployment process encountered an error.', // Include stdout if stderr is empty
              summary: deployErrorMessage,
              data: { deployResults: { success: false, environment, duration, strategy, command: `${deployCommand} ${deployArgs.join(' ')}` }, rawStdout: stdout, rawStderr: stderr, exitCode: code }
            });
            return;
          }

          // Try to extract URL from stdout if a pattern is provided and no fixed URL
          if (!deploymentUrl && expectedUrlPattern && stdout) {
            try {
                const urlMatch = stdout.match(new RegExp(expectedUrlPattern));
                if (urlMatch && urlMatch[1]) {
                    deploymentUrl = urlMatch[1];
                    this.logger.info(`Extracted deployment URL from stdout: ${deploymentUrl}`);
                } else {
                    this.logger.warn(`Expected URL pattern "${expectedUrlPattern}" not found in stdout. Deployment URL might be missing.`);
                }
            } catch (regexError: unknown) {
                const regexErrorMsg = regexError instanceof Error ? regexError.message : String(regexError);
                this.logger.error(`Invalid regex for expectedUrlPattern: ${expectedUrlPattern}`, { error: regexErrorMsg });
            }
          }
          
          if (!deploymentUrl) {
             this.logger.warn(`Deployment URL could not be determined for environment ${environment}. Verification steps might be limited.`);
             // deploymentUrl = `unknown-url-for-${environment}-${Date.now()}`; // Fallback if needed
          }


          const deployResults = {
            success: true,
            environment,
            strategy,
            timestamp: new Date().toISOString(),
            deploymentId: `deploy-${environment}-${Date.now()}`,
            duration,
            url: deploymentUrl,
            artifactsDeployed: artifactsToDeploy.map((art: { name: string }) => art.name),
            commandExecuted: `${deployCommand} ${deployArgs.join(' ')}`,
          };

          const deploySuccessMessage = `Successfully deployed to ${deployResults.environment} using ${deployResults.strategy} strategy in ${deployResults.duration.toFixed(2)}s. ${deployResults.url ? `URL: ${deployResults.url}` : 'URL not determined.'}`;
          this.logger.info(deploySuccessMessage, { deployResults });
          resolve({
            type: 'deploy',
            success: true,
            stepId: step.id,
            message: deploySuccessMessage,
            summary: deploySuccessMessage,
            data: { deployResults, rawStdout: stdout, exitCode: code },
          });
        });

        process.on('error', (err) => {
          const duration = (Date.now() - startTime) / 1000;
          this.logger.error(`Failed to start deploy command ${deployCommand}`, { error: err });
          resolve({
            type: 'deploy',
            success: false,
            stepId: step.id,
            message: `Failed to start deploy command ${deployCommand}: ${err.message}`,
            summary: `Failed to start deploy command ${deployCommand}.`,
            error: err.message,
            data: { error: err, duration, command: `${deployCommand} ${deployArgs.join(' ')}` }
          });
        });
      });
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      this.logger.error('Error during deployProject execution setup', { error });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during deploy setup';
      return {
        type: 'deploy',
        success: false,
        stepId: step.id,
        error: errorMessage,
        summary: `Error setting up deploy step: ${errorMessage}`,
        data: { error, duration, command: `${deployCommand} ${deployArgs.join(' ')}` }
      };
    }
  }

  /**
   * Verifies the deployment was successful
   */
  private async verifyDeployment(step: PlanStep, context: Record<string, unknown>): Promise<ExecutionResult> {
    const performHealthChecks = step.data?.healthChecks !== false; // Default to true
    const healthCheckEndpoints = step.data?.healthCheckEndpoints || ['/health'];
    const healthCheckTimeout = step.data?.healthCheckTimeout || 5000; // Default 5 seconds timeout
    const performSmokeTests = step.data?.smokeTests !== false;   // Default to true
    // Allow smokeTestCommand and smokeTestArgs to be undefined if performSmokeTests is false or not configured
    const smokeTestCommand = step.data?.smokeTestCommand as string | undefined;
    const smokeTestArgs = step.data?.smokeTestArgs as string[] | undefined || [];

    this.logger.info('Verifying deployment', { performHealthChecks, healthCheckEndpoints, healthCheckTimeout, performSmokeTests, smokeTestCommand, smokeTestArgs });

    const previousDeployStep = Object.values(context).find(s => (s as ExecutionResult).type === 'deploy') as ExecutionResult | undefined;
    if (!previousDeployStep || !previousDeployStep.success || !previousDeployStep.data?.deployResults?.success) {
      const errorMsg = 'Cannot verify deployment: previous deployment step failed or deployment data is missing.';
      this.logger.error(errorMsg, { deployContext: previousDeployStep });
      return { type: 'verify', success: false, stepId: step.id, error: errorMsg, message: errorMsg, summary: errorMsg, data: { error: errorMsg } };
    }
    
    const deploymentUrl = previousDeployStep.data?.deployResults?.url;
    if (performHealthChecks && !deploymentUrl) { // Only critical if health checks are to be performed
      const errorMsg = 'Cannot perform health checks: deployment URL not found in context.';
      this.logger.error(errorMsg, { deployContextData: previousDeployStep.data });
       return { type: 'verify', success: false, stepId: step.id, error: errorMsg, message: errorMsg, summary: errorMsg, data: { error: errorMsg, reason: 'Missing deploymentUrl for health checks' } };
    }
    
    let healthCheckResults: HealthCheckResults = { passed: 0, failed: 0, checked: 0, details: [] };
    if (performHealthChecks && deploymentUrl) { // Ensure deploymentUrl exists for health checks
      this.logger.info(`Performing health checks on ${deploymentUrl}`, { endpoints: healthCheckEndpoints });
      for (const endpoint of healthCheckEndpoints) {
        const url = new URL(endpoint, deploymentUrl).toString();
        healthCheckResults.checked++;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), healthCheckTimeout);
        
        try {
          const startTime = Date.now();
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);
          const duration = Date.now() - startTime;

          if (response.ok) {
            healthCheckResults.passed++;
            healthCheckResults.details.push({ endpoint, url, status: response.status, success: true, duration });
            this.logger.info(`Health check passed for ${url}`, { status: response.status });
          } else {
            healthCheckResults.failed++;
            healthCheckResults.details.push({ endpoint, url, status: response.status, success: false, duration, error: `Status ${response.status}` });
            this.logger.warn(`Health check failed for ${url}`, { status: response.status });
          }
        } catch (error: unknown) {
          clearTimeout(timeoutId);
          healthCheckResults.failed++;
          let errorMessage: string;
          if (error instanceof Error) {
            errorMessage = error.name === 'AbortError' ? `Request timed out after ${healthCheckTimeout}ms` : error.message;
          } else {
            errorMessage = String(error);
          }
          healthCheckResults.details.push({ endpoint, url, success: false, error: errorMessage });
          this.logger.error(`Health check error for ${url}`, { error: errorMessage });
        }
      }
    } else if (performHealthChecks && !deploymentUrl) {
        this.logger.warn('Skipping health checks as deployment URL is not available.');
        healthCheckResults.message = 'Skipped due to missing deployment URL.';
    }

    let smokeTestResultsData: SmokeTestResultsData = { success: true, message: 'Smoke tests not configured or not performed.', rawStdout: '', rawStderr: '', exitCode: 0, testsRun: 0, passed: 0, failed: 0, error: undefined };
    if (performSmokeTests && smokeTestCommand) { // Only run if command is provided
      this.logger.info('Performing smoke tests', { command: smokeTestCommand, args: smokeTestArgs });
      
      const smokeProcess = spawn(smokeTestCommand, smokeTestArgs, { shell: smokeTestCommand.endsWith('.sh') || smokeTestCommand.endsWith('.bat') });
      let smokeStdout = '';
      let smokeStderr = '';
      smokeProcess.stdout.on('data', (data) => smokeStdout += data.toString());
      smokeProcess.stderr.on('data', (data) => smokeStderr += data.toString());

      smokeTestResultsData = await new Promise<SmokeTestResultsData>(resolve => {
        smokeProcess.on('close', code => {
          // Basic parsing for "X tests, Y passed, Z failed" could be added here if stdout format is known
          resolve({
            success: code === 0,
            message: code === 0 ? 'Smoke tests passed.' : `Smoke tests failed with code ${code}.`,
            rawStdout: smokeStdout,
            rawStderr: smokeStderr,
            exitCode: code ?? -1, // Handle null exit code
            // These are placeholders, real counts would need parsing from stdout
            testsRun: smokeStdout.toLowerCase().includes('test') ? 1 : 0, // very basic heuristic
            passed: code === 0 && smokeStdout.toLowerCase().includes('test') ? 1 : 0,
            failed: code !== 0 && smokeStdout.toLowerCase().includes('test') ? 1 : 0,
          });
        });
        smokeProcess.on('error', err => {
          this.logger.error('Failed to start smoke test command', { error: err });
          resolve({ success: false, message: `Failed to start smoke tests: ${err.message}`, error: err.message, testsRun: 0, passed: 0, failed: 0, rawStdout: '', rawStderr: '', exitCode: 1 });
        });
      });
      if (!smokeTestResultsData.success) {
          this.logger.warn('Smoke tests failed', { results: smokeTestResultsData });
      } else {
          this.logger.info('Smoke tests completed', { results: smokeTestResultsData });
      }
    } else if (performSmokeTests && !smokeTestCommand) {
        this.logger.warn('Smoke tests were configured to run, but no smokeTestCommand was provided. Skipping.');
        smokeTestResultsData.message = 'Smoke tests configured but no command provided.';
        smokeTestResultsData.success = true; // Consider it success if no command means nothing to fail
    }
    
    const overallSuccess =
      (!performHealthChecks || healthCheckResults.failed === 0) &&
      (!performSmokeTests || smokeTestResultsData.success);

    let message = 'Deployment verification: ';
    if (performHealthChecks) {
        if (healthCheckResults.checked > 0) {
            message += `${healthCheckResults.passed}/${healthCheckResults.checked} health checks passed. `;
        } else {
            message += `No health checks performed (checked: ${healthCheckResults.checked}, message: ${healthCheckResults.message || 'details not available'}). `;
        }
    }


    if (performSmokeTests) {
      message += smokeTestResultsData.message;
    }
    
    if (!performHealthChecks && !performSmokeTests) {
      message += 'No verification steps performed as per configuration.';
    }

    if (!overallSuccess && !message.toLowerCase().includes('failed')) {
        message = 'Deployment verification failed. ' + message;
    }
    
    return {
      type: 'verify',
      success: !!overallSuccess, // Ensure it's a boolean
      stepId: step.id,
      message,
      summary: message,
      data: {
          healthCheckResults: performHealthChecks ? healthCheckResults : undefined,
          smokeTestResults: performSmokeTests ? smokeTestResultsData : undefined,
          deploymentUrlChecked: deploymentUrl
      },
    };
  }

  /**
   * Sends notifications about pipeline results
   */
  private async sendNotifications(step: PlanStep, context: Record<string, unknown>): Promise<ExecutionResult> {
    const channels: string[] = step.data?.channels || ['email']; // Default to email
    const onlyOnFailure = step.data?.onlyOnFailure === true;
    
    // Configuration for recipients should come from step.data or a dedicated notifications config.
    const emailRecipients: string[] = step.data?.emailRecipients || [];
    const slackWebhookUrl: string | undefined = step.data?.slackWebhookUrl;
    const slackChannels: string[] = step.data?.slackChannels || [];
    const defaultEmailRecipientOnError = 'dev-team@example.com'; // Fallback if no recipients configured for email

    this.logger.info('Preparing to send notifications', { channels, onlyOnFailure, stepEmailRecipients: step.data?.emailRecipients, stepSlackWebhookUrl: step.data?.slackWebhookUrl, stepSlackChannels: step.data?.slackChannels });
    
    const pipelineSteps = Object.values(context).filter(s => (s as ExecutionResult).type !== 'notify' && (s as ExecutionResult).stepId) as ExecutionResult[];
    const overallSuccess = pipelineSteps.every(s => s.success);
    
    if (onlyOnFailure && overallSuccess) {
      const skipMessage = 'Notifications skipped: pipeline succeeded and onlyOnFailure is true.';
      this.logger.info(skipMessage);
      return {
        type: 'notify',
        success: true,
        stepId: step.id,
        message: skipMessage,
        summary: skipMessage,
        data: { notificationsSent: false, reason: 'Pipeline success with onlyOnFailure true' },
      };
    }
    
    const messageSummary = pipelineSteps.map(s => {
      let summary = `${s.type} (${s.stepId}): ${s.success ? 'OK' : 'Failed'}`;
      if(!s.success) summary += ` - Error: ${s.error || s.message || 'Unknown error'}`;
      return summary;
    }).join('\n');

    const pipelineName = step.data?.pipelineName || 'Unnamed Pipeline';
    const notificationSubject = `CI/CD Pipeline Report (${pipelineName}): ${overallSuccess ? 'Succeeded' : 'Failed'}`;
    // Consider providing a link to the pipeline run if available in context
    const pipelineRunLink = (context.pipelineInfo as any)?.runUrl || 'N/A';
    const notificationBody = `Pipeline Status: ${overallSuccess ? 'SUCCESS' : 'FAILURE'}
Pipeline Name: ${pipelineName}
Run Link: ${pipelineRunLink}

Step Summary:
${messageSummary}

Full Context (JSON extract for brevity):
${JSON.stringify(pipelineSteps.map(s => ({id: s.stepId, type: s.type, success: s.success, summary: s.summary?.substring(0,100)})), null, 2)}`;

    this.logger.info(`Notification details:`, { subject: notificationSubject, channels });

    let allNotificationsSentSuccessfully = true;
    const sentDetails: unknown[] = [];

    for (const channel of channels) {
      let sendSuccess = false;
      let sendError: string | undefined;
      let currentRecipients: string | string[] = 'N/A';

      try {
        switch (channel.toLowerCase()) {
          case 'email':
            if (!emailRecipients || emailRecipients.length === 0) {
                this.logger.warn('Email channel selected, but no recipients configured.');
                sendError = 'No email recipients configured.';
                break;
            }
            currentRecipients = emailRecipients.join(', ');
            this.logger.info(`Attempting to send email to: ${currentRecipients} for subject: "${notificationSubject}"`);
            // TODO: Implement actual email sending logic using a library like Nodemailer.
            // Example:
            // const emailService = new EmailService(configManager.getConfig(ConfigType.NOTIFICATIONS).emailSettings);
            // await emailService.send({ to: emailRecipients, subject: notificationSubject, htmlBody: notificationBody.replace(/\n/g, '<br>') });
            this.logger.warn('Email sending is a TODO. Simulating success for now.');
            sendSuccess = true; // Simulate success
            break;
          case 'slack':
            if (!slackWebhookUrl && (!slackChannels || slackChannels.length === 0)) {
                this.logger.warn('Slack channel selected, but no webhook URL or channels configured.');
                sendError = 'No Slack webhook URL or channels configured.';
                break;
            }
            currentRecipients = slackWebhookUrl ? `Webhook: ${slackWebhookUrl.substring(0,30)}...` : `Channels: ${slackChannels.join(', ')}`;
            this.logger.info(`Attempting to send Slack notification to: ${currentRecipients}`);
            // TODO: Implement actual Slack sending logic using @slack/web-api or a webhook.
            // Example (webhook):
            // await fetch(slackWebhookUrl, { method: 'POST', body: JSON.stringify({ text: notificationBody }), headers: { 'Content-Type': 'application/json' } });
            // Example (API):
            // const slackService = new SlackService(configManager.getConfig(ConfigType.NOTIFICATIONS).slackSettings);
            // await slackService.postMessage({ channels: slackChannels, text: notificationBody });
            this.logger.warn('Slack sending is a TODO. Simulating success for now.');
            sendSuccess = true; // Simulate success
            break;
          default:
            this.logger.warn(`Notification channel '${channel}' not implemented. Skipping.`);
            sendError = `Channel '${channel}' not implemented.`;
        }
      } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        this.logger.error(`Error sending notification via ${channel}: ${errorMsg}`, { error: e });
        sendError = e instanceof Error ? e.message : String(e);
      }

      if (sendSuccess) {
        this.logger.info(`Successfully processed (simulated) notification for channel ${channel}.`);
        sentDetails.push({ channel, success: true, recipients: currentRecipients });
      } else {
        this.logger.error(`Failed to process notification for channel ${channel}.`, { error: sendError });
        sentDetails.push({ channel, success: false, error: sendError || `Processing failed for ${channel}`, recipients: currentRecipients });
        allNotificationsSentSuccessfully = false;
      }
    }

    const notificationResults = {
      success: allNotificationsSentSuccessfully,
      channelsAttempted: channels,
      details: sentDetails,
      messageType: overallSuccess ? 'success' : 'failure',
      timestamp: new Date().toISOString(),
    };
    
    const finalMessage = allNotificationsSentSuccessfully
      ? `Notifications processed (simulated). Status: ${notificationResults.messageType}. See details in data.`
      : `Some notifications failed to send (or are simulated). Status: ${notificationResults.messageType}. See details in data.`;

    return {
      type: 'notify',
      success: allNotificationsSentSuccessfully, // This reflects if the processing loop had errors, not necessarily if all external services succeeded.
      stepId: step.id,
      message: finalMessage,
      summary: finalMessage,
      error: !allNotificationsSentSuccessfully ? 'One or more notification channels failed or were not fully implemented.' : undefined,
      data: { notificationResults },
    };
  }

  /**
   * Finds build artifacts in common output directories.
   * @param baseDir The base directory of the project, defaults to current working directory.
   * @returns A list of found artifacts with their name, size, and path.
   */
  private async findBuildArtifacts(baseDir: string = '.'): Promise<{ name: string; size: number; path: string }[]> {
    const commonOutputDirs = ['dist', 'build', 'out', 'public', 'target']; // Added 'target' for Java/Maven projects
    const foundArtifacts: { name: string; size: number; path: string }[] = [];
    const searchBasePath = path.resolve(baseDir); // Ensure baseDir is absolute for consistent path.relative

    this.logger.info(`Searching for build artifacts in common directories under: ${searchBasePath}`);

    for (const dir of commonOutputDirs) {
        const artifactDir = path.join(searchBasePath, dir);
        try {
            // Check if directory exists
            await fs.access(artifactDir);
            this.logger.debug(`Scanning directory: ${artifactDir}`);
            // Note: { recursive: true } for fs.readdir is available in Node.js 18.17.0+.
            // If older Node version, a manual recursive walk function would be needed.
            // Assuming modern Node.js for this implementation.
            const files = await fs.readdir(artifactDir, { withFileTypes: true, recursive: true });
            for (const file of files) {
                // Construct full path carefully if recursive readdir provides paths relative to artifactDir or full paths
                // withFileTypes + recursive: file.name is entry name, file.path is full path to directory containing entry (Node 20+)
                // For broader compatibility, let's construct path from artifactDir and file.name if it's not already absolute
                let filePath = file.name; // This might be relative path within the recursive search
                if (file.path) { // Node 20+ provides 'path' property
                    filePath = path.join(file.path, file.name);
                } else { // Fallback for older Node versions or if path is not provided
                    filePath = path.join(artifactDir, file.name); // This assumes file.name is relative to artifactDir
                }


                if (file.isFile()) {
                    try {
                        const stats = await fs.stat(filePath);
                        const relativeFilePath = path.relative(searchBasePath, filePath);
                        foundArtifacts.push({
                            name: file.name,
                            size: stats.size,
                            path: relativeFilePath
                        });
                        this.logger.debug(`Found artifact: ${relativeFilePath}, Size: ${stats.size} bytes`);
                    } catch (statError: unknown) {
                        const statErrorMsg = statError instanceof Error ? statError.message : String(statError);
                        this.logger.warn(`Could not stat file ${filePath}: ${statErrorMsg}`);
                    }
                }
            }
            // If artifacts are found in one of the common directories, we can decide to stop or continue.
            // For now, let's continue to gather from all common dirs, could be configurable.
            // if (foundArtifacts.length > 0) break;
        } catch (error: unknown) {
            if ((error as { code?: string })?.code === 'ENOENT') {
                this.logger.debug(`Directory ${artifactDir} not found.`);
            } else {
                const errorMsg = error instanceof Error ? error.message : String(error);
                this.logger.warn(`Error accessing directory ${artifactDir}: ${errorMsg}`);
            }
        }
    }

    if (foundArtifacts.length === 0) {
        this.logger.warn('No build artifacts found in common output directories. Returning empty list. Searched in:', commonOutputDirs);
    } else {
        this.logger.info(`Found ${foundArtifacts.length} build artifacts.`);
    }
    return foundArtifacts;
  }
}
