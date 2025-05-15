import React, { useState } from 'react';
import { FaEdit, FaPlay, FaHistory, FaSave, FaSlidersH, FaExchangeAlt, FaBug, FaPlus, FaSpinner } from 'react-icons/fa';

interface PromptVersion {
  id: string;
  content: string;
  timestamp: string;
  parameters?: Record<string, any>;
  response?: string;
  tokensUsed?: number;
  latency?: number; // ms
}

interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  currentVersionId: string;
  versions: PromptVersion[];
  tags?: string[];
}

const PromptEngineeringSuite: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [promptParameters, setPromptParameters] = useState<Record<string, any>>({});
  const [testResponse, setTestResponse] = useState('');
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor', 'templates', 'history'

  // Placeholder for available prompt templates
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>([
    { id: 'tpl1', name: 'Summarization Prompt', currentVersionId: 'v1a', versions: [{id: 'v1a', content: 'Summarize the following text concisely: {{text}}', timestamp: '2025-05-10'}]},
    { id: 'tpl2', name: 'Code Generation Prompt (Python)', currentVersionId: 'v2c', versions: [{id: 'v2c', content: 'Write a Python function to {{task}} with the following requirements: {{requirements}}', timestamp: '2025-05-12'}]},
  ]);

  const handleRunPrompt = async () => {
    if (!currentPrompt) return;
    setIsLoadingResponse(true);
    setTestResponse('');
    // Simulate API call to an agent or LLM backend
    console.log('Running prompt:', currentPrompt, 'with params:', promptParameters);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
    setTestResponse(`Simulated response for: "${currentPrompt.substring(0,50)}..."`);
    setIsLoadingResponse(false);
  };

  // TODO: Add functions for saving templates, managing versions, etc.

  const renderTemplatesList = () => (
    <div className="md:col-span-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-md"> {/* Changed to full width for tab content */}
      <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-3">Prompt Templates</h2>
      <ul className="space-y-2">
        {promptTemplates.map(tpl => (
          <li key={tpl.id}>
            <button 
              onClick={() => {
                setSelectedTemplate(tpl);
                const currentVer = tpl.versions.find(v => v.id === tpl.currentVersionId);
                setCurrentPrompt(currentVer?.content || '');
                setPromptParameters(currentVer?.parameters || {});
                setActiveTab('editor'); // Switch to editor tab on selection
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${selectedTemplate?.id === tpl.id && activeTab === 'editor' ? 'bg-indigo-100 dark:bg-indigo-700 text-indigo-700 dark:text-indigo-100 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'}`}
            >
              {tpl.name}
            </button>
          </li>
        ))}
         <li><button className="w-full text-left px-3 py-2 rounded-md text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-800"><FaPlus className="inline mr-1" /> New Template</button></li>
      </ul>
    </div>
  );

  const renderEditorTestBench = () => (
    <div className="md:col-span-3 space-y-6"> {/* Changed to full width for tab content */}
      {!selectedTemplate && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-10">
          <FaEdit className="text-4xl mx-auto mb-3 text-gray-400 dark:text-gray-500" />
          Select a template from the 'Templates' tab or create a new one to start editing.
        </div>
      )}
      {selectedTemplate && (
        <>
          <div>
            <label htmlFor="promptContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prompt Content (Editing: {selectedTemplate.name})
            </label>
            <textarea
              id="promptContent"
              rows={8}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              value={currentPrompt}
              onChange={(e) => setCurrentPrompt(e.target.value)}
              placeholder="Enter your prompt here. Use {{variable_name}} for parameters."
            />
          </div>

          <div>
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Parameters (JSON)</h3>
            <textarea
              rows={3}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-xs dark:bg-gray-700 dark:text-white"
              value={JSON.stringify(promptParameters, null, 2)}
              onChange={(e) => {
                try { setPromptParameters(JSON.parse(e.target.value)); } catch (err) { /* Handle JSON parse error if needed */ }
              }}
              placeholder='{ "text": "Sample input text...", "maxLength": 100 }'
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleRunPrompt}
              disabled={isLoadingResponse || !currentPrompt}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              <FaPlay className="mr-2" /> Run Test
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <FaSave className="mr-2" /> Save Version
            </button>
          </div>

          {isLoadingResponse && (
            <div className="text-center p-4">
              <FaSpinner className="animate-spin text-blue-500 text-2xl mx-auto" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Generating response...</p>
            </div>
          )}

          {testResponse && (
            <div>
              <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Test Response</h3>
              <pre className="w-full p-3 bg-gray-100 dark:bg-gray-900 rounded-md text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap max-h-60 overflow-y-auto">
                {testResponse}
              </pre>
              {/* Placeholder for metrics */}
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Tokens Used: {selectedTemplate?.versions.find(v=>v.id===selectedTemplate.currentVersionId)?.tokensUsed || 'N/A'}</span> | <span>Latency: {selectedTemplate?.versions.find(v=>v.id===selectedTemplate.currentVersionId)?.latency || 'N/A'} ms</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderVersionHistory = () => (
    <div className="md:col-span-3 p-4"> {/* Changed to full width for tab content */}
      <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-3">Version History {selectedTemplate && `for ${selectedTemplate.name}`}</h2>
      {selectedTemplate ? (
        <ul className="space-y-2">
          {selectedTemplate.versions.map(v => (
            <li key={v.id} className="p-2 border rounded-md dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">Version ID: {v.id}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{v.timestamp}</span>
              </div>
              <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded whitespace-pre-wrap max-h-20 overflow-y-auto">{v.content}</pre>
              <button className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Revert to this version</button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">Select a template from the 'Templates' tab to see its version history.</p>
      )}
    </div>
  );


  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
        <FaSlidersH className="mr-3 text-indigo-500" /> Prompt Engineering & Debugging Suite
      </h1>
      
      <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {['editor', 'templates', 'history'].map((tabName) => (
            <button
              key={tabName}
              onClick={() => setActiveTab(tabName)}
              className={`${
                activeTab === tabName
                  ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm capitalize`}
            >
              {tabName === 'editor' ? 'Editor & Test Bench' : tabName === 'history' ? 'Version History' : tabName}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeTab === 'editor' && renderEditorTestBench()}
        {activeTab === 'templates' && renderTemplatesList()}
        {activeTab === 'history' && renderVersionHistory()}
      </div>
    </div>
  );
};

// Assuming FaPlus is imported if not already available globally
// import { FaPlus } from 'react-icons/fa';

export default PromptEngineeringSuite;
