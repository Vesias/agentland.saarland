import React, { useEffect, useState } from 'react';

// Placeholder for API Usage Metrics data type
interface APIMetric {
  endpoint: string; // e.g., "/api/agents/active"
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  requestCount: number;
  errorRate: number; // Percentage
  avgLatency: number; // milliseconds
  p95Latency?: number; // 95th percentile latency
}

// Placeholder for API response type
interface APIUsageApiResponse {
  metrics: APIMetric[];
  summary?: {
    totalRequests: number;
    overallErrorRate: number;
  };
}

const APIUsageMetrics: React.FC = () => {
  const [apiMetrics, setApiMetrics] = useState<APIMetric[]>([]);
  const [summary, setSummary] = useState<APIUsageApiResponse['summary'] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Fetch API usage metrics from the backend API (e.g., from an API gateway or backend framework logs)
    // Example:
    // const fetchAPIMetrics = async () => {
    //   try {
    //     const response = await fetch('/api/system/api-usage/metrics'); // Replace with actual API endpoint
    //     if (!response.ok) {
    //       throw new Error(`HTTP error! status: ${response.status}`);
    //     }
    //     const data: APIUsageApiResponse = await response.json();
    //     setApiMetrics(data.metrics);
    //     setSummary(data.summary || null);
    //   } catch (e) {
    //     setError(e instanceof Error ? e.message : String(e));
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchAPIMetrics();

    // Mock data for now
    setTimeout(() => {
      setApiMetrics([
        { endpoint: '/api/agents/active', method: 'GET', requestCount: 1250, errorRate: 0.5, avgLatency: 80, p95Latency: 150 },
        { endpoint: '/api/workflows/{id}', method: 'GET', requestCount: 340, errorRate: 1.2, avgLatency: 120, p95Latency: 250 },
        { endpoint: '/api/kb/items', method: 'GET', requestCount: 870, errorRate: 0.2, avgLatency: 200, p95Latency: 400 },
        { endpoint: '/api/tasks/queue', method: 'POST', requestCount: 500, errorRate: 0.0, avgLatency: 50, p95Latency: 90 },
      ]);
      setSummary({ totalRequests: 2960, overallErrorRate: 0.45 });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading API usage metrics...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error fetching API metrics: {error}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">API Usage Metrics</h2>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-gray-50 rounded text-center">
            <p className="text-sm font-medium text-gray-500">Total API Requests (24h)</p>
            <p className="text-2xl font-semibold text-gray-900">{summary.totalRequests.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded text-center">
            <p className="text-sm font-medium text-gray-500">Overall Error Rate</p>
            <p className="text-2xl font-semibold text-gray-900">{summary.overallErrorRate.toFixed(2)}%</p>
          </div>
        </div>
      )}

      {apiMetrics.length === 0 && !summary ? (
        <p className="text-gray-600">No API usage data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requests</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error Rate</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Latency (ms)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P95 Latency (ms)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {apiMetrics.map((metric, index) => (
                <tr key={`${metric.method}-${metric.endpoint}-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{metric.method}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.endpoint}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.requestCount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.errorRate.toFixed(2)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.avgLatency}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.p95Latency || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* TODO: Add time range selection, filtering by endpoint/method, and charts */}
    </div>
  );
};

export default APIUsageMetrics;
