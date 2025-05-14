import { PlanStep, ExecutionResult } from "../types";
import { BaseExecutor } from './base-executor';
import configManager, { ConfigType } from '../../../../core/src/config/config-manager';
import { ClaudeError } from '../../../../core/src/error/error-handler';
import * as fs from 'fs/promises';
import * as path from 'path';
import fetch from 'node-fetch'; // Import für API-Aufrufe hinzufügen
import Ajv, { ValidateFunction } from 'ajv'; // Import für JSON-Schema-Validierung und ValidateFunction
import addFormats from 'ajv-formats'; // Import für zusätzliche Formate in Ajv
import * as zlib from 'zlib'; // Import für Komprimierung
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
  async executeStep(step: PlanStep, context: Record<string, unknown>): Promise<ExecutionResult> { // any zu unknown
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
    } catch (error: unknown) { // any zu unknown
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
    const sources: {
      type: string,
      path?: string,
      url?: string,
      query?: string,
      format?: string,
      // DB specific fields
      dbType?: string,
      connectionDetails?: any, // Can be a connection string or object
      // Allow other data fields for specific source types
      [key: string]: any;
    }[] = step.data?.sources || [];
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
          this.logger.info(`Collecting from API: ${source.url} (format: ${sourceFormat})`);
          const response = await fetch(source.url);
          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
          }
          if (sourceFormat === 'json') {
            const jsonData = await response.json();
            sourceData = Array.isArray(jsonData) ? jsonData : [jsonData];
          } else if (sourceFormat === 'csv') {
            const csvText = await response.text();
            const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
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
            if (sourceData.length === 0 && lines.length > 0) {
                this.logger.warn(`API CSV response from ${source.url} contained no data rows or only a header.`);
            }
          } else {
            // Fallback to text if format is not json or csv
            const textData = await response.text();
            sourceData = [textData]; // Store as an array with a single string element
            this.logger.info(`API response from ${source.url} treated as plain text.`);
          }
          sourceRecordCount = sourceData.length;
          allRawData.push(...sourceData);
          totalRecordsCollected += sourceRecordCount;
          status = 'success';
        } else if (source.type === 'database') {
          const { query, dbType, connectionDetails } = source;
          if (!query || !dbType || !connectionDetails) {
            errorMsg = `Database source type requires 'query', 'dbType', and 'connectionDetails' directly on the source object.`;
            this.logger.error(errorMsg, { source });
            status = 'failed_missing_config';
            collectionErrors.push({ source: `db_query: ${query || 'N/A'}`, error: errorMsg });
          } else {
            // TODO: Implement Database querying logic for various dbTypes.
            // This requires specific DB drivers (e.g., 'pg' for PostgreSQL, 'mysql2' for MySQL, 'mongodb' for MongoDB).
            // Example structure:
            // switch (dbType) {
            //   case 'postgres':
            //     // const pgClient = new pg.Client(connectionDetails); await pgClient.connect();
            //     // const res = await pgClient.query(query); sourceData = res.rows; await pgClient.end();
            //     break;
            //   case 'mongodb':
            //     // const mongoClient = new MongoClient(connectionDetails.uri); await mongoClient.connect();
            //     // const db = mongoClient.db(connectionDetails.database);
            //     // sourceData = await db.collection(connectionDetails.collection).find(JSON.parse(query || '{}')).toArray(); // Query might be a JSON string for Mongo
            //     // await mongoClient.close();
            //     break;
            //   default:
            //     errorMsg = `Unsupported database type: ${dbType}.`;
            // }
            // For now, mark as not implemented.
            status = 'skipped_not_implemented';
            errorMsg = `Database collection for dbType "${dbType}" with query "${query}" not yet implemented. Requires specific database driver integration.`;
            this.logger.warn(errorMsg, { source });
            collectionErrors.push({ source: `db_query (${dbType}): ${query}`, error: errorMsg });
          }
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
    let ajvValidate: ValidateFunction | undefined;

    if (validateSchema && schemaDefinition) {
      this.logger.info('Schema validation is configured. Attempting to load and compile schema.');
      try {
        const ajv = new Ajv({ allErrors: true });
        addFormats(ajv); // Fügt Formate wie date-time, email, etc. hinzu
        const schema = typeof schemaDefinition === 'string'
          ? JSON.parse(await fs.readFile(schemaDefinition, 'utf-8'))
          : schemaDefinition;
        ajvValidate = ajv.compile(schema);
        this.logger.info('JSON Schema compiled successfully.');
      } catch (err: any) {
         this.logger.error('Failed to load or compile schema definition. Schema validation will be skipped.', { schemaDefinition, error: err.message });
         // Optional: Decide if this is a fatal error for the validation step
         // return { type: 'validate', success: false, stepId: step.id, error: `Schema compilation failed: ${err.message}`, ... };
      }
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
      
      if (ajvValidate) { // Führe Schema-Validierung durch, wenn ajvValidate definiert ist
        if (!ajvValidate(record)) {
          isValidRecord = false;
          issuesFound.schemaViolations++;
          ajvValidate.errors?.forEach(err => {
            const path = err.instancePath || (err.params as any)?.missingProperty || (err.params as any)?.additionalProperty || 'record';
            recordIssues.push(`Schema error: '${path}' ${err.message}`);
          });
        }
      }

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
          case 'calculateField': {
            // Expects transform.options: { fieldToCalculate: string, operation: 'add'|'subtract'|'multiply'|'divide'|'set', value?: any, operandField?: string }
            const opts = transform.options;
            if (!opts || !opts.fieldToCalculate || !opts.operation) {
              throw new Error("calculateField requires 'options' with 'fieldToCalculate' and 'operation'.");
            }
            if (opts.operation !== 'set' && (opts.value === undefined && !opts.operandField)) {
                throw new Error("calculateField operations (add, subtract, etc.) require 'value' or 'operandField'.");
            }

            transformedData.forEach(record => {
              try {
                const baseValue = opts.operandField ? parseFloat(record[opts.operandField]) : parseFloat(record[opts.fieldToCalculate]); // Use fieldToCalculate if operandField is not given for unary-like ops
                const operationValue = opts.value !== undefined ? parseFloat(opts.value) : (opts.operandField && record[opts.operandField] !== undefined ? parseFloat(record[opts.operandField]) : undefined);


                if (opts.operation === 'set') {
                    record[opts.fieldToCalculate] = opts.value;
                    recordsAffectedThisTransform++;
                    return;
                }

                // Ensure baseValue is a number for arithmetic operations if it's the target field
                if (opts.operandField === undefined && isNaN(baseValue) && record[opts.fieldToCalculate] !== undefined) {
                     this.logger.warn(`Field '${opts.fieldToCalculate}' is not a number for record. Skipping calculation.`);
                     return;
                }
                 // Ensure operationValue is a number if value is provided
                if (opts.value !== undefined && isNaN(operationValue as number) && opts.operation !== 'set') {
                    this.logger.warn(`Provided 'value' for operation '${opts.operation}' is not a number. Skipping calculation for record.`);
                    return;
                }
                 // Ensure operandField's value is a number if provided
                if (opts.operandField && record[opts.operandField] !== undefined && isNaN(parseFloat(record[opts.operandField]))) {
                    this.logger.warn(`Operand field '${opts.operandField}' is not a number for record. Skipping calculation.`);
                    return;
                }


                let result;
                const valToOperate = operationValue !== undefined ? operationValue : (opts.operandField ? parseFloat(record[opts.operandField]) : undefined);
                const targetVal = parseFloat(record[opts.fieldToCalculate]);


                if (valToOperate === undefined && opts.operation !== 'set') {
                    this.logger.warn(`No value or valid operandField for operation '${opts.operation}' on field '${opts.fieldToCalculate}'. Skipping.`);
                    return;
                }


                switch (opts.operation) {
                  case 'add': result = targetVal + valToOperate!; break;
                  case 'subtract': result = targetVal - valToOperate!; break;
                  case 'multiply': result = targetVal * valToOperate!; break;
                  case 'divide':
                    if (valToOperate === 0) { this.logger.warn(`Division by zero for field '${opts.fieldToCalculate}'. Skipping.`); return; }
                    result = targetVal / valToOperate!;
                    break;
                  default: this.logger.warn(`Unsupported operation '${opts.operation}' for calculateField.`); return;
                }
                if (result !== undefined && !isNaN(result)) {
                    record[opts.fieldToCalculate] = result;
                    recordsAffectedThisTransform++;
                } else if (result !== undefined && isNaN(result)) {
                    this.logger.warn(`Calculation for field '${opts.fieldToCalculate}' resulted in NaN. Original value kept.`);
                }

              } catch (e: any) {
                this.logger.error(`Error evaluating calculateField for record: ${e.message}`, { record, transform });
              }
            });
            break;
          }
          case 'filterRecords': {
            // Expects transform.options: { field: string, operation: 'equals'|'notEquals'|'greaterThan'|'lessThan'|'contains'|'startsWith'|'endsWith'|'matchesRegex', value?: any, regex?: string }
            const opts = transform.options;
            if (!opts || !opts.field || !opts.operation) {
              throw new Error("filterRecords requires 'options' with 'field' and 'operation'.");
            }
            if (opts.operation !== 'matchesRegex' && opts.value === undefined) {
                throw new Error("filterRecords operations (except matchesRegex) require 'value'.");
            }
            if (opts.operation === 'matchesRegex' && !opts.regex) {
                throw new Error("filterRecords operation 'matchesRegex' requires 'regex'.");
            }

            const originalLength = transformedData.length;
            transformedData = transformedData.filter(record => {
              try {
                const recordValue = record[opts.field];
                if (recordValue === undefined && opts.operation !== 'equals' && opts.operation !== 'notEquals') { // Allow checking for undefined/null with equals/notEquals
                    return false; // Or true, depending on desired behavior for missing fields in other ops
                }

                switch (opts.operation) {
                  case 'equals': return recordValue == opts.value; // Use == for type coercion flexibility if desired, or === for strict
                  case 'notEquals': return recordValue != opts.value;
                  case 'greaterThan': return parseFloat(recordValue) > parseFloat(opts.value);
                  case 'lessThan': return parseFloat(recordValue) < parseFloat(opts.value);
                  case 'contains': return String(recordValue).toLowerCase().includes(String(opts.value).toLowerCase());
                  case 'startsWith': return String(recordValue).toLowerCase().startsWith(String(opts.value).toLowerCase());
                  case 'endsWith': return String(recordValue).toLowerCase().endsWith(String(opts.value).toLowerCase());
                  case 'matchesRegex': return new RegExp(opts.regex!).test(String(recordValue));
                  default: this.logger.warn(`Unsupported operation '${opts.operation}' for filterRecords.`); return true; // Keep record if op unknown
                }
              } catch (e: any) {
                this.logger.error(`Error evaluating filterRecords for record: ${e.message}`, { record, transform });
                return true; // Keep record on error to be safe
              }
            });
            recordsAffectedThisTransform = originalLength - transformedData.length;
            break;
          }
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
          case 'correlation_analysis': {
            if (!task.fields || task.fields.length < 2) {
              taskResult = { ...taskResult, status: 'failed', error: 'Correlation analysis requires at least two fields in task.fields.' };
              allTasksSuccessful = false;
              break;
            }
            if (processedDataArray.length === 0) {
                taskResult = { ...taskResult, status: 'skipped', message: 'No data to analyze for correlation.' };
                break;
            }

            const field1Name = task.fields[0];
            const field2Name = task.fields[1];
            
            const values1 = processedDataArray.map(r => parseFloat(r[field1Name])).filter(v => !isNaN(v));
            const values2 = processedDataArray.map(r => parseFloat(r[field2Name])).filter(v => !isNaN(v));

            if (values1.length !== values2.length || values1.length === 0) {
              const errorDetail = values1.length !== values2.length ? `Field arrays have different lengths after filtering non-numeric values (${values1.length} vs ${values2.length}).` : 'No valid numeric data pairs found for correlation.';
              this.logger.warn(`Cannot calculate correlation for ${field1Name} and ${field2Name}: ${errorDetail}`);
              taskResult = { ...taskResult, status: 'failed', error: `Insufficient or mismatched valid numeric data for ${field1Name} and ${field2Name}. ${errorDetail}` };
              allTasksSuccessful = false;
              break;
            }

            // Calculate Pearson correlation coefficient
            const n = values1.length;
            const sumX = values1.reduce((s, v) => s + v, 0);
            const sumY = values2.reduce((s, v) => s + v, 0);
            const sumXY = values1.reduce((s, v, i) => s + v * values2[i], 0);
            const sumX2 = values1.reduce((s, v) => s + v * v, 0);
            const sumY2 = values2.reduce((s, v) => s + v * v, 0);

            const numerator = n * sumXY - sumX * sumY;
            const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

            if (denominator === 0) {
              taskResult = { ...taskResult, status: 'success', correlation: { [`${field1Name}_vs_${field2Name}`]: 'N/A (denominator is zero)' }, message: `Correlation between ${field1Name} and ${field2Name} cannot be calculated (denominator is zero, likely constant values).` };
            } else {
              const correlation = (numerator / denominator).toFixed(4);
              let interpretation = "weak";
              const absCorr = Math.abs(parseFloat(correlation));
              if (absCorr >= 0.7) interpretation = "strong";
              else if (absCorr >= 0.4) interpretation = "moderate";
              
              if (parseFloat(correlation) < -0.00001) interpretation += " negative"; // check for actual negative, not just floating point noise around 0
              else if (parseFloat(correlation) > 0.00001) interpretation += " positive"; // check for actual positive
              else interpretation = "no linear"; // if very close to zero
              
              const message = `Correlation between '${field1Name}' & '${field2Name}': ${correlation} (${interpretation} correlation). Based on ${n} valid data pairs.`;
              this.logger.info(message);
              taskResult = {
                  ...taskResult,
                  status: 'success',
                  correlation: { [`${field1Name}_vs_${field2Name}`]: correlation },
                  interpretation,
                  sampleSize: n,
                  message
              };
              overallAnalysisResults.keyInsights.push({ description: message, type: task.type, fields: [field1Name, field2Name], value: correlation });
            }
            break;
          }
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
        let vizContent: string = '';
        let vizFormat = (task.options?.format || 'svg').toLowerCase();
        let vizSizeBytes = 0;
        let taskStatus = 'pending';

        // Ensure analysisData has the necessary structure
        const dataForViz = task.dataKey ? analysisData[task.dataKey] : analysisData.summaryStatistics || analysisData.keyInsights || analysisData;

        if (!dataForViz || (Array.isArray(dataForViz) && dataForViz.length === 0) || (typeof dataForViz === 'object' && Object.keys(dataForViz).length === 0 && analysisData.inputRecords === 0) ) {
            this.logger.warn(`No suitable data in analysisResults (key: ${task.dataKey || 'default'}) for visualization task ${task.type} for output ${task.outputName}. Skipping.`);
            taskResult = { ...taskResult, status: 'skipped_no_data', message: `No data from analysis (key: ${task.dataKey || 'default'}) to visualize.`};
            allTasksSuccessful = false; // Or true if skipping is acceptable
        } else {
            this.logger.info(`Generating visualization for ${task.type} - ${task.outputName} using dataKey: ${task.dataKey || 'summaryStatistics (default)' }`);
            switch (task.type.toLowerCase()) {
              case 'barchart_svg':
                // Expects dataForViz to be an object like { categoryA: 10, categoryB: 20 } or an array of {label: string, value: number}
                vizContent = this.generateSimpleBarChartSVG(dataForViz, task.options);
                vizFormat = 'svg';
                taskStatus = 'success';
                break;
              case 'text_summary':
                vizContent = `Text Summary for ${task.outputName}:\n${JSON.stringify(dataForViz, null, 2)}`;
                vizFormat = 'txt';
                taskStatus = 'success';
                break;
              default:
                this.logger.warn(`Unsupported visualization type: ${task.type}. Creating a placeholder JSON dump.`);
                vizContent = `Placeholder for ${task.type} - ${task.outputName}\nData:\n${JSON.stringify(dataForViz, null, 2)}`;
                vizFormat = 'txt';
                taskStatus = 'success_placeholder'; // Indicates it's a placeholder
            }

            const vizFileName = `${task.outputName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.${vizFormat}`;
            const vizPath = `visualizations/${vizFileName}`;
            
            await fs.mkdir('visualizations', { recursive: true });
            await fs.writeFile(vizPath, vizContent);
            const stats = await fs.stat(vizPath);
            vizSizeBytes = stats.size;
            
            this.logger.info(`Generated visualization file: ${vizPath} (${vizSizeBytes} bytes)`);
            taskResult = { ...taskResult, status: taskStatus, path: vizPath, sizeBytes: vizSizeBytes, format: vizFormat, message: `${task.type} generated.` };
            overallVisualizationResults.visualizationsCreated.push({
                type: task.type,
                name: vizFileName,
                path: vizPath,
                sizeBytes: vizSizeBytes,
                dataKeyUsed: task.dataKey || 'summaryStatistics (default)',
                statusMessage: taskStatus
            });
        }
      } catch (error: any) {
        this.logger.error(`Error during (simulated) visualization task ${task.type} (${task.outputName}): ${error.message}`, { task });
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
        let itemCompression = item.compression || defaultCompression; // Make it let to modify if needed
        
        let fileName = item.name;
        if (!path.extname(fileName)) { // Ensure extension based on format
            fileName = `${fileName}.${itemFormat}`;
        }

        let dataBuffer: Buffer;
        let originalDataString: string;

        if (typeof item.data === 'string') {
            originalDataString = item.data;
        } else if (typeof item.data === 'object' && item.data !== null && (item.data as any).recordCount !== undefined && Array.isArray((item.data as any).sample)) {
            originalDataString = JSON.stringify(item.data, null, 2);
        } else if (Array.isArray(item.data) || (typeof item.data === 'object' && item.data !== null)) {
            if (itemFormat === 'json') {
                originalDataString = JSON.stringify(item.data, null, 2);
            } else if (itemFormat === 'csv' && Array.isArray(item.data)) {
                const csvString = this.serializeToCsv(item.data);
                if (csvString === null) {
                   this.logger.warn(`Could not serialize data to CSV for ${fileName}. Storing as JSON string instead.`);
                   originalDataString = JSON.stringify(item.data, null, 2); // Fallback to JSON
                } else {
                   originalDataString = csvString;
                }
            } else {
                 originalDataString = String(item.data);
            }
        } else {
            originalDataString = String(item.data);
        }
        dataBuffer = Buffer.from(originalDataString, 'utf-8');

        if (itemCompression === 'gzip') {
            try {
                dataBuffer = zlib.gzipSync(dataBuffer);
                if (!fileName.endsWith('.gz')) {
                    fileName += '.gz';
                }
                this.logger.info(`Compressed item '${item.name}' using gzip. New filename: ${fileName}`);
            } catch (compressError: any) {
                this.logger.error(`Failed to compress item ${item.name} with gzip: ${compressError.message}. Storing uncompressed.`, { error: compressError });
                itemCompression = 'none'; // Fallback to no compression
                // dataBuffer remains the original uncompressed buffer
            }
        } else if (itemCompression !== 'none') {
             this.logger.warn(`Unsupported compression type '${itemCompression}' for item '${item.name}'. Storing uncompressed.`);
             itemCompression = 'none';
        }
        
        let filePath = '';
        if (destinationConfig.type === 'filesystem') {
          const basePath = destinationConfig.basePath || 'output/pipeline_results';
          await fs.mkdir(basePath, { recursive: true });
          filePath = path.join(basePath, fileName);
          await fs.writeFile(filePath, dataBuffer); // Write buffer
          const stats = await fs.stat(filePath);
          storageOpResults.filesWrittenDetails.push({ name: fileName, path: filePath, sizeBytes: stats.size, format: itemFormat, type: item.type, compression: itemCompression });
          storageOpResults.totalSizeBytes += stats.size;
        } else if (destinationConfig.type === 's3') {
          // TODO: Implement S3 upload logic using AWS SDK.
          // Ensure to pass the `dataBuffer` to the S3 client's PutObjectCommand.
          // Example:
          // import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
          // const s3Client = new S3Client({ region: "your-region" }); // Configure client
          // const putParams = {
          //   Bucket: destinationConfig.bucket,
          //   Key: `${destinationConfig.pathPrefix || ''}${fileName}`,
          //   Body: dataBuffer,
          //   ContentType: itemFormat === 'json' ? 'application/json' : (itemFormat === 'csv' ? 'text/csv' : 'application/octet-stream'),
          //   ContentEncoding: itemCompression === 'gzip' ? 'gzip' : undefined
          // };
          // await s3Client.send(new PutObjectCommand(putParams));
          this.logger.warn(`S3 storage for '${fileName}' to bucket '${destinationConfig.bucket || 'N/A'}' is NOT IMPLEMENTED. Skipping S3 upload.`);
          storageOpResults.filesWrittenDetails.push({ name: fileName, path: `s3://${destinationConfig.bucket || 'unknown-bucket'}/${destinationConfig.pathPrefix || ''}${fileName}`, status: 'skipped_s3_not_implemented', type: item.type, format: itemFormat, compression: itemCompression });
          allStoresSuccessful = false; // Mark as not fully successful if S3 fails/skipped
        } else {
            throw new Error(`Unsupported destination type: ${destinationConfig.type}`);
        }
        if (destinationConfig.type === 'filesystem') {
             this.logger.info(`Stored ${item.type} '${fileName}' to ${filePath}.`);
        }

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

private generateSimpleBarChartSVG(data: any, options?: any): string {
    const chartWidth = options?.width || 500;
    const chartHeight = options?.height || 300;
    const barColor = options?.barColor || 'steelblue';
    const padding = { top: 20, right: 20, bottom: 30, left: 40 }; // Adjusted bottom for labels

    let dataPoints: { label: string; value: number }[] = [];

    if (Array.isArray(data)) {
      // Assuming array of {label: string, value: number}
      dataPoints = data.filter(item => typeof item.label === 'string' && typeof item.value === 'number');
    } else if (typeof data === 'object' && data !== null) {
      // Assuming object like { categoryA: 10, categoryB: 20 }
      dataPoints = Object.entries(data)
        .filter(([key, value]) => typeof value === 'number')
        .map(([key, value]) => ({ label: key, value: value as number }));
    }

    if (dataPoints.length === 0) {
      return `<svg width="${chartWidth}" height="${chartHeight}" xmlns="http://www.w3.org/2000/svg"><text x="10" y="20">No data to display for bar chart.</text></svg>`;
    }

    const values = dataPoints.map(d => d.value);
    const maxValue = Math.max(0, ...values); // Ensure maxValue is not negative
    const numBars = dataPoints.length;
    
    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;

    // Ensure barWidth is at least 1, even with many bars or small plotWidth
    const barWidth = Math.max(1, plotWidth / numBars - (options?.barPadding || 5));
    const yScale = maxValue > 0 ? plotHeight / maxValue : 0; // Prevent division by zero if maxValue is 0

    let svgElements = `<svg width="${chartWidth}" height="${chartHeight}" xmlns="http://www.w3.org/2000/svg" style="font-family: sans-serif; font-size: 10px;">`;
    svgElements += `<rect width="100%" height="100%" fill="white"/>`; // Background

    // Bars and Labels
    dataPoints.forEach((d, i) => {
      const barHeight = Math.max(0, d.value * yScale); // Ensure barHeight is not negative
      const x = padding.left + i * (barWidth + (options?.barPadding || 5));
      const y = padding.top + plotHeight - barHeight;

      svgElements += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${barColor}" />`;
      // Label below bar
      svgElements += `<text x="${x + barWidth / 2}" y="${padding.top + plotHeight + 15}" text-anchor="middle" fill="black">${d.label}</text>`;
      // Value on top of bar (optional, can be cluttered)
      if (options?.showValues) {
         svgElements += `<text x="${x + barWidth / 2}" y="${y - 5}" text-anchor="middle" fill="black" font-size="9px">${d.value}</text>`;
      }
    });
    
    // Basic Y-Axis (line and max value)
    svgElements += `<line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + plotHeight}" stroke="black"/>`;
    svgElements += `<text x="${padding.left - 5}" y="${padding.top}" text-anchor="end" dominant-baseline="middle" fill="black">${maxValue.toFixed(0)}</text>`;
    svgElements += `<text x="${padding.left - 5}" y="${padding.top + plotHeight}" text-anchor="end" dominant-baseline="middle" fill="black">0</text>`;

    // Basic X-Axis (line)
    svgElements += `<line x1="${padding.left}" y1="${padding.top + plotHeight}" x2="${padding.left + plotWidth}" y2="${padding.top + plotHeight}" stroke="black"/>`;


    svgElements += `</svg>`;
    return svgElements;
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
