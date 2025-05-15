import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaKey, FaCheck, FaTimes, FaExclamationTriangle, FaUserShield, FaUsers, FaUserLock } from 'react-icons/fa';

/**
 * A2AMissionAuthWidget Component
 * 
 * Displays the mission authorization controls and status for agent-to-agent
 * communication in the agentland.saarland security dashboard
 */
const A2AMissionAuthWidget = ({ className = "", agent = null }) => {
  const [missionAuthData, setMissionAuthData] = useState({
    accessLevels: {
      public: 8,
      protected: 5,
      private: 3,
      restricted: 1
    },
    operations: {
      view: { count: 42, level: 'public' },
      start: { count: 36, level: 'public' },
      update: { count: 28, level: 'protected' },
      complete: { count: 15, level: 'protected' },
      create: { count: 7, level: 'private' },
      delete: { count: 2, level: 'restricted' },
      manage: { count: 5, level: 'restricted' }
    },
    recentOperations: [
      { operation: 'view', missionId: 'mission-123', agentId: 'agent-45', status: 'authorized', timestamp: '2025-05-14T10:15:00Z' },
      { operation: 'start', missionId: 'mission-124', agentId: 'agent-67', status: 'authorized', timestamp: '2025-05-14T10:12:30Z' },
      { operation: 'update', missionId: 'mission-123', agentId: 'agent-45', status: 'authorized', timestamp: '2025-05-14T10:08:45Z' },
      { operation: 'delete', missionId: 'mission-120', agentId: 'agent-32', status: 'denied', timestamp: '2025-05-14T09:55:20Z' },
      { operation: 'create', missionId: 'mission-125', agentId: 'agent-88', status: 'authorized', timestamp: '2025-05-14T09:45:10Z' }
    ]
  });

  const [activeTab, setActiveTab] = useState('levels');
  const [isLoading, setIsLoading] = useState(false);
  const [editingOperation, setEditingOperation] = useState(null);

  // Fetch auth data
  useEffect(() => {
    // This would be replaced with an actual API call
    const fetchAuthData = async () => {
      setIsLoading(true);
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real implementation, this would call an API endpoint
        // Example: const response = await fetch('/api/a2a/mission/auth-data');
        // const data = await response.json();
        // setMissionAuthData(data);
      } catch (error) {
        console.error('Error fetching mission auth data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuthData();
  }, []);

  // Handle operation level change
  const handleOperationLevelChange = (operation, level) => {
    setMissionAuthData(prevData => ({
      ...prevData,
      operations: {
        ...prevData.operations,
        [operation]: {
          ...prevData.operations[operation],
          level
        }
      }
    }));
    setEditingOperation(null);
  };

  // Start editing an operation's access level
  const startEditing = (operation) => {
    setEditingOperation(operation);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingOperation(null);
  };

  // Get icon for access level
  const getAccessLevelIcon = (level) => {
    switch (level) {
      case 'public':
        return <FaUsers />;
      case 'protected':
        return <FaUserShield />;
      case 'private':
        return <FaUserLock />;
      case 'restricted':
        return <FaKey />;
      default:
        return <FaUsers />;
    }
  };

  // Get status icon for operation
  const getStatusIcon = (status) => {
    switch (status) {
      case 'authorized':
        return <FaCheck className="status-icon authorized" />;
      case 'denied':
        return <FaTimes className="status-icon denied" />;
      default:
        return <FaExclamationTriangle className="status-icon unknown" />;
    }
  };

  // Render access levels tab
  const renderAccessLevelsTab = () => {
    return (
      <div className="access-levels-tab">
        <p className="tab-description">
          Configure the required access levels for different mission operations.
          Higher levels provide more security but require stronger authentication.
        </p>
        
        <div className="access-level-legend">
          <div className="level-item public">
            <div className="level-icon">{getAccessLevelIcon('public')}</div>
            <div className="level-info">
              <span className="level-name">Public</span>
              <span className="level-desc">Available to all authenticated agents</span>
            </div>
          </div>
          
          <div className="level-item protected">
            <div className="level-icon">{getAccessLevelIcon('protected')}</div>
            <div className="level-info">
              <span className="level-name">Protected</span>
              <span className="level-desc">Available to agents with domain verification</span>
            </div>
          </div>
          
          <div className="level-item private">
            <div className="level-icon">{getAccessLevelIcon('private')}</div>
            <div className="level-info">
              <span className="level-name">Private</span>
              <span className="level-desc">Available to verified and approved agents</span>
            </div>
          </div>
          
          <div className="level-item restricted">
            <div className="level-icon">{getAccessLevelIcon('restricted')}</div>
            <div className="level-info">
              <span className="level-name">Restricted</span>
              <span className="level-desc">Available only to admin agents</span>
            </div>
          </div>
        </div>
        
        <div className="operation-config">
          <h4>Operation Access Levels</h4>
          
          <div className="operations-list">
            {Object.entries(missionAuthData.operations).map(([operation, data]) => (
              <div key={operation} className="operation-item">
                <div className="operation-header">
                  <span className="operation-name">{operation.charAt(0).toUpperCase() + operation.slice(1)}</span>
                  <span className="operation-count">{data.count} requests</span>
                </div>
                
                {editingOperation === operation ? (
                  <div className="operation-editor">
                    <div className="editor-options">
                      {['public', 'protected', 'private', 'restricted'].map(level => (
                        <button
                          key={level}
                          className={`level-option ${level}`}
                          onClick={() => handleOperationLevelChange(operation, level)}
                        >
                          {getAccessLevelIcon(level)}
                          <span>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                        </button>
                      ))}
                    </div>
                    <button className="cancel-button" onClick={cancelEditing}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="operation-level" onClick={() => startEditing(operation)}>
                    <span className={`level-badge ${data.level}`}>
                      {getAccessLevelIcon(data.level)}
                      <span>{data.level.charAt(0).toUpperCase() + data.level.slice(1)}</span>
                    </span>
                    <button className="edit-button">
                      Change
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render operations log tab
  const renderOperationsLogTab = () => {
    return (
      <div className="operations-log-tab">
        <p className="tab-description">
          Recent mission authorization requests and their outcomes.
          Monitor agent activities and detect unauthorized access attempts.
        </p>
        
        <div className="operations-table">
          <div className="table-header">
            <div className="header-cell timestamp">Timestamp</div>
            <div className="header-cell operation">Operation</div>
            <div className="header-cell mission">Mission ID</div>
            <div className="header-cell agent">Agent ID</div>
            <div className="header-cell status">Status</div>
          </div>
          
          <div className="table-body">
            {missionAuthData.recentOperations.map((op, index) => (
              <div key={index} className={`table-row ${op.status}`}>
                <div className="cell timestamp">
                  {new Date(op.timestamp).toLocaleString()}
                </div>
                <div className="cell operation">
                  {op.operation.charAt(0).toUpperCase() + op.operation.slice(1)}
                </div>
                <div className="cell mission">{op.missionId}</div>
                <div className="cell agent">{op.agentId}</div>
                <div className="cell status">
                  {getStatusIcon(op.status)}
                  <span>{op.status.charAt(0).toUpperCase() + op.status.slice(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="log-actions">
          <button className="view-all-button">
            View All Operations Log
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`a2a-mission-auth-widget ${className}`}>
      <div className="widget-header">
        <div className="widget-title">
          <FaShieldAlt className="title-icon" />
          <h3>Mission Authorization</h3>
        </div>
        
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'levels' ? 'active' : ''}`}
            onClick={() => setActiveTab('levels')}
          >
            Access Levels
          </button>
          <button 
            className={`tab-button ${activeTab === 'operations' ? 'active' : ''}`}
            onClick={() => setActiveTab('operations')}
          >
            Operations Log
          </button>
        </div>
      </div>
      
      <div className="widget-content">
        {isLoading ? (
          <div className="loading-state">Loading mission authorization data...</div>
        ) : (
          <>
            {activeTab === 'levels' && renderAccessLevelsTab()}
            {activeTab === 'operations' && renderOperationsLogTab()}
          </>
        )}
      </div>
      
      <style jsx>{`
        .a2a-mission-auth-widget {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .widget-header {
          padding: 1rem;
          border-bottom: 1px solid #eee;
        }
        
        .widget-title {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .title-icon {
          color: #3a6ea5;
          margin-right: 0.5rem;
        }
        
        .widget-title h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #333;
        }
        
        .tabs {
          display: flex;
          gap: 0.5rem;
        }
        
        .tab-button {
          padding: 0.5rem 1rem;
          border: none;
          background-color: transparent;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
          color: #555;
        }
        
        .tab-button:hover {
          background-color: #f0f0f0;
        }
        
        .tab-button.active {
          background-color: #3a6ea5;
          color: white;
        }
        
        .widget-content {
          padding: 1rem;
        }
        
        .loading-state {
          text-align: center;
          padding: 2rem 0;
          color: #777;
        }
        
        .tab-description {
          margin-top: 0;
          margin-bottom: 1.25rem;
          font-size: 0.875rem;
          color: #666;
          line-height: 1.5;
        }
        
        /* Access Levels Tab */
        .access-level-legend {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background-color: #f8f9fa;
          border-radius: 6px;
        }
        
        .level-item {
          display: flex;
          align-items: center;
        }
        
        .level-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          margin-right: 0.75rem;
          color: white;
        }
        
        .level-item.public .level-icon {
          background-color: #28a745;
        }
        
        .level-item.protected .level-icon {
          background-color: #17a2b8;
        }
        
        .level-item.private .level-icon {
          background-color: #ffc107;
        }
        
        .level-item.restricted .level-icon {
          background-color: #dc3545;
        }
        
        .level-info {
          display: flex;
          flex-direction: column;
        }
        
        .level-name {
          font-weight: 500;
          color: #333;
          margin-bottom: 0.25rem;
        }
        
        .level-desc {
          font-size: 0.75rem;
          color: #777;
        }
        
        .operation-config h4 {
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1rem;
          color: #333;
        }
        
        .operations-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .operation-item {
          border: 1px solid #eee;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .operation-header {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background-color: #f8f9fa;
          border-bottom: 1px solid #eee;
        }
        
        .operation-name {
          font-weight: 500;
          color: #333;
        }
        
        .operation-count {
          font-size: 0.875rem;
          color: #777;
        }
        
        .operation-level {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
        }
        
        .level-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
        }
        
        .level-badge svg {
          margin-right: 0.25rem;
        }
        
        .level-badge.public {
          background-color: rgba(40, 167, 69, 0.1);
          color: #28a745;
        }
        
        .level-badge.protected {
          background-color: rgba(23, 162, 184, 0.1);
          color: #17a2b8;
        }
        
        .level-badge.private {
          background-color: rgba(255, 193, 7, 0.1);
          color: #ffc107;
        }
        
        .level-badge.restricted {
          background-color: rgba(220, 53, 69, 0.1);
          color: #dc3545;
        }
        
        .edit-button {
          background-color: transparent;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          cursor: pointer;
        }
        
        .edit-button:hover {
          background-color: #f0f0f0;
        }
        
        .operation-editor {
          padding: 1rem;
          background-color: #f8f9fa;
        }
        
        .editor-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
        
        .level-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          border: 1px solid #eee;
          border-radius: 4px;
          background-color: white;
          cursor: pointer;
        }
        
        .level-option svg {
          margin-bottom: 0.25rem;
        }
        
        .level-option.public {
          color: #28a745;
        }
        
        .level-option.protected {
          color: #17a2b8;
        }
        
        .level-option.private {
          color: #ffc107;
        }
        
        .level-option.restricted {
          color: #dc3545;
        }
        
        .level-option:hover {
          background-color: #f0f0f0;
        }
        
        .cancel-button {
          width: 100%;
          padding: 0.5rem;
          background-color: transparent;
          border: 1px solid #ccc;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
        }
        
        .cancel-button:hover {
          background-color: #f0f0f0;
        }
        
        /* Operations Log Tab */
        .operations-table {
          border: 1px solid #eee;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 1rem;
        }
        
        .table-header {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr;
          background-color: #f8f9fa;
          border-bottom: 1px solid #eee;
          font-weight: 500;
        }
        
        .header-cell {
          padding: 0.75rem;
          font-size: 0.875rem;
          color: #555;
        }
        
        .table-body {
          max-height: 300px;
          overflow-y: auto;
        }
        
        .table-row {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr;
          border-bottom: 1px solid #eee;
        }
        
        .table-row:last-child {
          border-bottom: none;
        }
        
        .table-row.authorized {
          background-color: rgba(40, 167, 69, 0.05);
        }
        
        .table-row.denied {
          background-color: rgba(220, 53, 69, 0.05);
        }
        
        .cell {
          padding: 0.75rem;
          font-size: 0.875rem;
          color: #333;
          display: flex;
          align-items: center;
        }
        
        .cell.timestamp {
          font-size: 0.8rem;
          color: #777;
        }
        
        .status-icon {
          margin-right: 0.25rem;
        }
        
        .status-icon.authorized {
          color: #28a745;
        }
        
        .status-icon.denied {
          color: #dc3545;
        }
        
        .status-icon.unknown {
          color: #ffc107;
        }
        
        .log-actions {
          text-align: center;
        }
        
        .view-all-button {
          padding: 0.5rem 1rem;
          background-color: transparent;
          border: 1px solid #3a6ea5;
          border-radius: 4px;
          color: #3a6ea5;
          cursor: pointer;
          font-size: 0.875rem;
        }
        
        .view-all-button:hover {
          background-color: #3a6ea5;
          color: white;
        }
        
        @media (max-width: 768px) {
          .access-level-legend {
            grid-template-columns: 1fr;
          }
          
          .table-header, .table-row {
            grid-template-columns: 1.5fr 1fr 1fr;
          }
          
          .header-cell.mission, .header-cell.agent,
          .cell.mission, .cell.agent {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default A2AMissionAuthWidget;