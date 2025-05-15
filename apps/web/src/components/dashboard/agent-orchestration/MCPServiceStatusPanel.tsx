import React, { useState, useEffect, useCallback } from 'react';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaRedo } from 'react-icons/fa';

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
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toISOString());

  const fetchMcpStatus = useCallback(async () => {
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
      setMcpServices([
        { name: 'sequentialthinking (Fallback)', status: 'offline', lastChecked: new Date().toISOString() },
      ]);
    } finally {
      setIsLoading(false);
      setLastRefreshed(new Date().toISOString());
    }
  }, []); // Empty dependency array means this function is created once

  useEffect(() => {
    fetchMcpStatus();
    // Optional: Set up an interval to periodically refresh statuses
    // const intervalId = setInterval(fetchMcpStatus, 60000); // every 60 seconds
    // return () => clearInterval(intervalId);
  }, [fetchMcpStatus]); // fetchMcpStatus is now a stable dependency

  const getStatusPresentation = (status: MCPServiceStatus['status']) => {
    switch (status) {
      case 'online':
        return { icon: <FaCheckCircle className="text-green-500" />, color: 'text-green-700 dark:text-green-300', bgColor: 'bg-green-50 dark:bg-green-700/20 border-green-200 dark:border-green-700' };
      case 'offline':
        return { icon: <FaTimesCircle className="text-gray-500" />, color: 'text-gray-700 dark:text-gray-300', bgColor: 'bg-gray-50 dark:bg-gray-700/20 border-gray-200 dark:border-gray-700' };
      case 'error':
        return { icon: <FaExclamationTriangle className="text-red-500" />, color: 'text-red-700 dark:text-red-300', bgColor: 'bg-red-50 dark:bg-red-700/20 border-red-200 dark:border-red-700' };
      case 'degraded':
        return { icon: <FaExclamationTriangle className="text-yellow-500" />, color: 'text-yellow-700 dark:text-yellow-300', bgColor: 'bg-yellow-50 dark:bg-yellow-700/20 border-yellow-200 dark:border-yellow-700' };
      default:
        return { icon: <FaSpinner className="text-gray-500 animate-spin" />, color: 'text-gray-700 dark:text-gray-300', bgColor: 'bg-gray-50 dark:bg-gray-700/20 border-gray-200 dark:border-gray-700' };
    }
  };

  // Show full panel loader only on initial load and if there are no services yet
  if (isLoading && mcpServices.length === 0) { 
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center h-full flex flex-col justify-center items-center">
        <FaSpinner className="animate-spin text-blue-500 text-3xl mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-300">Lade MCP Service Status...</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          MCP Service Status
        </h2>
        <button
          onClick={fetchMcpStatus}
          disabled={isLoading}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 disabled:opacity-50"
          title="Refresh Status"
        >
          {isLoading ? <FaSpinner className="animate-spin" /> : <FaRedo />}
        </button>
      </div>
      
      {error && <p className="text-red-500 dark:text-red-400 mb-3 text-sm">Fehler beim Laden: {error}</p>}
      
      {!isLoading && mcpServices.length === 0 && !error && (
        <div className="flex-grow flex flex-col justify-center items-center text-gray-500 dark:text-gray-400">
           <FaTimesCircle className="text-3xl mb-2"/>
          <p>Keine MCP Services konfiguriert oder Status nicht abrufbar.</p>
        </div>
      )}

      {mcpServices.length > 0 && (
        <div className="space-y-2 flex-grow overflow-y-auto pr-1"> {/* Added flex-grow */}
          {mcpServices.map((service) => {
            const { icon, color, bgColor } = getStatusPresentation(service.status);
            return (
              <div key={service.name} className={`flex items-center justify-between p-2.5 rounded-md border hover:shadow-sm transition-shadow ${bgColor}`}>
                <div className="flex items-center min-w-0">
                  <span className={`mr-2.5 text-lg ${color}`}>{icon}</span>
                  <span className={`text-sm font-medium truncate ${color}`} title={service.name}>
                    {service.name}
                  </span>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className={`text-xs font-semibold capitalize px-1.5 py-0.5 rounded-full ${color} ${bgColor.replace('border-', 'bg-').replace('/20', '/40')}`}>
                    {service.status}
                  </span>
                  {service.latency !== undefined && (
                    <p className={`text-xs mt-0.5 ${color} opacity-80`}>{service.latency}ms</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
        Letzte Prüfung: {new Date(lastRefreshed).toLocaleString()}
        {error && mcpServices.length > 0 && " (Fallback-Daten werden angezeigt)"}
      </p>
    </div>
  );
};

export default MCPServiceStatusPanel;
