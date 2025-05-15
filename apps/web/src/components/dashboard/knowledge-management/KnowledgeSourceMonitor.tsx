import React, { useState, useEffect } from 'react';

interface DataSourceStatus {
  id: string;
  name: string;
  type: 'Database' | 'File System' | 'API' | 'Web Scrape';
  status: 'connected' | 'syncing' | 'error' | 'idle' | 'disabled';
  lastIngestion: string;
  itemCount?: number;
}

const KnowledgeSourceMonitor: React.FC = () => {
  // Placeholder data - in a real implementation, this would be fetched
  // from a backend service connected to the RAG configuration and monitoring.
  const [dataSources, setDataSources] = useState<DataSourceStatus[]>([
    { id: 'src1', name: 'Project Documentation (/ai_docs)', type: 'File System', status: 'connected', lastIngestion: '2025-05-15 12:00 UTC', itemCount: 152 },
    { id: 'src2', name: 'Saarland Regional Database API', type: 'API', status: 'syncing', lastIngestion: '2025-05-15 19:00 UTC', itemCount: 12503 },
    { id: 'src3', name: 'External News Feed (RSS)', type: 'Web Scrape', status: 'error', lastIngestion: '2025-05-14 08:00 UTC' },
    { id: 'src4', name: 'User Uploaded Documents', type: 'File System', status: 'idle', lastIngestion: '2025-05-13 15:30 UTC', itemCount: 34 },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   setIsLoading(true);
  //   // Replace with actual API call
  //   fetch('/api/rag/datasources/status') // Example API endpoint
  //     .then(res => res.json())
  //     .then(data => {
  //       setDataSources(data);
  //       setIsLoading(false);
  //     })
  //     .catch(error => {
  //       console.error("Failed to fetch data source statuses:", error);
  //       setIsLoading(false);
  //     });
  // }, []);

  const getStatusChipStyle = (status: DataSourceStatus['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100';
      case 'syncing': return 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100 animate-pulse';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100';
      case 'idle': return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200';
      case 'disabled': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100';
      default: return 'bg-gray-200 text-gray-700';
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
        <p className="text-gray-600 dark:text-gray-300">Lade Wissensquellen-Status...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Wissensquellen Monitor
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Typ</th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Letzte Ingestion</th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Elemente</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {dataSources.map((source) => (
              <tr key={source.id}>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{source.name}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{source.type}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusChipStyle(source.status)}`}>
                    {source.status}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{source.lastIngestion}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">{source.itemCount?.toLocaleString() ?? 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Daten basierend auf RAG Konfiguration und Monitoring.
      </p>
    </div>
  );
};

export default KnowledgeSourceMonitor;
