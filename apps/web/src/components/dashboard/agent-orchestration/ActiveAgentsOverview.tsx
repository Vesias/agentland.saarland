import React, { useEffect, useState } from 'react';
import { FaPlayCircle, FaPauseCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

// Placeholder for Agent data type
interface Agent {
  id: string;
  name: string;
  status: 'idle' | 'busy' | 'error';
  currentTask?: string;
  taskProgress?: number; // Percentage 0-100, if applicable
  performanceMetrics?: {
    responseTime: number;
    tasksCompleted: number;
  };
}

// Placeholder for API response type
interface ApiResponse {
  agents: Agent[];
}

const StatusIcon: React.FC<{ status: Agent['status'] }> = ({ status }) => {
  switch (status) {
    case 'idle':
      return <FaPlayCircle className="text-green-500" title="Idle" />;
    case 'busy':
      return <FaSpinner className="text-yellow-500 animate-spin" title="Busy" />;
    case 'error':
      return <FaExclamationTriangle className="text-red-500" title="Error" />;
    default:
      return <FaPauseCircle className="text-gray-400" title="Unknown" />;
  }
};

const ActiveAgentsOverview: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Fetch agent data from the backend API
    // Example:
    // const fetchAgents = async () => {
    //   try {
    //     const response = await fetch('/api/agents/active'); // Replace with actual API endpoint
    //     if (!response.ok) {
    //       throw new Error(`HTTP error! status: ${response.status}`);
    //     }
    //     const data: ApiResponse = await response.json();
    //     setAgents(data.agents);
    //   } catch (e) {
    //     setError(e instanceof Error ? e.message : String(e));
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchAgents();

    // Mock data for now
    setTimeout(() => {
      setAgents([
        { id: 'agent-001', name: 'Saarland-Navigator', status: 'idle', performanceMetrics: { responseTime: 120, tasksCompleted: 15 } },
        { id: 'agent-002', name: 'TourismAgent', status: 'busy', currentTask: 'Fetching hotel data', taskProgress: 60, performanceMetrics: { responseTime: 350, tasksCompleted: 8 } },
        { id: 'agent-003', name: 'ResearchAgent', status: 'error', performanceMetrics: { responseTime: 0, tasksCompleted: 0 } },
        { id: 'agent-004', name: 'DataProcessingAgent', status: 'busy', currentTask: 'Analyzing dataset XYZ', taskProgress: 25, performanceMetrics: { responseTime: 180, tasksCompleted: 3 } },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="p-4 text-center text-gray-600">Loading active agents...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error fetching agents: {error}</div>;
  }

  return (
    <div className="bg-surface shadow-lg rounded-xl p-6 border border-border">
      <h2 className="text-xl font-semibold mb-5 text-foreground">Active Agents Overview</h2>
      {agents.length === 0 ? (
        <p className="text-foreground-muted text-center py-4">No active agents found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Increased gap for better separation */}
          {agents.map((agent) => (
            <div key={agent.id} className="bg-background p-5 border border-border rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out flex flex-col space-y-3"> {/* Increased padding, rounded-xl, shadow-lg, space-y-3 */}
              <div className="flex justify-between items-center"> {/* items-center for vertical alignment */}
                <h3 className="font-semibold text-lg text-primary truncate" title={agent.name}>{agent.name}</h3>
                <div className="flex items-center space-x-2 flex-shrink-0"> {/* flex-shrink-0 to prevent status from shrinking */}
                   <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                    ${agent.status === 'idle' ? 'bg-green-500 text-white' : ''}
                    ${agent.status === 'busy' ? 'bg-yellow-500 text-black' : ''}
                    ${agent.status === 'error' ? 'bg-red-500 text-white' : ''}
                  `}>
                    {agent.status.toUpperCase()}
                  </span>
                  <StatusIcon status={agent.status} />
                </div>
              </div>
              <p className="text-xs text-foreground-muted">ID: {agent.id}</p>
              
              {agent.currentTask && (
                <div className="space-y-1">
                  <p className="text-sm text-foreground-secondary">Current Task:</p>
                  <p className="text-sm text-foreground font-medium truncate" title={agent.currentTask}>{agent.currentTask}</p>
                  {agent.taskProgress !== undefined && (
                    <div className="w-full bg-surface rounded-full h-2.5 dark:bg-gray-700 mt-1"> {/* Theme-aware background for progress bar track */}
                      <div 
                        className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${agent.taskProgress}%` }}
                        aria-valuenow={agent.taskProgress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        role="progressbar"
                        aria-label={`Task progress ${agent.taskProgress}%`}
                      ></div>
                    </div>
                  )}
                </div>
              )}

              {agent.performanceMetrics && (
                 <div className="text-sm text-foreground-secondary border-t border-border pt-3 mt-auto space-y-1"> {/* mt-auto to push to bottom if card height is consistent */}
                   <div className="flex justify-between w-full">
                     <span>Avg. Response:</span>
                     <span className="font-semibold text-foreground">{agent.performanceMetrics.responseTime}ms</span>
                   </div>
                   <div className="flex justify-between w-full">
                     <span>Tasks Completed:</span>
                     <span className="font-semibold text-foreground">{agent.performanceMetrics.tasksCompleted}</span>
                   </div>
                 </div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* TODO: Add more sophisticated visualization options, e.g., a visual map or charts */}
    </div>
  );
};

export default ActiveAgentsOverview;
