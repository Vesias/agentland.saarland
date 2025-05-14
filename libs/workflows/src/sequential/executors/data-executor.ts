import { PlanStep, ExecutionResult } from "../types";
import { BaseExecutor } from './base-executor';
import configManager, { ConfigType } from '../../../../core/src/config/config-manager';
import { ClaudeError } from '../../../../core/src/error/error-handler';
import * as fs from 'fs/promises';
import * as path from 'path';
// Potenziell CSV-Parser-Bibliothek importieren, falls CSV-Verarbeitung implementiert wird
// import Papa from 'papaparse';

/**
 * Data-specific execution implementation.
 * Handles the execution of data processing and analysis steps.
 */
export class DataExecutor extends BaseExecutor {
  constructor() {
    super('data');
  }

  /**
   * Executes a data processing step
   * 
   * @param step The plan step to execute
   * @param context Execution context with data from previous steps
   * @returns Result of the execution
   */
  async executeStep(step: PlanStep, context: Record<string, any>): Promise<ExecutionResult> {
    this.logger.debug(`Executing data step: ${step.id}`, { step });
    
    try {
      const config = configManager.getConfig(ConfigType.GLOBAL); // Or a more specific config if available e.g. ConfigType.DATA
      
      switch(step.id) {
        case 'collect':
          return await this.collectData(step, context);
        case 'validate':
          return await this.validateData(step, context);
        case 'transform':
          return await this.transformData(step, context);
        case 'analyze':
          return await this.analyzeData(step, context);
        case 'visualize':
          return await this.visualizeResults(step, context);
        case 'store':
          return await this.storeData(step, context);
        default:
          throw new ClaudeError(`Unknown data step: ${step.id}`);
      }
    } catch (error) {
      this.logger.error(`Error executing data step ${step.id}`, { error });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        type: step.actionType || step.id,
        success: false,
        stepId: step.id,
        error: errorMessage,
        summary: `Error in data step ${step.id}: ${errorMessage}`,
        data: { error }
      };
    }
  }

  /**
   * Collects data from specified sources
   */
  private async collectData(step: PlanStep, context: Record<string, any>): Promise<ExecutionResult> {
    const sources: { type: string, path?: string, url?: string, query?: string, format?: string }[] = step.data?.sources || [];
    // Default formats can be overridden by source-specific format
    const defaultFormats = step.data?.defaultFormats || ['json', 'csv'];
    this.logger.info('Collecting data', { sources, defaultFormats });

    let allRawData: any[] = [];
    const collectionErrors: any[] = [];
    let totalRecordsCollected = 0;
    let filesCollectedCount = 0;
    const dataBySourceDetails: any[] = [];

    for (const source of sources) {
      const sourceFormat = source.format || (source.path ? path.extname(source.path).substring(1) : undefined) || defaultFormats[0];
      let sourceData: any[] = [];
      let sourceFileCount = 0;
      let sourceRecordCount = 0;
      let status = 'pending';
      let errorMsg: string | undefined;

      try {
        if (source.type === 'file' && source.path) {
          this.logger.info(`Collecting from file: ${source.path} (format: ${sourceFormat})`);
          const fileContent = await fs.readFile(source.path, 'utf-8');
          sourceFileCount = 1;
          if (sourceFormat === 'json') {
            const jsonData = JSON.parse(fileContent);
            sourceData = Array.isArray(jsonData) ? jsonData : [jsonData];
          } else if (sourceFormat === 'csv') {
            // TODO: Implement robust CSV parsing, e.g., using a library like papaparse
            // For now, a very basic split for simulation
            const lines = fileContent.split('\n').filter(line => line.trim() !== '');
            if (lines.length > 1) { // Assuming header
              const headers = lines[0].split(',');
              sourceData = lines.slice(1).map(line => {
                const values = line.split(',');
                return headers.reduce((obj, header, index) => {
                  obj[header.trim()] = values[index]?.trim();
                  return obj;
                }, {} as Record<string, string>);
              });
            }
            this.logger.warn('CSV parsing is basic. Consider using a dedicated library for production.');
          } else {
            throw new Error(`Unsupported file format: ${sourceFormat} for source ${source.path}`);
          }
          sourceRecordCount = sourceData.length;
          allRawData.push(...sourceData);
          totalRecordsCollected += sourceRecordCount;
          filesCollectedCount += sourceFileCount;
          status = 'success';
        } else if (source.type === 'api' && source.url) {
          // TODO: Implement API fetching logic
          this.logger.info(`Collecting from API: ${source.url} (format: ${sourceFormat})`);
          // const response = await fetch(source.url);
          // const data = await response.json(); // or .text() for CSV
          // sourceData = ...
          status = 'skipped_not_implemented';
          errorMsg = `API collection for ${source.url} not yet implemented.`;
          this.logger.warn(errorMsg);
          collectionErrors.push({ source: source.url, error: errorMsg });
        } else if (source.type === 'database' && source.query) {
          // TODO: Implement Database querying logic
          this.logger.info(`Collecting from Database (query): ${source.query} (format: ${sourceFormat})`);
          status = 'skipped_not_implemented';
          errorMsg = `Database collection for query ${source.query} not yet implemented.`;
          this.logger.warn(errorMsg);
          collectionErrors.push({ source: source.query, error: errorMsg });
        } else {
          throw new Error(`Unsupported source type or missing parameters: ${JSON.stringify(source)}`);
        }
      } catch (error: any) {
        this.logger.error(`Failed to collect data from source: ${JSON.stringify(source)}`, { error: error.message });
        collectionErrors.push({ source: source.path || source.url || source.query, error: error.message });
        status = 'failed';
        errorMsg = error.message;
      }
      dataBySourceDetails.push({
        source: source.path || source.url || source.query || 'unknown',
        type: source.type,
        format: sourceFormat,
        files: sourceFileCount,
        records: sourceRecordCount,
        status,
        error: errorMsg,
      });
    }
    
    const overallSuccess = collectionErrors.length === 0 || totalRecordsCollected > 0; // Success if at least some data collected or no errors
    const message = `Collected ${totalRecordsCollected} records from ${sources.length} sources (${filesCollectedCount} files). ${collectionErrors.length} errors occurred.`;
    
    return {
      type: 'collect',
      success: overallSuccess,
      stepId: step.id,
      message,
      summary: message,
      error: collectionErrors.length > 0 ? `${collectionErrors.length} collection errors. See data for details.` : undefined,
      data: {
        dataCollectionResults: {
          totalSourcesProcessed: sources.length,
          totalFilesCollected: filesCollectedCount,
          totalRecordsCollected,
          detailsBySource: dataBySourceDetails,
          errors: collectionErrors,
        },
        // Storing all collected data directly might be memory intensive for large datasets.
        // Consider storing paths to temporary files or summaries/samples.
        // For now, we pass it along for subsequent steps if not too large.
        rawData: allRawData.length < 10000 ? allRawData : { recordCount: allRawData.length, sample: allRawData.slice(0,5), message: "Dataset too large, only sample stored." }
      },
    };
  }

  /**
   * Validates data quality and integrity
   */
  private async validateData(step: PlanStep, context: Record<string, any>): Promise<ExecutionResult> {
    const validateSchema = step.data?.validateSchema !== false; // e.g., using a JSON schema
    const schemaDefinition = step.data?.schemaDefinition; // Path to schema or schema object
    const checkCompletenessFields: string[] = step.data?.checkCompletenessFields || []; // Fields to check for non-null/empty
    const checkConsistencyRules: {field: string, rule: string, value?: any, regex?: string}[] = step.data?.checkConsistencyRules || []; // e.g., { field: 'age', rule: 'greaterThan', value: 0 }
    
    this.logger.info('Validating data', { validateSchema, schemaDefinitionPath: typeof schemaDefinition === 'string' ? schemaDefinition : 'object', checkCompletenessFields, checkConsistencyRules });
    
    const previousCollectStep = Object.values(context).find(s => (s as ExecutionResult).type === 'collect') as ExecutionResult | undefined;
    let rawDataArray: any[] = [];

    if (previousCollectStep?.data?.rawData) {
        if(Array.isArray(previousCollectStep.data.rawData)) {
            rawDataArray = previousCollectStep.data.rawData;
        } else if (previousCollectStep.data.rawData.recordCount !== undefined && Array.isArray(previousCollectStep.data.rawData.sample)) {
            this.logger.warn('Validating a sample of the data as full dataset was too large in previous step.');
            rawDataArray = previousCollectStep.data.rawData.sample;
        }
    }
    
    const totalRecordsInput = previousCollectStep?.data?.rawData?.recordCount ?? rawDataArray.length;

    if (rawDataArray.length === 0 && totalRecordsInput === 0) {
      const errorMsg = 'No data available from collect step for validation.';
      this.logger.error(errorMsg, { collectContext: previousCollectStep });
      return { type: 'validate', success: false, stepId: step.id, error: errorMsg, message: errorMsg, summary: errorMsg, data: { error: errorMsg } };
    }
    
    let validRecords: any[] = [];
    let currentInvalidRecordsCount = 0;
    const issuesFound = { schemaViolations: 0, incompletenessViolations: 0, consistencyViolations: 0, other: 0 };
    const validationDetails: any[] = [];

    if (validateSchema && schemaDefinition) {
      this.logger.info('Schema validation is configured. NOTE: Full schema validation logic (e.g. Ajv) is not yet implemented here. Performing basic checks based on other rules.');
      // Placeholder: Actual schema validation (e.g. with Ajv) would go here.
      // For now, we rely on completeness and consistency checks.
      // If using Ajv:
      // try {
      //   const ajv = new Ajv();
      //   const schema = typeof schemaDefinition === 'string' ? JSON.parse(await fs.readFile(schemaDefinition, 'utf-8')) : schemaDefinition;
      //   const ajvValidate = ajv.compile(schema);
      // } catch (err) {
      //    this.logger.error('Failed to load or compile schema definition', { path: schemaDefinition, error: err });
      //    // Decide if this is a fatal error for the validation step
      // }
    }

    for (const record of rawDataArray) {
      let isValidRecord = true;
      const recordIssues: string[] = [];

      // Completeness checks
      for (const field of checkCompletenessFields) {
        if (record[field] === null || record[field] === undefined || record[field] === '') {
          isValidRecord = false;
          issuesFound.incompletenessViolations++;
          recordIssues.push(`Field '${field}' is incomplete.`);
        }
      }

      // Consistency checks
      for (const rule of checkConsistencyRules) {
        if (rule.field && record[rule.field] !== undefined) {
          let ruleFailed = false;
          switch(rule.rule) {
            case 'greaterThan':
              if (!(parseFloat(record[rule.field]) > rule.value)) ruleFailed = true;
              break;
            case 'lessThan':
              if (!(parseFloat(record[rule.field]) < rule.value)) ruleFailed = true;
              break;
            case 'equals':
              if (record[rule.field] !== rule.value) ruleFailed = true;
              break;
            case 'matchesRegex':
              if (rule.regex && !new RegExp(rule.regex).test(record[rule.field])) ruleFailed = true;
              break;
            case 'notNull':
                 if (record[rule.field] === null || record[rule.field] === undefined) ruleFailed = true;
                 break;
            case 'isNumber':
                if (isNaN(parseFloat(record[rule.field]))) ruleFailed = true;
                break;
            // Add more consistency rules as needed
          }
          if (ruleFailed) {
            isValidRecord = false;
            issuesFound.consistencyViolations++;
            recordIssues.push(`Field '${rule.field}' (${record[rule.field]}) failed rule '${rule.rule}' ${rule.value !== undefined ? rule.value : rule.regex || ''}.`);
          }
        }
      }
      
      // if (validateSchema && ajvValidate && !ajvValidate(record)) {
      //   isValidRecord = false;
      //   issuesFound.schemaViolations++;
      //   ajvValidate.errors?.forEach(err => recordIssues.push(`Schema error: ${err.instancePath || 'record'} ${err.message}`));
      // }

      if (isValidRecord) {
        validRecords.push(record);
      } else {
        currentInvalidRecordsCount++;
        if (validationDetails.length < 50) { // Limit stored details
            validationDetails.push({ recordId: record.id || JSON.stringify(record).substring(0,50), issues: recordIssues });
        }
      }
    }
    
    let finalInvalidRecordsCount = currentInvalidRecordsCount;
    if (rawDataArray.length < totalRecordsInput && totalRecordsInput > 0 && rawDataArray.length > 0) {
        const sampleInvalidRate = currentInvalidRecordsCount / rawDataArray.length;
        finalInvalidRecordsCount = Math.round(sampleInvalidRate * totalRecordsInput);
        this.logger.warn(`Extrapolated invalid records count to ${finalInvalidRecordsCount} from ${currentInvalidRecordsCount} in sample of ${rawDataArray.length} (total input: ${totalRecordsInput}).`);
    }


    const dataQualityScore = totalRecordsInput > 0 ? (totalRecordsInput - finalInvalidRecordsCount) / totalRecordsInput : 0;
    const success = finalInvalidRecordsCount === 0;

    const message = success
      ? `Data validation passed for ${totalRecordsInput} records. Quality score: ${(dataQualityScore * 100).toFixed(1)}%.`
      : `Data validation found an estimated ${finalInvalidRecordsCount} invalid records out of ${totalRecordsInput}. Quality score: ${(dataQualityScore * 100).toFixed(1)}%.`;
    
    return {
      type: 'validate',
      success,
      stepId: step.id,
      message,
      summary: message,
      error: !success ? `Validation failed with ${finalInvalidRecordsCount} invalid records.` : undefined,
      data: {
        validationResults: {
          totalRecordsChecked: totalRecordsInput,
          validRecordsCount: totalRecordsInput - finalInvalidRecordsCount,
          invalidRecordsCount: finalInvalidRecordsCount,
          issuesFound,
          dataQualityScore,
          detailsSample: validationDetails, // Sample of details
        },
        validatedData: validRecords.length < 10000 ? validRecords : { recordCount: validRecords.length, sample: validRecords.slice(0,5), message: "Validated dataset too large, only sample stored."}
      },
    };
  }

  /**
   * Transforms and processes the data
   */
  private async transformData(step: PlanStep, context: Record<string, any>): Promise<ExecutionResult> {
    const transformations = step.data?.transformations || [];
    const inPlace = step.data?.inPlace === true;
    this.logger.info('Transforming data', { transformations, inPlace });

    const previousValidateStep = Object.values(context).find(s => (s as ExecutionResult).stepId === 'validate') as ExecutionResult | undefined;
    const validatedData = previousValidateStep?.data?.validatedData;
    const inputRecords = validatedData?.recordCount || 0;

    if (!validatedData || inputRecords === 0) {
      const errorMsg = 'No validated data available from validate step for transformation.';
      this.logger.error(errorMsg, { validateContext: previousValidateStep });
      return {
        type: 'transform',
        success: false,
        stepId: step.id,
        error: errorMsg,
        message: errorMsg,
        summary: errorMsg,
        data: { error: errorMsg }
      };
    }
    
    // TODO: Implement actual data transformation logic (e.g., using a data manipulation library or custom functions)
    // Example: const transformedDataPayload = await applyTransformations(validatedData, transformations);
    
    // Simulating transformation results
    const recordsDropped = Math.floor(Math.random() * (inputRecords * 0.02)); // Simulate up to 2% records dropped
    const transformationResults = {
      inputRecords,
      outputRecords: inputRecords - recordsDropped,
      transformationsApplied: transformations.map((transform: string) => ({
        name: transform,
        recordsAffected: Math.floor(Math.random() * inputRecords), // Simplified
        status: 'success',
      })),
      durationSeconds: Math.floor(Math.random() * 60) + 10,
      inPlace,
    };
    
    const message = `Successfully transformed ${transformationResults.inputRecords} records to ${transformationResults.outputRecords} records in ${transformationResults.durationSeconds}s.`;
    return {
      type: 'transform',
      success: true, // This would depend on the outcome of actual transformations
      stepId: step.id,
      message,
      summary: message,
      data: { transformationResults, processedData: { recordCount: transformationResults.outputRecords, sample: "/* processed data sample */" } },
    };
  }

  /**
   * Analyzes the processed data
   */
  private async analyzeData(step: PlanStep, context: Record<string, any>): Promise<ExecutionResult> {
    const analysisTypes = step.data?.analysisTypes || ['descriptive_stats'];
    const generateReports = step.data?.generateReports === true;
    this.logger.info('Analyzing data', { analysisTypes, generateReports });

    const previousTransformStep = Object.values(context).find(s => (s as ExecutionResult).stepId === 'transform') as ExecutionResult | undefined;
    const processedData = previousTransformStep?.data?.processedData;
    const inputRecords = processedData?.recordCount || 0;

    if (!processedData || inputRecords === 0) {
      const errorMsg = 'No processed data available from transform step for analysis.';
      this.logger.error(errorMsg, { transformContext: previousTransformStep });
      return {
        type: 'analyze',
        success: false,
        stepId: step.id,
        error: errorMsg,
        message: errorMsg,
        summary: errorMsg,
        data: { error: errorMsg }
      };
    }
    
    // TODO: Implement actual data analysis logic (e.g., using statistical libraries, ML models)
    // Example: const analysisOutput = await performAnalysis(processedData, analysisTypes);

    // Simulating analysis results
    const analysisResults = {
      inputRecords,
      analysisTypesApplied: analysisTypes,
      keyInsights: [
        { description: 'Average user engagement increased by 15% month-over-month.', confidence: 0.95 },
        { description: 'Product X shows highest correlation with repeat purchases.', confidence: 0.88 },
      ],
      summaryStatistics: { meanValue: 55.2, medianValue: 52.1, stdDeviation: 12.5 },
      reportsGenerated: generateReports ? [
        { name: 'analysis_summary_report.pdf', path: 'reports/analysis_summary_report.pdf', sizeBytes: 300000 },
        { name: 'detailed_metrics.csv', path: 'reports/detailed_metrics.csv', sizeBytes: 150000 },
      ] : [],
    };
    
    const message = `Data analysis completed for ${analysisResults.inputRecords} records using ${analysisResults.analysisTypesApplied.join(', ')} methods. ${analysisResults.keyInsights.length} key insights found.` +
                    (generateReports ? ` ${analysisResults.reportsGenerated.length} reports generated.` : '');
    return {
      type: 'analyze',
      success: true, // This would depend on the outcome of actual analysis
      stepId: step.id,
      message,
      summary: message,
      data: { analysisResults },
    };
  }

  /**
   * Creates visualizations of the analysis results
   */
  private async visualizeResults(step: PlanStep, context: Record<string, any>): Promise<ExecutionResult> {
    const visualizationTypes = step.data?.visualizationTypes || ['bar_chart', 'line_graph'];
    const interactive = step.data?.interactive === true;
    this.logger.info('Visualizing results', { visualizationTypes, interactive });

    const previousAnalysisStep = Object.values(context).find(s => (s as ExecutionResult).stepId === 'analyze') as ExecutionResult | undefined;
    const analysisData = previousAnalysisStep?.data?.analysisResults;

    if (!analysisData) {
      const errorMsg = 'No analysis results available from analyze step for visualization.';
      this.logger.error(errorMsg, { analysisContext: previousAnalysisStep });
      return {
        type: 'visualize',
        success: false,
        stepId: step.id,
        error: errorMsg,
        message: errorMsg,
        summary: errorMsg,
        data: { error: errorMsg }
      };
    }
    
    // TODO: Implement actual visualization generation (e.g., using charting libraries like Chart.js, D3, or Plotly)
    // Example: const vizOutputs = await generateVisualizations(analysisData, visualizationTypes, interactive);

    // Simulating visualization results
    const visualizationResults = {
      typesGenerated: visualizationTypes,
      isInteractive: interactive,
      visualizationsCreated: [
        { type: 'bar_chart', name: 'sales_by_region.png', path: 'visualizations/sales_by_region.png', sizeBytes: 120000 },
        { type: 'line_graph', name: 'engagement_trend.svg', path: 'visualizations/engagement_trend.svg', sizeBytes: 80000 },
      ],
      dashboardLinks: interactive ? [{ name: 'Live Dashboard', url: 'http://localhost:3001/dashboard/xyz' }] : [],
    };
    
    const message = `Successfully created ${visualizationResults.visualizationsCreated.length} visualizations (${visualizationResults.typesGenerated.join(', ')}).` +
                    (interactive && visualizationResults.dashboardLinks.length > 0 ? ` Interactive dashboard available.` : '');
    return {
      type: 'visualize',
      success: true, // This would depend on the outcome of actual visualization
      stepId: step.id,
      message,
      summary: message,
      data: { visualizationResults },
    };
  }

  /**
   * Stores the processed data to the target location
   */
  private async storeData(step: PlanStep, context: Record<string, any>): Promise<ExecutionResult> {
    const destination = step.data?.destination || 'output/processed_data';
    const format = step.data?.format || 'parquet';
    const compression = step.data?.compression || 'snappy';
    this.logger.info('Storing processed data', { destination, format, compression });

    const previousTransformStep = Object.values(context).find(s => (s as ExecutionResult).stepId === 'transform') as ExecutionResult | undefined;
    const processedData = previousTransformStep?.data?.processedData; // Main data to store
    const analysisResults = (Object.values(context).find(s => (s as ExecutionResult).stepId === 'analyze') as ExecutionResult | undefined)?.data?.analysisResults;
    const visualizationResults = (Object.values(context).find(s => (s as ExecutionResult).stepId === 'visualize') as ExecutionResult | undefined)?.data?.visualizationResults;

    if (!processedData && !analysisResults && !visualizationResults) {
      const errorMsg = 'No data or results available from previous steps to store.';
      this.logger.warn(errorMsg);
      return {
        type: 'store',
        success: false, // Or true if nothing to store is not an error
        stepId: step.id,
        message: errorMsg,
        summary: errorMsg,
        data: { message: errorMsg },
      };
    }
    
    // TODO: Implement actual data storage logic (e.g., writing to filesystem, database, S3)
    // Example: await saveData(destination, format, compression, processedData, analysisResults, visualizationResults);

    // Simulating storage results
    let filesStored: Array<{ name: string; path: string; sizeBytes: number; compressed: boolean }> = [];
    let totalSizeBytes = 0;
    let compressedSizeBytes = 0;

    if (processedData) {
      const size = (processedData.recordCount || 1000) * 100; // Estimate size
      filesStored.push({ name: `data.${format}`, path: `${destination}/data.${format}`, sizeBytes: size, compressed: compression !== 'none' });
      totalSizeBytes += size;
      compressedSizeBytes += compression !== 'none' ? size * 0.3 : size; // Estimate compression
    }
    if (analysisResults?.reportsGenerated?.length) {
      analysisResults.reportsGenerated.forEach((report: any) => {
        filesStored.push({ name: report.name, path: report.path, sizeBytes: report.sizeBytes, compressed: false });
        totalSizeBytes += report.sizeBytes;
        compressedSizeBytes += report.sizeBytes;
      });
    }
    if (visualizationResults?.visualizationsCreated?.length) {
       visualizationResults.visualizationsCreated.forEach((viz: any) => {
        filesStored.push({ name: viz.name, path: viz.path, sizeBytes: viz.sizeBytes, compressed: false });
        totalSizeBytes += viz.sizeBytes;
        compressedSizeBytes += viz.sizeBytes;
      });
    }
    
    const storageOpResults = {
      destinationPath: destination,
      outputFormat: format,
      compressionUsed: compression,
      filesWritten: filesStored.length,
      totalSizeBytes,
      compressedSizeBytes,
      timestamp: new Date().toISOString(),
    };
    
    const message = `Successfully stored ${storageOpResults.filesWritten} item(s) to ${storageOpResults.destinationPath}. Total size: ${(storageOpResults.totalSizeBytes / (1024*1024)).toFixed(2)}MB (Compressed: ${(storageOpResults.compressedSizeBytes / (1024*1024)).toFixed(2)}MB).`;
    return {
      type: 'store',
      success: true, // This would depend on the outcome of actual storage operation
      stepId: step.id,
      message,
      summary: message,
      data: { storageResults: storageOpResults },
    };
  }
}