import React, { useState } from 'react';
import { FaRobot, FaCog, FaKey, FaTasks, FaCheckCircle, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

interface AgentConfig {
  name: string;
  type: string; // e.g., 'RAG', 'DataProcessing', 'CodeGeneration'
  description: string;
  capabilities: string[];
  mcpToolsAccess: string[];
  a2aPolicies: {
    allowIncomingFrom: string[]; // Agent IDs or '*'
    allowOutgoingTo: string[];   // Agent IDs or '*'
  };
  initialPrompt?: string;
  apiKey?: string; // For agent-specific API keys if needed
}

const STEPS = [
  { id: 1, name: 'Basic Information', icon: <FaRobot /> },
  { id: 2, name: 'Capabilities & Tools', icon: <FaCog /> },
  { id: 3, name: 'Communication & Security', icon: <FaKey /> },
  { id: 4, name: 'Review & Deploy', icon: <FaTasks /> },
];

const AgentOnboardingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [agentConfig, setAgentConfig] = useState<Partial<AgentConfig>>({
    name: '',
    type: '',
    description: '',
    capabilities: [],
    mcpToolsAccess: [],
    a2aPolicies: { allowIncomingFrom: [], allowOutgoingTo: [] },
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Handle final submission
      console.log('Submitting agent configuration:', agentConfig);
      setIsSubmitted(true);
      // Here you would typically make an API call to the backend
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAgentConfig(prev => ({ ...prev, [name]: value }));
  };

  // Placeholder for more complex state changes like arrays
  // const handleArrayChange = (name: keyof AgentConfig, values: string[]) => {
  //   setAgentConfig(prev => ({ ...prev, [name]: values }));
  // };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Basic Information
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Agent Name</label>
              <input type="text" name="name" id="name" value={agentConfig.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" placeholder="My New Agent" />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Agent Type</label>
              <select name="type" id="type" value={agentConfig.type} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white">
                <option value="">Select type...</option>
                <option value="RAG">RAG Agent</option>
                <option value="DataProcessing">Data Processing Agent</option>
                <option value="CodeGeneration">Code Generation Agent</option>
                <option value="Custom">Custom Agent</option>
              </select>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea name="description" id="description" value={agentConfig.description} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" placeholder="Briefly describe what this agent does." />
            </div>
          </div>
        );
      // Add cases for other steps (Capabilities, Communication, Review)
      // For brevity, these are simplified here.
      case 2: // Capabilities & Tools
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agent Capabilities</label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Select the core functions this agent will perform.</p>
              {/* Placeholder for a multi-select or checkbox group for capabilities */}
              <div className="space-y-2">
                {['Data Analysis', 'Natural Language Processing', 'File System Operations', 'API Interaction', 'User Interface Generation'].map(cap => (
                  <label key={cap} className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    <input 
                      type="checkbox" 
                      name="capabilities" 
                      value={cap} 
                      checked={agentConfig.capabilities?.includes(cap)}
                      onChange={(e) => {
                        const { checked, value } = e.target;
                        setAgentConfig(prev => ({
                          ...prev,
                          capabilities: checked 
                            ? [...(prev.capabilities || []), value] 
                            : (prev.capabilities || []).filter(c => c !== value)
                        }));
                      }}
                      className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700"
                    />
                    <span>{cap}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">MCP Tool Access</label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Select MCP tools this agent requires access to.</p>
              {/* Placeholder for a multi-select or checkbox group for MCP tools */}
              <div className="space-y-2">
                {['sequentialthinking', 'context7', 'desktop-commander', 'brave-search'].map(tool => (
                   <label key={tool} className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    <input 
                      type="checkbox" 
                      name="mcpToolsAccess" 
                      value={tool}
                      checked={agentConfig.mcpToolsAccess?.includes(tool)}
                      onChange={(e) => {
                        const { checked, value } = e.target;
                        setAgentConfig(prev => ({
                          ...prev,
                          mcpToolsAccess: checked 
                            ? [...(prev.mcpToolsAccess || []), value] 
                            : (prev.mcpToolsAccess || []).filter(t => t !== value)
                        }));
                      }}
                      className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700"
                    />
                    <span>{tool}</span>
                  </label>
                ))}
              </div>
            </div>
             <div>
              <label htmlFor="initialPrompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Initial System Prompt (Optional)</label>
              <textarea name="initialPrompt" id="initialPrompt" value={agentConfig.initialPrompt || ''} onChange={handleChange} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" placeholder="Define the agent's core instructions or personality..." />
            </div>
          </div>
        );
      case 3: // Communication & Security
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">A2A Communication Policies</label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Define which agents this agent can communicate with. Use '*' for all, or specific Agent IDs.</p>
              <div className="space-y-3">
                <div>
                  <label htmlFor="allowIncomingFrom" className="block text-xs font-medium text-gray-600 dark:text-gray-400">Allow Incoming From (comma-separated IDs or '*')</label>
                  <input 
                    type="text" 
                    name="allowIncomingFrom" 
                    id="allowIncomingFrom" 
                    value={agentConfig.a2aPolicies?.allowIncomingFrom.join(', ') || ''}
                    onChange={(e) => setAgentConfig(prev => ({ ...prev, a2aPolicies: { ...(prev.a2aPolicies!), allowIncomingFrom: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }}))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" 
                    placeholder="agent-alpha, agent-beta, *"
                  />
                </div>
                <div>
                  <label htmlFor="allowOutgoingTo" className="block text-xs font-medium text-gray-600 dark:text-gray-400">Allow Outgoing To (comma-separated IDs or '*')</label>
                  <input 
                    type="text" 
                    name="allowOutgoingTo" 
                    id="allowOutgoingTo" 
                    value={agentConfig.a2aPolicies?.allowOutgoingTo.join(', ') || ''}
                    onChange={(e) => setAgentConfig(prev => ({ ...prev, a2aPolicies: { ...(prev.a2aPolicies!), allowOutgoingTo: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }}))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" 
                    placeholder="agent-gamma, *"
                  />
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Agent-Specific API Key (Optional)</label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">If this agent requires its own API key for external services, enter it here. It will be stored securely.</p>
              <input 
                type="password" 
                name="apiKey" 
                id="apiKey" 
                value={agentConfig.apiKey || ''} 
                onChange={handleChange} 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" 
                placeholder="Enter API key if needed" 
              />
            </div>
          </div>
        );
      case 4: // Review & Deploy
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Review Agent Configuration</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md space-y-3 text-sm">
              <div><strong className="text-gray-600 dark:text-gray-300">Name:</strong> {agentConfig.name || 'Not set'}</div>
              <div><strong className="text-gray-600 dark:text-gray-300">Type:</strong> {agentConfig.type || 'Not set'}</div>
              <div><strong className="text-gray-600 dark:text-gray-300">Description:</strong> {agentConfig.description || 'Not set'}</div>
              <div>
                <strong className="text-gray-600 dark:text-gray-300">Capabilities:</strong> 
                {agentConfig.capabilities && agentConfig.capabilities.length > 0 ? agentConfig.capabilities.join(', ') : 'None selected'}
              </div>
              <div>
                <strong className="text-gray-600 dark:text-gray-300">MCP Tools Access:</strong> 
                {agentConfig.mcpToolsAccess && agentConfig.mcpToolsAccess.length > 0 ? agentConfig.mcpToolsAccess.join(', ') : 'None selected'}
              </div>
              <div>
                <strong className="text-gray-600 dark:text-gray-300">Initial Prompt:</strong> 
                {agentConfig.initialPrompt ? (
                  <pre className="whitespace-pre-wrap bg-gray-100 dark:bg-gray-600 p-2 rounded text-xs max-h-24 overflow-y-auto">{agentConfig.initialPrompt}</pre>
                ) : 'Not set'}
              </div>
              <div>
                <strong className="text-gray-600 dark:text-gray-300">A2A Incoming Policy:</strong> 
                {agentConfig.a2aPolicies?.allowIncomingFrom?.join(', ') || 'Not set'}
              </div>
              <div>
                <strong className="text-gray-600 dark:text-gray-300">A2A Outgoing Policy:</strong> 
                {agentConfig.a2aPolicies?.allowOutgoingTo?.join(', ') || 'Not set'}
              </div>
              <div>
                <strong className="text-gray-600 dark:text-gray-300">Agent API Key:</strong> 
                {agentConfig.apiKey ? 'Set (hidden)' : 'Not set'}
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Please review the agent configuration carefully. Once submitted, the agent will be provisioned based on these settings.
            </p>
          </div>
        );
      default: return null;
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center">
        <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Agent Onboarding Submitted!</h2>
        <p className="text-gray-600 dark:text-gray-300">Agent <strong>{agentConfig.name}</strong> configuration has been submitted for deployment.</p>
        {/* Add a button to go back to agent list or dashboard */}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center">Agent Onboarding & Configuration</h1>
      
      {/* Stepper Navigation */}
      <nav aria-label="Progress" className="mb-8">
        <ol role="list" className="flex items-center">
          {STEPS.map((step, stepIdx) => (
            <li key={step.name} className={`relative ${stepIdx !== STEPS.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
              {step.id < currentStep ? (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-indigo-600" />
                  </div>
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className="relative w-8 h-8 flex items-center justify-center bg-indigo-600 rounded-full hover:bg-indigo-900"
                  >
                    <FaCheckCircle className="w-5 h-5 text-white" aria-hidden="true" />
                    <span className="sr-only">{step.name}</span>
                  </button>
                </>
              ) : step.id === currentStep ? (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <button
                    disabled
                    className="relative w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 border-2 border-indigo-600 rounded-full"
                    aria-current="step"
                  >
                    <span className="h-2.5 w-2.5 bg-indigo-600 rounded-full" aria-hidden="true" />
                    <span className="sr-only">{step.name}</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <button
                    disabled /* Enable if you want to allow jumping to future unvisited steps */
                    className="group relative w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-full hover:border-gray-400"
                  >
                    <span className="h-2.5 w-2.5 bg-transparent rounded-full group-hover:bg-gray-300" aria-hidden="true" />
                    <span className="sr-only">{step.name}</span>
                  </button>
                </>
              )}
               <p className="absolute -bottom-6 text-xs font-medium text-gray-600 dark:text-gray-300 w-max text-center -translate-x-1/2 left-1/2">{step.name}</p>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-8">
        {renderStepContent()}
      </div>

      <div className="mt-8 pt-5 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <FaArrowLeft className="mr-2" /> Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {currentStep === STEPS.length ? 'Submit & Deploy' : 'Next'} <FaArrowRight className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentOnboardingFlow;
