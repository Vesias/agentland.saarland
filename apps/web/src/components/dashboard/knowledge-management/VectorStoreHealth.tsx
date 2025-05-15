import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';

interface VectorStoreStats {
  storeName: string;
  totalEmbeddings: number;
  indexSize: string; // e.g., "5.2 GB"
  avgQueryTime: number; // in ms
  lastUpdate: string;
  status: 'healthy' | 'degraded' | 'offline' | 'indexing';
}

const VectorStoreHealth: React.FC = () => {
  const [vectorStoreStats, setVectorStoreStats] = useState<VectorStoreStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVectorStoreHealth = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/rag/vectorstore-health');
        if (!response.ok) {
          throw new Error(`Failed to fetch vector store health: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setVectorStoreStats(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        setVectorStoreStats({ // Fallback
          storeName: 'pgvector Main Store (Fallback)',
          totalEmbeddings: 0,
          indexSize: 'N/A',
          avgQueryTime: 0,
          lastUpdate: new Date().toISOString(),
          status: 'offline',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVectorStoreHealth();
  }, []);

  const getStatusIndicator = (status: VectorStoreStats['status']) => {
    switch (status) {
      case 'healthy':
        return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full dark:bg-green-700 dark:text-green-100">Healthy</span>;
      case 'degraded':
        return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full dark:bg-yellow-700 dark:text-yellow-100">Degraded</span>;
      case 'offline':
        return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full dark:bg-red-700 dark:text-red-100">Offline</span>;
      case 'indexing':
        return <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full dark:bg-blue-700 dark:text-blue-100 animate-pulse">Indexing</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-100">Unknown</span>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
        <FaSpinner className="animate-spin text-blue-500 text-2xl mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-300">Lade Vector Store Status...</p>
      </div>
    );
  }

  if (error && !vectorStoreStats) { // Show error only if no fallback data is set (or if stats are null)
     return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-500 dark:text-red-400 mb-4">
          Fehler bei Vector Store Health
        </h2>
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!vectorStoreStats) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Vector Store Health
        </h2>
        <p className="text-gray-500 dark:text-gray-400">Keine Daten verfügbar.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Vector Store Health
        </h2>
        {getStatusIndicator(vectorStoreStats.status)}
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Store Name:</p>
          <p className="font-medium text-gray-700 dark:text-gray-200">{vectorStoreStats.storeName}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Total Embeddings:</p>
          <p className="font-medium text-gray-700 dark:text-gray-200">{vectorStoreStats.totalEmbeddings.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Index Size:</p>
          <p className="font-medium text-gray-700 dark:text-gray-200">{vectorStoreStats.indexSize}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Avg. Query Time:</p>
          <p className="font-medium text-gray-700 dark:text-gray-200">{vectorStoreStats.avgQueryTime} ms</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Letztes Update: {new Date(vectorStoreStats.lastUpdate).toLocaleString()}
        {error && " (Fallback-Daten werden angezeigt)"}
      </p>
    </div>
  );
};

export default VectorStoreHealth;
