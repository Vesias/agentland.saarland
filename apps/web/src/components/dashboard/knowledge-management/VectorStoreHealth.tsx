import React, { useState, useEffect } from 'react';

interface VectorStoreStats {
  storeName: string;
  totalEmbeddings: number;
  indexSize: string; // e.g., "5.2 GB"
  avgQueryTime: number; // in ms
  lastUpdate: string;
  status: 'healthy' | 'degraded' | 'offline';
}

const VectorStoreHealth: React.FC = () => {
  // Placeholder data - in a real implementation, this would be fetched
  // from a backend service connected to the RAG system.
  const [vectorStoreStats, setVectorStoreStats] = useState<VectorStoreStats>({
    storeName: 'pgvector Main Store',
    totalEmbeddings: 157890,
    indexSize: '2.3 GB',
    avgQueryTime: 45,
    lastUpdate: '2025-05-15 18:30 UTC',
    status: 'healthy',
  });
  const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   setIsLoading(true);
  //   // Replace with actual API call to fetch vector store stats
  //   fetch('/api/rag/vectorstore/health') // Example API endpoint
  //     .then(res => res.json())
  //     .then(data => {
  //       setVectorStoreStats(data);
  //       setIsLoading(false);
  //     })
  //     .catch(error => {
  //       console.error("Failed to fetch vector store health:", error);
  //       setIsLoading(false);
  //     });
  // }, []);

  const getStatusIndicator = (status: VectorStoreStats['status']) => {
    switch (status) {
      case 'healthy':
        return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full dark:bg-green-700 dark:text-green-100">Healthy</span>;
      case 'degraded':
        return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full dark:bg-yellow-700 dark:text-yellow-100">Degraded</span>;
      case 'offline':
        return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full dark:bg-red-700 dark:text-red-100">Offline</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-100">Unknown</span>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
        <p className="text-gray-600 dark:text-gray-300">Lade Vector Store Status...</p>
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
        Letztes Update: {vectorStoreStats.lastUpdate}
      </p>
    </div>
  );
};

export default VectorStoreHealth;
