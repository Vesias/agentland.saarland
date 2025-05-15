import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';

interface MCPServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'error' | 'degraded';
  latency?: number; // in ms
  lastChecked: string;
}

const MCPServiceStatusPanel: React.FC = () => {
  const [mcpServices, setMcpServices] = useState<MCPServiceStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMcpStatus = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/mcp/status');
        if (!response.ok) {
          throw new Error(`Failed to fetch MCP statuses: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setMcpServices(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        // Fallback to empty or minimal data
        setMcpServices([
            { name: 'sequentialthinking (Fallback)', status: 'offline', lastChecked: new Date().toISOString() },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMcpStatus();
    // Optional: Set up an interval to periodically refresh statuses
    // const intervalId = setInterval(fetchMcpStatus, 60000); // every 60 seconds
    // return () => clearInterval(intervalId);
  }, []);

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
        <FaSpinner className="animate-spin text-blue-500 text-2xl mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-300">Lade MCP Service Status...</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        MCP Service Status
      </h2>
      {error && <p className="text-red-500 dark:text-red-400 mb-3">Fehler beim Laden: {error}</p>}
      {!isLoading && mcpServices.length === 0 && !error && <p className="text-gray-500 dark:text-gray-400">Keine MCP Services konfiguriert oder Status nicht abrufbar.</p>}

      {mcpServices.length > 0 && (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {mcpServices.map((service) => (
            <div key={service.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <div className="flex items-center overflow-hidden">
                <span className={`w-3 h-3 rounded-full mr-2 flex-shrink-0 ${getStatusColor(service.status)}`}></span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate" title={service.name}>{service.name}</span>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
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
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Letzte Prüfung: {mcpServices.length > 0 ? new Date(mcpServices[0].lastChecked).toLocaleString() : 'N/A'}
        {error && " (Fallback-Daten werden angezeigt)"}
      </p>
    </div>
  );
};

export default MCPServiceStatusPanel;
