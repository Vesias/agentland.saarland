import React, { useState } from 'react';
import { 
  FaShieldAlt, 
  FaLock, 
  FaKey, 
  FaUsers, 
  FaExchangeAlt, 
  FaClipboard, 
  FaDatabase, 
  FaRobot, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaCheck, 
  FaTimes,
  FaInfoCircle
} from 'react-icons/fa';
import { useSecurity } from '../../contexts/SecurityContext';
import { SecurityWidget, DNSSecurityStatus, SecurityAuditHighlights, EnvVariableStatus } from './index'; // Import DNSSecurityStatus and SecurityAuditHighlights from barrel file

/**
 * Security Dashboard Page
 * 
 * Comprehensive dashboard for monitoring and managing A2A security
 */
const SecurityDashboardPage = () => {
  const { 
    isAuthenticated, 
    currentAgent,
    accessLevel, 
    roles,
    encryptionEnabled,
    messageSigningEnabled,
    securityLevel,
    activeAgents,
    messagesProcessed,
    messagesBlocked,
    loading,
    error,
    generateApiKey,
    toggleEncryption,
    toggleMessageSigning,
    setSecurityLevel,
    clearError
  } = useSecurity();

  const [newApiKey, setNewApiKey] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [authorizedAgents, setAuthorizedAgents] = useState([
    { id: 'agent-1', name: 'Git Agent', accessLevel: 'PROTECTED', roles: ['git-operations', 'repo-management'], active: true, lastActive: '2025-05-14T10:30:00Z' },
    { id: 'agent-2', name: 'Documentation Agent', accessLevel: 'PUBLIC', roles: ['doc-generation'], active: true, lastActive: '2025-05-14T09:15:00Z' },
    { id: 'agent-3', name: 'RAG Agent', accessLevel: 'PRIVATE', roles: ['vector-db-access', 'content-retrieval'], active: false, lastActive: '2025-05-13T16:45:00Z' },
    { id: 'agent-4', name: 'Debug Agent', accessLevel: 'RESTRICTED', roles: ['code-execution', 'debugging'], active: true, lastActive: '2025-05-14T11:00:00Z' }
  ]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [formMode, setFormMode] = useState('view'); // view, edit, create

  // Handle API key generation
  const handleGenerateApiKey = async () => {
    const apiKey = await generateApiKey();
    setNewApiKey(apiKey);
  };

  // Render error message if any
  const renderErrorMessage = () => {
    if (!error) return null;
    
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={clearError}>Dismiss</button>
      </div>
    );
  };

  // Render the overview tab
  const renderOverviewTab = () => {
    return (
      <div className="dashboard-tab">
        <h2>Security Overview</h2>
        
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <FaShieldAlt className="card-icon" />
              <h3>Security Status</h3>
            </div>
            <div className="card-content">
              <div className="status-item">
                <span className="status-label">Security Level:</span>
                <span className={`status-value security-level-${securityLevel}`}>
                  {securityLevel.charAt(0).toUpperCase() + securityLevel.slice(1)}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Encryption:</span>
                <span className={`status-value ${encryptionEnabled ? 'status-enabled' : 'status-disabled'}`}>
                  {encryptionEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Message Signing:</span>
                <span className={`status-value ${messageSigningEnabled ? 'status-enabled' : 'status-disabled'}`}>
                  {messageSigningEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
          <SecurityAuditHighlights />
          <EnvVariableStatus />
          <div className="dashboard-card">
            <div className="card-header">
              <FaUsers className="card-icon" />
              <h3>Agent Information</h3>
            </div>
            <div className="card-content">
              <div className="status-item">
                <span className="status-label">Current Agent:</span>
                <span className="status-value">{currentAgent || 'Not authenticated'}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Access Level:</span>
                <span className="status-value">{accessLevel || 'None'}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Roles:</span>
                <span className="status-value">
                  {roles && roles.length > 0 ? roles.join(', ') : 'None'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <FaExchangeAlt className="card-icon" />
              <h3>Message Metrics</h3>
            </div>
            <div className="card-content">
              <div className="metric-item">
                <span className="metric-label">Active Agents:</span>
                <span className="metric-value">{activeAgents}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Messages Processed:</span>
                <span className="metric-value">{messagesProcessed}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Messages Blocked:</span>
                <span className="metric-value">{messagesBlocked}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the settings tab
  const renderSettingsTab = () => {
    return (
      <div className="dashboard-tab">
        <h2>Security Settings</h2>
        
        <div className="settings-section">
          <h3>Security Level</h3>
          <p>Configure the overall security level for A2A communications.</p>
          
          <div className="security-level-controls">
            <div className="security-level-options">
              <button 
                className={`level-button ${securityLevel === 'high' ? 'active' : ''}`}
                onClick={() => setSecurityLevel('high')}
              >
                High
              </button>
              <button 
                className={`level-button ${securityLevel === 'medium' ? 'active' : ''}`}
                onClick={() => setSecurityLevel('medium')}
              >
                Medium
              </button>
              <button 
                className={`level-button ${securityLevel === 'low' ? 'active' : ''}`}
                onClick={() => setSecurityLevel('low')}
              >
                Low
              </button>
            </div>
            
            <div className="security-level-description">
              <strong>Security Level Description:</strong>
              {securityLevel === 'high' && (
                <p>High security enforces strict validation, authentication, and authorization for all messages. All security features are enabled.</p>
              )}
              {securityLevel === 'medium' && (
                <p>Medium security enforces validation and authentication but allows more flexible authorization. Most security features are enabled.</p>
              )}
              {securityLevel === 'low' && (
                <p>Low security enforces basic validation only. This mode should only be used for development or testing.</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Security Features</h3>
          <p>Enable or disable specific security features.</p>
          
          <div className="feature-toggles">
            <div className="feature-toggle">
              <div className="feature-info">
                <FaLock className="feature-icon" />
                <div className="feature-text">
                  <h4>Message Encryption</h4>
                  <p>Encrypt sensitive data in A2A messages</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={encryptionEnabled}
                  onChange={(e) => toggleEncryption(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <div className="feature-toggle">
              <div className="feature-info">
                <FaExchangeAlt className="feature-icon" />
                <div className="feature-text">
                  <h4>Message Signing</h4>
                  <p>Sign messages to verify authenticity</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={messageSigningEnabled}
                  onChange={(e) => toggleMessageSigning(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>API Key Management</h3>
          <p>Generate new API keys for agent authentication.</p>
          
          <div className="api-key-section">
            <button className="generate-key-button" onClick={handleGenerateApiKey}>
              <FaKey className="button-icon" />
              Generate New API Key
            </button>
            
            {newApiKey && (
              <div className="new-api-key">
                <h4>New API Key Generated</h4>
                <p className="api-key-value">{newApiKey}</p>
                <p className="api-key-warning">Save this key now. It will not be shown again.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render the activity log tab
  const renderActivityLogTab = () => {
    // Mock log data - would come from an API in real implementation
    const mockLogData = [
      { id: 1, timestamp: '2025-05-14T08:32:15Z', type: 'authentication', severity: 'info', message: 'Agent git-agent authenticated successfully' },
      { id: 2, timestamp: '2025-05-14T08:30:22Z', type: 'authorization', severity: 'warning', message: 'Unauthorized access attempt by agent user-agent' },
      { id: 3, timestamp: '2025-05-14T08:15:05Z', type: 'validation', severity: 'error', message: 'Message validation failed: missing required field' },
      { id: 4, timestamp: '2025-05-14T08:10:18Z', type: 'encryption', severity: 'info', message: 'Encryption enabled for all messages' },
      { id: 5, timestamp: '2025-05-14T08:05:30Z', type: 'system', severity: 'info', message: 'A2A Security System initialized' }
    ];
    
    return (
      <div className="dashboard-tab">
        <h2>Security Activity Log</h2>
        
        <div className="activity-log">
          <div className="log-filters">
            <select className="log-filter">
              <option value="all">All Types</option>
              <option value="authentication">Authentication</option>
              <option value="authorization">Authorization</option>
              <option value="validation">Validation</option>
              <option value="encryption">Encryption</option>
              <option value="system">System</option>
            </select>
            
            <select className="log-filter">
              <option value="all">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          
          <div className="log-entries">
            {mockLogData.map(log => (
              <div className={`log-entry severity-${log.severity}`} key={log.id}>
                <div className="log-timestamp">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
                <div className="log-type">{log.type}</div>
                <div className="log-message">{log.message}</div>
              </div>
            ))}
          </div>
          
          <div className="log-pagination">
            <button className="pagination-button">&lt; Previous</button>
            <span className="pagination-info">Page 1 of 1</span>
            <button className="pagination-button" disabled>Next &gt;</button>
          </div>
        </div>
      </div>
    );
  };

  // Handle agent selection
  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
    setFormMode('view');
  };
  
  // Handle create new agent
  const handleCreateAgent = () => {
    setSelectedAgent({
      id: '',
      name: '',
      accessLevel: 'PUBLIC',
      roles: [],
      active: true,
      lastActive: new Date().toISOString()
    });
    setFormMode('create');
  };
  
  // Handle edit agent
  const handleEditAgent = () => {
    setFormMode('edit');
  };
  
  // Handle delete agent
  const handleDeleteAgent = (agentId) => {
    const updatedAgents = authorizedAgents.filter(agent => agent.id !== agentId);
    setAuthorizedAgents(updatedAgents);
    if (selectedAgent && selectedAgent.id === agentId) {
      setSelectedAgent(null);
    }
  };
  
  // Handle save agent
  const handleSaveAgent = (agent) => {
    if (formMode === 'create') {
      // Generate a new ID for the agent
      const newAgent = {
        ...agent,
        id: `agent-${Date.now()}`,
        lastActive: new Date().toISOString()
      };
      setAuthorizedAgents([...authorizedAgents, newAgent]);
      setSelectedAgent(newAgent);
    } else if (formMode === 'edit') {
      // Update existing agent
      const updatedAgents = authorizedAgents.map(a => 
        a.id === agent.id ? agent : a
      );
      setAuthorizedAgents(updatedAgents);
      setSelectedAgent(agent);
    }
    setFormMode('view');
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    if (formMode === 'create') {
      setSelectedAgent(null);
    }
    setFormMode('view');
  };

  // Render the agent authorization tab
  const renderAgentAuthorizationTab = () => {
    return (
      <div className="dashboard-tab">
        <h2>Agent Authorization</h2>
        
        <div className="agent-dashboard-layout">
          <div className="agent-list-panel">
            <div className="panel-header">
              <h3>Authorized Agents</h3>
              <button className="add-agent-button" onClick={handleCreateAgent}>
                <FaPlus className="button-icon" />
                Add Agent
              </button>
            </div>
            
            <div className="agent-list">
              {authorizedAgents.map(agent => (
                <div 
                  key={agent.id}
                  className={`agent-list-item ${selectedAgent && selectedAgent.id === agent.id ? 'selected' : ''} ${agent.active ? 'active' : 'inactive'}`}
                  onClick={() => handleSelectAgent(agent)}
                >
                  <div className="agent-icon">
                    <FaRobot />
                  </div>
                  <div className="agent-info">
                    <div className="agent-name">{agent.name}</div>
                    <div className="agent-details">
                      {agent.accessLevel} • {agent.roles.length} role(s)
                    </div>
                  </div>
                  <div className="agent-status">
                    {agent.active ? 
                      <span className="status-badge active">Active</span> : 
                      <span className="status-badge inactive">Inactive</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="agent-details-panel">
            {selectedAgent ? (
              <>
                <div className="panel-header">
                  <h3>{formMode === 'create' ? 'Create New Agent' : 'Agent Details'}</h3>
                  <div className="header-actions">
                    {formMode === 'view' && (
                      <>
                        <button className="action-button edit" onClick={handleEditAgent}>
                          <FaEdit className="button-icon" />
                          Edit
                        </button>
                        <button className="action-button delete" onClick={() => handleDeleteAgent(selectedAgent.id)}>
                          <FaTrash className="button-icon" />
                          Delete
                        </button>
                      </>
                    )}
                    {(formMode === 'edit' || formMode === 'create') && (
                      <>
                        <button className="action-button save" onClick={() => handleSaveAgent(selectedAgent)}>
                          <FaCheck className="button-icon" />
                          Save
                        </button>
                        <button className="action-button cancel" onClick={handleCancelEdit}>
                          <FaTimes className="button-icon" />
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="agent-form">
                  <div className="form-group">
                    <label>Agent Name</label>
                    {formMode === 'view' ? (
                      <div className="form-value">{selectedAgent.name}</div>
                    ) : (
                      <input 
                        type="text" 
                        value={selectedAgent.name}
                        onChange={(e) => setSelectedAgent({...selectedAgent, name: e.target.value})}
                        placeholder="Enter agent name"
                      />
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>Access Level</label>
                    {formMode === 'view' ? (
                      <div className="form-value access-level">
                        <span className={`access-badge ${selectedAgent.accessLevel.toLowerCase()}`}>
                          {selectedAgent.accessLevel}
                        </span>
                      </div>
                    ) : (
                      <select 
                        value={selectedAgent.accessLevel}
                        onChange={(e) => setSelectedAgent({...selectedAgent, accessLevel: e.target.value})}
                      >
                        <option value="PUBLIC">PUBLIC</option>
                        <option value="PROTECTED">PROTECTED</option>
                        <option value="PRIVATE">PRIVATE</option>
                        <option value="RESTRICTED">RESTRICTED</option>
                      </select>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>Agent Roles</label>
                    {formMode === 'view' ? (
                      <div className="form-value">
                        {selectedAgent.roles.length > 0 ? (
                          <div className="role-badges">
                            {selectedAgent.roles.map(role => (
                              <span key={role} className="role-badge">{role}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="no-roles">No roles assigned</span>
                        )}
                      </div>
                    ) : (
                      <div className="role-input-container">
                        <input 
                          type="text" 
                          placeholder="Add a role and press Enter"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim() !== '') {
                              const newRole = e.target.value.trim();
                              if (!selectedAgent.roles.includes(newRole)) {
                                setSelectedAgent({
                                  ...selectedAgent, 
                                  roles: [...selectedAgent.roles, newRole]
                                });
                              }
                              e.target.value = '';
                            }
                          }}
                        />
                        {selectedAgent.roles.length > 0 && (
                          <div className="role-badges editable">
                            {selectedAgent.roles.map(role => (
                              <span key={role} className="role-badge">
                                {role}
                                <button 
                                  className="remove-role" 
                                  onClick={() => {
                                    const updatedRoles = selectedAgent.roles.filter(r => r !== role);
                                    setSelectedAgent({...selectedAgent, roles: updatedRoles});
                                  }}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>Status</label>
                    {formMode === 'view' ? (
                      <div className="form-value">
                        {selectedAgent.active ? 'Active' : 'Inactive'}
                      </div>
                    ) : (
                      <div className="toggle-switch-container">
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={selectedAgent.active}
                            onChange={(e) => setSelectedAgent({...selectedAgent, active: e.target.checked})}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                        <span className="toggle-label">{selectedAgent.active ? 'Active' : 'Inactive'}</span>
                      </div>
                    )}
                  </div>
                  
                  {formMode === 'view' && (
                    <div className="form-group">
                      <label>Last Active</label>
                      <div className="form-value">
                        {new Date(selectedAgent.lastActive).toLocaleString()}
                      </div>
                    </div>
                  )}
                  
                  {formMode === 'view' && (
                    <div className="agent-capabilities">
                      <h4>Agent Capabilities</h4>
                      <div className="capabilities-list">
                        {getCapabilitiesByAccessLevel(selectedAgent.accessLevel).map(capability => (
                          <div key={capability.name} className="capability-item">
                            <div className="capability-name">
                              <FaCheck className={`capability-icon ${capability.allowed ? 'allowed' : 'denied'}`} />
                              {capability.name}
                            </div>
                            <div className="capability-description">
                              {capability.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="no-agent-selected">
                <FaInfoCircle className="info-icon" />
                <h3>No Agent Selected</h3>
                <p>Select an agent from the list to view details or click "Add Agent" to create a new one.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="dns-security-section">
          <h3>Domain Security Verification</h3>
          <p className="section-description">
            Agent authentication can be verified using DNS security records. This allows agents to authenticate using domain ownership verification.
          </p>
          <DNSSecurityStatus />
        </div>
      </div>
    );
  };
  
  // Helper function to get capabilities based on access level
  const getCapabilitiesByAccessLevel = (accessLevel) => {
    const capabilities = [
      { 
        name: 'Message Sending', 
        description: 'Send messages to other agents',
        allowed: ['PUBLIC', 'PROTECTED', 'PRIVATE', 'RESTRICTED'].includes(accessLevel)
      },
      { 
        name: 'Message Receiving', 
        description: 'Receive messages from other agents',
        allowed: ['PUBLIC', 'PROTECTED', 'PRIVATE', 'RESTRICTED'].includes(accessLevel)
      },
      { 
        name: 'System Access', 
        description: 'Access system resources and configurations',
        allowed: ['PROTECTED', 'PRIVATE', 'RESTRICTED'].includes(accessLevel)
      },
      { 
        name: 'File Operations', 
        description: 'Read and write files in allowed directories',
        allowed: ['PRIVATE', 'RESTRICTED'].includes(accessLevel)
      },
      { 
        name: 'Execute Code', 
        description: 'Execute code snippets in a secure environment',
        allowed: ['RESTRICTED'].includes(accessLevel)
      },
      { 
        name: 'Agent Creation', 
        description: 'Create and manage other agents',
        allowed: ['RESTRICTED'].includes(accessLevel)
      }
    ];
    
    return capabilities;
  };

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'settings':
        return renderSettingsTab();
      case 'agents':
        return renderAgentAuthorizationTab();
      case 'activity':
        return renderActivityLogTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="security-dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <FaShieldAlt className="dashboard-title-icon" />
          <h1>A2A Security Dashboard</h1>
        </div>
        
        <div className="dashboard-agent-info">
          {isAuthenticated ? (
            <>
              <span className="agent-label">Agent:</span>
              <span className="agent-value">{currentAgent}</span>
              <span className={`agent-status authenticated`}>Authenticated</span>
            </>
          ) : (
            <span className="agent-status unauthenticated">Not Authenticated</span>
          )}
        </div>
      </div>
      
      {renderErrorMessage()}
      
      {loading && <div className="loading-indicator">Loading security data...</div>}
      
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FaShieldAlt className="tab-icon" />
          Overview
        </button>
        
        <button 
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <FaClipboard className="tab-icon" />
          Settings
        </button>
        
        <button 
          className={`tab-button ${activeTab === 'agents' ? 'active' : ''}`}
          onClick={() => setActiveTab('agents')}
        >
          <FaRobot className="tab-icon" />
          Agent Authorization
        </button>
        
        <button 
          className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <FaDatabase className="tab-icon" />
          Activity Log
        </button>
      </div>
      
      <div className="dashboard-content">
        {renderTabContent()}
      </div>
      
      <style jsx>{`
        .security-dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem;
        }
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eee;
        }
        
        .dashboard-title {
          display: flex;
          align-items: center;
        }
        
        .dashboard-title-icon {
          color: #3a6ea5;
          font-size: 1.5rem;
          margin-right: 0.75rem;
        }
        
        .dashboard-title h1 {
          margin: 0;
          font-size: 1.5rem;
          color: #333;
        }
        
        .dashboard-agent-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .agent-label {
          font-weight: 500;
          color: #777;
        }
        
        .agent-value {
          font-weight: 600;
        }
        
        .agent-status {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .agent-status.authenticated {
          background-color: rgba(92, 184, 92, 0.1);
          color: #5cb85c;
        }
        
        .agent-status.unauthenticated {
          background-color: rgba(217, 83, 79, 0.1);
          color: #d9534f;
        }
        
        .error-message {
          background-color: rgba(217, 83, 79, 0.1);
          color: #d9534f;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .error-message p {
          margin: 0;
        }
        
        .error-message button {
          background-color: transparent;
          border: 1px solid #d9534f;
          color: #d9534f;
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          cursor: pointer;
        }
        
        .loading-indicator {
          text-align: center;
          padding: 1rem;
          color: #777;
        }
        
        .dashboard-tabs {
          display: flex;
          border-bottom: 1px solid #ddd;
          margin-bottom: 1.5rem;
        }
        
        .tab-button {
          display: flex;
          align-items: center;
          padding: 0.75rem 1.25rem;
          background-color: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          color: #555;
        }
        
        .tab-button.active {
          border-bottom-color: #3a6ea5;
          color: #3a6ea5;
        }
        
        .tab-icon {
          margin-right: 0.5rem;
        }
        
        .dashboard-tab h2 {
          margin-top: 0;
          margin-bottom: 1.5rem;
          font-size: 1.25rem;
          color: #333;
        }
        
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        
        .dashboard-card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .card-header {
          display: flex;
          align-items: center;
          padding: 1rem;
          background-color: #f8f9fa;
          border-bottom: 1px solid #eee;
        }
        
        .card-icon {
          margin-right: 0.75rem;
          color: #3a6ea5;
        }
        
        .card-header h3 {
          margin: 0;
          font-size: 1rem;
        }
        
        .card-content {
          padding: 1rem;
        }
        
        .status-item, .metric-item {
          margin-bottom: 0.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .status-item:last-child, .metric-item:last-child {
          margin-bottom: 0;
        }
        
        .status-label, .metric-label {
          font-weight: 500;
          color: #555;
        }
        
        .status-value, .metric-value {
          font-weight: 600;
        }
        
        .status-enabled {
          color: #5cb85c;
        }
        
        .status-disabled {
          color: #d9534f;
        }
        
        .security-level-high {
          color: #5cb85c;
        }
        
        .security-level-medium {
          color: #f0ad4e;
        }
        
        .security-level-low {
          color: #d9534f;
        }
        
        .settings-section {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .settings-section h3 {
          margin-top: 0;
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
          color: #333;
        }
        
        .settings-section > p {
          margin-top: 0;
          margin-bottom: 1.25rem;
          color: #555;
        }
        
        .security-level-controls {
          margin-top: 1rem;
        }
        
        .security-level-options {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .level-button {
          flex: 1;
          padding: 0.75rem;
          border-radius: 4px;
          border: 1px solid #ddd;
          background-color: #f8f9fa;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .level-button.active {
          background-color: #3a6ea5;
          color: white;
          border-color: #3a6ea5;
        }
        
        .security-level-description {
          background-color: #f8f9fa;
          border-radius: 4px;
          padding: 1rem;
          border: 1px solid #eee;
        }
        
        .security-level-description strong {
          display: block;
          margin-bottom: 0.5rem;
        }
        
        .security-level-description p {
          margin: 0;
          color: #555;
        }
        
        .feature-toggles {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .feature-toggle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background-color: #f8f9fa;
          border-radius: 4px;
          border: 1px solid #eee;
        }
        
        .feature-info {
          display: flex;
          align-items: center;
        }
        
        .feature-icon {
          color: #3a6ea5;
          margin-right: 0.75rem;
          font-size: 1.25rem;
        }
        
        .feature-text h4 {
          margin: 0;
          margin-bottom: 0.25rem;
          font-size: 1rem;
        }
        
        .feature-text p {
          margin: 0;
          color: #777;
          font-size: 0.875rem;
        }
        
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }
        
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          border-radius: 24px;
          transition: 0.4s;
        }
        
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          border-radius: 50%;
          transition: 0.4s;
        }
        
        input:checked + .toggle-slider {
          background-color: #3a6ea5;
        }
        
        input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }
        
        .api-key-section {
          margin-top: 1rem;
        }
        
        .generate-key-button {
          display: flex;
          align-items: center;
          background-color: #3a6ea5;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.75rem 1.25rem;
          cursor: pointer;
          font-weight: 500;
        }
        
        .button-icon {
          margin-right: 0.5rem;
        }
        
        .new-api-key {
          margin-top: 1rem;
          background-color: #f8f9fa;
          border-radius: 4px;
          padding: 1rem;
          border: 1px solid #eee;
        }
        
        .new-api-key h4 {
          margin-top: 0;
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }
        
        .api-key-value {
          font-family: monospace;
          background-color: #000;
          color: #fff;
          padding: 0.75rem;
          border-radius: 4px;
          overflow-x: auto;
          margin-bottom: 0.5rem;
        }
        
        .api-key-warning {
          color: #d9534f;
          font-size: 0.875rem;
          margin: 0;
        }
        
        .activity-log {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .log-filters {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background-color: #f8f9fa;
          border-bottom: 1px solid #eee;
        }
        
        .log-filter {
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid #ddd;
          background-color: white;
        }
        
        .log-entries {
          padding: 0.5rem 0;
          max-height: 400px;
          overflow-y: auto;
        }
        
        .log-entry {
          display: grid;
          grid-template-columns: 180px 120px 1fr;
          gap: 1rem;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #eee;
        }
        
        .log-entry:last-child {
          border-bottom: none;
        }
        
        .severity-info {
          border-left: 4px solid #5bc0de;
        }
        
        .severity-warning {
          border-left: 4px solid #f0ad4e;
        }
        
        .severity-error {
          border-left: 4px solid #d9534f;
        }
        
        .severity-critical {
          border-left: 4px solid #d9534f;
          background-color: rgba(217, 83, 79, 0.05);
        }
        
        .log-timestamp {
          color: #777;
          font-size: 0.875rem;
        }
        
        .log-type {
          text-transform: capitalize;
          font-weight: 500;
        }
        
        .log-pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background-color: #f8f9fa;
          border-top: 1px solid #eee;
        }
        
        .pagination-button {
          background-color: transparent;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 0.5rem 0.75rem;
          cursor: pointer;
        }
        
        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .pagination-info {
          color: #777;
          font-size: 0.875rem;
        }
        
        /* Agent Authorization Tab Styles */
        .agent-dashboard-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .agent-list-panel, .agent-details-panel {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background-color: #f8f9fa;
          border-bottom: 1px solid #eee;
        }
        
        .panel-header h3 {
          margin: 0;
          font-size: 1.1rem;
        }
        
        .add-agent-button {
          display: flex;
          align-items: center;
          background-color: #3a6ea5;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          cursor: pointer;
        }
        
        .add-agent-button .button-icon {
          margin-right: 0.5rem;
        }
        
        .agent-list {
          max-height: 500px;
          overflow-y: auto;
          padding: 0.5rem;
        }
        
        .agent-list-item {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 0.5rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
          border-left: 3px solid transparent;
        }
        
        .agent-list-item:hover {
          background-color: #f8f9fa;
        }
        
        .agent-list-item.selected {
          background-color: rgba(58, 110, 165, 0.1);
          border-left-color: #3a6ea5;
        }
        
        .agent-list-item.inactive {
          opacity: 0.7;
        }
        
        .agent-icon {
          color: #3a6ea5;
          font-size: 1.25rem;
          margin-right: 0.75rem;
        }
        
        .agent-info {
          flex: 1;
        }
        
        .agent-name {
          font-weight: 500;
          color: #333;
          margin-bottom: 0.25rem;
        }
        
        .agent-details {
          font-size: 0.75rem;
          color: #777;
        }
        
        .agent-status {
          display: flex;
          align-items: center;
        }
        
        .status-badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
          font-weight: 500;
        }
        
        .status-badge.active {
          background-color: rgba(92, 184, 92, 0.1);
          color: #5cb85c;
        }
        
        .status-badge.inactive {
          background-color: rgba(108, 117, 125, 0.1);
          color: #6c757d;
        }
        
        .header-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .action-button {
          display: flex;
          align-items: center;
          background-color: transparent;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          cursor: pointer;
        }
        
        .action-button.edit {
          color: #3a6ea5;
          border-color: #3a6ea5;
        }
        
        .action-button.delete {
          color: #d9534f;
          border-color: #d9534f;
        }
        
        .action-button.save {
          color: #5cb85c;
          border-color: #5cb85c;
        }
        
        .action-button.cancel {
          color: #6c757d;
          border-color: #6c757d;
        }
        
        .action-button .button-icon {
          margin-right: 0.25rem;
        }
        
        .agent-form {
          padding: 1rem;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #555;
        }
        
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.875rem;
        }
        
        .form-value {
          padding: 0.5rem;
          background-color: #f8f9fa;
          border-radius: 4px;
          font-size: 0.875rem;
        }
        
        .access-level .access-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .access-badge.public {
          background-color: rgba(92, 184, 92, 0.1);
          color: #5cb85c;
        }
        
        .access-badge.protected {
          background-color: rgba(91, 192, 222, 0.1);
          color: #5bc0de;
        }
        
        .access-badge.private {
          background-color: rgba(240, 173, 78, 0.1);
          color: #f0ad4e;
        }
        
        .access-badge.restricted {
          background-color: rgba(217, 83, 79, 0.1);
          color: #d9534f;
        }
        
        .role-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .role-badge {
          display: inline-flex;
          align-items: center;
          background-color: rgba(58, 110, 165, 0.1);
          color: #3a6ea5;
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
        }
        
        .role-badge.editable {
          padding-right: 0.25rem;
        }
        
        .remove-role {
          background: none;
          border: none;
          color: #d9534f;
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
          padding: 0 0 0 0.25rem;
        }
        
        .no-roles {
          color: #777;
          font-style: italic;
        }
        
        .role-input-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .toggle-switch-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .toggle-label {
          font-size: 0.875rem;
        }
        
        .agent-capabilities {
          margin-top: 1.5rem;
          border-top: 1px solid #eee;
          padding-top: 1rem;
        }
        
        .agent-capabilities h4 {
          margin-top: 0;
          margin-bottom: 0.75rem;
          font-size: 1rem;
        }
        
        .capabilities-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .capability-item {
          padding: 0.75rem;
          background-color: #f8f9fa;
          border-radius: 4px;
          border: 1px solid #eee;
        }
        
        .capability-name {
          display: flex;
          align-items: center;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        
        .capability-icon {
          margin-right: 0.5rem;
        }
        
        .capability-icon.allowed {
          color: #5cb85c;
        }
        
        .capability-icon.denied {
          color: #d9534f;
        }
        
        .capability-description {
          font-size: 0.875rem;
          color: #777;
        }
        
        .no-agent-selected {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: #777;
          text-align: center;
          padding: 1rem;
        }
        
        .no-agent-selected .info-icon {
          font-size: 2.5rem;
          color: #ddd;
          margin-bottom: 1rem;
        }
        
        .no-agent-selected h3 {
          margin-top: 0;
          margin-bottom: 0.5rem;
        }
        
        .no-agent-selected p {
          max-width: 300px;
        }
        
        .dns-security-section {
          margin-top: 1.5rem;
        }
        
        .dns-security-section h3 {
          margin-top: 0;
          margin-bottom: 0.5rem;
        }
        
        .section-description {
          margin-top: 0;
          margin-bottom: 1rem;
          color: #555;
        }
        
        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          
          .log-entry {
            grid-template-columns: 1fr;
            gap: 0.25rem;
          }
          
          .agent-dashboard-layout {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default SecurityDashboardPage;
