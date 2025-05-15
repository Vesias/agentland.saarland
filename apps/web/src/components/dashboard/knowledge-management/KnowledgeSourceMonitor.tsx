import React, { useState, useEffect } from 'react';
import { FaSpinner, FaDatabase, FaGlobe, FaFileAlt, FaSync, FaExclamationTriangle } from 'react-icons/fa';

// Interface aligned with the API response from /api/rag/knowledge-sources
interface KnowledgeSource {
  id: string;
  name: string;
  type: 'document_collection' | 'web_crawl' | 'api_feed' | 'database_sync';
  status: 'active' | 'syncing' | 'error' | 'disabled';
  documentCount: number;
  lastSync: string;
  errorDetails?: string;
}

const KnowledgeSourceMonitor: React.FC = () => {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKnowledgeSources = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/rag/knowledge-sources');
        if (!response.ok) {
          throw new Error(`Failed to fetch knowledge sources: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setSources(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        setSources([]); // Fallback to empty on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchKnowledgeSources();
  }, []);

  const getStatusChipStyle = (status: KnowledgeSource['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100';
      case 'syncing': return 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100 animate-pulse';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100';
      case 'disabled': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100';
      default: return 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: KnowledgeSource['type']) => {
    switch (type) {
      case 'document_collection': return <FaFileAlt className="mr-2 text-gray-500 dark:text-gray-400" />;
      case 'web_crawl': return <FaGlobe className="mr-2 text-blue-500 dark:text-blue-400" />;
      case 'api_feed': return <FaSync className="mr-2 text-purple-500 dark:text-purple-400" />;
      case 'database_sync': return <FaDatabase className="mr-2 text-teal-500 dark:text-teal-400" />;
      default: return null;
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
        <FaSpinner className="animate-spin text-blue-500 text-2xl mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-300">Lade Wissensquellen-Status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-500 dark:text-red-400 mb-2">
          <FaExclamationTriangle className="inline mr-2" /> Fehler beim Laden der Wissensquellen
        </h2>
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Wissensquellen Monitor
      </h2>
      {sources.length === 0 && !isLoading && (
        <p className="text-gray-500 dark:text-gray-400">Keine Wissensquellen konfiguriert oder Daten nicht verfügbar.</p>
      )}
      {sources.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Typ</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Letzter Sync</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dokumente</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sources.map((source) => (
                <tr key={source.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{source.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 flex items-center">
                    {getTypeIcon(source.type)}
                    {source.type.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusChipStyle(source.status)}`}>
                      {source.status}
                    </span>
                    {source.status === 'error' && source.errorDetails && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1 truncate" title={source.errorDetails}>{source.errorDetails}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(source.lastSync).toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">{source.documentCount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Daten basierend auf RAG Konfiguration und Monitoring.
        {error && " (Einige Daten konnten nicht geladen werden)"}
      </p>
    </div>
  );
};

export default KnowledgeSourceMonitor;
