import React, { useState, useEffect } from 'react';
import { FaLock, FaLockOpen, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';

/**
 * Authentication Status Indicator Component
 * 
 * Displays the current authentication and security status
 * in a compact format suitable for headers or small widget areas
 */
const AuthStatusIndicator = ({ agentId, className = "" }) => {
  const [status, setStatus] = useState({
    authenticated: true,
    encrypted: true,
    securityLevel: 'high', // 'high', 'medium', 'low'
    lastChecked: new Date()
  });

  const [showDetails, setShowDetails] = useState(false);

  // Fetch authentication status
  useEffect(() => {
    // Mock API call - would be replaced with actual API call
    const fetchAuthStatus = async () => {
      try {
        // Example API call:
        // const response = await fetch(`/api/security/auth-status?agentId=${agentId}`);
        // const data = await response.json();
        // setStatus(data);
        
        // For demo, just simulate random statuses occasionally
        if (Math.random() > 0.8) {
          setStatus(prev => ({
            ...prev,
            authenticated: Math.random() > 0.3,
            encrypted: Math.random() > 0.2,
            securityLevel: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
            lastChecked: new Date()
          }));
        }
      } catch (error) {
        console.error('Error fetching auth status:', error);
      }
    };

    fetchAuthStatus();
    
    // Refresh status every 60 seconds
    const interval = setInterval(fetchAuthStatus, 60000);
    
    return () => clearInterval(interval);
  }, [agentId]);

  // Icon and color based on security level
  const renderSecurityLevelIcon = () => {
    switch (status.securityLevel) {
      case 'high':
        return <FaShieldAlt className="status-icon high" title="High Security" />;
      case 'medium':
        return <FaShieldAlt className="status-icon medium" title="Medium Security" />;
      case 'low':
        return <FaExclamationTriangle className="status-icon low" title="Low Security" />;
      default:
        return <FaExclamationTriangle className="status-icon low" title="Unknown Security Level" />;
    }
  };

  // Icons for authentication and encryption
  const renderStatusIcons = () => {
    return (
      <>
        {status.authenticated 
          ? <FaLock className="status-icon" title="Authenticated" /> 
          : <FaLockOpen className="status-icon error" title="Not Authenticated" />}
          
        {renderSecurityLevelIcon()}
      </>
    );
  };

  // Detailed popup with more information
  const renderDetailedPopup = () => {
    if (!showDetails) return null;
    
    return (
      <div className="auth-status-details">
        <div className="detail-row">
          <span className="detail-label">Authentication:</span>
          <span className={`detail-value ${status.authenticated ? 'good' : 'error'}`}>
            {status.authenticated ? 'Authenticated' : 'Not Authenticated'}
          </span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Encryption:</span>
          <span className={`detail-value ${status.encrypted ? 'good' : 'error'}`}>
            {status.encrypted ? 'Encrypted' : 'Not Encrypted'}
          </span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Security Level:</span>
          <span className={`detail-value ${status.securityLevel}`}>
            {status.securityLevel.charAt(0).toUpperCase() + status.securityLevel.slice(1)}
          </span>
        </div>
        
        <div className="detail-row timestamp">
          <span className="detail-label">Last Checked:</span>
          <span className="detail-value">
            {status.lastChecked.toLocaleTimeString()}
          </span>
        </div>
        
        <div className="detail-actions">
          <button className="detail-action-button">
            Security Settings
          </button>
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`auth-status-indicator ${className}`}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      {renderStatusIcons()}
      {renderDetailedPopup()}
      
      <style jsx>{`
        .auth-status-indicator {
          display: flex;
          align-items: center;
          padding: 0.25rem;
          position: relative;
          cursor: pointer;
        }
        
        .status-icon {
          margin: 0 0.25rem;
          color: #3a6ea5;
        }
        
        .status-icon.high {
          color: #5cb85c;
        }
        
        .status-icon.medium {
          color: #f0ad4e;
        }
        
        .status-icon.low {
          color: #d9534f;
        }
        
        .status-icon.error {
          color: #d9534f;
        }
        
        .auth-status-details {
          position: absolute;
          top: 100%;
          right: 0;
          width: 260px;
          background-color: white;
          border-radius: 4px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
          padding: 1rem;
          z-index: 100;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        
        .detail-row.timestamp {
          font-size: 0.75rem;
          color: #777;
          margin-top: 0.5rem;
        }
        
        .detail-label {
          font-weight: 500;
        }
        
        .detail-value {
          font-weight: 600;
        }
        
        .detail-value.good {
          color: #5cb85c;
        }
        
        .detail-value.error {
          color: #d9534f;
        }
        
        .detail-value.high {
          color: #5cb85c;
        }
        
        .detail-value.medium {
          color: #f0ad4e;
        }
        
        .detail-value.low {
          color: #d9534f;
        }
        
        .detail-actions {
          margin-top: 1rem;
          text-align: center;
        }
        
        .detail-action-button {
          background-color: #3a6ea5;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
          cursor: pointer;
        }
        
        .detail-action-button:hover {
          background-color: #2a5a8e;
        }
      `}</style>
    </div>
  );
};

export default AuthStatusIndicator;