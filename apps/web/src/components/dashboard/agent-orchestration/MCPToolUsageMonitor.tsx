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

  const getSuccessRateColor = (rate: number): string => {
    if (rate >= 99) return 'text-green-600 dark:text-green-400';
    if (rate >= 95) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="bg-surface shadow-lg rounded-xl p-6 border border-border">
      <h2 className="text-xl font-semibold mb-5 text-foreground">MCP Tool Usage Monitor</h2>
      {toolsUsage.length === 0 ? (
        <p className="text-foreground-muted text-center py-4">No MCP tool usage data available.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border"> {/* Added border to the scroll container */}
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">{/* Use muted background from theme */}
              <tr>{/* Ensure no whitespace before first th */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Tool Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Invocations</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Success Rate</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Avg. Response (ms)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Last Used</th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">{/* Ensure no whitespace before first tr */}
              {toolsUsage.map((tool, index) => (
                <tr key={tool.id} className={index % 2 === 0 ? 'bg-background' : 'bg-surface'}>{/* Alternating row colors, ensure no whitespace before first td */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{tool.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-secondary text-right">{tool.invocations.toLocaleString()}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getSuccessRateColor(tool.successRate)} text-right`}>{tool.successRate.toFixed(1)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-secondary text-right">{tool.avgResponseTime}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-secondary">{new Date(tool.lastUsed).toLocaleString()}</td>
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
