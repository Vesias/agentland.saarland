// Memory Bank MCP Server
// Provides long-term memory storage and retrieval

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3022;
const SERVER_NAME = "memory-bank";
const LOG_FILE = path.join(process.env.HOME, '.claude', 'logs', 'memory_bank.log');
const MEMORY_FILE = path.join(process.env.HOME, '.claude', 'storage', 'memory_bank.json');

// Ensure log directory exists
const logDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Ensure storage directory exists
const storageDir = path.dirname(MEMORY_FILE);
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

// Ensure memory file exists
if (!fs.existsSync(MEMORY_FILE)) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify({
    memories: [],
    metadata: {
      created: new Date().toISOString(),
      version: '1.0.0'
    }
  }));
}

// Log function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  
  // Append to log file
  fs.appendFileSync(LOG_FILE, logMessage);
}

// Load memories
function loadMemories() {
  try {
    const data = fs.readFileSync(MEMORY_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    log(`Error loading memories: ${error.message}`);
    return {
      memories: [],
      metadata: {
        created: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }
}

// Save memories
function saveMemories(memoryData) {
  try {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(memoryData, null, 2));
    return true;
  } catch (error) {
    log(`Error saving memories: ${error.message}`);
    return false;
  }
}

// Create server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
    
    // Get memory stats
    const memoryData = loadMemories();
    const memoryCount = memoryData.memories.length;
    
    res.end(JSON.stringify({
      status: 'healthy',
      name: SERVER_NAME,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '1.0.0',
      stats: {
        memory_count: memoryCount
      }
    }));
    return;
  }
  
  // Handle store memory endpoint
  if (req.url === '/api/store' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { key, value, metadata = {} } = data;
        
        if (!key || !value) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Key and value are required' }));
          return;
        }
        
        log(`Storing memory: "${key}"`);
        
        // Load current memories
        const memoryData = loadMemories();
        
        // Check if memory with this key already exists
        const existingIndex = memoryData.memories.findIndex(m => m.key === key);
        
        if (existingIndex >= 0) {
          // Update existing memory
          memoryData.memories[existingIndex] = {
            key,
            value,
            metadata: {
              ...metadata,
              updated: new Date().toISOString()
            }
          };
        } else {
          // Add new memory
          memoryData.memories.push({
            key,
            value,
            metadata: {
              ...metadata,
              created: new Date().toISOString()
            }
          });
        }
        
        // Save updated memories
        if (saveMemories(memoryData)) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            key
          }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to save memory' }));
        }
      } catch (error) {
        log(`Error processing request: ${error.message}`);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
    
    return;
  }
  
  // Handle retrieve memory endpoint
  if (req.url === '/api/retrieve' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { key } = data;
        
        if (!key) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Key is required' }));
          return;
        }
        
        log(`Retrieving memory: "${key}"`);
        
        // Load memories
        const memoryData = loadMemories();
        
        // Find memory with this key
        const memory = memoryData.memories.find(m => m.key === key);
        
        if (memory) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            memory
          }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Memory not found' }));
        }
      } catch (error) {
        log(`Error processing request: ${error.message}`);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
    
    return;
  }
  
  // Handle search memories endpoint
  if (req.url === '/api/search' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { query, maxResults = 10 } = data;
        
        if (!query) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Query is required' }));
          return;
        }
        
        log(`Searching memories for: "${query}"`);
        
        // Load memories
        const memoryData = loadMemories();
        
        // Simple search - check if query is in key or value
        // In a real implementation, this would use embeddings/vector search
        const results = memoryData.memories
          .filter(memory => {
            const keyMatch = memory.key.toLowerCase().includes(query.toLowerCase());
            const valueMatch = typeof memory.value === 'string' && 
                               memory.value.toLowerCase().includes(query.toLowerCase());
            return keyMatch || valueMatch;
          })
          .slice(0, maxResults);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          results,
          count: results.length
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

// Start server
server.listen(PORT, () => {
  log(`Memory Bank MCP Server running on port ${PORT}`);
});

// Handle shutdown
process.on('SIGINT', () => {
  log('Server shutting down...');
  server.close(() => {
    log('Server closed');
    process.exit(0);
  });
});