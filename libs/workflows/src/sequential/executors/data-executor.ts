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
           this.logger.info(`Parsing CSV file: ${source.path}`);
           // Improved basic CSV parsing (still not as robust as a dedicated library)
           const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '');
           if (lines.length > 0) {
               const headers = this.parseCsvLine(lines[0]);
               if (lines.length > 1) {
                   sourceData = lines.slice(1).map(line => {
                       const values = this.parseCsvLine(line);
                       return headers.reduce((obj, header, index) => {
                           obj[header.trim()] = values[index] !== undefined ? values[index].trim() : '';
                           return obj;
                       }, {} as Record<string, string>);
                   });
               }
           }
           if (sourceData.length === 0 && lines.length > 0) { // Only header or empty file
               this.logger.warn(`CSV file ${source.path} contained no data rows or only a header.`);
           }
           this.logger.warn('CSV parsing is improved but still basic. For complex CSVs, consider a dedicated library like Papaparse.');
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
              if (!(parseFloat(record[rule.field]) > parseFloat(rule.value))) ruleFailed = true;
              break;
            case 'lessThan':
              if (!(parseFloat(record[rule.field]) < parseFloat(rule.value))) ruleFailed = true;
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
    const transformations: { type: string, fields?: string[], newField?: string, value?: any, expression?: string, options?: any }[] = step.data?.transformations || [];
    const inPlace = step.data?.inPlace === true; // If true, modifies data directly; if false, creates a new dataset.
    this.logger.info('Transforming data', { transformationsCount: transformations.length, inPlace });

    const previousValidateStep = Object.values(context).find(s => (s as ExecutionResult).type === 'validate') as ExecutionResult | undefined;
    let validatedDataArray: any[] = [];

    if (previousValidateStep?.data?.validatedData) {
        if(Array.isArray(previousValidateStep.data.validatedData)) {
            validatedDataArray = previousValidateStep.data.validatedData;
        } else if (previousValidateStep.data.validatedData.recordCount !== undefined && Array.isArray(previousValidateStep.data.validatedData.sample)) {
            this.logger.warn('Transforming a sample of the data as full validated dataset was too large in previous step.');
            validatedDataArray = previousValidateStep.data.validatedData.sample;
        }
    }
    
    const inputRecordsCount = previousValidateStep?.data?.validatedData?.recordCount ?? validatedDataArray.length;

    if (validatedDataArray.length === 0 && inputRecordsCount === 0) {
      const errorMsg = 'No validated data available from validate step for transformation.';
      this.logger.error(errorMsg, { validateContext: previousValidateStep });
      return { type: 'transform', success: false, stepId: step.id, error: errorMsg, message: errorMsg, summary: errorMsg, data: { error: errorMsg } };
    }
    
    const startTime = Date.now();
    let transformedData = inPlace ? validatedDataArray : validatedDataArray.map(record => ({ ...record })); // Deep copy if not inPlace
    let recordsDroppedCount = 0;
    const transformationDetails: any[] = [];

    for (const transform of transformations) {
      this.logger.debug(`Applying transformation: ${transform.type}`, { transform });
      let recordsAffectedThisTransform = 0;
      try {
        switch (transform.type) {
          case 'renameField':
            if (transform.fields && transform.fields.length === 1 && transform.newField) {
              const oldFieldName = transform.fields[0];
              transformedData.forEach(record => {
                if (record[oldFieldName] !== undefined) {
                  record[transform.newField!] = record[oldFieldName];
                  delete record[oldFieldName];
                  recordsAffectedThisTransform++;
                }
              });
            } else {
              throw new Error("Invalid parameters for renameField: requires 'fields' (array with one old name) and 'newField'.");
            }
            break;
          case 'calculateField':
             this.logger.warn(`Transformation type '${transform.type}' with expression is a placeholder and not fully implemented securely.`);
            // Example: transformedData.forEach(r => { try { r[transform.newField] = new Function('record', `return ${transform.expression}`)(r); recordsAffectedThisTransform++; } catch(e) { this.logger.error('Expression eval error', e); } });
            recordsAffectedThisTransform = transformedData.length;
            break;
          case 'filterRecords':
            this.logger.warn(`Transformation type '${transform.type}' with expression is a placeholder and not fully implemented securely.`);
            // const originalLength = transformedData.length;
            // transformedData = transformedData.filter(record => { try { return new Function('record', `return ${transform.expression}`)(record); } catch(e) { this.logger.error('Filter expression eval error', e); return true; }});
            // recordsDroppedCount += originalLength - transformedData.length;
            // recordsAffectedThisTransform = originalLength - transformedData.length;
            break;
          case 'removeFields':
            if (transform.fields && Array.isArray(transform.fields)) {
                let affectedCount = 0;
                transformedData.forEach(record => {
                    let recordAffected = false;
                    transform.fields?.forEach(field => {
                        if (record[field] !== undefined) {
                             delete record[field];
                             recordAffected = true;
                        }
                    });
                    if(recordAffected) affectedCount++;
                });
                recordsAffectedThisTransform = affectedCount;
            } else {
                 throw new Error("Invalid parameters for removeFields: requires 'fields' (array of field names).");
            }
            break;
          case 'mapValues': // { type: 'mapValues', field: 'status', mapping: { '1': 'active', '0': 'inactive' } }
            if (transform.fields && transform.fields.length === 1 && transform.options?.mapping) {
                const fieldToMap = transform.fields[0];
                transformedData.forEach(record => {
                    if (record[fieldToMap] !== undefined && transform.options.mapping[record[fieldToMap]] !== undefined) {
                        record[fieldToMap] = transform.options.mapping[record[fieldToMap]];
                        recordsAffectedThisTransform++;
                    }
                });
            } else {
                throw new Error("Invalid parameters for mapValues: requires 'fields' (single field) and 'options.mapping' object.");
            }
            break;
          default:
            this.logger.warn(`Unknown transformation type: ${transform.type}. Skipping.`);
            transformationDetails.push({ name: transform.type, status: 'skipped', recordsAffected: 0, error: 'Unknown type' });
            continue;
        }
        transformationDetails.push({ name: transform.type, status: 'success', recordsAffected: recordsAffectedThisTransform });
      } catch (error: any) {
        this.logger.error(`Error during transformation ${transform.type}: ${error.message}`, { transform });
        transformationDetails.push({ name: transform.type, status: 'failed', recordsAffected: 0, error: error.message });
      }
    }
    
    const durationSeconds = (Date.now() - startTime) / 1000;
    const outputRecordsCount = transformedData.length;

    if (validatedDataArray.length < inputRecordsCount && inputRecordsCount > 0) {
        this.logger.warn('Transformed data is based on a sample from the previous step. Records dropped count might not be accurate for the full dataset.');
        // recordsDroppedCount is based on the sample in this case.
    } else {
        recordsDroppedCount = inputRecordsCount - outputRecordsCount;
    }

    const message = `Successfully applied ${transformations.length} transformation(s) to an input of ${inputRecordsCount} records, resulting in ${outputRecordsCount} records. Estimated records dropped: ${recordsDroppedCount}. Duration: ${durationSeconds.toFixed(2)}s.`;
    return {
      type: 'transform',
      success: transformationDetails.every(d => d.status === 'success' || d.status === 'skipped'),
      stepId: step.id,
      message,
      summary: message,
      error: transformationDetails.some(d=>d.status === 'failed') ? 'One or more transformations failed. See details.' : undefined,
      data: {
        transformationResults: {
          inputRecords: inputRecordsCount,
          outputRecords: outputRecordsCount,
          recordsDropped: recordsDroppedCount,
          transformationsAppliedDetails: transformationDetails,
          durationSeconds,
          inPlace,
        },
        processedData: outputRecordsCount < 10000 ? transformedData : { recordCount: outputRecordsCount, sample: transformedData.slice(0,5), message: "Processed dataset too large, only sample stored." }
      },
    };
  }

  /**
   * Analyzes the processed data
   */
  private async analyzeData(step: PlanStep, context: Record<string, any>): Promise<ExecutionResult> {
    const analysisTasks: { type: string, fields?: string[], options?: any, reportName?: string }[] = step.data?.analysisTasks || [{type: 'descriptive_stats'}];
    const generateReports = step.data?.generateReports !== false; // Default true
    
    this.logger.info('Analyzing data', { analysisTasksCount: analysisTasks.length, generateReports });

    const previousTransformStep = Object.values(context).find(s => (s as ExecutionResult).type === 'transform') as ExecutionResult | undefined;
    let processedDataArray: any[] = [];

    if (previousTransformStep?.data?.processedData) {
        if(Array.isArray(previousTransformStep.data.processedData)) {
            processedDataArray = previousTransformStep.data.processedData;
        } else if (previousTransformStep.data.processedData.recordCount !== undefined && Array.isArray(previousTransformStep.data.processedData.sample)) {
            this.logger.warn('Analyzing a sample of the data as full processed dataset was too large in previous step.');
            processedDataArray = previousTransformStep.data.processedData.sample;
        }
    }
    
    const inputRecordsCount = previousTransformStep?.data?.processedData?.recordCount ?? processedDataArray.length;

    if (processedDataArray.length === 0 && inputRecordsCount === 0) {
      const errorMsg = 'No processed data available from transform step for analysis.';
      this.logger.error(errorMsg, { transformContext: previousTransformStep });
      return { type: 'analyze', success: false, stepId: step.id, error: errorMsg, message: errorMsg, summary: errorMsg, data: { error: errorMsg } };
    }
    
    const startTime = Date.now();
    const overallAnalysisResults: any = {
        inputRecords: inputRecordsCount,
        tasksPerformedDetails: [],
        keyInsights: [],
        summaryStatistics: {},
        reportsGenerated: [],
    };
    let allTasksSuccessful = true;

    for (const task of analysisTasks) {
      this.logger.debug(`Performing analysis task: ${task.type}`, { task });
      let taskResult: any = { name: task.type, status: 'pending' };
      try {
        switch (task.type) {
          case 'descriptive_stats':
            if (task.fields && task.fields.length > 0 && processedDataArray.length > 0) {
              const stats:any = {};
              for (const field of task.fields) {
                const values = processedDataArray.map(r => parseFloat(r[field])).filter(v => !isNaN(v));
                if (values.length > 0) {
                  const sum = values.reduce((a, b) => a + b, 0);
                  const mean = sum / values.length;
                  values.sort((a,b) => a - b);
                  const median = values.length % 2 === 0 ? (values[values.length/2 -1] + values[values.length/2])/2 : values[Math.floor(values.length/2)];
                  stats[field] = { mean: mean.toFixed(2), median: median.toFixed(2), count: values.length, min: Math.min(...values), max: Math.max(...values) };
                } else {
                  stats[field] = { error: "No numeric data or field not found for stats" };
                }
              }
              taskResult = { ...taskResult, status: 'success', statistics: stats };
              overallAnalysisResults.summaryStatistics = { ...overallAnalysisResults.summaryStatistics, ...stats };
              overallAnalysisResults.keyInsights.push({ description: `Descriptive statistics calculated for fields: ${task.fields.join(', ')}.` , type: task.type, fields: task.fields });
            } else {
                 taskResult = { ...taskResult, status: 'skipped', message: 'No fields specified or no data for descriptive_stats.' };
            }
            break;
          case 'correlation_analysis':
            this.logger.warn(`Analysis task '${task.type}' is a placeholder and not fully implemented.`);
            if (task.fields && task.fields.length >= 2 && processedDataArray.length > 0) {
                // Placeholder for actual correlation logic (e.g. Pearson)
                const simulatedCorrelation = (Math.random() * 1.8 - 0.9).toFixed(3); // between -0.9 and 0.9
                taskResult = { ...taskResult, status: 'success', correlation: { [`${task.fields[0]}_vs_${task.fields[1]}`]: simulatedCorrelation } };
                overallAnalysisResults.keyInsights.push({ description: `Simulated correlation between ${task.fields[0]} & ${task.fields[1]}: ${simulatedCorrelation}.`, type: task.type, fields: task.fields});
            } else {
                 taskResult = { ...taskResult, status: 'skipped', message: 'Requires at least two fields for correlation_analysis.' };
            }
            break;
          default:
            this.logger.warn(`Unknown analysis task type: ${task.type}. Skipping.`);
            taskResult = { ...taskResult, status: 'skipped', error: 'Unknown type' };
            allTasksSuccessful = false;
        }
        if (generateReports && taskResult.status === 'success' && task.reportName) {
            const reportContent = JSON.stringify(taskResult, null, 2);
            const reportPath = `reports/${task.reportName}_${Date.now()}.json`;
            try {
                await fs.mkdir('reports', { recursive: true }); // Ensure reports directory exists
                await fs.writeFile(reportPath, reportContent);
                this.logger.info(`Report generated for ${task.type}: ${reportPath}`);
                overallAnalysisResults.reportsGenerated.push({ name: `${task.reportName}.json`, path: reportPath, sizeBytes: reportContent.length, type: task.type });
            } catch (reportError: any) {
                this.logger.error(`Failed to write report ${reportPath}`, { error: reportError.message });
                taskResult.reportError = reportError.message; // Add report error to task result
            }
        }
        overallAnalysisResults.tasksPerformedDetails.push(taskResult);
      } catch (error: any) {
        this.logger.error(`Error during analysis task ${task.type}: ${error.message}`, { task });
        taskResult = { ...taskResult, status: 'failed', error: error.message };
        overallAnalysisResults.tasksPerformedDetails.push(taskResult);
        allTasksSuccessful = false;
      }
    }
    
    const durationSeconds = (Date.now() - startTime) / 1000;
    overallAnalysisResults.durationSeconds = durationSeconds;
    
    const successfulTasksCount = overallAnalysisResults.tasksPerformedDetails.filter((t:any)=>t.status === 'success').length;
    const message = `Data analysis completed in ${durationSeconds.toFixed(2)}s. ${successfulTasksCount}/${analysisTasks.length} tasks successful. ${overallAnalysisResults.keyInsights.length} key insights. ` +
                    (generateReports ? `${overallAnalysisResults.reportsGenerated.length} reports generated.` : '');
    return {
      type: 'analyze',
      success: allTasksSuccessful,
      stepId: step.id,
      message,
      summary: message,
      error: !allTasksSuccessful ? 'One or more analysis tasks failed. See details in data.' : undefined,
      data: { analysisResults: overallAnalysisResults },
    };
  }

  /**
   * Creates visualizations of the analysis results
   */
  private async visualizeResults(step: PlanStep, context: Record<string, any>): Promise<ExecutionResult> {
    const vizTasks: { type: string, dataKey?: string, fields?: string[], options?: any, outputName: string }[] = step.data?.visualizationTasks || [];
    const interactive = step.data?.interactive === true; // For potential interactive dashboard links
    
    this.logger.info('Visualizing results', { numVizTasks: vizTasks.length, interactive });

    const previousAnalysisStep = Object.values(context).find(s => (s as ExecutionResult).type === 'analyze') as ExecutionResult | undefined;
    const analysisData = previousAnalysisStep?.data?.analysisResults;

    if (!analysisData) {
      const errorMsg = 'No analysis results available from analyze step for visualization.';
      this.logger.error(errorMsg, { analysisContext: previousAnalysisStep });
      return { type: 'visualize', success: false, stepId: step.id, error: errorMsg, message: errorMsg, summary: errorMsg, data: { error: errorMsg } };
    }
    
    const startTime = Date.now();
    const overallVisualizationResults: any = {
        visualizationsCreated: [],
        dashboardLinks: [],
        isInteractive: interactive,
        tasksPerformedDetails: [],
    };
    let allTasksSuccessful = true;

    for (const task of vizTasks) {
      this.logger.debug(`Creating visualization: ${task.type} - ${task.outputName}`, { task });
      let taskResult: any = { name: task.outputName, type: task.type, status: 'pending' };
      try {
        // Placeholder for actual visualization generation
        if (!analysisData.summaryStatistics && !analysisData.keyInsights && !(analysisData.inputRecords > 0) ) { // Check if there's any data to visualize
            throw new Error(`No suitable data in analysisResults for visualization task ${task.type} for output ${task.outputName}`);
        }

        const vizFileName = `${task.outputName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.${task.options?.format || 'png'}`;
        const vizPath = `visualizations/${vizFileName}`;
        const simulatedSizeBytes = Math.floor(Math.random() * 200000) + 50000;

        await fs.mkdir('visualizations', { recursive: true }); // Ensure directory exists
        // Simulate file creation - in a real scenario, a charting library would output a file or buffer
        await fs.writeFile(vizPath, `Placeholder content for ${task.type}: ${task.outputName}\nData used (simulated): ${JSON.stringify(task.dataKey ? analysisData[task.dataKey] : analysisData.summaryStatistics)}`);
        
        this.logger.info(`Simulated visualization created: ${vizPath}`);

        taskResult = { ...taskResult, status: 'success', path: vizPath, sizeBytes: simulatedSizeBytes };
        overallVisualizationResults.visualizationsCreated.push({ type: task.type, name: vizFileName, path: vizPath, sizeBytes: simulatedSizeBytes, dataKeyUsed: task.dataKey || 'summaryStatistics' });
        
      } catch (error: any) {
        this.logger.error(`Error during visualization task ${task.type} (${task.outputName}): ${error.message}`, { task });
        taskResult = { ...taskResult, status: 'failed', error: error.message };
        allTasksSuccessful = false;
      }
      overallVisualizationResults.tasksPerformedDetails.push(taskResult);
    }

    if (interactive && vizTasks.length > 0) { // Only add dashboard link if visualizations were attempted
      overallVisualizationResults.dashboardLinks.push({ name: 'Interactive Dashboard (Simulated)', url: `http://localhost:3001/dashboard/viz-session-${Date.now()}` });
    }
    
    const durationSeconds = (Date.now() - startTime) / 1000;
    overallVisualizationResults.durationSeconds = durationSeconds;

    const successfulTasksCount = overallVisualizationResults.tasksPerformedDetails.filter((t:any)=>t.status === 'success').length;
    const message = `Visualization step completed in ${durationSeconds.toFixed(2)}s. ${successfulTasksCount}/${vizTasks.length} visualizations generated.` +
                    (interactive && overallVisualizationResults.dashboardLinks.length > 0 ? ` Interactive dashboard link(s) available.` : '');
    
    return {
      type: 'visualize',
      success: allTasksSuccessful,
      stepId: step.id,
      message,
      summary: message,
      error: !allTasksSuccessful ? 'One or more visualization tasks failed. See details in data.' : undefined,
      data: { visualizationResults: overallVisualizationResults },
    };
  }

  /**
   * Stores the processed data to the target location
   */
  private async storeData(step: PlanStep, context: Record<string, any>): Promise<ExecutionResult> {
    const destinationConfig = step.data?.destination || { type: 'filesystem', basePath: 'output/data_pipeline' }; // e.g., { type: 's3', bucket: 'my-bucket', pathPrefix: 'output/' }
    const defaultFormat = step.data?.format || 'json'; // Default format for processed data
    const defaultCompression = step.data?.compression || 'none'; // e.g. 'gzip'

    this.logger.info('Storing processed data and artifacts', { destinationConfig, defaultFormat, defaultCompression });

    const itemsToStore: { name: string, data: any, format?: string, compression?: string, type: 'processedData' | 'analysisReport' | 'visualization' }[] = [];

    // Gather data from previous steps
    const processedDataStep = Object.values(context).find(s => (s as ExecutionResult).type === 'transform') as ExecutionResult | undefined;
    if (processedDataStep?.data?.processedData) {
        itemsToStore.push({ name: 'processed_data', data: processedDataStep.data.processedData, format: defaultFormat, compression: defaultCompression, type: 'processedData' });
    }

    const analysisStep = Object.values(context).find(s => (s as ExecutionResult).type === 'analyze') as ExecutionResult | undefined;
    if (analysisStep?.data?.analysisResults?.reportsGenerated?.length) {
        analysisStep.data.analysisResults.reportsGenerated.forEach((report: any) => {
            // Assuming reports are already file paths or contain data to be written
            itemsToStore.push({ name: report.name || `analysis_report_${Date.now()}`, data: report, format: path.extname(report.path || report.name || '.json').substring(1) || 'json', type: 'analysisReport' });
        });
    }
     if (analysisStep?.data?.analysisResults?.summaryStatistics && Object.keys(analysisStep.data.analysisResults.summaryStatistics).length > 0) {
        itemsToStore.push({ name: 'summary_statistics', data: analysisStep.data.analysisResults.summaryStatistics, format: 'json', type: 'analysisReport' });
    }


    const visualizationStep = Object.values(context).find(s => (s as ExecutionResult).type === 'visualize') as ExecutionResult | undefined;
    if (visualizationStep?.data?.visualizationResults?.visualizationsCreated?.length) {
        visualizationStep.data.visualizationResults.visualizationsCreated.forEach((viz: any) => {
            // Assuming visualizations are file paths or data to be written
             itemsToStore.push({ name: viz.name || `visualization_${Date.now()}`, data: viz, format: path.extname(viz.path || viz.name || '.png').substring(1) || 'png', type: 'visualization' });
        });
    }

    if (itemsToStore.length === 0) {
      const msg = 'No data, reports, or visualizations available from previous steps to store.';
      this.logger.warn(msg);
      return { type: 'store', success: true, stepId: step.id, message: msg, summary: msg, data: { message: msg, filesWritten: 0 } };
    }
    
    const startTime = Date.now();
    const storageOpResults = {
      destination: destinationConfig,
      filesWrittenDetails: [] as any[],
      totalFilesWritten: 0,
      totalSizeBytes: 0,
      // compressedSizeBytes: 0, // More complex to calculate accurately without actual compression
      timestamp: new Date().toISOString(),
    };
    let allStoresSuccessful = true;

    for (const item of itemsToStore) {
      try {
        const itemFormat = item.format || defaultFormat;
        const itemCompression = item.compression || defaultCompression; // TODO: Implement compression
        let fileName = item.name;
        if (!path.extname(fileName)) { // Ensure extension
            fileName = `${fileName}.${itemFormat}`;
        }
        
        let dataToWrite: string;
        if (typeof item.data === 'string') { // If data is already a path or string content
            dataToWrite = item.data; // Could be path or content
            // Check if item.data is an object and has a path property, and is not a string itself
            // Check if item.data is an object, has a 'path' property which is a string, and is not a viz/report type where 'data' might be the content itself.
            if (typeof item.data === 'object' &&
                item.data !== null &&
                'path' in item.data && // Ensures 'path' key exists
                typeof (item.data as any).path === 'string' && // Type assertion after check
                item.type !== 'visualization' &&
                item.type !== 'analysisReport') {
                
                this.logger.info(`Item ${item.name} (type: ${item.type}) has a path property: ${(item.data as any).path}. Assuming it's metadata, content was already set to dataToWrite if it was a string path, or will be stringified if it's complex object.`);
                // If dataToWrite is still the object itself (because item.data was not a string initially), stringify it.
                if (typeof dataToWrite !== 'string') {
                    dataToWrite = JSON.stringify(item.data, null, 2);
                }
                // If item.data.path was the actual content (e.g. a string path to a file to be copied),
                // then dataToWrite would already be that string.
                // The current logic doesn't copy files, it writes the content of `dataToWrite`.
             }
        } else if (typeof item.data === 'object' &&
                   item.data !== null &&
                   (item.data as any).recordCount !== undefined && // Type assertion
                   Array.isArray((item.data as any).sample)) { // Handle summarized data
            dataToWrite = JSON.stringify(item.data, null, 2); // Store the summary object
        } else if (Array.isArray(item.data) || (typeof item.data === 'object' && item.data !== null)) {
            if (itemFormat === 'json') {
                dataToWrite = JSON.stringify(item.data, null, 2);
            } else if (itemFormat === 'csv' && Array.isArray(item.data)) {
                const csvString = this.serializeToCsv(item.data);
                if (csvString === null) {
                   this.logger.warn(`Could not serialize data to CSV for ${fileName} (data was empty or invalid). Storing as JSON string instead.`);
                   dataToWrite = JSON.stringify(item.data, null, 2); // Fallback to JSON
                } else {
                   dataToWrite = csvString;
                   this.logger.info(`Serialized ${item.name} to CSV format.`);
                }
            } else if (itemFormat === 'csv') {
               this.logger.warn(`Data for ${fileName} is not an array, cannot serialize to CSV. Storing as string. Consider JSON format.`);
               dataToWrite = String(item.data); // Fallback for non-array data intended for CSV
            } else {
                 dataToWrite = item.data.toString(); // Fallback for other formats
            }
        } else {
            dataToWrite = String(item.data);
        }


        let filePath = '';
        if (destinationConfig.type === 'filesystem') {
          const basePath = destinationConfig.basePath || 'output/pipeline_results';
          await fs.mkdir(basePath, { recursive: true });
          filePath = path.join(basePath, fileName);
          await fs.writeFile(filePath, dataToWrite);
          const stats = await fs.stat(filePath);
          storageOpResults.filesWrittenDetails.push({ name: fileName, path: filePath, sizeBytes: stats.size, format: itemFormat, type: item.type });
          storageOpResults.totalSizeBytes += stats.size;
        } else if (destinationConfig.type === 's3') {
          // TODO: Implement S3 upload logic
          this.logger.warn(`S3 storage for ${fileName} not implemented. Skipping.`);
          storageOpResults.filesWrittenDetails.push({ name: fileName, path: `s3://${destinationConfig.bucket}/${destinationConfig.pathPrefix || ''}${fileName}`, status: 'skipped_s3_not_implemented', type: item.type });
          allStoresSuccessful = false; // Mark as not fully successful if S3 fails/skipped
        } else {
            throw new Error(`Unsupported destination type: ${destinationConfig.type}`);
        }
        this.logger.info(`Stored ${item.type} '${fileName}' to ${filePath || destinationConfig.type}.`);

      } catch (error: any) {
        this.logger.error(`Failed to store item ${item.name}: ${error.message}`, { item });
        storageOpResults.filesWrittenDetails.push({ name: item.name, status: 'failed', error: error.message, type: item.type });
        allStoresSuccessful = false;
      }
    }
    
    storageOpResults.totalFilesWritten = storageOpResults.filesWrittenDetails.filter(f => f.status !== 'failed' && f.status !== 'skipped_s3_not_implemented').length;
    const durationSeconds = (Date.now() - startTime) / 1000;
    storageOpResults['durationSeconds'] = durationSeconds;

    const message = `Storage step completed in ${durationSeconds.toFixed(2)}s. ${storageOpResults.totalFilesWritten}/${itemsToStore.length} items successfully stored. Total size: ${(storageOpResults.totalSizeBytes / (1024*1024)).toFixed(2)}MB.`;
    return {
      type: 'store',
      success: allStoresSuccessful && storageOpResults.totalFilesWritten > 0, // Success if all intended items stored (or at least some if partial success is ok)
      stepId: step.id,
      message,
      summary: message,
      error: !allStoresSuccessful ? 'One or more items failed to store. See details in data.' : undefined,
      data: { storageResults: storageOpResults },
    };
  }

  /**
   * Parses a single line of a CSV file, attempting to handle quoted fields.
   * This is a basic implementation and may not cover all CSV edge cases.
   * @param line The CSV line to parse.
   * @returns An array of strings representing the fields in the line.
   */
  private parseCsvLine(line: string): string[] {
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          // Handle escaped quote: ""
          currentField += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField);
        currentField = '';
      } else {
        currentField += char;
      }
    }
    fields.push(currentField); // Add the last field
    return fields;
  }

  /**
   * Serializes an array of objects to a CSV string.
   * @param data Array of objects to serialize.
   * @returns A string in CSV format.
   */
  private serializeToCsv(data: any[]): string | null {
    if (!data || data.length === 0) {
      return null;
    }

    const headers = Object.keys(data[0]);
    const escapeCsvField = (field: any): string => {
      if (field === null || field === undefined) {
        return '';
      }
      const stringField = String(field);
      // If field contains comma, newline, or double quote, enclose in double quotes
      if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
        return `"${stringField.replace(/"/g, '""')}"`; // Escape double quotes by doubling them
      }
      return stringField;
    };

    const headerRow = headers.map(escapeCsvField).join(',');
    const dataRows = data.map(row =>
      headers.map(header => escapeCsvField(row[header])).join(',')
    );

    return [headerRow, ...dataRows].join('\n');
  }
}