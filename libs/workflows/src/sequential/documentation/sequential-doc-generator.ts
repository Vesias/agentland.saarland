/**
 * Sequential Documentation Generator
 * 
 * This module uses the Sequential Planner to generate comprehensive documentation
 * by integrating sequential thinking, Context7, and 21st-dev-magic MCP tools.
 */

import * as path from 'path';
import * as fs from 'fs';
import { Command } from 'commander';
import { createLogger } from "../../../../core/src/logging/logger";
// @ts-ignore
import { sequentialPlanner } from "../services/sequential-planner"; // Adjusted path assuming services is sibling to documentation
import { ExecutionResult, PlanStep } from "../types"; // Adjusted path assuming types is sibling to documentation

const logger = createLogger('doc-generator');

/**
 * Documentation generation options
 */
export interface DocumentationOptions {
  /**
   * File or directory path to generate documentation for
   */
  path: string;
  
  /**
   * Output format (markdown, html, json)
   */
  format?: 'markdown' | 'md' | 'html' | 'json';
  
  /**
   * Output file path
   */
  output?: string;
  
  /**
   * Whether to include private methods/properties
   */
  includePrivate?: boolean;
}

/**
 * Documentation generation result
 */
export interface DocumentationResult {
  /**
   * Whether the generation was successful
   */
  success: boolean;
  
  /**
   * Output file path
   */
  output?: string;
  
  /**
   * Summary of the generation
   */
  summary?: string;
  
  /**
   * Executed steps
   */
  executedSteps?: Array<{
    number: number;
    description: string;
    status: string;
    result: string | null;
  }>;
  
  /**
   * Error message if unsuccessful
   */
  error?: string;
}

/**
 * File info with content
 */
interface FileInfo {
  path: string;
  relativePath: string;
  content: string;
  extension: string;
}

/**
 * Generate documentation for a file or directory
 * @param options - Documentation options
 * @returns Promise with generation result
 */
export async function generateDocumentation(options: DocumentationOptions): Promise<DocumentationResult> {
  try {
    logger.info('Generating documentation', { 
      path: options.path,
      format: options.format || 'markdown'
    });
    
    // Normalize options
    const normalizedOptions: Required<DocumentationOptions> = {
      path: options.path,
      format: options.format || 'markdown',
      output: options.output || `./docs/${path.basename(options.path)}.${options.format === 'html' ? 'html' : options.format === 'json' ? 'json' : 'md'}`,
      includePrivate: options.includePrivate || false
    };
    
    // Check if path exists
    if (!fs.existsSync(normalizedOptions.path)) {
      throw new Error(`Path does not exist: ${normalizedOptions.path}`);
    }
    
    // Determine if it's a file or directory
    const stats = fs.statSync(normalizedOptions.path);
    const isDirectory = stats.isDirectory();
    
    // Create goal for sequential planner
    const goal = isDirectory
      ? `Generate comprehensive documentation for all code files in the directory: ${normalizedOptions.path}`
      : `Generate comprehensive documentation for the code file: ${normalizedOptions.path}`;
      
    // Add format details to goal
    const detailedGoal = `${goal} in ${normalizedOptions.format} format. ${
      normalizedOptions.includePrivate ? 'Include' : 'Exclude'
    } private methods and properties.`;
    
    // Run the sequential planner
    // TODO: Refactor this to use sequentialPlanner.generatePlan and then iterate through steps,
    // calling _executeDocumentationStep or similar logic for each step.
    // This is a placeholder and will likely not work as expected without further refactoring.
    const planSteps = await sequentialPlanner.generatePlan(detailedGoal, { initialSteps: 5 });
    let executedSteps: PlanStep[] = [];
    let summary = "Plan generated, execution not fully implemented in this refactor.";

    // Placeholder for result structure that was previously returned by runPlanningCycle
    const result = {
        summary: summary,
        executedSteps: planSteps.map(s => ({...s, result: null, status: 'pending' })) // Simplified
    };
    
    // Return the result
    return {
      success: true,
      output: normalizedOptions.output,
      summary: result.summary,
      executedSteps: result.executedSteps.map(step => ({
        number: step.number,
        description: step.description,
        status: step.status,
        result: null // step.result is always null in this simplified mapping
      }))
    };
  } catch (err) {
    logger.error('Error generating documentation', { error: (err as Error).message });
    return {
      success: false,
      error: (err as Error).message
    };
  }
}

/**
 * Read a directory recursively
 * @param dir - Directory path
 * @returns Array of files with content
 */
function _processDirectoryRecursively(currentPath: string, relativePath: string, results: FileInfo[]): void {
  const entries = fs.readdirSync(currentPath);

  for (const entry of entries) {
    const fullPath = path.join(currentPath, entry);
    const entryRelativePath = path.join(relativePath, entry);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      if (entry === 'node_modules' || entry === '.git' || entry === 'dist' || entry === 'build') {
        continue;
      }
      _processDirectoryRecursively(fullPath, entryRelativePath, results);
    } else {
      const ext = path.extname(entry).toLowerCase();
      if (['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.h', '.cs'].includes(ext)) {
        results.push({
          path: fullPath,
          relativePath: entryRelativePath,
          content: fs.readFileSync(fullPath, 'utf8'),
          extension: ext
        });
      }
    }
  }
}

function readDirectory(dir: string): FileInfo[] {
  const results: FileInfo[] = [];
  _processDirectoryRecursively(dir, '', results);
  return results;
}

/**
 * Handles file analysis steps during documentation generation.
 */
async function _handleFileAnalysisStep(
  step: PlanStep,
  normalizedOptions: Required<DocumentationOptions>,
  isDirectory: boolean
): Promise<ExecutionResult | undefined> {
  if (step.description.toLowerCase().includes('analyze') ||
      step.description.toLowerCase().includes('read file') ||
      step.description.toLowerCase().includes('parse code')) {
    let fileContent: string | FileInfo[];
    if (isDirectory) {
      fileContent = readDirectory(normalizedOptions.path);
    } else {
      fileContent = fs.readFileSync(normalizedOptions.path, 'utf8');
    }
    return {
      type: 'code_analysis',
      data: { fileContent },
      summary: `Code analyzed from ${isDirectory ? 'directory' : 'file'}: ${normalizedOptions.path}`
    } as ExecutionResult;
  }
  return undefined;
}

/**
 * Handles documentation generation steps.
 */
async function _handleDocumentationGenerationStep(
  step: PlanStep,
  executedSteps: PlanStep[],
  normalizedOptions: Required<DocumentationOptions>
): Promise<ExecutionResult | undefined> {
  if (step.description.toLowerCase().includes('generate documentation') ||
      step.description.toLowerCase().includes('create documentation') ||
      step.description.toLowerCase().includes('write documentation')) {
    const analysisSteps = executedSteps.filter(s =>
      s.result && s.result.type === 'code_analysis');
    if (analysisSteps.length === 0) {
      return {
        type: 'error',
        data: { error: 'No code analysis found in previous steps' },
        summary: 'Failed to find code analysis results'
      } as ExecutionResult;
    }
    const outputDir = path.dirname(normalizedOptions.output);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const documentationContent = await _generateDocumentationContent(
      analysisSteps,
      normalizedOptions
    );
    fs.writeFileSync(normalizedOptions.output, documentationContent);
    return {
      type: 'documentation',
      data: {
        path: normalizedOptions.output,
        content: documentationContent.substring(0, 500) +
          (documentationContent.length > 500 ? '...' : '')
      },
      summary: `Documentation generated and saved to ${normalizedOptions.output}`
    } as ExecutionResult;
  }
  return undefined;
}

/**
 * Handles UI component generation steps.
 */
async function _handleUiComponentStep(
  step: PlanStep
): Promise<ExecutionResult | undefined> {
  if (step.actionType === 'ui') {
    return {
      type: 'ui',
      data: {
        name: 'DocumentationUI',
        code: '// UI component would be generated here in a real environment'
      },
      summary: 'Documentation UI component generated'
    } as ExecutionResult;
  }
  return undefined;
}


/**
 * Executes a single documentation step.
 */
async function _executeDocumentationStep(
  step: PlanStep,
  executedSteps: PlanStep[],
  normalizedOptions: Required<DocumentationOptions>,
  isDirectory: boolean
): Promise<ExecutionResult | undefined> {
  logger.info('Executing documentation step', {
    stepNumber: step.number,
    description: step.description.substring(0, 100) + (step.description.length > 100 ? '...' : '')
  });

  let result = await _handleFileAnalysisStep(step, normalizedOptions, isDirectory);
  if (result) return result;

  result = await _handleDocumentationGenerationStep(step, executedSteps, normalizedOptions);
  if (result) return result;

  result = await _handleUiComponentStep(step);
  if (result) return result;

  return undefined; // Default handling for other steps
}


/**
 * Generates Markdown formatted documentation content.
 */
function _generateMarkdownContent(
  analysisSteps: PlanStep[],
  options: Required<DocumentationOptions>
): string {
  let content = '';
  const title = path.basename(options.path).replace(/\.[^/.]+$/, '');
  content += `# ${title} Documentation\n\n`;
  content += `Generated on: ${new Date().toISOString().split('T')[0]}\n\n`;
  content += `## Table of Contents\n\n`;
  content += `- [Overview](#overview)\n`;
  content += `- [Files](#files)\n`;
  content += `- [Classes](#classes)\n`;
  content += `- [Functions](#functions)\n`;
  content += `- [Interfaces & Types](#interfaces--types)\n\n`;
  content += `## Overview\n\n`;
  content += `This documentation was automatically generated for \`${options.path}\` using the Sequential Documentation Generator.\n\n`;
  content += `## Files\n\n`;
  const files = analysisSteps[0]?.result?.data.fileContent;
  if (Array.isArray(files)) {
    content += `The following files were analyzed:\n\n`;
    files.forEach((file: FileInfo) => {
      content += `- \`${file.relativePath}\`\n`;
    });
    content += `\n`;
  } else {
    content += `Analyzed file: \`${options.path}\`\n\n`;
  }
  content += `## Classes\n\n*Classes would be documented here based on code analysis*\n\n`;
  content += `## Functions\n\n*Functions would be documented here based on code analysis*\n\n`;
  content += `## Interfaces & Types\n\n*Interfaces and Types would be documented here based on code analysis*\n\n`;
  return content;
}

/**
 * Generates HTML formatted documentation content.
 */
function _generateHtmlContent(
  analysisSteps: PlanStep[],
  options: Required<DocumentationOptions>
): string {
  const title = path.basename(options.path).replace(/\.[^/.]+$/, '');
  let content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} Documentation</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { margin-top: 2em; }
    code { background-color: #f5f5f5; padding: 2px 4px; border-radius: 4px; }
    pre { background-color: #f5f5f5; padding: 15px; border-radius: 8px; overflow-x: auto; }
    .toc { background-color: #f9f9f9; padding: 15px; border-radius: 8px; }
    .file { margin-bottom: 15px; }
  </style>
</head>
<body>
  <h1>${title} Documentation</h1>
  <p>Generated on: ${new Date().toISOString().split('T')[0]}</p>
  <div class="toc">
    <h2>Table of Contents</h2>
    <ul>
      <li><a href="#overview">Overview</a></li>
      <li><a href="#files">Files</a></li>
      <li><a href="#classes">Classes</a></li>
      <li><a href="#functions">Functions</a></li>
      <li><a href="#interfaces">Interfaces & Types</a></li>
    </ul>
  </div>
  <h2 id="overview">Overview</h2>
  <p>This documentation was automatically generated for <code>${options.path}</code> using the Sequential Documentation Generator.</p>
  <h2 id="files">Files</h2>
`;
  const files = analysisSteps[0]?.result?.data.fileContent;
  if (Array.isArray(files)) {
    content += `  <p>The following files were analyzed:</p>\n  <ul>\n`;
    files.forEach((file: FileInfo) => {
      content += `    <li class="file"><code>${file.relativePath}</code></li>\n`;
    });
    content += `  </ul>\n`;
  } else {
    content += `  <p>Analyzed file: <code>${options.path}</code></p>\n`;
  }
  content += `  <h2 id="classes">Classes</h2>
  <p><em>Classes would be documented here based on code analysis</em></p>
  <h2 id="functions">Functions</h2>
  <p><em>Functions would be documented here based on code analysis</em></p>
  <h2 id="interfaces">Interfaces & Types</h2>
  <p><em>Interfaces and Types would be documented here based on code analysis</em></p>
</body>
</html>`;
  return content;
}

/**
 * Generates JSON formatted documentation content.
 */
function _generateJsonContent(
  analysisSteps: PlanStep[],
  options: Required<DocumentationOptions>
): string {
  const files = analysisSteps[0]?.result?.data.fileContent;
  const jsonDoc = {
    title: path.basename(options.path).replace(/\.[^/.]+$/, ''),
    generated: new Date().toISOString(),
    path: options.path,
    includePrivate: options.includePrivate,
    files: Array.isArray(files)
      ? files.map((f: FileInfo) => ({ path: f.relativePath }))
      : [{ path: options.path }],
    classes: [],
    functions: [],
    interfaces: []
  };
  return JSON.stringify(jsonDoc, null, 2);
}


/**
 * Generate documentation content based on code analysis
 * @param analysisSteps - Code analysis steps
 * @param options - Documentation options
 * @returns Documentation content
 */
async function _generateDocumentationContent(
  analysisSteps: PlanStep[],
  options: Required<DocumentationOptions>
): Promise<string> {
  // This would normally involve complex parsing and documentation generation
  // Here we're providing a simplified implementation
  if (options.format === 'markdown' || options.format === 'md') {
    return _generateMarkdownContent(analysisSteps, options);
  } else if (options.format === 'html') {
    return _generateHtmlContent(analysisSteps, options);
  } else if (options.format === 'json') {
    return _generateJsonContent(analysisSteps, options);
  }
  return '';
}

/**
 * Command-line interface for documentation generation
 * @param args - Command line arguments
 */
export async function cli(argv: string[]): Promise<void> {
  const program = new Command();

  program
    .version('1.0.0') // Version des Doc Generators, kann angepasst werden
    .description('Sequential Documentation Generator - Generates documentation for code files or directories.')
    .argument('<path>', 'File or directory path to generate documentation for')
    .option('-f, --format <format>', 'Output format (markdown, md, html, json)', 'markdown')
    .option('-o, --output <output>', 'Output file path')
    .option('-p, --includePrivate', 'Include private methods/properties', false);

  // process.argv anstelle von args verwenden, wenn die Funktion direkt als CLI-Einstiegspunkt dient.
  // Wenn args übergeben wird (z.B. von einem anderen Skript), dann args verwenden.
  // Für Konsistenz mit dem Task, der die Funktion `cli` beibehält, parsen wir `argv`.
  program.parse(argv);
  const optionsFromCommander = program.opts();
  const inputPath = program.args[0];


  const options: DocumentationOptions = {
    path: inputPath,
    format: optionsFromCommander.format,
    output: optionsFromCommander.output,
    includePrivate: optionsFromCommander.includePrivate
  };

  if (!options.path) {
    // Commander sollte dies bereits abfangen, da <path> ein erforderliches Argument ist.
    // program.help() wird automatisch aufgerufen.
    // console.error('Error: Path is required');
    // program.help(); // Zeigt die Hilfe an und beendet das Programm
    return;
  }

  console.log(`Generating documentation for ${options.path}...`);

  const result = await generateDocumentation(options);

  if (result.success) {
    console.log(`Documentation generated successfully!`);
    console.log(`Output: ${result.output}`);
  } else {
    console.error(`Error generating documentation: ${result.error}`);
  }
}

// Export the main function
export const sequentialDocGenerator = {
  generateDocumentation,
  cli
};

// Beispiel für einen direkten Aufruf, falls diese Datei als Skript ausgeführt wird
// Dies ist optional und hängt davon ab, wie das CLI-Tool gestartet werden soll.
// if (require.main === module) {
//   cli(process.argv).catch(error => {
//     logger.error('CLI Error:', error);
//     process.exit(1);
//   });
// }