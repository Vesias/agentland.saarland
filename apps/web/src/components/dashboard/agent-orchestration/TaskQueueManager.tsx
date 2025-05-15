import React, { useEffect, useState } from 'react';

// Placeholder for Task data type
interface Task {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'queued' | 'processing' | 'deferred';
  submittedAt: string; // ISO date string
  assignedAgent?: string; // ID or name of the agent it's likely to be processed by
}

// Placeholder for API response type
interface TaskQueueApiResponse {
  tasks: Task[];
  totalQueued: number;
}

const TaskQueueManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Fetch task queue data from the backend API
    // Example:
    // const fetchTasks = async () => {
    //   try {
    //     const response = await fetch('/api/tasks/queue'); // Replace with actual API endpoint
    //     if (!response.ok) {
    //       throw new Error(`HTTP error! status: ${response.status}`);
    //     }
    //     const data: TaskQueueApiResponse = await response.json();
    //     setTasks(data.tasks);
    //   } catch (e) {
    //     setError(e instanceof Error ? e.message : String(e));
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchTasks();

    // Mock data for now
    setTimeout(() => {
      setTasks([
        { id: 'task-001', description: 'Generate report for Q2 sales', priority: 'high', status: 'queued', submittedAt: new Date(Date.now() - 3600000).toISOString(), assignedAgent: 'ReportingAgent' },
        { id: 'task-002', description: 'Analyze user feedback from last week', priority: 'medium', status: 'queued', submittedAt: new Date(Date.now() - 7200000).toISOString() },
        { id: 'task-003', description: 'Update knowledge base with new documents', priority: 'low', status: 'processing', submittedAt: new Date(Date.now() - 10800000).toISOString(), assignedAgent: 'RAGUpdateAgent' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  // TODO: Implement functions for task actions (e.g., reprioritize, cancel) if needed

  if (loading) {
    return <div className="p-4 text-center">Loading task queue...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error fetching task queue: {error}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Task Queue Manager</h2>
      {tasks.length === 0 ? (
        <p className="text-gray-600">Task queue is currently empty.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Agent</th>
                {/* <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th> */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${task.priority === 'high' ? 'bg-red-100 text-red-800' : ''}
                      ${task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${task.priority === 'low' ? 'bg-green-100 text-green-800' : ''}
                    `}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(task.submittedAt).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.assignedAgent || 'N/A'}</td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* TODO: Add pagination, filtering, and sorting options */}
    </div>
  );
};

export default TaskQueueManager;
