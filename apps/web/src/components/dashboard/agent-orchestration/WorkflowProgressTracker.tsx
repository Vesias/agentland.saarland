import React, { useState, useEffect } from 'react';

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
  // Placeholder data
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: 'wf1',
      name: 'Document Analysis Pipeline',
      status: 'running',
      currentStepId: 'step2',
      progressPercentage: 45,
      steps: [
        { id: 'step1', name: 'Fetch Document', status: 'completed', startTime: '10:00', endTime: '10:01', details: 'Source: /docs/report.pdf' },
        { id: 'step2', name: 'Extract Text', status: 'in-progress', startTime: '10:01', details: 'Using OCR Agent' },
        { id: 'step3', name: 'Summarize Content', status: 'pending' },
        { id: 'step4', name: 'Store Results', status: 'pending' },
      ],
    },
    {
      id: 'wf2',
      name: 'Daily News Aggregation',
      status: 'completed',
      progressPercentage: 100,
      steps: [
        { id: 's1', name: 'Fetch Feeds', status: 'completed' },
        { id: 's2', name: 'Filter Articles', status: 'completed' },
        { id: 's3', name: 'Generate Briefing', status: 'completed' },
      ],
    },
    {
      id: 'wf3',
      name: 'Codebase Audit',
      status: 'failed',
      currentStepId: 'audit-step2',
      progressPercentage: 20,
      steps: [
        { id: 'audit-step1', name: 'Clone Repository', status: 'completed'},
        { id: 'audit-step2', name: 'Static Analysis', status: 'error', details: 'Linter timeout' },
        { id: 'audit-step3', name: 'Generate Report', status: 'pending' },
      ],
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   setIsLoading(true);
  //   fetch('/api/workflows/active') // Example API
  //     .then(res => res.json())
  //     .then(data => {
  //       setWorkflows(data);
  //       setIsLoading(false);
  //     })
  //     .catch(error => {
  //       console.error("Failed to fetch workflows:", error);
  //       setIsLoading(false);
  //     });
  // }, []);

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
    return <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">Lade Workflow-Fortschritt...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Aktive Workflows & Pläne</h2>
      {workflows.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">Keine aktiven Workflows.</p>
      )}
      <div className="space-y-6">
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
