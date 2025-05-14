import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaLock, FaExchangeAlt, FaUserCheck, FaExclamationTriangle } from 'react-icons/fa';

/**
 * Security Widget Component for Dashboard
 * 
 * Displays security metrics and status for the A2A communication system
 * Provides controls for security settings and agent authentication
 */
const SecurityWidget = ({ title = "A2A Security Status", className = "", agent = null }) => {
  const [securityMetrics, setSecurityMetrics] = useState({
    authenticationStatus: 'authenticated', // 'authenticated', 'unauthenticated', 'partial'
    encryptionStatus: 'enabled', // 'enabled', 'disabled'
    securityLevel: 'high', // 'high', 'medium', 'low'
    messageSigning: 'enabled', // 'enabled', 'disabled'
    activeAgents: 3,
    totalMessages: 152,
    blockedMessages: 7
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch security metrics
  useEffect(() => {
    // This would be replaced with an actual API call
    const fetchSecurityMetrics = async () => {
      setIsLoading(true);
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real implementation, this would call an API endpoint
        // Example: const response = await fetch('/api/security/metrics');
        // const data = await response.json();
        // setSecurityMetrics(data);
      } catch (error) {
        console.error('Error fetching security metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSecurityMetrics();
    
    // Set up polling for periodic updates
    const interval = setInterval(fetchSecurityMetrics, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Generate authentication indicator
  const renderAuthenticationStatus = () => {
    switch (securityMetrics.authenticationStatus) {
      case 'authenticated':
        return (
          <div className="security-status-item security-status-good">
            <FaUserCheck className="security-icon" />
            <span>Authenticated</span>
          </div>
        );
      case 'unauthenticated':
        return (
          <div className="security-status-item security-status-critical">
            <FaExclamationTriangle className="security-icon" />
            <span>Not Authenticated</span>
          </div>
        );
      case 'partial':
        return (
          <div className="security-status-item security-status-warning">
            <FaExclamationTriangle className="security-icon" />
            <span>Partially Authenticated</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Generate encryption indicator
  const renderEncryptionStatus = () => {
    return (
      <div className={`security-status-item ${securityMetrics.encryptionStatus === 'enabled' ? 'security-status-good' : 'security-status-warning'}`}>
        <FaLock className="security-icon" />
        <span>Encryption {securityMetrics.encryptionStatus === 'enabled' ? 'Enabled' : 'Disabled'}</span>
      </div>
    );
  };

  // Generate message signing indicator
  const renderMessageSigningStatus = () => {
    return (
      <div className={`security-status-item ${securityMetrics.messageSigning === 'enabled' ? 'security-status-good' : 'security-status-warning'}`}>
        <FaExchangeAlt className="security-icon" />
        <span>Message Signing {securityMetrics.messageSigning === 'enabled' ? 'Enabled' : 'Disabled'}</span>
      </div>
    );
  };

  // Generate security level indicator with bar chart
  const renderSecurityLevel = () => {
    const levels = {
      'high': { percent: 100, class: 'security-level-high' },
      'medium': { percent: 66, class: 'security-level-medium' },
      'low': { percent: 33, class: 'security-level-low' }
    };
    
    const level = levels[securityMetrics.securityLevel] || levels.low;
    
    return (
      <div className="security-level">
        <span>Security Level: {securityMetrics.securityLevel.charAt(0).toUpperCase() + securityMetrics.securityLevel.slice(1)}</span>
        <div className="security-level-bar">
          <div 
            className={`security-level-indicator ${level.class}`}
            style={{ width: `${level.percent}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Render agent-specific controls if an agent is provided
  const renderAgentControls = () => {
    if (!agent) return null;
    
    return (
      <div className="agent-security-controls">
        <h4>Agent Controls</h4>
        <div className="agent-control-buttons">
          <button className="agent-control-button regenerate">
            Regenerate API Key
          </button>
          <button className="agent-control-button revoke">
            Revoke Access
          </button>
        </div>
      </div>
    );
  };

  // Generate credentials button
  const handleGenerateCredentials = () => {
    // This would call the API to generate and download credentials
    console.log('Generating new credentials');
  };

  // Expanded security details
  const renderDetailedView = () => {
    if (!isExpanded) return null;
    
    return (
      <div className="security-details">
        <div className="security-metrics">
          <div className="metric-item">
            <span className="metric-label">Active Agents:</span>
            <span className="metric-value">{securityMetrics.activeAgents}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Messages Processed:</span>
            <span className="metric-value">{securityMetrics.totalMessages}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Blocked Messages:</span>
            <span className="metric-value">{securityMetrics.blockedMessages}</span>
          </div>
        </div>
        
        {renderAgentControls()}
        
        <div className="security-actions">
          <button onClick={handleGenerateCredentials} className="action-button">
            Generate New Credentials
          </button>
          <button onClick={() => console.log('View Security Logs')} className="action-button">
            View Security Logs
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`security-widget-container ${className}`}>
      <div className="security-widget-header">
        <div className="security-widget-title">
          <FaShieldAlt className="security-title-icon" />
          <h3>{title}</h3>
        </div>
        <button 
          className="toggle-details-button"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Less' : 'More'} Details
        </button>
      </div>
      
      {isLoading ? (
        <div className="security-loading">Loading security status...</div>
      ) : (
        <>
          <div className="security-status">
            {renderAuthenticationStatus()}
            {renderEncryptionStatus()}
            {renderMessageSigningStatus()}
          </div>
          
          {renderSecurityLevel()}
          {renderDetailedView()}
        </>
      )}
      
      <style jsx>{`
        .security-widget-container {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 1.25rem;
          margin-bottom: 1.5rem;
        }
        
        .security-widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .security-widget-title {
          display: flex;
          align-items: center;
        }
        
        .security-title-icon {
          color: #3a6ea5;
          margin-right: 0.5rem;
          font-size: 1.25rem;
        }
        
        .security-widget-title h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #333;
        }
        
        .toggle-details-button {
          background-color: transparent;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
        }
        
        .toggle-details-button:hover {
          background-color: #f0f0f0;
        }
        
        .security-loading {
          padding: 1rem 0;
          text-align: center;
          color: #777;
        }
        
        .security-status {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .security-status-item {
          display: flex;
          align-items: center;
          padding: 0.5rem 0.75rem;
          border-radius: 4px;
          font-size: 0.875rem;
          flex: 1;
          min-width: 150px;
        }
        
        .security-icon {
          margin-right: 0.5rem;
        }
        
        .security-status-good {
          background-color: rgba(92, 184, 92, 0.1);
          color: #5cb85c;
          border: 1px solid rgba(92, 184, 92, 0.3);
        }
        
        .security-status-warning {
          background-color: rgba(240, 173, 78, 0.1);
          color: #f0ad4e;
          border: 1px solid rgba(240, 173, 78, 0.3);
        }
        
        .security-status-critical {
          background-color: rgba(217, 83, 79, 0.1);
          color: #d9534f;
          border: 1px solid rgba(217, 83, 79, 0.3);
        }
        
        .security-level {
          margin-bottom: 1rem;
        }
        
        .security-level span {
          display: block;
          margin-bottom: 0.25rem;
          font-size: 0.875rem;
        }
        
        .security-level-bar {
          height: 0.5rem;
          background-color: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .security-level-indicator {
          height: 100%;
        }
        
        .security-level-high {
          background-color: #5cb85c;
        }
        
        .security-level-medium {
          background-color: #f0ad4e;
        }
        
        .security-level-low {
          background-color: #d9534f;
        }
        
        .security-details {
          border-top: 1px solid #eee;
          margin-top: 1rem;
          padding-top: 1rem;
        }
        
        .security-metrics {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .metric-item {
          flex: 1;
          min-width: 100px;
        }
        
        .metric-label {
          display: block;
          font-size: 0.75rem;
          color: #777;
          margin-bottom: 0.25rem;
        }
        
        .metric-value {
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
        }
        
        .agent-security-controls {
          margin-bottom: 1rem;
        }
        
        .agent-security-controls h4 {
          margin-top: 0;
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }
        
        .agent-control-buttons {
          display: flex;
          gap: 0.75rem;
        }
        
        .agent-control-button {
          padding: 0.5rem 0.75rem;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
        }
        
        .agent-control-button.regenerate {
          background-color: #5bc0de;
          color: white;
        }
        
        .agent-control-button.revoke {
          background-color: #d9534f;
          color: white;
        }
        
        .security-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .action-button {
          flex: 1;
          min-width: 150px;
          padding: 0.5rem 0.75rem;
          background-color: #3a6ea5;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
        }
        
        .action-button:hover {
          background-color: #2a5a8e;
        }
        
        @media (max-width: 768px) {
          .security-status {
            flex-direction: column;
          }
          
          .security-status-item {
            width: 100%;
          }
          
          .security-actions {
            flex-direction: column;
          }
          
          .action-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SecurityWidget;