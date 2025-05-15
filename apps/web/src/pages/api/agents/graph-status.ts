import type { NextApiRequest, NextApiResponse } from 'next';

interface AgentNode {
  id: string;
  label: string;
  status: 'idle' | 'processing' | 'error' | 'completed';
  task?: string;
}

interface AgentLink {
  source: string;
  target: string;
  label?: string;
}

interface AgentGraphData {
  nodes: AgentNode[];
  links: AgentLink[];
}

// Simulate fetching or generating live agent graph data
const getAgentGraphData = (): AgentGraphData => {
  // This data would normally come from a live agent management system
  const statuses: Array<'idle' | 'processing' | 'error' | 'completed'> = ['idle', 'processing', 'error', 'completed'];
  const tasks = [
    'Analyzing user sentiment', 
    'Fetching data from API X', 
    'Generating report for Q2', 
    'Optimizing database query',
    'Monitoring system logs'
  ];

  const nodes: AgentNode[] = [
    { id: 'agent-main-coordinator', label: 'Main Coordinator', status: statuses[Math.floor(Math.random() * statuses.length)], task: tasks[Math.floor(Math.random() * tasks.length)] },
    { id: 'agent-data-ingest-1', label: 'Data Ingestor A', status: statuses[Math.floor(Math.random() * statuses.length)], task: tasks[Math.floor(Math.random() * tasks.length)] },
    { id: 'agent-rag-processor', label: 'RAG Processor', status: 'idle' },
    { id: 'agent-claude-api', label: 'Claude API Handler', status: 'completed', task: 'Generate summary for doc_xyz.pdf' },
    { id: 'agent-user-notifier', label: 'User Notifier', status: 'idle' },
    { id: 'agent-mcp-tool-sequential', label: 'Sequential Thinker', status: 'processing', task: 'Planning next steps for complex query' },
  ];

  const links: AgentLink[] = [
    { source: 'agent-main-coordinator', target: 'agent-data-ingest-1', label: 'New Data Task' },
    { source: 'agent-data-ingest-1', target: 'agent-rag-processor', label: 'Raw Data Chunks' },
    { source: 'agent-rag-processor', target: 'agent-claude-api', label: 'Contextual Prompt' },
    { source: 'agent-claude-api', target: 'agent-user-notifier', label: 'Final Response' },
    { source: 'agent-main-coordinator', target: 'agent-mcp-tool-sequential', label: 'Complex Query' },
    { source: 'agent-mcp-tool-sequential', target: 'agent-claude-api', label: 'Refined Prompt' },
  ];

  // Randomly make some agents error or idle to show dynamism
  nodes.forEach(node => {
    if (Math.random() < 0.1) node.status = 'error';
    else if (Math.random() < 0.3 && node.status === 'processing') node.status = 'idle';
  });

  return { nodes, links };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AgentGraphData | { error: string }>
) {
  if (req.method === 'GET') {
    try {
      const graphData = getAgentGraphData();
      res.status(200).json(graphData);
    } catch (error) {
      console.error('Error generating agent graph data:', error);
      res.status(500).json({ error: 'Failed to retrieve agent graph data.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
