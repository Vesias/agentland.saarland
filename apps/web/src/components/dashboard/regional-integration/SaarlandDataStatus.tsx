import React, { useEffect, useState } from 'react';

// Placeholder for Data Connector status data type
interface DataConnectorStatus {
  id: string;
  name: string; // e.g., "Saarland Tourism API", "E-Gov Services Portal"
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSyncTime?: string; // ISO date string
  dataVolume?: string; // e.g., "1.2 GB", "15,000 records"
  nextSyncTime?: string; // ISO date string
}

// Placeholder for API response type
interface DataConnectorsApiResponse {
  connectors: DataConnectorStatus[];
}

const SaarlandDataStatus: React.FC = () => {
  const [connectors, setConnectors] = useState<DataConnectorStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Fetch data connector statuses from the backend API
    // Example:
    // const fetchDataConnectors = async () => {
    //   try {
    //     const response = await fetch('/api/regional/connectors/status'); // Replace with actual API endpoint
    //     if (!response.ok) {
    //       throw new Error(`HTTP error! status: ${response.status}`);
    //     }
    //     const data: DataConnectorsApiResponse = await response.json();
    //     setConnectors(data.connectors);
    //   } catch (e) {
    //     setError(e instanceof Error ? e.message : String(e));
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchDataConnectors();

    // Mock data for now
    setTimeout(() => {
      setConnectors([
        { id: 'connector-01', name: 'Saarland Tourism Events API', status: 'connected', lastSyncTime: new Date(Date.now() - 3600000).toISOString(), dataVolume: '5,200 events', nextSyncTime: new Date(Date.now() + 86400000).toISOString() },
        { id: 'connector-02', name: 'E-Government Services (Public Forms)', status: 'error', lastSyncTime: new Date(Date.now() - 86400000 * 2).toISOString() },
        { id: 'connector-03', name: 'Cultural Archives Database', status: 'syncing', dataVolume: '1.5 TB' },
        { id: 'connector-04', name: 'Regional Transport Data Feed', status: 'disconnected' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: DataConnectorStatus['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-700';
      case 'disconnected': return 'bg-gray-100 text-gray-700';
      case 'error': return 'bg-red-100 text-red-700';
      case 'syncing': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading Saarland data connector statuses...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error fetching data connector statuses: {error}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Saarland Data Integration Status</h2>
      {connectors.length === 0 ? (
        <p className="text-gray-600">No data connectors configured or status unavailable.</p>
      ) : (
        <ul className="space-y-4">
          {connectors.map((connector) => (
            <li key={connector.id} className="p-4 border border-gray-200 rounded-md">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-gray-700">{connector.name}</span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(connector.status)}`}>
                  {connector.status.toUpperCase()}
                </span>
              </div>
              {connector.lastSyncTime && (
                <p className="text-xs text-gray-500">Last Sync: {new Date(connector.lastSyncTime).toLocaleString()}</p>
              )}
              {connector.dataVolume && (
                <p className="text-xs text-gray-500">Data Volume: {connector.dataVolume}</p>
              )}
              {connector.nextSyncTime && connector.status !== 'syncing' && (
                 <p className="text-xs text-gray-500">Next Sync: {new Date(connector.nextSyncTime).toLocaleString()}</p>
              )}
              {/* TODO: Add action to trigger manual sync or view logs */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SaarlandDataStatus;
