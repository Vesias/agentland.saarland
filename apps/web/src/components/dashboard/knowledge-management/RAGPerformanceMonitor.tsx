import React, { useEffect, useState } from 'react';

// Placeholder for RAG Performance Metrics data type
interface RAGMetrics {
  totalQueries: number;
  avgQueryLatency: number; // milliseconds
  retrievalAccuracy?: number; // Percentage, if available/measurable
  documentsInStore: number;
  lastStoreUpdate: string; // ISO date string
  cacheHitRate?: number; // Percentage, if caching is used
}

// Placeholder for API response type
interface RAGMetricsApiResponse {
  metrics: RAGMetrics;
}

const RAGPerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<RAGMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Fetch RAG performance metrics from the backend API
    // Example:
    // const fetchRAGMetrics = async () => {
    //   try {
    //     const response = await fetch('/api/rag/performance/metrics'); // Replace with actual API endpoint
    //     if (!response.ok) {
    //       throw new Error(`HTTP error! status: ${response.status}`);
    //     }
    //     const data: RAGMetricsApiResponse = await response.json();
    //     setMetrics(data.metrics);
    //   } catch (e) {
    //     setError(e instanceof Error ? e.message : String(e));
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchRAGMetrics();

    // Mock data for now
    setTimeout(() => {
      setMetrics({
        totalQueries: 1250,
        avgQueryLatency: 450,
        retrievalAccuracy: 88.5,
        documentsInStore: 15230,
        lastStoreUpdate: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        cacheHitRate: 30.2,
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading RAG performance metrics...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error fetching RAG metrics: {error}</div>;
  }

  if (!metrics) {
    return <div className="p-4 text-center text-gray-600">No RAG performance data available.</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">RAG Performance Monitor</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm font-medium text-gray-500">Total Queries</p>
          <p className="text-2xl font-semibold text-gray-900">{metrics.totalQueries.toLocaleString()}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm font-medium text-gray-500">Avg. Query Latency</p>
          <p className="text-2xl font-semibold text-gray-900">{metrics.avgQueryLatency} ms</p>
        </div>
        {metrics.retrievalAccuracy !== undefined && (
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm font-medium text-gray-500">Retrieval Accuracy</p>
            <p className="text-2xl font-semibold text-gray-900">{metrics.retrievalAccuracy.toFixed(1)}%</p>
          </div>
        )}
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm font-medium text-gray-500">Documents in Store</p>
          <p className="text-2xl font-semibold text-gray-900">{metrics.documentsInStore.toLocaleString()}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm font-medium text-gray-500">Last Store Update</p>
          <p className="text-lg font-semibold text-gray-900">{new Date(metrics.lastStoreUpdate).toLocaleString()}</p>
        </div>
        {metrics.cacheHitRate !== undefined && (
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm font-medium text-gray-500">Cache Hit Rate</p>
            <p className="text-2xl font-semibold text-gray-900">{metrics.cacheHitRate.toFixed(1)}%</p>
          </div>
        )}
      </div>
      {/* TODO: Add charts for trends over time (e.g., query latency, accuracy) */}
    </div>
  );
};

export default RAGPerformanceMonitor;
