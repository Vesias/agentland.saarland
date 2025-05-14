
import { PlanStep, ExecutionResult } from "../types";
import { BaseExecutor } from './base-executor';
import configManager, { ConfigType } from '../../../../core/src/config/config-manager';
import { ClaudeError } from '../../../../core/src/error/error-handler';
import { glob } from 'glob';
import * as fs from 'fs/promises';
import * as path from 'path';
import fetch from 'node-fetch'; // Import für HTTP-Anfragen in validateDocumentation
// Für AST-Parsing könnte man Bibliotheken wie @babel/parser, typescript oder esprima verwenden.
// import { parse } from '@babel/parser';
// import * as ts from 'typescript';

interface DocElementTag {
  tag: string;
  type?: string;
  name?: string;
  description?: string;
}

interface DocElementParam {
  name: string;
  type?: string;
  optional?: boolean;
  default?: string;
  description?: string;
}

interface DocElementReturn {
  type?: string;
  description?: string;
}

interface DocElement {
  itemType: 'jsdoc' | 'function' | 'class' | 'interface' | 'export' | 'todo' | 'comment_block' | string;
  name?: string;
  line: number;
  description?: string;
  content?: string;
  tags?: DocElementTag[];
  raw?: string;
  params?: DocElementParam[]; // Geändert von parameters zu params für Konsistenz
  isAsync?: boolean; // Hinzugefügt für Funktionen
  returnType?: string;
  returns?: DocElementReturn;
  extends?: string | null;
  filePath?: string;
  associatedElementName?: string;
  exportType?: string;
}

interface OpenApiInfo {
  title?: string;
  version?: string;
  description?: string;
}

interface OpenApiParameter {
    name: string;
    in: string;
    schema?: { type?: string };
    description?: string;
}

interface OpenApiOperation {
    summary?: string;
    description?: string;
    parameters?: OpenApiParameter[];
    responses?: Record<string, { description?: string }>;
    // Weitere OpenAPI Operation Eigenschaften
}

interface OpenApiPathItem {
    [method: string]: OpenApiOperation;
}

interface OpenApiSpec {
  openapi?: string;
  swagger?: string;
  info?: OpenApiInfo;
  paths?: Record<string, OpenApiPathItem>;
  components?: Record<string, unknown>;
  rawContent?: string;
  format?: 'json' | 'yaml_raw';
}


/**
 * Documentation-specific execution implementation.
 * Handles the execution of documentation generation steps.
 */
export class DocumentationExecutor extends BaseExecutor {
  constructor() {
    super('documentation');
  }

  /**
   * Executes a documentation plan step
   * 
   * @param step The plan step to execute
   * @param context Execution context with data from previous steps
   * @returns Result of the execution
   */
  async executeStep(step: PlanStep, context: Record<string, unknown>): Promise<ExecutionResult> { // any zu unknown
    this.logger.debug(`Executing documentation step: ${step.id}`, { step });
    
    try {
      const config = configManager.getConfig(ConfigType.GLOBAL); // Or a more specific config
      
      switch(step.id) {
        case 'analyze':
          return await this.analyzeCodebase(step, context);
        case 'extract':
          return await this.extractDocumentation(step, context);
        case 'generate':
          return await this.generateDocumentation(step, context);
        case 'validate':
          return await this.validateDocumentation(step, context);
        case 'api-docs':
          return await this.generateApiDocs(step, context);
        default:
          throw new ClaudeError(`Unknown documentation step: ${step.id}`);
      }
    } catch (error: unknown) { // any zu unknown
      this.logger.error(`Error executing documentation step ${step.id}`, { error });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        type: step.actionType || step.id,
        success: false,
        stepId: step.id,
        error: errorMessage,
        summary: `Error in documentation step ${step.id}: ${errorMessage}`,
        data: { error }
      };
    }
  }

  /**
   * Analyzes the codebase to identify components requiring documentation
   */
  private async analyzeCodebase(step: PlanStep, context: Record<string, unknown>): Promise<ExecutionResult> {
    const patterns: string[] = step.data?.patterns || ['**/*.ts', '**/*.tsx', '!**/*.spec.ts', '!**/node_modules/**'];
    const basePath = step.data?.basePath || '.';
    this.logger.info('Analyzing codebase structure with enhanced regex', { patterns, basePath });

    let analyzedFiles: {
      path: string,
      type: string,
      lastModified?: string,
      needsDocumentation: boolean,
      coverage?: number,
      elements: DocElement[], // To store extracted JSDoc, functions, classes, etc.
      elementsCount?: number,
      error?: string
    }[] = [];
    let filesFoundCount = 0;
    let filesRequiringDocsCount = 0;

    try {
      const matchedFiles = await glob(patterns, { cwd: basePath, nodir: true, dot: false, ignore: step.data?.ignorePatterns || ['**/node_modules/**', '**/.git/**'] });
      filesFoundCount = matchedFiles.length;

      for (const filePath of matchedFiles) {
        const fullPath = path.join(basePath, filePath);
        try {
          const stats = await fs.stat(fullPath);
          const fileExtension = path.extname(filePath).toLowerCase();
          let type = 'unknown';
          if (['.ts', '.js'].includes(fileExtension)) type = 'module';
          if (['.tsx', '.jsx'].includes(fileExtension)) type = 'component';
          
          this.logger.debug(`Analyzing file ${fullPath} for documentation needs.`);
          let fileContentForAnalysis = "";
          try {
            fileContentForAnalysis = await fs.readFile(fullPath, 'utf-8');
          } catch (readError: unknown) {
            const readErrorMsg = readError instanceof Error ? readError.message : String(readError);
            this.logger.warn(`Could not read file ${fullPath} for analysis: ${readErrorMsg}`);
            analyzedFiles.push({ path: filePath, type, lastModified: stats.mtime.toISOString(), needsDocumentation: true, coverage: 0, elements: [], elementsCount: 0, error: 'File read error' });
            filesRequiringDocsCount++;
            continue;
          }

          const fileElements: DocElement[] = [];
          let match;

          // Regex for JSDoc blocks (captures content including tags)
          const jsdocRegex = /\/\*\*\s*([\s\S]*?)\s*\*\//g;
          // Regex for single-line comments
          const singleLineCommentRegex = /\/\/\s*(.*)/g;
          // Regex for TODOs specifically
          const todoRegex = /\/\/\s*TODO[:\s](.*)/gi;
          // Improved function regex: captures async, name, parameters (more robustly), and return type hint
          const functionRegex = /(async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\)\s*(?::\s*([^{;]*?)\s*)?(?:\{|\=\>)/g;
          // Class regex: captures name, extends
          const classRegex = /class\s+([a-zA-Z0-9_]+)(?:\s+extends\s+([a-zA-Z0-9_<>,\s]+))?\s*\{/g;
          // Interface regex: captures name
          const interfaceRegex = /interface\s+([a-zA-Z0-9_]+)\s*\{/g;
          const importRegex = /import\s+(?:(?:\{[^}]+\})|\w+|\*)\s+from\s+['"]([^'"]+)['"];/g;
          const exportRegex = /export\s+(?:async\s+)?(const|let|var|function|class|interface|type|enum)\s+([a-zA-Z0-9_]+)/g;

          // Extract JSDoc blocks
          while ((match = jsdocRegex.exec(fileContentForAnalysis)) !== null) {
            const jsdocContent = match[1].trim();
            interface JSDocTag {
              tag: string;
              type?: string;
              name?: string;
              description?: string;
            }
            const tags: JSDocTag[] = [];
            const tagRegex = /@(\w+)\s*(?:\{([^}]+)\})?\s*([a-zA-Z0-9_$.[\]]+)?\s*([^-][\s\S]*?)?(?=\s*@|$)/g;
            let tagMatch;
            while((tagMatch = tagRegex.exec(jsdocContent)) !== null) {
              tags.push({
                  tag: tagMatch[1],
                  type: tagMatch[2] ? tagMatch[2].trim() : undefined,
                  name: tagMatch[3] ? tagMatch[3].trim() : undefined,
                  description: tagMatch[4] ? tagMatch[4].trim().replace(/^-/, '').trim() : undefined,
              });
            }
            const description = jsdocContent.split('@')[0].trim().replace(/^\s*\*\s?/gm, '').trim();
            fileElements.push({ itemType: 'jsdoc', description, tags, raw: jsdocContent, line: fileContentForAnalysis.substring(0, match.index).split('\n').length });
          }
          
          // Extract TODOs
          while ((match = todoRegex.exec(fileContentForAnalysis)) !== null) {
              fileElements.push({ itemType: 'todo', content: match[1].trim(), line: fileContentForAnalysis.substring(0, match.index).split('\n').length });
          }

          // Extract functions
          while ((match = functionRegex.exec(fileContentForAnalysis)) !== null) {
            const paramsString = match[3] || '';
            const parameters = paramsString.split(',')
              .map(p => {
                  const parts = p.trim().split(':');
                  const nameWithType = parts[0].trim();
                  const name = nameWithType.replace(/\??\s*=.*/, '').trim(); // Remove optional marker and default value for name
                  const type = parts[1] ? parts[1].trim().split('=')[0].trim() : 'any'; // Get type before default value
                  const optional = nameWithType.includes('?') || nameWithType.includes('=');
                  const defaultValue = nameWithType.includes('=') ? nameWithType.split('=')[1]?.trim() : undefined;
                  return { name, type, optional, default: defaultValue };
              })
              .filter(p => p.name);
            fileElements.push({ itemType: 'function', name: match[2], params: parameters, isAsync: !!match[1], returnType: match[4] ? match[4].trim() : undefined, line: fileContentForAnalysis.substring(0, match.index).split('\n').length });
          }
          
          // Extract classes
          while ((match = classRegex.exec(fileContentForAnalysis)) !== null) {
              fileElements.push({ itemType: 'class', name: match[1], extends: match[2] ? match[2].trim() : null, line: fileContentForAnalysis.substring(0, match.index).split('\n').length });
          }

          // Extract interfaces
          while ((match = interfaceRegex.exec(fileContentForAnalysis)) !== null) {
              fileElements.push({ itemType: 'interface', name: match[1], line: fileContentForAnalysis.substring(0, match.index).split('\n').length });
          }
          
          // Extract exports (simplified, might overlap with functions/classes if they are exported)
          while ((match = exportRegex.exec(fileContentForAnalysis)) !== null) {
            // Avoid double-counting if already captured as function/class/interface
            if (!fileElements.some(el => el.name === match[2] && (el.itemType === match[1] || (el.itemType === 'jsdoc' && el.line && fileContentForAnalysis.substring(el.line).startsWith(match[0]))))) {
                 fileElements.push({ itemType: 'export', exportType: match[1], name: match[2], line: fileContentForAnalysis.substring(0, match.index).split('\n').length });
            }
          }
          
          const exportCount = fileElements.filter(el => el.itemType === 'export' || ((el.itemType === 'function' || el.itemType === 'class' || el.itemType === 'interface') && el.name && el.line && fileContentForAnalysis.substring(0, fileContentForAnalysis.indexOf(el.name, (el.line-1)*20)).includes(`export ${el.itemType} ${el.name}`))).length; // Approximate
          const docCommentCount = fileElements.filter(el => el.itemType === 'jsdoc' && el.description && el.description.length > 10).length; // Count substantial JSDoc blocks
          const hasTodoForDoc = fileElements.some(el => el.itemType === 'todo' && el.content && /document/i.test(el.content));

          let needsDoc = false;
          let estimatedCoverage = 0.5;

          if (exportCount > 0) {
            if (hasTodoForDoc) {
              needsDoc = true;
              estimatedCoverage = 0.1;
            } else if (docCommentCount > 0) {
              estimatedCoverage = Math.min(1, docCommentCount / exportCount);
              needsDoc = estimatedCoverage < (step.data?.coverageTarget || 0.7);
            } else {
              needsDoc = true;
              estimatedCoverage = 0.0;
            }
          } else {
            needsDoc = false; // No exports, heuristic assumes no top-level docs needed
            estimatedCoverage = 1.0;
          }
          
          if (needsDoc) filesRequiringDocsCount++;

          analyzedFiles.push({
            path: filePath,
            type,
            lastModified: stats.mtime.toISOString(),
            needsDocumentation: needsDoc,
            coverage: parseFloat(estimatedCoverage.toFixed(2)),
            elements: fileElements, // Store all extracted elements
            elementsCount: fileElements.length
          });
        } catch (fileStatError: unknown) {
          const statErrorMsg = fileStatError instanceof Error ? fileStatError.message : 'Unknown stat error';
          this.logger.warn(`Could not stat file ${fullPath}: ${statErrorMsg}`);
        }
      }
      
      const message = `Codebase analysis complete with enhanced regex. Found ${filesFoundCount} files. ${filesRequiringDocsCount} files identified as potentially requiring documentation.`;
      return {
        type: 'analyze-codebase',
        success: true,
        stepId: step.id,
        message,
        summary: message,
        data: { analysisResults: { files: analyzedFiles, patternsUsed: patterns, basePath } },
      };
    } catch (error: unknown) {
      const globErrorMsg = error instanceof Error ? error.message : 'Unknown glob error';
      this.logger.error('Error during codebase analysis with glob', { error: globErrorMsg });
      return {
        type: 'analyze-codebase',
        success: false,
        stepId: step.id,
        message: `Error during codebase analysis: ${globErrorMsg}`,
        summary: 'Codebase analysis failed.',
        error: globErrorMsg,
        data: { patternsUsed: patterns, basePath },
      };
    }
  }

  /**
   * Extracts documentation from code comments and structure
   */
  private async extractDocumentation(step: PlanStep, context: Record<string, unknown>): Promise<ExecutionResult> {
    const extractExamples = step.data?.extractExamples === true; // This flag is not fully utilized yet
    this.logger.info('Extracting documentation from analyzed code elements', { extractExamples });

    const previousAnalysisStep = Object.values(context).find(s => (s as ExecutionResult).type === 'analyze-codebase') as ExecutionResult | undefined;
    
    if (!previousAnalysisStep?.data?.analysisResults?.files) {
        const errorMsg = 'No analysis results available from codebase analysis step for documentation extraction.';
        this.logger.warn(errorMsg, { analysisContext: previousAnalysisStep });
        return { type: 'extract-documentation', success: true, stepId: step.id, message: errorMsg, summary: errorMsg, data: { message: 'No analysis results to process.', extractedDocItems: [] } };
    }

    const filesFromAnalysis: {
        path: string,
        needsDocumentation?: boolean,
        elements?: DocElement[]
    }[] = previousAnalysisStep.data.analysisResults.files;
    
    const extractedItemsOverall: DocElement[] = [];
    let filesProcessedCount = 0;
    let elementsExtractedCount = 0;

    for (const fileInfo of filesFromAnalysis) {
      if (!fileInfo || typeof fileInfo.path !== 'string' || !Array.isArray(fileInfo.elements)) {
        this.logger.warn('Skipping invalid fileInfo object or fileInfo without elements array', { fileInfo });
        continue;
      }

      if (!fileInfo.needsDocumentation && !step.data?.forceExtractAll) {
          this.logger.debug(`Skipping file ${fileInfo.path} as it does not require documentation and forceExtractAll is not set.`);
          continue;
      }
      
      this.logger.debug(`Extracting from analyzed elements of: ${fileInfo.path}`);
      filesProcessedCount++;

      for (const element of fileInfo.elements) {
        const currentElement = element as DocElement; // Cast to DocElement for easier access
        if (currentElement.itemType === 'jsdoc') {
            const associatedElement = fileInfo.elements?.find(elUntyped => {
                const el = elUntyped as DocElement;
                return (el.itemType === 'function' || el.itemType === 'class' || el.itemType === 'interface') &&
                el.line > currentElement.line && el.line < currentElement.line + 5; // Heuristic
            }) as DocElement | undefined;

            extractedItemsOverall.push({
                itemType: associatedElement ? associatedElement.itemType : 'comment_block',
                name: associatedElement?.name || `JSDoc_L${currentElement.line}`,
                description: currentElement.description,
                params: currentElement.tags?.filter(t => t.tag === 'param').map(t => ({ name: t.name as string, type: t.type, description: t.description })) || [],
                returns: currentElement.tags?.find(t => t.tag === 'returns' || t.tag === 'return')
                         ? { type: currentElement.tags.find(t => t.tag === 'returns' || t.tag === 'return')?.type, description: currentElement.tags.find(t => t.tag === 'returns' || t.tag === 'return')?.description }
                         : undefined,
                tags: currentElement.tags,
                filePath: fileInfo.path,
                raw: currentElement.raw, // Changed from rawComment
                line: currentElement.line,
                associatedElementName: associatedElement?.name,
            });
            elementsExtractedCount++;
        } else if (currentElement.itemType === 'function' || currentElement.itemType === 'class' || currentElement.itemType === 'interface') {
            const hasAssociatedJSDoc = extractedItemsOverall.some(item =>
                item.filePath === fileInfo.path &&
                item.associatedElementName === currentElement.name &&
                item.line < currentElement.line
            );

            if (!hasAssociatedJSDoc) {
                 extractedItemsOverall.push({
                    itemType: currentElement.itemType,
                    name: currentElement.name,
                    description: 'No JSDoc comment found or not associated.',
                    params: currentElement.params || [], // Geändert von parameters
                    returns: currentElement.returnType ? { type: currentElement.returnType, description: '' } : undefined,
                    extends: currentElement.extends,
                    filePath: fileInfo.path,
                    line: currentElement.line,
                });
                elementsExtractedCount++;
            }
        } else if (currentElement.itemType === 'todo') {
            extractedItemsOverall.push({
                itemType: 'todo',
                name: `TODO_L${currentElement.line}`,
                description: currentElement.content, // Changed from content
                filePath: fileInfo.path,
                line: currentElement.line,
            });
            elementsExtractedCount++;
        }
      }
      
      if (fileInfo.elements.length === 0 && fileInfo.needsDocumentation) {
        extractedItemsOverall.push({ itemType: 'file_placeholder', name: fileInfo.path, description: 'File marked for documentation, but no specific elements found by analyzer.', filePath: fileInfo.path, line: 0 });
        elementsExtractedCount++;
      }
    }
    
    const message = `Successfully processed ${filesProcessedCount} analyzed files. Extracted ${elementsExtractedCount} documentation-relevant items.`;
    return {
      type: 'extract-documentation',
      success: true,
      stepId: step.id,
      message,
      summary: message,
      data: { extractedDocItems: extractedItemsOverall, filesProcessedCount }, // Removed examplesExtracted as it's not used
    };
  }

  /**
   * Generates documentation files based on extracted information
   */
  private async generateDocumentation(step: PlanStep, context: Record<string, unknown>): Promise<ExecutionResult> {
    const outputFormat = step.data?.format || 'markdown';
    const outputDir = step.data?.outputDir || 'docs/generated';
    const templateName = step.data?.template || 'default';
    this.logger.info('Generating documentation', { outputFormat, outputDir, templateName });

    const previousExtractStep = Object.values(context).find(s => (s as ExecutionResult).type === 'extract-documentation') as ExecutionResult | undefined;
    const extractedDocItems: DocElement[] = (previousExtractStep?.data as { extractedDocItems: DocElement[] })?.extractedDocItems || [];
    
    if (extractedDocItems.length === 0) {
      const msg = 'No extracted documentation items available for generation.';
      this.logger.info(msg, { extractContext: previousExtractStep });
      return { type: 'generate-documentation', success: true, stepId: step.id, message: msg, summary: msg, data: { message: msg, generatedFiles: [] } };
    }

    await fs.mkdir(outputDir, { recursive: true });
    const generatedFiles: { sourceFilePath?: string, outputFilePath: string, sizeBytes: number, status: string, error?: string }[] = [];

    const itemsByFile = extractedDocItems.reduce((acc: Record<string, DocElement[]>, item: DocElement) => {
      const key = item.filePath || 'unknown_file_source';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    for (const [filePath, items] of Object.entries(itemsByFile)) {
      if (items.length === 0) continue;

      let docContent = `---
sourceFile: ${filePath}
generatedAt: ${new Date().toISOString()}
format: ${outputFormat}
---
# Documentation for ${filePath}\n\n`;

      if (outputFormat === 'markdown') {
        for (const item of items) {
          const currentItem = item as DocElement; // Cast for easier access
          docContent += `## \`${currentItem.name || 'Unnamed Element'}\` (${currentItem.itemType || 'N/A'})\n\n`;
          docContent += `${currentItem.description || 'No description available.'}\n\n`;
          
          const paramsToRender = currentItem.params;
          if (paramsToRender && paramsToRender.length > 0) {
            docContent += `### Parameters\n`;
            docContent += `| Name | Type | Optional | Default | Description |\n`;
            docContent += `|------|------|----------|---------|-------------|\n`;
            paramsToRender.forEach(p => {
              docContent += `| \`${p.name}\` | \`${p.type || 'any'}\` | ${p.optional ? 'Yes' : 'No'} | ${p.default !== undefined ? `\`${p.default}\`` : '-'} | ${p.description || 'No description.'} |\n`;
            });
            docContent += `\n`;
          }

          if (currentItem.returns) {
            docContent += `### Returns\n`;
            docContent += `**Type:** \`${currentItem.returns.type || 'any'}\`\n\n`;
            docContent += `${currentItem.returns.description || 'No return description.'}\n\n`;
          }

          if (currentItem.tags && currentItem.tags.length > 0) {
            const otherTags = currentItem.tags.filter(t => t.tag !== 'param' && t.tag !== 'returns' && t.tag !== 'description');
            if (otherTags.length > 0) {
                docContent += `### Other Tags\n`;
                otherTags.forEach(t => {
                    docContent += `- **@${t.tag}**: ${t.name ? `\`${t.name}\` ` : ''}${t.type ? `{\`${t.type}\`} ` : ''}${t.description || ''}\n`;
                });
                docContent += `\n`;
            }
          }
          if (currentItem.raw) { // Changed from rawComment
             docContent += `\n<details>\n<summary>Raw JSDoc Comment</summary>\n\n\`\`\`javascript\n${currentItem.raw}\n\`\`\`\n\n</details>\n\n`;
          }
          docContent += `---\n`;
        }
      } else if (outputFormat === 'html') {
        docContent = `<html><head><title>Docs for ${filePath}</title><style>body{font-family:sans-serif; margin:20px;} table{border-collapse:collapse; width:100%;} th,td{border:1px solid #ddd;padding:8px;text-align:left;} th{background-color:#f2f2f2;}</style></head><body><h1>Documentation for ${filePath}</h1>`;
        for (const item of items) {
          const currentItem = item as DocElement;
          docContent += `<div><h2><code>${currentItem.name || 'Unnamed Element'}</code> (${currentItem.itemType || 'N/A'})</h2>`;
          docContent += `<p>${currentItem.description || 'No description available.'}</p>`;
          const paramsToRender = currentItem.params;
          if (paramsToRender && paramsToRender.length > 0) {
            docContent += `<h3>Parameters</h3><table><tr><th>Name</th><th>Type</th><th>Optional</th><th>Default</th><th>Description</th></tr>`;
            paramsToRender.forEach(p => {
              docContent += `<tr><td><code>${p.name}</code></td><td><code>${p.type || 'any'}</code></td><td>${p.optional ? 'Yes' : 'No'}</td><td>${p.default !== undefined ? `<code>${p.default}</code>` : '-'}</td><td>${p.description || 'No description.'}</td></tr>`;
            });
            docContent += `</table>`;
          }
          if (currentItem.returns) {
            docContent += `<h3>Returns</h3><p><strong>Type:</strong> <code>${currentItem.returns.type || 'any'}</code></p><p>${currentItem.returns.description || 'No return description.'}</p>`;
          }
          docContent += `</div><hr/>`;
        }
        docContent += `</body></html>`;
      } else {
        docContent = JSON.stringify(items, null, 2);
      }
      
      const safeFileName = filePath.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const outputFilePath = path.join(outputDir, `${safeFileName}.${outputFormat === 'markdown' ? 'md' : outputFormat}`);
      
      try {
        await fs.writeFile(outputFilePath, docContent);
        const stats = await fs.stat(outputFilePath);
        generatedFiles.push({ sourceFilePath: filePath, outputFilePath, sizeBytes: stats.size, status: 'success' });
      } catch (error: unknown) {
        const writeErrorMsg = error instanceof Error ? error.message : 'Unknown error writing documentation file';
        this.logger.error(`Failed to write documentation file ${outputFilePath}: ${writeErrorMsg}`);
        generatedFiles.push({ sourceFilePath: filePath, outputFilePath, sizeBytes: 0, status: 'failed', error: writeErrorMsg });
      }
    }
    
    const message = `Successfully generated ${generatedFiles.filter(f=>f.status === 'success').length} documentation files in ${outputFormat} format to ${outputDir}.`;
    return {
      type: 'generate-documentation',
      success: generatedFiles.some(f => f.status === 'success'), // Success if at least one file generated
      stepId: step.id,
      message,
      summary: message,
      data: { generatedFiles, outputFormat, outputDirectory: outputDir, templateUsed: templateName },
    };
  }

  /**
   * Validates the generated documentation
   */
  private async validateDocumentation(step: PlanStep, context: Record<string, unknown>): Promise<ExecutionResult> { // any zu unknown
    const checkBrokenLinks = step.data?.checkBrokenLinks !== false;
    const checkCoverage = step.data?.checkCoverage !== false;
    const coverageThreshold = step.data?.coverageThreshold || 80; // Minimum coverage in percent
    this.logger.info('Validating documentation', { checkBrokenLinks, checkCoverage, coverageThreshold });

    const previousGenerateStep = Object.values(context).find(s => (s as ExecutionResult).type === 'generate-documentation') as ExecutionResult | undefined;
    const generatedDocs: { outputFilePath: string, status: string, sourceFilePath?: string }[] = previousGenerateStep?.data?.generatedFiles || [];

    if (generatedDocs.filter(doc => doc.status === 'success').length === 0) {
      const msg = 'No successfully generated documentation files available for validation.';
      this.logger.info(msg, { generateContext: previousGenerateStep });
      return { type: 'validate-documentation', success: true, stepId: step.id, message: msg, summary: msg, data: { message: msg, validationResults: {} } };
    }
    
    let brokenLinksFound = 0;
    let coverageGapsFound = 0;
    let filesValidatedCount = 0;
    const validationIssues: unknown[] = [];
    
    // Declare previousAnalysisStep earlier as it's used in the loop for sourceFilePath context
    // and also later for coverage calculation.
    const previousAnalysisStep = Object.values(context).find(s => (s as ExecutionResult).type === 'analyze-codebase') as ExecutionResult | undefined;

    for (const docFile of generatedDocs) {
      if (docFile.status !== 'success' || !docFile.outputFilePath) continue;
      filesValidatedCount++;
      try {
        const content = await fs.readFile(docFile.outputFilePath, 'utf-8');
        
        if (checkBrokenLinks) {
          const markdownLinkRegex = /\[[^\]]+\]\(([^)]+)\)/g;
          let match;
          while ((match = markdownLinkRegex.exec(content)) !== null) {
            const link = match[1];
            if (link.startsWith('http')) {
                this.logger.debug(`Checking external link: ${link} in ${docFile.outputFilePath}`);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), step.data?.externalLinkTimeout || 5000); // Default 5s timeout
                try {
                    const response = await fetch(link, { method: 'HEAD', signal: controller.signal, redirect: 'follow' });
                    clearTimeout(timeoutId);
                    if (!response.ok) {
                        brokenLinksFound++;
                        validationIssues.push({ file: docFile.outputFilePath, type: 'broken_external_link', link, status: response.status, message: `External link returned status ${response.status}` });
                        this.logger.warn(`Broken external link found: ${link} (status ${response.status}) in ${docFile.outputFilePath}`);
                    }
                } catch (fetchError: unknown) {
                    clearTimeout(timeoutId);
                    brokenLinksFound++;
                    const typedFetchError = fetchError as { name?: string; message?: string };
                    const errorMessage = typedFetchError.name === 'AbortError' ? 'Request timed out' : (typedFetchError.message || String(fetchError));
                    validationIssues.push({ file: docFile.outputFilePath, type: 'broken_external_link', link, message: `Failed to fetch external link: ${errorMessage}` });
                    this.logger.warn(`Failed to fetch external link ${link} in ${docFile.outputFilePath}: ${errorMessage}`);
                }
            } else if (!link.startsWith('#') && !link.startsWith('mailto:')) {
                this.logger.debug(`Checking local link: ${link} in ${docFile.outputFilePath}`);
                const outputDir = previousGenerateStep?.data?.outputDirectory || 'docs/generated';
                const currentDocDir = path.dirname(docFile.outputFilePath);
                
                // Attempt 1: Relative to the current document's directory
                let targetPath = path.resolve(currentDocDir, link);
                
                try {
                    await fs.access(targetPath);
                } catch (e1) {
                    // Attempt 2: Relative to the root of the generated docs output directory
                    const targetPathFromDocsRoot = path.resolve(outputDir, link.startsWith('./') ? link.substring(2) : link);
                    try {
                        await fs.access(targetPathFromDocsRoot);
                    } catch (e2) {
                        // Attempt 3: If it might be a link to a source file (heuristic)
                        const sourceFileBaseDir = docFile.sourceFilePath ? path.dirname(path.resolve(previousAnalysisStep?.data?.analysisResults?.basePath || '.', docFile.sourceFilePath)) : null;
                        if (sourceFileBaseDir && !/\.(md|html)$/i.test(link)) { // Heuristic: if not ending in .md or .html, could be source
                            const targetPathFromSource = path.resolve(sourceFileBaseDir, link);
                             try {
                                await fs.access(targetPathFromSource);
                             } catch (e3) {
                                brokenLinksFound++;
                                validationIssues.push({ file: docFile.outputFilePath, type: 'broken_local_link', link, message: 'Local link target not found.', attemptedPaths: [targetPath, targetPathFromDocsRoot, targetPathFromSource] });
                                this.logger.warn(`Broken local link found: ${link} in ${docFile.outputFilePath}. Attempted: ${targetPath}, ${targetPathFromDocsRoot}, ${targetPathFromSource}`);
                             }
                        } else {
                             brokenLinksFound++;
                             validationIssues.push({ file: docFile.outputFilePath, type: 'broken_local_link', link, message: 'Local link target not found.', attemptedPaths: [targetPath, targetPathFromDocsRoot] });
                             this.logger.warn(`Broken local link found: ${link} in ${docFile.outputFilePath}. Attempted: ${targetPath}, ${targetPathFromDocsRoot}`);
                        }
                    }
                }
            }
          }
        }
      } catch (error: unknown) {
        const readDocErrorMsg = error instanceof Error ? error.message : 'Unknown error reading generated doc file';
        this.logger.warn(`Could not read generated file ${docFile.outputFilePath} for validation: ${readDocErrorMsg}`);
      }
    }
    // previousAnalysisStep is now declared at the beginning of the function.
    const analyzedCodeFilesCount = previousAnalysisStep?.data?.analysisResults?.files?.length || 0;
    
    let overallCoveragePercent = 0;
    if (checkCoverage && analyzedCodeFilesCount > 0) {
        const documentedSourceFiles = new Set(generatedDocs.filter(f => f.status === 'success' && f.sourceFilePath).map(f => f.sourceFilePath));
        const documentedFilesCount = documentedSourceFiles.size;
        overallCoveragePercent = Math.min(100, (documentedFilesCount / analyzedCodeFilesCount) * 100);
        
        if (overallCoveragePercent < coverageThreshold) {
            coverageGapsFound = analyzedCodeFilesCount - documentedFilesCount;
            validationIssues.push({
                type: 'coverage_gap',
                message: `Overall coverage ${overallCoveragePercent.toFixed(1)}% is below threshold of ${coverageThreshold}%. Approx. ${coverageGapsFound} source files may lack documentation.`,
                details: {
                    totalAnalyzed: analyzedCodeFilesCount,
                    documented: documentedFilesCount,
                    threshold: coverageThreshold
                }
            });
        }
    }

    const validationResultsData = {
      filesChecked: filesValidatedCount,
      issuesFound: {
        brokenLinks: brokenLinksFound,
        coverageGaps: coverageGapsFound,
      },
      overallCoveragePercent: checkCoverage ? parseFloat(overallCoveragePercent.toFixed(1)) : null,
      details: validationIssues
    };
    
    const isSuccess = validationResultsData.issuesFound.brokenLinks === 0 &&
                      (!checkCoverage || (validationResultsData.overallCoveragePercent !== null && validationResultsData.overallCoveragePercent >= coverageThreshold));

    let summaryMessage = `Documentation validation completed for ${validationResultsData.filesChecked} files. `;
    if (checkBrokenLinks) summaryMessage += `${validationResultsData.issuesFound.brokenLinks} broken links found. `;
    if (checkCoverage && validationResultsData.overallCoveragePercent !== null) {
        summaryMessage += `Overall documentation coverage: ${validationResultsData.overallCoveragePercent}%. `;
        if (validationResultsData.overallCoveragePercent < coverageThreshold) {
            summaryMessage += `Coverage is BELOW the ${coverageThreshold}% threshold. `;
        }
    }
    if (!isSuccess) summaryMessage = "Validation found issues: " + summaryMessage;

    return {
      type: 'validate-documentation',
      success: isSuccess,
      stepId: step.id,
      message: summaryMessage,
      summary: summaryMessage,
      data: { validationResults: validationResultsData },
    };
  }

  /**
   * Generates API documentation
   */
  private async generateApiDocs(step: PlanStep, context: Record<string, unknown>): Promise<ExecutionResult> {
    const outputFormat = step.data?.format || 'markdown'; // Default to markdown for better utility
    const outputDir = step.data?.outputDir || 'docs/api';
    const apiSpecPath = step.data?.apiSpecPath as string | undefined;
    const useExtractedItems = step.data?.useExtractedItems !== false;
    this.logger.info('Generating API documentation', { outputFormat, outputDir, apiSpecPath, useExtractedItems });

    let sourceDescription = "";
    let apiSpecContent: OpenApiSpec | null = null; // Will hold parsed spec if available

    if (apiSpecPath) {
      sourceDescription = `API specification file: ${apiSpecPath}`;
      try {
        const fullSpecPath = path.resolve(apiSpecPath);
        const specFileContent = await fs.readFile(fullSpecPath, 'utf-8');
        if (apiSpecPath.endsWith('.json')) {
            apiSpecContent = JSON.parse(specFileContent);
        } else if (apiSpecPath.endsWith('.yaml') || apiSpecPath.endsWith('.yml')) {
            // For YAML, a parser like 'js-yaml' would be needed.
            // import * as yaml from 'js-yaml'; apiSpecContent = yaml.load(specFileContent);
            this.logger.warn(`YAML spec processing for ${apiSpecPath} is a TODO. Attempting to treat as JSON for now or use raw content.`);
            try { apiSpecContent = JSON.parse(specFileContent); } catch { apiSpecContent = { rawContent: specFileContent, format: 'yaml_raw' }; }
        } else {
            throw new Error('Unsupported API specification file format (expected .json, .yaml, or .yml).');
        }
        if (apiSpecContent && !apiSpecContent.openapi && !apiSpecContent.swagger) {
             this.logger.warn(`File ${apiSpecPath} does not seem to be a valid OpenAPI/Swagger spec (missing openapi/swagger root property). Processing will be limited.`);
        }
      } catch (error: unknown) {
        const loadSpecErrorMsg = error instanceof Error ? error.message : 'Unknown error loading API spec';
        this.logger.error(`Failed to load or parse API spec file ${apiSpecPath}: ${loadSpecErrorMsg}`);
        return { type: 'generate-api-docs', success: false, stepId: step.id, message: `Error loading API spec: ${loadSpecErrorMsg}`, summary: 'API spec loading failed.', data: { error: loadSpecErrorMsg, apiSpecPath } };
      }
    }
    
    let itemsFromCode: DocElement[] = [];
    if (useExtractedItems && !apiSpecPath) { // Only use extracted items if no spec path is given
        const previousExtractStep = Object.values(context).find(s => (s as ExecutionResult).type === 'extract-documentation') as ExecutionResult | undefined;
        itemsFromCode = (previousExtractStep?.data as { extractedDocItems: DocElement[] })?.extractedDocItems || [];
        sourceDescription = "extracted code comments (heuristic for API endpoints)";
        if (itemsFromCode.length === 0) {
            const msg = 'No API spec path provided and no extracted documentation items available for API documentation generation.';
            this.logger.warn(msg);
            return { type: 'generate-api-docs', success: true, stepId: step.id, message: msg, summary: msg, data: { message: msg, apiDocFiles: [] } };
        }
    }

    if (!apiSpecContent && itemsFromCode.length === 0) {
        const errorMsg = 'No API specification or extracted code elements to process for API documentation.';
        this.logger.error(errorMsg);
        return { type: 'generate-api-docs', success: false, stepId: step.id, message: errorMsg, summary: errorMsg, data: { error: errorMsg } };
    }
    
    await fs.mkdir(outputDir, { recursive: true });
    const apiDocFiles: { source: string, outputFilePath: string, sizeBytes: number, status: string, error?: string }[] = [];
    let apiDocContent = ``;

    // Header for Markdown and HTML
    if (outputFormat === 'markdown') {
        apiDocContent = `# API Reference\n\nSource: ${sourceDescription}\n\n---\n\n`;
    } else if (outputFormat === 'html') {
        apiDocContent = `<html><head><title>API Reference</title><style>body{font-family:sans-serif; margin:20px;} pre{background:#f4f4f4;padding:1em;overflow:auto;border-radius:5px;} table{border-collapse:collapse; width:auto; margin-bottom:1em;} th,td{border:1px solid #ddd;padding:8px;text-align:left;} th{background-color:#f2f2f2;}</style></head><body><h1>API Reference</h1><p>Source: ${sourceDescription}</p><hr/>`;
    }

    if (apiSpecContent) {
        this.logger.info(`Generating API documentation from specification: ${apiSpecPath}`);
        if (outputFormat === 'openapi_json') {
            apiDocContent = JSON.stringify(apiSpecContent, null, 2);
        } else if (outputFormat === 'markdown') {
            apiDocContent += `## API Specification Overview (from ${apiSpecPath})\n\n`;
            apiDocContent += `**Title:** ${apiSpecContent.info?.title || 'N/A'}\n`;
            apiDocContent += `**Version:** ${apiSpecContent.info?.version || 'N/A'}\n`;
            apiDocContent += `**Description:** ${apiSpecContent.info?.description || 'No description.'}\n\n`;
            if (apiSpecContent.paths) {
                apiDocContent += `### Endpoints\n\n`;
                for (const [pathKey, pathItemUntyped] of Object.entries(apiSpecContent.paths || {})) {
                  const pathItem = pathItemUntyped as OpenApiPathItem;
                  apiDocContent += `#### \`${pathKey}\`\n\n`;
                  for (const [method, operation] of Object.entries(pathItem)) {
                    apiDocContent += `**${method.toUpperCase()}**: ${operation.summary || operation.description || 'No summary.'}\n`;
                    if (operation.parameters && operation.parameters.length > 0) {
                        apiDocContent += `Parameters:\n`;
                        operation.parameters.forEach(param => {
                            apiDocContent += `- \`${param.name}\` (${param.in}, ${param.schema?.type || 'N/A'}): ${param.description || ''}\n`;
                        });
                        }
                        apiDocContent += `\n`;
                    }
                }
            }
            if (apiSpecContent.rawContent && apiSpecContent.format === 'yaml_raw') {
                 apiDocContent += `\n<details>\n<summary>Raw YAML Spec Content</summary>\n\n\`\`\`yaml\n${apiSpecContent.rawContent}\n\`\`\`\n\n</details>\n\n`;
            } else {
                 apiDocContent += `\n<details>\n<summary>Raw JSON Spec Content</summary>\n\n\`\`\`json\n${JSON.stringify(apiSpecContent, null, 2)}\n\`\`\`\n\n</details>\n\n`;
            }
        } else if (outputFormat === 'html') {
            apiDocContent += `<h2>API Specification Overview (from ${apiSpecPath})</h2>`;
            apiDocContent += `<p><strong>Title:</strong> ${apiSpecContent.info?.title || 'N/A'}</p>`;
            apiDocContent += `<p><strong>Version:</strong> ${apiSpecContent.info?.version || 'N/A'}</p>`;
            apiDocContent += `<p><strong>Description:</strong> ${apiSpecContent.info?.description || 'No description.'}</p>`;
            if (apiSpecContent.paths) {
                apiDocContent += `<h3>Endpoints</h3>`;
                for (const [pathKey, pathItemUntyped] of Object.entries(apiSpecContent.paths || {})) {
                    const pathItem = pathItemUntyped as OpenApiPathItem;
                    apiDocContent += `<h4><code>${pathKey}</code></h4>`;
                    for (const [method, operation] of Object.entries(pathItem)) {
                        apiDocContent += `<p><strong>${method.toUpperCase()}</strong>: ${operation.summary || operation.description || 'No summary.'}</p>`;
                         if (operation.parameters && operation.parameters.length > 0) {
                            apiDocContent += `<h5>Parameters:</h5><ul>`;
                            operation.parameters.forEach(param => {
                                apiDocContent += `<li><code>${param.name}</code> (${param.in}, ${param.schema?.type || 'N/A'}): ${param.description || ''}</li>`;
                            });
                            apiDocContent += `</ul>`;
                        }
                    }
                }
            }
            apiDocContent += `<h3>Raw Specification</h3><pre><code>${JSON.stringify(apiSpecContent, null, 2).replace(/</g, "<").replace(/>/g, ">")}</code></pre>`;
        }
    } else if (useExtractedItems && itemsFromCode.length > 0) {
        this.logger.info(`Generating API documentation from ${itemsFromCode.length} extracted code comments (heuristic).`);
        // Heuristic: filter for items that might be API endpoints (e.g., functions with @route tags or specific naming)
        const apiEndpoints = itemsFromCode.filter(item =>
            item.itemType === 'function' &&
            (item.tags?.some(t => t.tag === 'route' || t.tag === 'path' || t.tag === 'endpoint') || (item.name && /^(get|post|put|delete|patch)[A-Z]/.test(item.name)))
        );
        if (apiEndpoints.length === 0) {
            apiDocContent += "No specific API endpoints identified from extracted code comments based on current heuristics.\n";
        }
        apiEndpoints.forEach(item => {
            const routeTag = item.tags?.find(t => t.tag === 'route' || t.tag === 'path');
            const endpointPath = routeTag?.description?.split(' ')[1] || item.name;
            const httpMethod = routeTag?.description?.split(' ')[0]?.toUpperCase() || 'GET'; // Default to GET

            if (outputFormat === 'markdown') {
                apiDocContent += `### \`${httpMethod} ${endpointPath}\` (from ${item.filePath})\n\n`;
                apiDocContent += `**Function:** \`${item.name}\`\n\n`;
                apiDocContent += `${item.description || 'No description.'}\n\n`;
                if (item.params && item.params.length > 0) {
                    apiDocContent += `**Parameters:**\n`;
                    item.params?.forEach(p => {
                        apiDocContent += `- \`${p.name}\` (\`${p.type || 'any'}\`): ${p.description || ''}\n`;
                    });
                    apiDocContent += `\n`;
                }
            } else if (outputFormat === 'html') {
                apiDocContent += `<div><h3><code>${httpMethod} ${endpointPath}</code> (from ${item.filePath})</h3>`;
                apiDocContent += `<p><strong>Function:</strong> <code>${item.name}</code></p>`;
                apiDocContent += `<p>${item.description || 'No description.'}</p>`;
                 if (item.params && item.params.length > 0) {
                    apiDocContent += `<strong>Parameters:</strong><ul>`;
                    item.params?.forEach(p => {
                        apiDocContent += `<li><code>${p.name}</code> (<code>${p.type || 'any'}</code>): ${p.description || ''}</li>`;
                    });
                    apiDocContent += `</ul>`;
                }
                apiDocContent += `</div><hr/>`;
            }
        });
    }

    if (outputFormat === 'html') apiDocContent += `</body></html>`;

    const outputFileName = `api_reference.${outputFormat === 'openapi_json' ? 'json' : (outputFormat === 'markdown' ? 'md' : 'html')}`;
    const outputFilePath = path.join(outputDir, outputFileName);

    try {
      await fs.writeFile(outputFilePath, apiDocContent);
      const stats = await fs.stat(outputFilePath);
      apiDocFiles.push({
        source: apiSpecPath || (itemsFromCode.length > 0 && itemsFromCode[0].filePath ? itemsFromCode[0].filePath : 'extracted_code_elements'),
        outputFilePath,
        sizeBytes: stats.size,
        status: 'success',
      });
    } catch (error: unknown) {
      const writeApiDocErrorMsg = error instanceof Error ? error.message : 'Unknown error writing API documentation file';
      this.logger.error(`Failed to write API documentation file ${outputFilePath}: ${writeApiDocErrorMsg}`);
      apiDocFiles.push({
        source: apiSpecPath || (itemsFromCode.length > 0 && itemsFromCode[0].filePath ? itemsFromCode[0].filePath : 'extracted_code_elements'),
        outputFilePath,
        sizeBytes: 0,
        status: 'failed',
        error: writeApiDocErrorMsg,
      });
    }
    
    const successStatus = apiDocFiles.some(f => f.status === 'success');
    const resultMessage = `Successfully generated ${apiDocFiles.filter(f=>f.status === 'success').length} API documentation file(s) in ${outputFormat} format to ${outputDir}.`;
    return {
      type: 'generate-api-docs',
      success: successStatus,
      stepId: step.id,
      message: resultMessage,
      summary: resultMessage,
      data: { apiDocFiles, outputFormat, outputDirectory: outputDir, sourceUsed: apiSpecPath ? 'api_spec' : (useExtractedItems ? 'extracted_code_elements' : 'none') },
    };
  }
}
