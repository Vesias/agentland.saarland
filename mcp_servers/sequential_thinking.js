// Sequential Thinking MCP Server
// Provides recursive thought generation capabilities

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3020;
const SERVER_NAME = "sequential-thinking";
const LOG_FILE = path.join(process.env.HOME, '.claude', 'logs', 'sequential_thinking.log');

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
  if (req.url === '/api/think' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { prompt, depth = 3, steps = 5 } = data;
        
        if (!prompt) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Prompt is required' }));
          return;
        }
        
        log(`Sequential thinking request: "${prompt.substring(0, 30)}..." (depth: ${depth}, steps: ${steps})`);
        
        // Generate sequential thinking response (simple simulation)
        const thoughts = generateSequentialThoughts(prompt, depth, steps);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          result: thoughts,
          meta: {
            depth,
            steps,
            prompt_tokens: prompt.length / 4, // Rough estimation
            completion_tokens: JSON.stringify(thoughts).length / 4 // Rough estimation
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

// Generate sequential thoughts
function generateSequentialThoughts(prompt, depth, steps) {
  const thoughts = [];
  
  for (let i = 0; i < steps; i++) {
    const step = {
      step: i + 1,
      thoughts: []
    };
    
    for (let j = 0; j < depth; j++) {
      step.thoughts.push({
        depth: j + 1,
        content: `Thought ${j + 1} for step ${i + 1}: ${generateThought(prompt, i, j)}`
      });
    }
    
    thoughts.push(step);
  }
  
  return thoughts;
}

// Generate a thought based on prompt, step, and depth
function generateThought(prompt, step, depth) {
  const thoughts = [
    "Consider the implications of this approach",
    "Analyze potential edge cases",
    "Evaluate alternative solutions",
    "Look at this from a different perspective",
    "Apply first principles thinking",
    "Consider the system architecture"
  ];
  
  return thoughts[Math.floor(Math.random() * thoughts.length)];
}

// Start server
server.listen(PORT, () => {
  log(`Sequential Thinking MCP Server running on port ${PORT}`);
});

// Handle shutdown
process.on('SIGINT', () => {
  log('Server shutting down...');
  server.close(() => {
    log('Server closed');
    process.exit(0);
  });
});