import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  startTime?: string;
  endTime?: string;
  details?: string;
}

interface Workflow {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  currentStepId?: string;
  steps: WorkflowStep[];
  progressPercentage: number;
}

const WorkflowProgressTracker: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkflows = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/workflows/active-status');
        if (!response.ok) {
          throw new Error(`Failed to fetch workflows: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setWorkflows(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        setWorkflows([]); // Fallback to empty
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflows();
    // Optional: Interval to refresh
    // const intervalId = setInterval(fetchWorkflows, 10000); // every 10 seconds
    // return () => clearInterval(intervalId);
  }, []);

  const getStepStatusColor = (status: WorkflowStep['status']) => {
    if (status === 'completed') return 'bg-green-500';
    if (status === 'in-progress') return 'bg-blue-500 animate-pulse';
    if (status === 'error') return 'bg-red-500';
    return 'bg-gray-300 dark:bg-gray-600';
  };

  const getWorkflowStatusColor = (status: Workflow['status']) => {
    if (status === 'completed') return 'border-green-500';
    if (status === 'running') return 'border-blue-500';
    if (status === 'failed') return 'border-red-500';
    if (status === 'paused') return 'border-yellow-500';
    return 'border-gray-300';
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
        <FaSpinner className="animate-spin text-blue-500 text-2xl mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-300">Lade Workflow-Fortschritt...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-500 dark:text-red-400 mb-4">Fehler bei Workflows</h2>
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Aktive Workflows & Pläne</h2>
      {workflows.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">Keine aktiven Workflows.</p>
      )}
      <div className="space-y-6 max-h-96 overflow-y-auto pr-2"> {/* Added max-h and overflow */}
        {workflows.map(wf => (
          <div key={wf.id} className={`p-4 border-l-4 ${getWorkflowStatusColor(wf.status)} bg-gray-50 dark:bg-gray-700 rounded-r-md`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200">{wf.name}</h3>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getWorkflowStatusColor(wf.status).replace('border-', 'bg-').replace('-500', '-100 dark:bg-opacity-20 dark:text-opacity-80').replace('border-gray-300', 'bg-gray-100 dark:bg-gray-600')}`}>
                {wf.status.toUpperCase()} - {wf.progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-3">
              <div className={`h-2 rounded-full ${getWorkflowStatusColor(wf.status).replace('border-', 'bg-')}`} style={{ width: `${wf.progressPercentage}%` }}></div>
            </div>
            <ol className="space-y-2">
              {wf.steps.map(step => (
                <li key={step.id} className="flex items-center text-xs">
                  <span className={`w-2 h-2 rounded-full mr-2 ${getStepStatusColor(step.status)}`}></span>
                  <span className="text-gray-600 dark:text-gray-300">{step.name}</span>
                  {step.status === 'in-progress' && <span className="ml-1 text-blue-500 dark:text-blue-400">(läuft...)</span>}
                  {step.status === 'error' && <span className="ml-1 text-red-500 dark:text-red-400">(Fehler: {step.details || 'Unbekannt'})</span>}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowProgressTracker;
