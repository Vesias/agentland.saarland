// Context7 MCP Server
// Provides contextual awareness framework

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3021;
const SERVER_NAME = "context7";
const LOG_FILE = path.join(process.env.HOME, '.claude', 'logs', 'context7.log');
const AI_DOCS_DIR = path.join(process.env.HOME, 'Dokumente', 'agent.saarland', 'ai_docs');

// Ensure log directory exists
const logDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Log function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  
  // Append to log file
  fs.appendFileSync(LOG_FILE, logMessage);
}

// Create server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Handle status endpoint
  if (req.url === '/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      name: SERVER_NAME,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '1.0.0'
    }));
    return;
  }
  
  // Handle API endpoints
  if (req.url === '/api/getContext' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { query, maxResults = 3 } = data;
        
        if (!query) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Query is required' }));
          return;
        }
        
        log(`Context request: "${query.substring(0, 30)}..." (maxResults: ${maxResults})`);
        
        // Retrieve relevant documents
        const results = findRelevantDocuments(query, maxResults);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          results,
          meta: {
            total_results: results.length,
            query_length: query.length,
            search_path: AI_DOCS_DIR
          }
        }));
      } catch (error) {
        log(`Error processing request: ${error.message}`);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
    
    return;
  }
  
  // Handle unknown endpoints
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Find relevant documents (simple simulation)
function findRelevantDocuments(query, maxResults) {
  const results = [];
  
  // Check if AI docs directory exists
  if (!fs.existsSync(AI_DOCS_DIR)) {
    log(`AI docs directory not found: ${AI_DOCS_DIR}`);
    return results;
  }
  
  // Very simple search - just find files containing query words
  // In a real implementation, this would use embeddings/vector search
  const queryWords = query.toLowerCase().split(/\s+/);
  
  try {
    // Get all markdown files recursively
    const mdFiles = findMarkdownFiles(AI_DOCS_DIR);
    
    // Search in files
    for (const filePath of mdFiles) {
      // Read file content
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Simple relevance score - count query word occurrences
      let score = 0;
      for (const word of queryWords) {
        const regex = new RegExp(word, 'gi');
        const matches = content.match(regex);
        if (matches) {
          score += matches.length;
        }
      }
      
      // If score > 0, file contains at least one query word
      if (score > 0) {
        // Get relative path for cleaner output
        const relativePath = path.relative(AI_DOCS_DIR, filePath);
        
        // Extract a snippet containing the query
        const snippet = extractSnippet(content, queryWords);
        
        results.push({
          path: relativePath,
          score,
          snippet
        });
      }
      
      // Stop when we have enough results
      if (results.length >= maxResults) {
        break;
      }
    }
    
    // Sort by score (highest first)
    results.sort((a, b) => b.score - a.score);
    
    return results.slice(0, maxResults);
  } catch (error) {
    log(`Error searching documents: ${error.message}`);
    return results;
  }
}

// Find all markdown files in a directory recursively
function findMarkdownFiles(dir) {
  const files = [];
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      // Recursively search subdirectories
      files.push(...findMarkdownFiles(itemPath));
    } else if (stats.isFile() && itemPath.endsWith('.md')) {
      // Add markdown files
      files.push(itemPath);
    }
  }
  
  return files;
}

// Extract a snippet containing query words
function extractSnippet(content, queryWords) {
  // Split content into lines
  const lines = content.split('\n');
  
  // Find a line containing any query word
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    for (const word of queryWords) {
      if (line.includes(word)) {
        // Found a matching line, return it with some context
        const startLine = Math.max(0, i - 1);
        const endLine = Math.min(lines.length - 1, i + 1);
        
        return lines.slice(startLine, endLine + 1).join('\n');
      }
    }
  }
  
  // No match found, return first few lines
  return lines.slice(0, 3).join('\n');
}

// Start server
server.listen(PORT, () => {
  log(`Context7 MCP Server running on port ${PORT}`);
});

// Handle shutdown
process.on('SIGINT', () => {
  log('Server shutting down...');
  server.close(() => {
    log('Server closed');
    process.exit(0);
  });
});