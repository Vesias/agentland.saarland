import React, { useEffect, useState } from 'react';

// Placeholder for Agent data type
interface Agent {
  id: string;
  name: string;
  status: 'idle' | 'busy' | 'error';
  currentTask?: string;
  performanceMetrics?: {
    responseTime: number;
    tasksCompleted: number;
  };
}

// Placeholder for API response type
interface ApiResponse {
  agents: Agent[];
}

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
        { id: 'agent-002', name: 'TourismAgent', status: 'busy', currentTask: 'Fetching hotel data', performanceMetrics: { responseTime: 350, tasksCompleted: 8 } },
        { id: 'agent-003', name: 'ResearchAgent', status: 'error', performanceMetrics: { responseTime: 0, tasksCompleted: 0 } },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading active agents...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error fetching agents: {error}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Active Agents Overview</h2>
      {agents.length === 0 ? (
        <p className="text-gray-600">No active agents found.</p>
      ) : (
        <ul className="space-y-4">
          {agents.map((agent) => (
            <li key={agent.id} className="p-4 border border-gray-200 rounded-md hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">{agent.name} (ID: {agent.id})</span>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full
                    ${agent.status === 'idle' ? 'bg-green-100 text-green-700' : ''}
                    ${agent.status === 'busy' ? 'bg-yellow-100 text-yellow-700' : ''}
                    ${agent.status === 'error' ? 'bg-red-100 text-red-700' : ''}
                  `}
                >
                  {agent.status.toUpperCase()}
                </span>
              </div>
              {agent.currentTask && (
                <p className="text-sm text-gray-500 mt-1">Task: {agent.currentTask}</p>
              )}
              {agent.performanceMetrics && (
                 <div className="text-xs text-gray-500 mt-1">
                   Avg. Response: {agent.performanceMetrics.responseTime}ms | Tasks Completed: {agent.performanceMetrics.tasksCompleted}
                 </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {/* TODO: Add more sophisticated visualization options, e.g., a visual map or charts */}
    </div>
  );
};

export default ActiveAgentsOverview;
