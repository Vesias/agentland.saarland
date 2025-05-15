import React, { useEffect, useRef, useState } from 'react';

// A proper graph visualization library (e.g., Vis Network, React Flow, or D3)
// would be needed for a real implementation. This is a simplified placeholder.
import { FaSpinner } from 'react-icons/fa';

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

const LiveAgentGraph: React.FC = () => {
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const [graphData, setGraphData] = useState<AgentGraphData>({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgentGraphData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/agents/graph-status');
        if (!response.ok) {
          throw new Error(`Failed to fetch agent graph data: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setGraphData(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        // Fallback to empty data
        setGraphData({ nodes: [], links: [] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentGraphData();
    // Optional: Set up an interval to periodically refresh data
    // const intervalId = setInterval(fetchAgentGraphData, 5000); // every 5 seconds
    // return () => clearInterval(intervalId);
  }, []);

  const getStatusColor = (status: AgentNode['status']) => {
    switch (status) {
      case 'processing': return 'border-blue-500 bg-blue-100 dark:bg-blue-700';
      case 'idle': return 'border-gray-400 bg-gray-100 dark:bg-gray-600';
      case 'error': return 'border-red-500 bg-red-100 dark:bg-red-700';
      case 'completed': return 'border-green-500 bg-green-100 dark:bg-green-700';
      default: return 'border-gray-300';
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
        <FaSpinner className="animate-spin text-blue-500 text-2xl mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-300">Lade Agenten-Graph...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-500 dark:text-red-400 mb-4">Fehler beim Laden des Agenten-Graphen</h2>
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Live Agenten-Interaktionsgraph
      </h2>
      {graphData.nodes.length === 0 && graphData.links.length === 0 && !isLoading && (
         <p className="text-gray-500 dark:text-gray-400">Keine Agenten-Aktivität zu visualisieren.</p>
      )}
      <div ref={graphContainerRef} className="w-full h-96 border border-gray-200 dark:border-gray-700 rounded-md p-4 relative overflow-auto">
        {/* Simplified text-based representation of the graph */}
        {graphData.nodes.length > 0 && (
          <>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Agenten ({graphData.nodes.length}):</h3>
            <ul className="list-disc list-inside mb-4">
              {graphData.nodes.map(node => (
                <li key={node.id} className={`text-xs p-2 rounded border-2 ${getStatusColor(node.status)} mb-1 text-gray-800 dark:text-gray-100`}>
                  <strong>{node.label}</strong> (Status: {node.status})
                  {node.task && <span className="block text-gray-600 dark:text-gray-300 text-xxs">Task: {node.task}</span>}
                </li>
              ))}
            </ul>
          </>
        )}
        {graphData.links.length > 0 && (
          <>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Verbindungen ({graphData.links.length}):</h3>
            <ul className="list-disc list-inside">
              {graphData.links.map((link, index) => (
                <li key={`${link.source}-${link.target}-${index}`} className="text-xs text-gray-600 dark:text-gray-300">
                  {graphData.nodes.find(n=>n.id===link.source)?.label || link.source} 
                  <span className="text-blue-500 dark:text-blue-400"> → </span> 
                  {graphData.nodes.find(n=>n.id===link.target)?.label || link.target}
                  {link.label && <span className="text-gray-500 dark:text-gray-400 text-xxs"> ({link.label})</span>}
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="text-xs text-gray-400 dark:text-gray-500 absolute bottom-2 right-2">
          Hinweis: Dies ist eine vereinfachte Darstellung. Eine interaktive Graphbibliothek wird benötigt.
        </p>
      </div>
    </div>
  );
};

export default LiveAgentGraph;
