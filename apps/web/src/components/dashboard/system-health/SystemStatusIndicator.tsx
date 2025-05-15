import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaTools, FaCog } from 'react-icons/fa';

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

  const getOverallStatusInfo = (status: OverallStatus): { class: string; icon: React.ElementType, label: string } => {
    switch (status) {
      case 'operational': return { class: 'bg-success text-white', icon: FaCheckCircle, label: 'Operational' };
      case 'degraded_performance': return { class: 'bg-warning text-black', icon: FaExclamationTriangle, label: 'Degraded Performance' };
      case 'partial_outage': return { class: 'bg-orange-500 text-white', icon: FaExclamationTriangle, label: 'Partial Outage' }; // Assuming orange-500 is defined or use a theme color
      case 'major_outage': return { class: 'bg-danger text-white', icon: FaTimesCircle, label: 'Major Outage' };
      case 'maintenance': return { class: 'bg-info text-white', icon: FaTools, label: 'Maintenance' };
      default: return { class: 'bg-gray-500 text-white', icon: FaCog, label: 'Unknown' };
    }
  };
  
  const getComponentStatusIcon = (status: ComponentStatus['status']): React.ReactElement => {
    switch (status) {
      case 'operational': return <FaCheckCircle className="text-success" />;
      case 'warning': return <FaExclamationTriangle className="text-warning" />;
      case 'error': return <FaTimesCircle className="text-danger" />;
      case 'maintenance': return <FaTools className="text-info" />;
      default: return <FaCog className="text-gray-400" />;
    }
  };


  if (loading) {
    return <div className="bg-surface shadow-lg rounded-xl p-6 border border-border text-center text-foreground-muted">Loading system status...</div>;
  }

  if (error) {
    return <div className="bg-surface shadow-lg rounded-xl p-6 border border-border text-center text-danger">Error fetching system status: {error}</div>;
  }

  if (!systemStatus) {
    return <div className="bg-surface shadow-lg rounded-xl p-6 border border-border text-center text-foreground-muted">System status is currently unavailable.</div>;
  }

  const overallStatusInfo = getOverallStatusInfo(systemStatus.overallStatus);
  const OverallStatusIcon = overallStatusInfo.icon;

  return (
    <div className="bg-surface shadow-lg rounded-xl p-6 border border-border">
      <div className={`p-4 rounded-lg mb-6 ${overallStatusInfo.class} flex flex-col items-center`}>
        <OverallStatusIcon className="w-8 h-8 mb-2" />
        <h2 className="text-xl font-semibold text-center">
          {overallStatusInfo.label}
        </h2>
        <p className="text-xs text-center opacity-90">Last checked: {new Date(systemStatus.lastChecked).toLocaleString()}</p>
      </div>
      
      <h3 className="text-lg font-medium text-foreground mb-3">Component Status:</h3>
      <ul className="space-y-3">
        {systemStatus.components.map((component) => (
          <li key={component.name} className="flex justify-between items-center p-3 bg-background border border-border rounded-lg hover:shadow-md transition-shadow">
            <span className="text-sm text-foreground font-medium">{component.name}</span>
            <div className="flex items-center space-x-2">
              {component.message && <span className="text-xs text-foreground-secondary italic" title={component.message}>({component.message.length > 30 ? component.message.substring(0, 27) + '...' : component.message})</span>}
              {getComponentStatusIcon(component.status)}
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                ${component.status === 'operational' ? 'bg-success/20 text-success-foreground' : ''}
                ${component.status === 'warning' ? 'bg-warning/20 text-warning-foreground' : ''}
                ${component.status === 'error' ? 'bg-danger/20 text-danger-foreground' : ''}
                ${component.status === 'maintenance' ? 'bg-info/20 text-info-foreground' : ''}
              `}>
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
