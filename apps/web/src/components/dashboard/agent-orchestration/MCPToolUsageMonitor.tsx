import React, { useEffect, useState } from 'react';

// Placeholder for MCP Tool Usage data type
interface MCPToolUsage {
  id: string;
  name: string;
  invocations: number;
  successRate: number; // Percentage, e.g., 99.5
  avgResponseTime: number; // Milliseconds
  lastUsed: string; // ISO date string
}

// Placeholder for API response type
interface MCPToolsApiResponse {
  toolsUsage: MCPToolUsage[];
}

const MCPToolUsageMonitor: React.FC = () => {
  const [toolsUsage, setToolsUsage] = useState<MCPToolUsage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Fetch MCP tool usage data from the backend API
    // Example:
    // const fetchMCPToolUsage = async () => {
    //   try {
    //     const response = await fetch('/api/mcp/tools/usage'); // Replace with actual API endpoint
    //     if (!response.ok) {
    //       throw new Error(`HTTP error! status: ${response.status}`);
    //     }
    //     const data: MCPToolsApiResponse = await response.json();
    //     setToolsUsage(data.toolsUsage);
    //   } catch (e) {
    //     setError(e instanceof Error ? e.message : String(e));
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchMCPToolUsage();

    // Mock data for now
    setTimeout(() => {
      setToolsUsage([
        { id: 'mcp-tool-01', name: 'sequentialthinking', invocations: 150, successRate: 98.7, avgResponseTime: 750, lastUsed: new Date().toISOString() },
        { id: 'mcp-tool-02', name: 'context7-get-docs', invocations: 75, successRate: 100, avgResponseTime: 300, lastUsed: new Date().toISOString() },
        { id: 'mcp-tool-03', name: 'desktop-commander-read-file', invocations: 230, successRate: 95.2, avgResponseTime: 150, lastUsed: new Date().toISOString() },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading MCP tool usage...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error fetching MCP tool usage: {error}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">MCP Tool Usage Monitor</h2>
      {toolsUsage.length === 0 ? (
        <p className="text-gray-600">No MCP tool usage data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tool Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invocations</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Response (ms)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Used</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {toolsUsage.map((tool) => (
                <tr key={tool.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tool.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tool.invocations}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tool.successRate.toFixed(1)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tool.avgResponseTime}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(tool.lastUsed).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* TODO: Add filtering, sorting, and perhaps charts for trends */}
    </div>
  );
};

export default MCPToolUsageMonitor;
