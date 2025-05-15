import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css'; // Ensure React Flow styles are imported

// Placeholder for Workflow data type
interface WorkflowNodeData {
  label: string;
  type?: 'agent' | 'tool' | 'input' | 'output' | 'decision';
  status?: 'pending' | 'running' | 'completed' | 'failed';
}

interface WorkflowNode extends Node<WorkflowNodeData> {}

// Placeholder for API response type for a workflow
interface WorkflowApiResponse {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: Edge[];
}

const initialNodes: WorkflowNode[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start: User Query' },
    position: { x: 250, y: 5 },
  },
];

const AgentWorkflowVisualizer: React.FC<{ workflowId?: string }> = ({ workflowId }) => {
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [workflowName, setWorkflowName] = useState<string>('Workflow');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  useEffect(() => {
    if (workflowId) {
      setLoading(true);
      // TODO: Fetch workflow data from the backend API using workflowId
      // Example:
      // const fetchWorkflow = async () => {
      //   try {
      //     const response = await fetch(`/api/workflows/${workflowId}`); // Replace with actual API endpoint
      //     if (!response.ok) {
      //       throw new Error(`HTTP error! status: ${response.status}`);
      //     }
      //     const data: WorkflowApiResponse = await response.json();
      //     setWorkflowName(data.name);
      //     setNodes(data.nodes); // Ensure these nodes have x, y positions
      //     setEdges(data.edges);
      //   } catch (e) {
      //     setError(e instanceof Error ? e.message : String(e));
      //   } finally {
      //     setLoading(false);
      //   }
      // };
      // fetchWorkflow();

      // Mock data for now if a workflowId is provided
      setTimeout(() => {
        setWorkflowName(`Sample Workflow (${workflowId})`);
        setNodes([
          { id: 'wf-1-start', type: 'input', data: { label: 'User Request: Find best restaurant' }, position: { x: 50, y: 50 } },
          { id: 'wf-1-agent1', data: { label: 'ResearchAgent: Search online reviews', type: 'agent', status: 'completed' }, position: { x: 50, y: 150 } },
          { id: 'wf-1-agent2', data: { label: 'PlannerAgent: Filter by cuisine & budget', type: 'agent', status: 'running' }, position: { x: 300, y: 150 } },
          { id: 'wf-1-tool1', data: { label: 'GeoLocationTool: Check distance', type: 'tool', status: 'pending' }, position: { x: 300, y: 250 } },
          { id: 'wf-1-output', type: 'output', data: { label: 'Recommendation: "Le Gourmet"' }, position: { x: 150, y: 350 } },
        ]);
        setEdges([
          { id: 'e-wf1-start-a1', source: 'wf-1-start', target: 'wf-1-agent1', animated: true },
          { id: 'e-wf1-a1-a2', source: 'wf-1-agent1', target: 'wf-1-agent2', animated: true },
          { id: 'e-wf1-a2-t1', source: 'wf-1-agent2', target: 'wf-1-tool1', animated: true, label: 'uses' },
          { id: 'e-wf1-t1-out', source: 'wf-1-tool1', target: 'wf-1-output', animated: true },
          { id: 'e-wf1-a2-out', source: 'wf-1-agent2', target: 'wf-1-output', animated: true, type: 'step', label: 'direct to output if tool fails' },
        ]);
        setLoading(false);
      }, 1000);
    } else {
      // Default state if no workflowId is provided
      setNodes(initialNodes);
      setEdges([]);
      setWorkflowName("No Workflow Selected");
    }
  }, [workflowId]);

  if (loading) {
    return <div className="p-4 text-center">Loading workflow: {workflowName}...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error fetching workflow: {error}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6" style={{ height: '500px' }}> {/* Ensure height for React Flow */}
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{workflowName}</h2>
      {nodes.length === 1 && nodes[0].id === '1' && !workflowId ? (
         <p className="text-gray-600">Select a workflow to visualize its execution graph.</p>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          attributionPosition="bottom-left"
        >
          <MiniMap nodeStrokeWidth={3} zoomable pannable />
          <Controls />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      )}
      {/* TODO: Add more details on node click, legend for node types/statuses */}
    </div>
  );
};

export default AgentWorkflowVisualizer;
