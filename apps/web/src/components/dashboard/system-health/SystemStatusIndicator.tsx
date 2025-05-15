import React, { useEffect, useState } from 'react';

// Placeholder for System Status data type
type OverallStatus = 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage' | 'maintenance';

interface ComponentStatus {
  name: string;
  status: 'operational' | 'warning' | 'error' | 'maintenance';
  message?: string;
}

interface SystemStatus {
  overallStatus: OverallStatus;
  lastChecked: string; // ISO date string
  components: ComponentStatus[];
}

// Placeholder for API response type
interface SystemStatusApiResponse {
  status: SystemStatus;
}

const SystemStatusIndicator: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Fetch system status from the backend API
    // This might involve a backend service polling various microservices/components
    // Example:
    // const fetchSystemStatus = async () => {
    //   try {
    //     const response = await fetch('/api/system/health/status'); // Replace with actual API endpoint
    //     if (!response.ok) {
    //       throw new Error(`HTTP error! status: ${response.status}`);
    //     }
    //     const data: SystemStatusApiResponse = await response.json();
    //     setSystemStatus(data.status);
    //   } catch (e) {
    //     setError(e instanceof Error ? e.message : String(e));
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchSystemStatus();
    // const interval = setInterval(fetchSystemStatus, 60000); // Refresh every minute
    // return () => clearInterval(interval);

    // Mock data for now
    setTimeout(() => {
      setSystemStatus({
        overallStatus: 'operational',
        lastChecked: new Date().toISOString(),
        components: [
          { name: 'Agent Orchestration Service', status: 'operational' },
          { name: 'RAG Knowledge Base', status: 'operational' },
          { name: 'MCP Tool Gateway', status: 'operational' },
          { name: 'Regional Data Connectors', status: 'warning', message: 'Tourism API slow response' },
          { name: 'User Authentication', status: 'operational' },
        ],
      });
      setLoading(false);
    }, 1000);
  }, []);

  const getOverallStatusColorClasses = (status: OverallStatus) => {
    switch (status) {
      case 'operational': return 'bg-green-500 text-white';
      case 'degraded_performance': return 'bg-yellow-500 text-white';
      case 'partial_outage': return 'bg-orange-500 text-white';
      case 'major_outage': return 'bg-red-600 text-white';
      case 'maintenance': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  
  const getComponentStatusColor = (status: ComponentStatus['status']) => {
    switch (status) {
      case 'operational': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      case 'maintenance': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };


  if (loading) {
    return <div className="p-4 text-center">Loading system status...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error fetching system status: {error}</div>;
  }

  if (!systemStatus) {
    return <div className="p-4 text-center text-gray-600">System status is currently unavailable.</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className={`p-4 rounded-md mb-6 ${getOverallStatusColorClasses(systemStatus.overallStatus)}`}>
        <h2 className="text-xl font-semibold text-center">
          System Status: {systemStatus.overallStatus.replace('_', ' ').toUpperCase()}
        </h2>
        <p className="text-xs text-center opacity-80">Last checked: {new Date(systemStatus.lastChecked).toLocaleString()}</p>
      </div>
      
      <h3 className="text-lg font-medium text-gray-700 mb-3">Component Status:</h3>
      <ul className="space-y-2">
        {systemStatus.components.map((component) => (
          <li key={component.name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="text-sm text-gray-800">{component.name}</span>
            <div className="flex items-center">
              {component.message && <span className="text-xs text-gray-500 mr-2 italic">({component.message})</span>}
              <span className={`text-sm font-semibold ${getComponentStatusColor(component.status)}`}>
                {component.status.toUpperCase()}
              </span>
            </div>
          </li>
        ))}
      </ul>
      {/* TODO: Add link to a more detailed system health page or logs */}
    </div>
  );
};

export default SystemStatusIndicator;
