#!/usr/bin/env node

/**
 * Simple MCP Server
 * ================
 * 
 * A minimal MCP server implementation for agentland.saarland
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3099;

// Enable CORS
app.use(cors());
app.use(express.json());

// Basic status endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    name: 'simple-mcp-server',
    version: '1.0.0',
    timestamp: Date.now()
  });
});

// MCP API endpoint
app.post('/api/invoke', (req, res) => {
  const { method, params } = req.body;
  
  console.log(`MCP method invoked: ${method}`);
  console.log('Params:', params);
  
  // Handle different methods
  switch (method) {
    case 'sequentialthinking':
      return res.json({
        result: {
          thoughts: [
            "First, I'll analyze the problem by breaking it down into smaller steps.",
            "Then I'll consider different approaches and select the most suitable one.",
            "Finally, I'll implement the solution step by step, verifying each part works as expected."
          ]
        }
      });
      
    case 'getColorSchema':
      return res.json({
        result: {
          name: "Dark Theme",
          colors: {
            primary: "#1565c0",
            secondary: "#03dac6",
            accent: "#cf6679",
            background: "#121212",
            surface: "#1e1e1e",
            text: "#ffffff"
          }
        }
      });
      
    case 'echo':
      return res.json({
        result: {
          input: params,
          timestamp: Date.now()
        }
      });
      
    default:
      console.log(`Unknown method: ${method}`);
      return res.status(400).json({
        error: {
          code: 'method_not_found',
          message: `Method '${method}' not found`
        }
      });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Simple MCP Server running at http://localhost:${PORT}`);
  console.log('Available methods:');
  console.log('- sequentialthinking');
  console.log('- getColorSchema');
  console.log('- echo');
});