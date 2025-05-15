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
  // Position, // Position is part of Node, not usually imported separately unless for specific use
  Handle, // For custom nodes, if we go that route
  Position, // For Handle positioning
} from 'reactflow';
import 'reactflow/dist/style.css'; // Ensure React Flow styles are imported

// Placeholder for Workflow data type
type NodeType = 'agent' | 'tool' | 'input' | 'output' | 'decision' | 'default';
type NodeStatus = 'pending' | 'running' | 'completed' | 'failed' | 'unknown';

interface WorkflowNodeData {
  label: string;
  type?: NodeType;
  status?: NodeStatus;
}

interface WorkflowNode extends Node<WorkflowNodeData> {
  // React Flow's Node already includes id, position, data, type (optional), style (optional), className (optional) etc.
}

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
    type: 'input', // Default React Flow node type
    data: { label: 'Start: User Query', type: 'input' },
    position: { x: 250, y: 5 },
    style: { backgroundColor: '#90EE90', padding: '10px', borderRadius: '3px', border: '1px solid #228B22' },
  },
];

const getNodeStyle = (nodeData?: WorkflowNodeData): React.CSSProperties => {
  const baseStyle: React.CSSProperties = {
    padding: '10px 15px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '12px',
    textAlign: 'center',
  };
  switch (nodeData?.type) {
    case 'input':
      return { ...baseStyle, backgroundColor: '#A8E6CF', borderColor: '#77DD77' }; // Light green
    case 'output':
      return { ...baseStyle, backgroundColor: '#FFD3B6', borderColor: '#FFB347' }; // Light orange
    case 'agent':
      return { ...baseStyle, backgroundColor: '#B2DAFB', borderColor: '#6CB4EE' }; // Light blue
    case 'tool':
      return { ...baseStyle, backgroundColor: '#D1C4E9', borderColor: '#9575CD' }; // Light purple
    case 'decision':
      return { ...baseStyle, backgroundColor: '#FFFACD', borderColor: '#FFEB3B', transform: 'rotate(45deg)', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }; // Light yellow, diamond
    default:
      return { ...baseStyle, backgroundColor: '#f0f0f0', borderColor: '#ddd' };
  }
};

const AgentWorkflowVisualizer: React.FC<{ workflowId?: string }> = ({ workflowId }) => {
  const [nodes, setNodes] = useState<WorkflowNode[]>(
    initialNodes.map(n => ({ ...n, style: getNodeStyle(n.data) }))
  );
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
        const mockNodes: WorkflowNode[] = [
          { id: 'wf-1-start', type: 'input', data: { label: 'User Request: Find best restaurant', type: 'input' }, position: { x: 50, y: 50 } },
          { id: 'wf-1-agent1', type: 'default', data: { label: 'ResearchAgent: Search online reviews', type: 'agent', status: 'completed' }, position: { x: 50, y: 150 } },
          { id: 'wf-1-agent2', type: 'default', data: { label: 'PlannerAgent: Filter by cuisine & budget', type: 'agent', status: 'running' }, position: { x: 300, y: 150 } },
          { id: 'wf-1-tool1', type: 'default', data: { label: 'GeoLocationTool: Check distance', type: 'tool', status: 'pending' }, position: { x: 300, y: 250 } },
          { id: 'wf-1-output', type: 'output', data: { label: 'Recommendation: "Le Gourmet"', type: 'output' }, position: { x: 150, y: 350 } },
        ];
        setNodes(mockNodes.map(n => ({ ...n, style: getNodeStyle(n.data) })));
        setEdges([
          { id: 'e-wf1-start-a1', source: 'wf-1-start', target: 'wf-1-agent1', animated: true, style: { stroke: '#6CB4EE' } },
          { id: 'e-wf1-a1-a2', source: 'wf-1-agent1', target: 'wf-1-agent2', animated: true, style: { stroke: '#6CB4EE' } },
          { id: 'e-wf1-a2-t1', source: 'wf-1-agent2', target: 'wf-1-tool1', animated: true, label: 'uses', style: { stroke: '#9575CD' } },
          { id: 'e-wf1-t1-out', source: 'wf-1-tool1', target: 'wf-1-output', animated: true, style: { stroke: '#FFB347' } },
          { id: 'e-wf1-a2-out', source: 'wf-1-agent2', target: 'wf-1-output', animated: true, type: 'step', label: 'direct to output if tool fails', style: { stroke: '#FFB347' } },
        ]);
        setLoading(false);
      }, 1000);
    } else {
      // Default state if no workflowId is provided
      setNodes(initialNodes.map(n => ({ ...n, style: getNodeStyle(n.data) })));
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
          <MiniMap nodeStrokeWidth={3} zoomable pannable style={{ backgroundColor: '#E8E8E8', borderRadius: '4px' }} />
          <Controls />
          <Background color="#ddd" gap={20} size={1} />
        </ReactFlow>
      )}
      <div className="absolute bottom-2 left-2 bg-white p-2 shadow-md rounded border border-border text-xs">
        <h4 className="font-semibold mb-1">Legend:</h4>
        <div className="flex items-center mb-0.5"><div className="w-3 h-3 rounded-sm mr-1" style={getNodeStyle({label: 'Input', type: 'input'})}></div> Input Node</div>
        <div className="flex items-center mb-0.5"><div className="w-3 h-3 rounded-sm mr-1" style={getNodeStyle({label: 'Output', type: 'output'})}></div> Output Node</div>
        <div className="flex items-center mb-0.5"><div className="w-3 h-3 rounded-sm mr-1" style={getNodeStyle({label: 'Agent', type: 'agent'})}></div> Agent Node</div>
        <div className="flex items-center mb-0.5"><div className="w-3 h-3 rounded-sm mr-1" style={getNodeStyle({label: 'Tool', type: 'tool'})}></div> Tool Node</div>
        {/* <div className="flex items-center"><div className="w-3 h-3 transform rotate-45 mr-1" style={getNodeStyle({label: 'Decision', type: 'decision'})}></div> Decision Node</div> */}
      </div>
      {/* TODO: Add more details on node click (modal or sidebar) */}
    </div>
  );
};

export default AgentWorkflowVisualizer;
