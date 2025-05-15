import React, { useState, useEffect, useCallback } from 'react';
import { FaTools, FaSearch, FaInfoCircle, FaPuzzlePiece, FaServer, FaLink, FaUnlink, FaBook, FaSpinner } from 'react-icons/fa';

interface MCPToolSchema {
  // Simplified schema for now
  description: string;
  parameters: Record<string, { type: string; description: string; required?: boolean }>;
  returns: { type: string; description: string };
}

interface MCPTool {
  id: string;
  name: string;
  serverName: string; // Name of the MCP server providing the tool
  version: string;
  description: string;
  status: 'available' | 'unavailable' | 'deprecated';
  schema?: MCPToolSchema; // Optional detailed schema
  tags?: string[];
  usedByAgents?: string[]; // List of Agent IDs using this tool
}

const MCPToolManager: React.FC = () => {
  // Placeholder data
  const [mcpTools, setMcpTools] = useState<MCPTool[]>([
    { id: 'tool1', name: 'sequentialthinking', serverName: 'SequentialThinkingServer', version: '1.2.0', description: 'A detailed tool for dynamic and reflective problem-solving.', status: 'available', tags: ['planning', 'reasoning'], usedByAgents: ['agent-alpha', 'agent-gamma'] },
    { id: 'tool2', name: 'get_forecast', serverName: 'WeatherServer', version: '0.9.5', description: 'Fetches weather forecast for a given city.', status: 'available', tags: ['data', 'external-api'], usedByAgents: ['agent-beta'] },
    { id: 'tool3', name: 'desktop_commander_read_file', serverName: 'DesktopCommander', version: '2.0.1', description: 'Reads a file from the local desktop.', status: 'available', tags: ['filesystem', 'local'], usedByAgents: ['agent-alpha'] },
    { id: 'tool4', name: 'legacy_data_importer', serverName: 'LegacySystemBridge', version: '1.0.0', description: 'Imports data from old system (deprecated).', status: 'deprecated', tags: ['data', 'legacy'] },
  ]);
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false); // General loading for initial tool list

  // Context7 States
  const [libraryNameInput, setLibraryNameInput] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [resolvedLibraries, setResolvedLibraries] = useState<any[]>([]); // Store full resolve-library-id results
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null);
  const [documentation, setDocumentation] = useState<string | null>(null);
  const [context7Loading, setContext7Loading] = useState(false);
  const [context7Error, setContext7Error] = useState<string | null>(null);


  // useEffect(() => {
  //   setIsLoading(true);
  //   fetch('/api/mcp/tools') // Example API
  //     .then(res => res.json())
  //     .then(data => {
  //       setMcpTools(data);
  //       setIsLoading(false);
  //     })
  //     .catch(error => {
  //       console.error("Failed to fetch MCP tools:", error);
  //       setIsLoading(false);
  //     });
  // }, []);

  const filteredTools = mcpTools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.serverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectTool = (tool: MCPTool) => {
    setSelectedTool(tool);
    // Potentially fetch detailed schema if not already loaded
    // if (!tool.schema) { fetchToolSchema(tool.id); }
  };

  const handleResolveLibrary = async () => {
    if (!libraryNameInput.trim()) {
      setContext7Error("Please enter a library name.");
      return;
    }
    setContext7Loading(true);
    setContext7Error(null);
    setResolvedLibraries([]);
    setSelectedLibraryId(null);
    setDocumentation(null);
    try {
      const response = await fetch('/api/mcp/context7/resolve-library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ libraryName: libraryNameInput }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to resolve library: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success && data.result) {
        setResolvedLibraries(data.result);
        if (data.result.length === 1) {
          setSelectedLibraryId(data.result[0].id); // Auto-select if only one result
        }
      } else {
        setResolvedLibraries([]);
        setContext7Error(data.error || "No libraries found or unexpected response.");
      }
    } catch (error: any) {
      setContext7Error(error.message || "An error occurred while resolving the library.");
      setResolvedLibraries([]);
    } finally {
      setContext7Loading(false);
    }
  };

  const handleFetchDocs = async () => {
    if (!selectedLibraryId) {
      setContext7Error("Please select a resolved library first.");
      return;
    }
    if (!topicInput.trim()) {
      setContext7Error("Please enter a topic.");
      return;
    }
    setContext7Loading(true);
    setContext7Error(null);
    setDocumentation(null);
    try {
      const response = await fetch('/api/mcp/context7/get-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context7CompatibleLibraryID: selectedLibraryId, topic: topicInput }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch documentation: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success && data.result) {
        // Assuming result is the documentation string or an object with a content field
        setDocumentation(typeof data.result === 'string' ? data.result : JSON.stringify(data.result, null, 2));
      } else {
        setDocumentation(null);
        setContext7Error(data.error || "Failed to fetch documentation or unexpected response.");
      }
    } catch (error: any) {
      setContext7Error(error.message || "An error occurred while fetching documentation.");
      setDocumentation(null);
    } finally {
      setContext7Loading(false);
    }
  };
  
  if (isLoading) {
    return <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">Lade MCP Tools...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 max-w-7xl mx-auto"> {/* Increased max-width */}
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
        <FaPuzzlePiece className="mr-3 text-indigo-500" /> MCP Tool Discovery & Management
      </h1>

      {/* Context7 Tool Section */}
      <div className="mb-8 p-4 border border-dashed border-indigo-300 dark:border-indigo-700 rounded-lg">
        <h2 className="text-xl font-semibold text-indigo-700 dark:text-indigo-300 mb-4 flex items-center">
          <FaBook className="mr-2" /> Context7 Documentation Fetcher
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="libName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Library Name</label>
            <input 
              type="text" 
              id="libName"
              value={libraryNameInput} 
              onChange={(e) => setLibraryNameInput(e.target.value)}
              placeholder="e.g., react, express, zod"
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
            />
          </div>
          <div className="self-end">
            <button 
              onClick={handleResolveLibrary}
              disabled={context7Loading}
              className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center"
            >
              {context7Loading && resolvedLibraries.length === 0 ? <FaSpinner className="animate-spin mr-2" /> : <FaSearch className="mr-2" />}
              Resolve Library ID
            </button>
          </div>
        </div>

        {resolvedLibraries.length > 0 && (
          <div className="mb-4">
            <label htmlFor="resolvedLib" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Resolved Library</label>
            <select 
              id="resolvedLib"
              value={selectedLibraryId || ''}
              onChange={(e) => setSelectedLibraryId(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
            >
              <option value="" disabled>-- Select a library --</option>
              {resolvedLibraries.map((lib: any) => (
                <option key={lib.id} value={lib.id}>{lib.name} ({lib.id}) - Stars: {lib.stars}</option>
              ))}
            </select>
          </div>
        )}

        {selectedLibraryId && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="docTopic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Documentation Topic</label>
              <input 
                type="text" 
                id="docTopic"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="e.g., hooks, routing, validation"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
              />
            </div>
            <div className="self-end">
              <button 
                onClick={handleFetchDocs}
                disabled={context7Loading || !selectedLibraryId}
                className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center"
              >
                {context7Loading && documentation === null ? <FaSpinner className="animate-spin mr-2" /> : <FaBook className="mr-2" />}
                Fetch Documentation
              </button>
            </div>
          </div>
        )}
        
        {context7Error && <p className="text-sm text-red-600 dark:text-red-400 mb-2">{context7Error}</p>}

        {documentation && (
          <div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Fetched Documentation:</h3>
            <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md text-xs text-gray-800 dark:text-gray-200 max-h-96 overflow-auto">
              {documentation}
            </pre>
          </div>
        )}
      </div>

      {/* Existing Tool Discovery Section */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search tools by name, description, server, or tag..." 
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tool List (Left Panel) */}
        <div className="md:col-span-1 bg-gray-50 dark:bg-gray-700 p-4 rounded-md max-h-[calc(100vh-18rem)] overflow-y-auto">
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-3">Available Tools ({filteredTools.length})</h2>
          {filteredTools.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No tools match your search.</p>}
          <ul className="space-y-2">
            {filteredTools.map(tool => (
              <li key={tool.id}>
                <button 
                  onClick={() => handleSelectTool(tool)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${selectedTool?.id === tool.id ? 'bg-indigo-100 dark:bg-indigo-700 text-indigo-700 dark:text-indigo-100 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'}`}
                >
                  <div className="font-medium">{tool.name} <span className="text-xs text-gray-400 dark:text-gray-500">v{tool.version}</span></div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">from {tool.serverName}</div>
                  {tool.status === 'deprecated' && <span className="text-xs text-yellow-600 dark:text-yellow-400"> (Deprecated)</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Tool Details (Right Panel) */}
        <div className="md:col-span-2 p-4 border border-gray-200 dark:border-gray-700 rounded-md max-h-[calc(100vh-18rem)] overflow-y-auto">
          {selectedTool ? (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{selectedTool.name}</h2>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${selectedTool.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : selectedTool.status === 'deprecated' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'}`}>
                  {selectedTool.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{selectedTool.description}</p>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p><FaServer className="inline mr-1.5"/>Server: {selectedTool.serverName}</p>
                <p><FaPuzzlePiece className="inline mr-1.5"/>Version: {selectedTool.version}</p>
              </div>
              {selectedTool.tags && selectedTool.tags.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Tags:</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedTool.tags.map(tag => <span key={tag} className="px-1.5 py-0.5 text-xxs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded">{tag}</span>)}
                  </div>
                </div>
              )}
              {selectedTool.usedByAgents && selectedTool.usedByAgents.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Used by Agents:</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{selectedTool.usedByAgents.join(', ')}</p>
                </div>
              )}
              {/* Placeholder for schema display */}
              {selectedTool.schema && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Schema (Simplified):</h4>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto">{JSON.stringify(selectedTool.schema, null, 2)}</pre>
                </div>
              )}
              <div className="mt-4 flex space-x-2">
                <button className="px-3 py-1.5 text-xs border border-indigo-500 text-indigo-500 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900 flex items-center"><FaLink className="mr-1.5"/> Assign to Agent</button>
                <button className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"><FaInfoCircle className="mr-1.5"/> View Docs</button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-10">
              <FaTools className="text-4xl mx-auto mb-3 text-gray-400 dark:text-gray-500" />
              Select a tool from the list to view its details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MCPToolManager;
