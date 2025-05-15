import React, { useEffect, useState } from 'react';

// Placeholder for Configuration Item data type
interface ConfigItem {
  key: string; // e.g., "LOG_LEVEL", "AGENT_MAX_RETRIES", "API_KEYS.OPENAI"
  value: string | number | boolean | object; // Could be complex, consider JSON.stringify for objects
  module: string; // e.g., "core", "rag_service", "tourism_agent"
  isEditable: boolean;
  description?: string;
  lastModified?: string; // ISO date string
}

// Placeholder for API response type
interface ConfigApiResponse {
  configs: ConfigItem[];
}

const ConfigManagerPanel: React.FC = () => {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // TODO: Add state for editing individual config items

  useEffect(() => {
    // TODO: Fetch configurations from the backend API
    // Ensure this API is highly secure and only accessible by admins
    // Example:
    // const fetchConfigs = async () => {
    //   try {
    //     const response = await fetch('/api/admin/configurations'); // Replace with actual API endpoint
    //     if (!response.ok) {
    //       throw new Error(`HTTP error! status: ${response.status}`);
    //     }
    //     const data: ConfigApiResponse = await response.json();
    //     setConfigs(data.configs);
    //   } catch (e) {
    //     setError(e instanceof Error ? e.message : String(e));
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchConfigs();

    // Mock data for now
    setTimeout(() => {
      setConfigs([
        { key: 'LOG_LEVEL', value: 'info', module: 'CoreLogging', isEditable: true, description: 'System-wide logging level (debug, info, warn, error)', lastModified: new Date(Date.now() - 86400000).toISOString() },
        { key: 'AGENT_MAX_RETRIES', value: 3, module: 'AgentOrchestrator', isEditable: true, description: 'Max retries for failing agent tasks' },
        { key: 'API_KEYS.CLAUDE_API_KEY', value: 'sk-**********', module: 'LLMConnectors', isEditable: false, description: 'API Key for Claude (display masked)' },
        { key: 'RAG.EMBEDDING_MODEL', value: 'text-embedding-ada-002', module: 'RAGService', isEditable: false, description: 'Model used for text embeddings' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  // TODO: Implement handleSaveConfig(item: ConfigItem, newValue: any) if editing is enabled

  if (loading) {
    return <div className="p-4 text-center">Loading configurations...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error fetching configurations: {error}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Configuration Manager Panel</h2>
      <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md mb-6">
        <strong className="font-semibold">Warning:</strong> Modifying configurations can have significant system-wide impact. Proceed with caution.
      </p>
      
      {configs.length === 0 ? (
        <p className="text-gray-600">No configurations available or accessible.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                {/* <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th> */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {configs.map((config) => (
                <tr key={`${config.module}-${config.key}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{config.module}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{config.key}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {typeof config.value === 'object' ? JSON.stringify(config.value) : String(config.value)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{config.description || 'N/A'}</td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {config.isEditable ? (
                      <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                    ) : (
                      <span className="text-gray-400">Read-only</span>
                    )}
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* TODO: Add filtering by module, search by key, and editing UI for editable fields */}
    </div>
  );
};

export default ConfigManagerPanel;
