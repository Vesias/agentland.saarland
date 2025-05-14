import { PlanStep, ExecutionResult } from "../types";
import { BaseExecutor } from './base-executor';
import configManager, { ConfigType } from '../../../../core/src/config/config-manager';
import { ClaudeError } from '../../../../core/src/error/error-handler';
import { glob } from 'glob';
import * as fs from 'fs/promises';
import * as path from 'path';
// Für AST-Parsing könnte man Bibliotheken wie @babel/parser, typescript oder esprima verwenden.
// import { parse } from '@babel/parser';
// import * as ts from 'typescript';

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
  private async analyzeCodebase(step: PlanStep, context: Record<string, unknown>): Promise<ExecutionResult> { // any zu unknown
    const patterns: string[] = step.data?.patterns || ['**/*.ts', '**/*.tsx', '!**/*.spec.ts', '!**/node_modules/**'];
    const basePath = step.data?.basePath || '.'; // Base path for glob patterns
    this.logger.info('Analyzing codebase structure', { patterns, basePath });

    let analyzedFiles: { path: string, type: string, lastModified?: string, needsDocumentation: boolean, coverage?: number, elements?: any[], elementsCount?: number, error?: string }[] = [];
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
          
                          this.logger.debug(`Analyzing file ${fullPath} for documentation needs using heuristic methods.`);
                          // Basic analysis to determine `needsDocumentation` and `coverage`.
                          // This is a simplification; full AST parsing (e.g. with TypeScript API or Babel) would be more robust.
                          let fileContentForAnalysis = "";
                          try {
                            fileContentForAnalysis = await fs.readFile(fullPath, 'utf-8');
                          } catch (readError: any) {
                            this.logger.warn(`Could not read file ${fullPath} for analysis: ${readError.message}`);
                            // Skip further analysis for this file if content cannot be read
                            analyzedFiles.push({ path: filePath, type, lastModified: stats.mtime.toISOString(), needsDocumentation: true, coverage: 0, elementsCount: 0, error: 'File read error' });
                            filesRequiringDocsCount++; // Assume it needs docs if unreadable
                            continue;
                          }
                
                          // Check for common indicators of documentation or need thereof
                          const hasDocComments = /\/\*\*\s*([\s\S]*?)\s*\*\//.test(fileContentForAnalysis); // JSDoc/TSDoc style
                          const hasTodoDocument = /\/\/\s*TODO:\s*(Document|Add docs|document this)/i.test(fileContentForAnalysis);
                          const exportCount = (fileContentForAnalysis.match(/export\s+(default\s+)?(async\s+)?(class|function|const|let|var|type|interface|enum)/g) || []).length;
                          
                          let needsDoc = false;
                          let estimatedCoverage = 0.5; // Default heuristic value
                
                          if (exportCount > 0) { // Only consider files with exports for detailed coverage heuristics
                            if (hasTodoDocument) {
                              needsDoc = true;
                              estimatedCoverage = 0.1; // Very low coverage if explicitly marked with TODO
                              this.logger.debug(`File ${filePath} marked with TODO for documentation.`);
                            } else if (hasDocComments) {
                              // Simple heuristic: count JSDoc blocks vs exports.
                              // A real system would parse AST to map comments to specific exports.
                              const commentBlockCount = (fileContentForAnalysis.match(/\/\*\*\s*([\s\S]*?)\s*\*\//g) || []).length;
                              estimatedCoverage = Math.min(1, commentBlockCount / exportCount); // Ensure exportCount is not zero
                              needsDoc = estimatedCoverage < (step.data?.coverageTarget || 0.7); // Needs more docs if coverage is below target (default 70%)
                              this.logger.debug(`File ${filePath} has ${commentBlockCount} doc comment(s) and ${exportCount} export(s). Estimated coverage: ${estimatedCoverage.toFixed(2)}. Needs docs: ${needsDoc}`);
                            } else {
                              needsDoc = true; // No doc comments but has exports
                              estimatedCoverage = 0.0;
                              this.logger.debug(`File ${filePath} has ${exportCount} export(s) but no doc comments. Needs docs.`);
                            }
                          } else {
                            needsDoc = false; // No exports, heuristic assumes it doesn't need top-level file docs in the same way
                            estimatedCoverage = 1.0; // Or N/A, depending on definition. For simplicity, assume covered.
                            this.logger.debug(`File ${filePath} has no exports. Assuming no specific documentation needed via this heuristic.`);
                          }

          if (needsDoc) filesRequiringDocsCount++;

          analyzedFiles.push({
            path: filePath,
            type,
            lastModified: stats.mtime.toISOString(),
            needsDocumentation: needsDoc,
            coverage: parseFloat(estimatedCoverage.toFixed(2)),
            elementsCount: exportCount // Store count of exported elements found
          });
        } catch (fileStatError: unknown) { // any zu unknown
          const statErrorMsg = fileStatError instanceof Error ? fileStatError.message : 'Unknown stat error';
          this.logger.warn(`Could not stat file ${fullPath}: ${statErrorMsg}`);
        }
      }
      
      const message = `Codebase analysis complete. Found ${filesFoundCount} files matching patterns. ${filesRequiringDocsCount} files identified as potentially requiring documentation.`;
      return {
        type: 'analyze-codebase',
        success: true,
        stepId: step.id,
        message,
        summary: message,
        data: { analysisResults: { files: analyzedFiles, patternsUsed: patterns, basePath } },
      };
    } catch (error: unknown) { // any zu unknown
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
  private async extractDocumentation(step: PlanStep, context: Record<string, unknown>): Promise<ExecutionResult> { // any zu unknown
    const extractExamples = step.data?.extractExamples === true;
    const commentTypes = step.data?.commentTypes || ['JSDoc', 'TSDoc']; // Specify which comment types to look for
    this.logger.info('Extracting documentation from code', { extractExamples, commentTypes });

    const previousAnalysisStep = Object.values(context).find(s => (s as ExecutionResult).type === 'analyze-codebase') as ExecutionResult | undefined;
    const filesToProcess: { path: string, needsDocumentation?: boolean, elements?: any[] }[] = previousAnalysisStep?.data?.analysisResults?.files || [];
    const basePath = previousAnalysisStep?.data?.analysisResults?.basePath || '.';


    if (!filesToProcess || filesToProcess.length === 0) {
      const errorMsg = 'No files data available from codebase analysis step for documentation extraction.';
      this.logger.warn(errorMsg, { analysisContext: previousAnalysisStep });
      return { type: 'extract-documentation', success: true, stepId: step.id, message: errorMsg, summary: errorMsg, data: { message: 'No files to process.', extractedDocItems: [] } };
    }
    
    const extractedItemsOverall: any[] = [];
    let filesProcessedCount = 0;
    let elementsExtractedCount = 0;

    for (const fileInfo of filesToProcess) {
      // Ensure fileInfo and fileInfo.path are defined
      if (!fileInfo || typeof fileInfo.path !== 'string') {
        this.logger.warn('Skipping invalid fileInfo object in filesToProcess', { fileInfo });
        continue;
      }

      if (!fileInfo.needsDocumentation && !step.data?.forceExtractAll) continue;

      const fullPath = path.join(basePath, fileInfo.path);
      this.logger.debug(`Extracting from: ${fullPath}`);
      filesProcessedCount++;
      try {
        const fileContent = await fs.readFile(fullPath, 'utf-8');
        
        const extractedElements: any[] = [];
        // NOTE: The following documentation extraction uses regular expressions.
        // This is a simplification and can be error-prone for complex code structures or nested comments.
        // A more robust solution would involve using an Abstract Syntax Tree (AST) parser
        // (e.g., TypeScript API, Babel, esprima) to accurately identify code elements and their associated comments.
        this.logger.debug(`Using regex-based comment extraction for ${fullPath}. For complex scenarios, consider AST parsing.`);

        // Improved Regex for JSDoc/TSDoc blocks and associated code structure
        // This regex tries to capture the comment block and the line(s) following it to infer name and type
        const jsdocRegex = /\/\*\*\s*([\s\S]*?)\s*\*\/\s*([\s\S]*?)(?=(\/\*\*|$|\n\s*(?:export|class|interface|type|const|let|var|function|async function|private|public|protected|static)))/g;
        let match;
        while((match = jsdocRegex.exec(fileContent)) !== null) {
            const commentBlockContent = match[1].trim();
            const followingCode = match[2].trim();
            
            let elementName = "UnnamedElement";
            let elementType = "unknown";

            // Attempt to infer name and type from the following code
            const firstCodeLine = followingCode.split('\n')[0].trim();
            const nameTypeMatch = /^(?:export\s+)?(?:default\s+)?(?:async\s+)?(class|interface|type|const|let|var|function)\s+([a-zA-Z0-9_]+)/.exec(firstCodeLine);
            if (nameTypeMatch) {
                elementType = nameTypeMatch[1];
                elementName = nameTypeMatch[2];
            } else {
                // Fallback for function expressions, arrow functions, etc.
                const assignmentMatch = /^(?:export\s+)?(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*[:=]/.exec(firstCodeLine);
                if (assignmentMatch) {
                    elementName = assignmentMatch[1];
                    if (firstCodeLine.includes('function') || firstCodeLine.includes('=>')) {
                        elementType = 'function';
                    } else if (firstCodeLine.includes('{')) {
                        elementType = 'object';
                    }
                }
            }

            let description = "";
            const descMatch = /@description\s+([^*](?:[^*]|\*(?!\/))*)/s.exec(commentBlockContent); // More robust description extraction
            if (descMatch) description = descMatch[1].replace(/\n\s*\*/g, '\n').trim(); // Clean up multiline descriptions
            else {
                const firstAt = commentBlockContent.indexOf('@');
                description = (firstAt === -1 ? commentBlockContent : commentBlockContent.substring(0, firstAt))
                              .replace(/^\s*\*\s?/gm, '') // Remove leading asterisks and spaces per line
                              .trim();
            }

            const params: any[] = [];
            const paramRegex = /@param\s+(?:\{([^}]+)\}\s+)?([a-zA-Z0-9_.]+)\s*(?:-\s*)?((?:[^*]|\*(?!\/))*)/g;
            let paramMatch;
            while((paramMatch = paramRegex.exec(commentBlockContent)) !== null) {
                params.push({ name: paramMatch[2], type: paramMatch[1] || 'any', description: paramMatch[3]?.replace(/\n\s*\*/g, '\n').trim() });
            }
            
            const returnsMatch = /@returns?\s+(?:\{([^}]+)\}\s*)?((?:[^*]|\*(?!\/))*)/s.exec(commentBlockContent);
            const returns = returnsMatch ? { type: returnsMatch[1] || 'any', description: returnsMatch[2]?.replace(/\n\s*\*/g, '\n').trim() } : undefined;

            extractedElements.push({
                type: elementType,
                name: elementName === "UnnamedElement" ? `${elementName}_${elementsExtractedCount}` : elementName,
                description,
                params,
                returns,
                filePath: fileInfo.path,
                commentBlock: `/**\n${commentBlockContent}\n */`, // Reconstruct for storage
                followingCodeSnippet: firstCodeLine // Store the line used for inference
            });
            elementsExtractedCount++;
        }
        
        if(extractedElements.length === 0 && fileInfo.needsDocumentation) {
             extractedElements.push({ type: 'file_placeholder', name: fileInfo.path, description: 'File marked for documentation, but no specific JSDoc/TSDoc elements extracted via current regex.', filePath: fileInfo.path });
             elementsExtractedCount++;
        }

        if (extractedElements.length > 0) {
          extractedItemsOverall.push(...extractedElements);
        }
      } catch (error: unknown) { // any zu unknown
        const extractErrorMsg = error instanceof Error ? error.message : 'Unknown extraction error';
        this.logger.error(`Failed to extract documentation from ${fullPath}: ${extractErrorMsg}`);
      }
    }
    
    const message = `Successfully processed ${filesProcessedCount} files for documentation extraction. Extracted ${elementsExtractedCount} documentation elements.`;
    return {
      type: 'extract-documentation',
      success: true,
      stepId: step.id,
      message,
      summary: message,
      data: { extractedDocItems: extractedItemsOverall, examplesExtracted: extractExamples, filesProcessedCount },
    };
  }

  /**
   * Generates documentation files based on extracted information
   */
  private async generateDocumentation(step: PlanStep, context: Record<string, unknown>): Promise<ExecutionResult> { // any zu unknown
    const outputFormat = step.data?.format || 'markdown'; // e.g., markdown, html
    const outputDir = step.data?.outputDir || 'docs/generated';
    const templateName = step.data?.template || 'default'; // Allow specifying a template
    this.logger.info('Generating documentation', { outputFormat, outputDir, templateName });

    const previousExtractStep = Object.values(context).find(s => (s as ExecutionResult).type === 'extract-documentation') as ExecutionResult | undefined;
    const extractedDocItems: any[] = previousExtractStep?.data?.extractedDocItems || [];
    const basePath = previousExtractStep?.data?.analysisResults?.basePath || '.';


    if (extractedDocItems.length === 0) {
      const msg = 'No extracted documentation items available for generation.';
      this.logger.info(msg, { extractContext: previousExtractStep });
      return { type: 'generate-documentation', success: true, stepId: step.id, message: msg, summary: msg, data: { message: msg, generatedFiles: [] } };
    }

    await fs.mkdir(outputDir, { recursive: true });
    const generatedFiles: { sourceFilePath?: string, outputFilePath: string, sizeBytes: number, status: string, error?: string }[] = [];

    // Group items by file path for per-file documentation
    const itemsByFile: Record<string, any[]> = extractedDocItems.reduce((acc, item) => {
      const key = item.filePath || 'unknown_file';
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
      // NOTE: For more complex documentation structures or custom theming,
      // consider using a templating engine (e.g., Handlebars, EJS, Nunjucks)
      // instead of direct string concatenation.
      if (outputFormat === 'markdown') {
        for (const item of items) {
          docContent += `## \`${item.name || 'Unnamed Element'}\` (${item.type || 'N/A'})\n\n`;
          docContent += `${item.description || 'No description.'}\n\n`;
          if (item.params && item.params.length > 0) {
            docContent += `### Parameters\n`;
            item.params.forEach((p: any) => {
              docContent += `- \`${p.name}\` (\`${p.type || 'any'}\`): ${p.description || 'No description.'}\n`;
            });
            docContent += `\n`;
          }
          if (item.returns) {
            docContent += `### Returns\n`;
            docContent += `- (\`${item.returns.type || 'any'}\`): ${item.returns.description || 'No description.'}\n\n`;
          }
          docContent += `---\n`;
        }
      } else if (outputFormat === 'html') {
        // Basic HTML structure - a real implementation would use a templating engine
        docContent = `<html><head><title>Docs for ${filePath}</title></head><body><h1>Documentation for ${filePath}</h1>`;
        for (const item of items) {
          docContent += `<div><h2><code>${item.name || 'Unnamed Element'}</code> (${item.type || 'N/A'})</h2>`;
          docContent += `<p>${item.description || 'No description.'}</p>`;
          if (item.params && item.params.length > 0) {
            docContent += `<h3>Parameters</h3><ul>`;
            item.params.forEach((p: any) => {
              docContent += `<li><b>${p.name}</b> (<code>${p.type || 'any'}</code>): ${p.description || 'No description.'}</li>`;
            });
            docContent += `</ul>`;
          }
          if (item.returns) {
            docContent += `<h3>Returns</h3><p>(<code>${item.returns.type || 'any'}</code>): ${item.returns.description || 'No description.'}</p>`;
          }
          docContent += `</div><hr/>`;
        }
        docContent += `</body></html>`;
      } else {
        // Placeholder for other formats
        docContent = JSON.stringify(items, null, 2);
      }
      
      // Sanitize filePath for use as a filename
      const safeFileName = filePath.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const outputFilePath = path.join(outputDir, `${safeFileName}.${outputFormat === 'markdown' ? 'md' : outputFormat}`);
      
      try {
        await fs.writeFile(outputFilePath, docContent);
        const stats = await fs.stat(outputFilePath);
        generatedFiles.push({
          sourceFilePath: filePath,
          outputFilePath,
          sizeBytes: stats.size,
          status: 'success',
        });
      } catch (error: unknown) {
        const writeErrorMsg = error instanceof Error ? error.message : 'Unknown error writing documentation file';
        this.logger.error(`Failed to write documentation file ${outputFilePath}: ${writeErrorMsg}`);
        generatedFiles.push({
          sourceFilePath: filePath,
          outputFilePath,
          sizeBytes: 0,
          status: 'failed',
          error: writeErrorMsg,
        });
      }
    }
    
    const message = `Successfully generated ${generatedFiles.filter(f=>f.status === 'success').length} documentation files in ${outputFormat} format to ${outputDir}.`;
    return {
      type: 'generate-documentation',
      success: true,
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
    const validationIssues: any[] = [];
    
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
                // For external links, a real check would involve an HTTP request.
                // This is a SIMULATION. A production system would use a library to make HEAD or GET requests.
                this.logger.debug(`Simulating check for external link: ${link} in ${docFile.outputFilePath}`);
                if (link.includes('example.com/broken-link-test-simulation')) { // More specific simulation trigger
                    brokenLinksFound++;
                    validationIssues.push({ file: docFile.outputFilePath, type: 'broken_external_link_simulated', link, message: "Simulated broken external link." });
                    this.logger.warn(`Simulated broken external link found: ${link} in ${docFile.outputFilePath}`);
                }
            } else if (!link.startsWith('#') && !link.startsWith('mailto:')) {
                // Handle relative local links
                this.logger.debug(`Checking local link: ${link} in ${docFile.outputFilePath}`);
                const outputDir = previousGenerateStep?.data?.outputDirectory || 'docs/generated';
                let targetPath = path.resolve(path.dirname(docFile.outputFilePath), link);
                
                // If link seems to be to another generated doc, try to resolve it within outputDir
                // e.g. [My Component](./my-component.md)
                const isLikelyInternalDocLink = /\.(md|html)$/i.test(link);
                if (isLikelyInternalDocLink && !link.startsWith('/') && !path.isAbsolute(link)) {
                    // This logic assumes links are relative to the current doc file's location within outputDir
                } else if (!isLikelyInternalDocLink && !link.startsWith('/') && !path.isAbsolute(link)) {
                    // Could be a link to a source file or other asset, resolve relative to project root or source file location
                    // This part is complex as "correct" base for relative links depends on documentation tool and setup
                    // For now, assume relative to the doc file itself.
                }


                try {
                    await fs.access(targetPath);
                } catch (e1) {
                    // Try resolving relative to the root of the generated docs output directory
                    const targetPathFromDocsRoot = path.resolve(outputDir, link.startsWith('./') ? link.substring(2) : link);
                    try {
                        await fs.access(targetPathFromDocsRoot);
                    } catch (e2) {
                        // Final check: if it's a link to a source file (e.g. from generated doc to original .ts)
                        // This is a heuristic and might need refinement based on actual link patterns
                        const sourceFileBaseDir = docFile.sourceFilePath ? path.dirname(path.resolve(previousAnalysisStep?.data?.analysisResults?.basePath || '.', docFile.sourceFilePath)) : null;
                        if (sourceFileBaseDir) {
                            const targetPathFromSource = path.resolve(sourceFileBaseDir, link);
                             try {
                                await fs.access(targetPathFromSource);
                             } catch (e3) {
                                brokenLinksFound++;
                                validationIssues.push({ file: docFile.outputFilePath, type: 'broken_local_link', link, attemptedPaths: [targetPath, targetPathFromDocsRoot, targetPathFromSource] });
                             }
                        } else {
                             brokenLinksFound++;
                             validationIssues.push({ file: docFile.outputFilePath, type: 'broken_local_link', link, attemptedPaths: [targetPath, targetPathFromDocsRoot] });
                        }
                    }
                }
            }
          }
        }
      } catch (error: unknown) { // any zu unknown
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
  private async generateApiDocs(step: PlanStep, context: Record<string, unknown>): Promise<ExecutionResult> { // any zu unknown
    const outputFormat = step.data?.format || 'html'; // e.g., html, openapi_json, markdown
    const outputDir = step.data?.outputDir || 'docs/api';
    const apiSpecPath = step.data?.apiSpecPath; // Path to an OpenAPI/Swagger spec file
    const useExtractedItems = step.data?.useExtractedItems !== false; // Default to using extracted items if no spec path
    this.logger.info('Generating API documentation', { outputFormat, outputDir, apiSpecPath, useExtractedItems });

    let sourceDescription = "";
    let itemsToProcess: any[] = [];

    if (apiSpecPath) {
      sourceDescription = `API specification file: ${apiSpecPath}`;
      try {
        const fullSpecPath = path.resolve(apiSpecPath); // Ensure path is absolute or resolved correctly
        const specContent = await fs.readFile(fullSpecPath, 'utf-8');
        if (specContent.includes('openapi:') || specContent.includes('swagger:')) { // Basic check
             itemsToProcess = [{ name: 'API Overview from Spec', type: 'api_spec', description: `Full API documentation based on ${apiSpecPath}`, filePath: apiSpecPath, content: specContent }];
        } else {
            throw new Error('Invalid API specification file format or content.');
        }
      } catch (error: unknown) { // any zu unknown
        const loadSpecErrorMsg = error instanceof Error ? error.message : 'Unknown error loading API spec';
        this.logger.error(`Failed to load API spec file ${apiSpecPath}: ${loadSpecErrorMsg}`);
        return { type: 'generate-api-docs', success: false, stepId: step.id, message: `Error loading API spec: ${loadSpecErrorMsg}`, summary: 'API spec loading failed.', data: { error: loadSpecErrorMsg, apiSpecPath } };
      }
    } else if (useExtractedItems) {
      const previousExtractStep = Object.values(context).find(s => (s as ExecutionResult).type === 'extract-documentation') as ExecutionResult | undefined;
      itemsToProcess = previousExtractStep?.data?.extractedDocItems || [];
      sourceDescription = "extracted code comments";
      if (itemsToProcess.length === 0) {
        const msg = 'No extracted documentation items available and no API spec path provided for API documentation generation.';
        this.logger.warn(msg, { extractContext: previousExtractStep });
        return { type: 'generate-api-docs', success: true, stepId: step.id, message: msg, summary: msg, data: { message: msg, apiDocFiles: [] } };
      }
    } else {
      const errorMsg = 'No API spec path provided and useExtractedItems is false. Cannot generate API docs.';
      this.logger.warn(errorMsg);
      return { type: 'generate-api-docs', success: false, stepId: step.id, message: errorMsg, summary: errorMsg, data: { error: errorMsg } };
    }
    
    await fs.mkdir(outputDir, { recursive: true });
    const apiDocFiles: { source: string, outputFilePath: string, sizeBytes: number, status: string, error?: string }[] = [];

    let apiDocContent = ``;
    if (outputFormat === 'html') {
        apiDocContent = `<html><head><title>API Reference</title><style>body{font-family:sans-serif;} pre{background:#f4f4f4;padding:1em;overflow:auto;}</style></head><body><h1>API Reference</h1><p>Source: ${sourceDescription}</p><hr/>`;
    } else if (outputFormat === 'markdown') {
        apiDocContent = `# API Reference\n\nSource: ${sourceDescription}\n\n---\n\n`;
    }


    if (apiSpecPath && itemsToProcess.length > 0 && itemsToProcess[0].type === 'api_spec') {
        // If we have a spec file, the "generation" might be just copying it or using a dedicated tool.
        // This is a SIMPLIFIED placeholder. For production, use tools like Swagger UI, Redocly, or similar
        // to generate rich, interactive API documentation from an OpenAPI/Swagger spec.
        this.logger.warn(`Processing API spec file ${apiSpecPath} with simplified placeholder logic. Consider dedicated tools for production.`);
        if (outputFormat === 'openapi_json') {
            apiDocContent = itemsToProcess[0].content; // Directly use the spec content if JSON output is requested
        } else if (outputFormat === 'html') {
            // Basic HTML rendering of a supposed spec. Real tools would generate interactive UIs.
            apiDocContent += `<h2>API Specification (from ${itemsToProcess[0].filePath})</h2>
                              <p><strong>Note:</strong> This is a basic rendering. For interactive API docs, use tools like Swagger UI or Redocly.</p>
                              <pre><code>${itemsToProcess[0].content.replace(/</g, "<").replace(/>/g, ">")}</code></pre>`;
        } else if (outputFormat === 'markdown') {
            apiDocContent += `## API Specification (from ${itemsToProcess[0].filePath})\n\n
**Note:** This is a basic rendering. For interactive API docs, consider dedicated tools.\n\n
\`\`\`json\n${itemsToProcess[0].content}\n\`\`\`\n`;
        } else {
            this.logger.warn(`Unsupported output format '${outputFormat}' for API spec. Defaulting to raw content.`);
            apiDocContent += `Raw API Spec Content from ${itemsToProcess[0].filePath}:\n\n${itemsToProcess[0].content}`;
        }
    } else { // Generating from extracted items (less common for formal API docs but supported as fallback)
        this.logger.info(`Generating API documentation from extracted code comments. For formal API docs, an OpenAPI/Swagger spec is recommended.`);
        itemsToProcess.forEach(item => {
          if (outputFormat === 'markdown') {
            apiDocContent += `## \`${item.name || 'Unnamed'}\` (${item.type || 'N/A'})\n\n${item.description || ''}\n\n`;
            // Add params, returns etc. for markdown if available
          } else if (outputFormat === 'html') {
            apiDocContent += `<div><h2><code>${item.name || 'Unnamed'}</code> (${item.type || 'N/A'})</h2><p>${item.description || ''}</p></div>`;
          } else {
            apiDocContent += JSON.stringify(item, null, 2) + '\n';
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
        source: apiSpecPath || (itemsToProcess.length > 0 && itemsToProcess[0].filePath ? itemsToProcess[0].filePath : 'extracted_items'),
        outputFilePath,
        sizeBytes: stats.size,
        status: 'success',
      });
    } catch (error: unknown) {
      const writeApiDocErrorMsg = error instanceof Error ? error.message : 'Unknown error writing API documentation file';
      this.logger.error(`Failed to write API documentation file ${outputFilePath}: ${writeApiDocErrorMsg}`);
      apiDocFiles.push({
        source: apiSpecPath || (itemsToProcess.length > 0 && itemsToProcess[0].filePath ? itemsToProcess[0].filePath : 'extracted_items'), // Sicherstellen, dass source einen Wert hat
        outputFilePath,
        sizeBytes: 0,
        status: 'failed',
        error: writeApiDocErrorMsg, // Korrekt hier
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
      data: { apiDocFiles, outputFormat, outputDirectory: outputDir, sourceUsed: apiSpecPath ? 'api_spec' : (useExtractedItems ? 'extracted_items' : 'none') },
    };
  }
}
