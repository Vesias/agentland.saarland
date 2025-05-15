import React, { useState, useEffect } from 'react';

interface MCPServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'error' | 'degraded';
  latency?: number; // in ms
  lastChecked: string;
}

const MCPServiceStatusPanel: React.FC = () => {
  // Placeholder data - in a real implementation, this would be fetched
  // from a backend service that monitors MCP servers.
  const [mcpServices, setMcpServices] = useState<MCPServiceStatus[]>([
    { name: 'sequentialthinking', status: 'online', latency: 55, lastChecked: '2025-05-15 19:50 UTC' },
    { name: 'context7', status: 'online', latency: 120, lastChecked: '2025-05-15 19:50 UTC' },
    { name: 'desktop-commander', status: 'degraded', latency: 350, lastChecked: '2025-05-15 19:48 UTC' },
    { name: 'brave-search', status: 'offline', lastChecked: '2025-05-15 19:45 UTC' },
    { name: 'think-mcp', status: 'error', lastChecked: '2025-05-15 19:50 UTC' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   setIsLoading(true);
  //   // Replace with actual API call to fetch MCP service statuses
  //   fetch('/api/mcp/status') // Example API endpoint
  //     .then(res => res.json())
  //     .then(data => {
  //       setMcpServices(data);
  //       setIsLoading(false);
  //     })
  //     .catch(error => {
  //       console.error("Failed to fetch MCP statuses:", error);
  //       setIsLoading(false);
  //     });
  // }, []);

  const getStatusColor = (status: MCPServiceStatus['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-gray-500';
      case 'error':
        return 'bg-red-500';
      case 'degraded':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
        <p className="text-gray-600 dark:text-gray-300">Lade MCP Service Status...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        MCP Service Status
      </h2>
      <div className="space-y-3">
        {mcpServices.map((service) => (
          <div key={service.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <div className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(service.status)}`}></span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{service.name}</span>
            </div>
            <div className="text-right">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${getStatusColor(service.status)}`}>
                {service.status.toUpperCase()}
              </span>
              {service.latency !== undefined && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{service.latency}ms</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Letzte Prüfung: {mcpServices.length > 0 ? mcpServices[0].lastChecked : 'N/A'}
      </p>
    </div>
  );
};

export default MCPServiceStatusPanel;
