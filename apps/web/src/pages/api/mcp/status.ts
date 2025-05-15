import type { NextApiRequest, NextApiResponse } from 'next';

interface MCPServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'error' | 'degraded';
  latency?: number; // in ms
  lastChecked: string;
  // Potentially add endpoint URL or other identifiers
}

// List of known MCP servers (could come from a config file)
const KNOWN_MCP_SERVERS = [
  { name: 'sequentialthinking', healthEndpoint: 'http://localhost:3001/health' }, // Example endpoint
  { name: 'context7', healthEndpoint: 'http://localhost:3002/health' },
  { name: 'desktop-commander', healthEndpoint: 'http://localhost:3003/health' },
  { name: 'brave-search', healthEndpoint: 'http://localhost:3004/health' }, // This might be an external API wrapper
  { name: 'think-mcp', healthEndpoint: 'http://localhost:3005/health' },
  // Add other MCP servers used by the project
  { name: 'github.com/modelcontextprotocol/servers/tree/main/src/filesystem', healthEndpoint: 'http://localhost:3006/health'},
  { name: 'github.com/zcaceres/fetch-mcp', healthEndpoint: 'http://localhost:3007/health'},
  { name: 'github.com/pashpashpash/mcp-webresearch', healthEndpoint: 'http://localhost:3008/health'},
  { name: 'github.com/modelcontextprotocol/servers/tree/main/src/sqlite', healthEndpoint: 'http://localhost:3009/health'},
  { name: 'github.com/pashpashpash/mcp-taskmanager', healthEndpoint: 'http://localhost:3010/health'},
  { name: '@21st-dev/magic', healthEndpoint: 'http://localhost:3011/health'},


];

// Simulated health check function
const checkServerHealth = async (serverName: string, endpoint: string): Promise<Omit<MCPServiceStatus, 'name' | 'lastChecked'>> => {
  // In a real app, you'd use fetch or an HTTP client here:
  // const startTime = Date.now();
  // try {
  //   const response = await fetch(endpoint, { timeout: 2000 }); // 2s timeout
  //   const latency = Date.now() - startTime;
  //   if (response.ok) {
  //     return { status: 'online', latency };
  //   } else if (response.status >= 400 && response.status < 500) {
  //     return { status: 'degraded', latency, details: `Client error: ${response.status}` };
  //   }
  //   return { status: 'error', latency, details: `Server error: ${response.status}` };
  // } catch (error) {
  //   const latency = Date.now() - startTime;
  //   return { status: 'offline', latency, details: 'Network error or timeout' };
  // }

  // Simulated for now:
  return new Promise(resolve => {
    setTimeout(() => {
      const rand = Math.random();
      const latency = Math.floor(Math.random() * 300) + 50; // 50-350ms
      if (rand < 0.7) resolve({ status: 'online', latency });
      else if (rand < 0.85) resolve({ status: 'degraded', latency });
      else if (rand < 0.95) resolve({ status: 'error', latency });
      else resolve({ status: 'offline', latency });
    }, Math.random() * 500); // Simulate network delay
  });
};


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MCPServiceStatus[] | { error: string }>
) {
  if (req.method === 'GET') {
    try {
      const statuses: MCPServiceStatus[] = await Promise.all(
        KNOWN_MCP_SERVERS.map(async (server) => {
          const health = await checkServerHealth(server.name, server.healthEndpoint);
          return {
            name: server.name,
            ...health,
            lastChecked: new Date().toISOString(),
          };
        })
      );
      res.status(200).json(statuses);
    } catch (error) {
      console.error('Error fetching MCP server statuses:', error);
      res.status(500).json({ error: 'Failed to retrieve MCP server statuses.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
