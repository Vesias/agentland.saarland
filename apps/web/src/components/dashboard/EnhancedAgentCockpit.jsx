import React, { useState, useEffect } from 'react';
import { FaRobot, FaLock, FaArrowRight, FaCheck, FaTimes, FaTrophy, FaMedal, FaKey } from 'react-icons/fa';
import { useGameState } from '../../hooks/mcp/useGameState';

/**
 * EnhancedAgentCockpit Component
 * 
 * An upgraded version of the agent cockpit widget that integrates
 * with the A2A mission authorization system
 */
const EnhancedAgentCockpit = () => {
  const { gameState, updateMissionProgress, startMission, completeMission } = useGameState();
  const [authStatus, setAuthStatus] = useState({
    status: 'pending',
    message: 'Checking authorization...'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthDetails, setShowAuthDetails] = useState(false);
  
  const currentMission = gameState?.currentMission || {
    name: "Mission: Saarland-Wanderweg digitalisieren",
    progress: 45,
    steps: [
      "Daten sammeln",
      "GPS-Koordinaten extrahieren",
      "Karte erstellen"
    ]
  };

  // Check mission authorization on mount and when mission changes
  useEffect(() => {
    const checkMissionAuth = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would call an API endpoint
        // Example: 
        // const response = await fetch('/api/a2a/mission/auth', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     missionId: currentMission.id,
        //     operation: 'view'
        //   })
        // });
        // const data = await response.json();
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Simulate response
        const data = {
          authorized: true,
          operation: 'view',
          missionId: currentMission.id,
          agentId: 'current-user-agent'
        };
        
        if (data.authorized) {
          setAuthStatus({
            status: 'authorized',
            message: 'Access granted to mission'
          });
        } else {
          setAuthStatus({
            status: 'denied',
            message: data.error || 'Access denied to mission'
          });
        }
      } catch (error) {
        console.error('Error checking mission authorization:', error);
        setAuthStatus({
          status: 'error',
          message: 'Error checking authorization'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (currentMission?.id) {
      checkMissionAuth();
    }
  }, [currentMission?.id]);

  // Handle mission operation with authorization
  const handleMissionOperation = async (operation) => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call an API endpoint
      // Example:
      // const response = await fetch('/api/a2a/mission/auth', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     missionId: currentMission.id,
      //     operation
      //   })
      // });
      // const data = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Simulate response
      const data = {
        authorized: true,
        operation,
        missionId: currentMission.id,
        agentId: 'current-user-agent'
      };
      
      if (data.authorized) {
        // Perform the operation based on authorization
        switch (operation) {
          case 'start':
            // Start mission in game state
            if (startMission && currentMission?.id) {
              startMission(currentMission.id);
            }
            break;
            
          case 'update':
            // Update mission progress
            if (updateMissionProgress && currentMission?.id) {
              const newProgress = Math.min(100, currentMission.progress + 10);
              updateMissionProgress(currentMission.id, newProgress);
            }
            break;
            
          case 'complete':
            // Complete mission
            if (completeMission && currentMission?.id) {
              completeMission(currentMission.id);
            }
            break;
            
          default:
            break;
        }
        
        setAuthStatus({
          status: 'authorized',
          message: `Operation "${operation}" authorized and completed`,
          operation
        });
      } else {
        setAuthStatus({
          status: 'denied',
          message: data.error || `Operation "${operation}" denied`,
          operation
        });
      }
    } catch (error) {
      console.error(`Error performing mission operation ${operation}:`, error);
      setAuthStatus({
        status: 'error',
        message: `Error performing operation "${operation}"`,
        operation
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render auth status indicator
  const renderAuthStatusIndicator = () => {
    const getStatusIcon = () => {
      switch (authStatus.status) {
        case 'authorized':
          return <FaCheck className="status-icon authorized" />;
        case 'denied':
          return <FaTimes className="status-icon denied" />;
        case 'error':
          return <FaTimes className="status-icon error" />;
        default:
          return <FaLock className="status-icon pending" />;
      }
    };
    
    return (
      <div className={`auth-status-indicator ${authStatus.status}`}>
        {getStatusIcon()}
        <span className="auth-status-text">{authStatus.message}</span>
        <button 
          className="toggle-details-button"
          onClick={() => setShowAuthDetails(!showAuthDetails)}
        >
          {showAuthDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
    );
  };

  // Render auth details
  const renderAuthDetails = () => {
    if (!showAuthDetails) return null;
    
    return (
      <div className="auth-details">
        <h4>Mission Authorization Details</h4>
        
        <div className="auth-permissions">
          <div className="permission-item">
            <div className="permission-header">
              <span>View Mission</span>
              <span className="permission-status authorized">
                <FaCheck /> Authorized
              </span>
            </div>
            <div className="permission-level">Access Level: Public</div>
          </div>
          
          <div className="permission-item">
            <div className="permission-header">
              <span>Update Progress</span>
              <span className="permission-status authorized">
                <FaCheck /> Authorized
              </span>
            </div>
            <div className="permission-level">Access Level: Protected</div>
          </div>
          
          <div className="permission-item">
            <div className="permission-header">
              <span>Complete Mission</span>
              <span className="permission-status authorized">
                <FaCheck /> Authorized
              </span>
            </div>
            <div className="permission-level">Access Level: Protected</div>
          </div>
          
          <div className="permission-item">
            <div className="permission-header">
              <span>Delete Mission</span>
              <span className="permission-status denied">
                <FaTimes /> Not Authorized
              </span>
            </div>
            <div className="permission-level">Access Level: Restricted (Required)</div>
          </div>
        </div>
        
        <div className="agent-credentials">
          <div className="credential-header">
            <FaKey className="credential-icon" />
            <span>Agent Credentials</span>
          </div>
          <div className="credential-level">
            <FaRobot className="agent-icon" />
            <div className="level-info">
              <span className="level-name">Protected Agent</span>
              <span className="level-details">Domain verified with DNS</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render agent badge/medal section
  const renderAgentBadges = () => {
    return (
      <div className="agent-badges">
        <h4>Agent Achievements</h4>
        <div className="badges-container">
          {(gameState?.badges || ["Einsteiger", "KI-Enthusiast", "Stepper", "Kartograph"]).map((badge, index) => (
            <div key={index} className="badge-item">
              <div className="badge-icon">
                {index === 0 ? <FaMedal className="medal bronze" /> : 
                 index === 1 ? <FaMedal className="medal silver" /> : 
                 index === 2 ? <FaMedal className="medal gold" /> : 
                               <FaTrophy className="trophy" />}
              </div>
              <div className="badge-name">{badge}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="enhanced-agent-cockpit">
      <div className="agent-cockpit-header">
        <div className="agent-info">
          <FaRobot className="agent-avatar" />
          <div className="agent-details">
            <div className="agent-name">Real-Life Agent</div>
            <div className="agent-level">Level {gameState?.level || 3}</div>
          </div>
        </div>
        
        <div className="agent-xp">
          <span className="xp-label">XP:</span>
          <span className="xp-value">{gameState?.xp || 450}/{gameState?.nextLevelXp || 1000}</span>
          <div className="xp-bar">
            <div 
              className="xp-progress" 
              style={{ width: `${((gameState?.xp || 450) / (gameState?.nextLevelXp || 1000)) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {renderAuthStatusIndicator()}
      {renderAuthDetails()}
      
      <div className="current-mission">
        <h4>Current Mission</h4>
        <div className="mission-name">{currentMission.name}</div>
        <div className="mission-progress">
          <div className="progress-bar">
            <div 
              className="progress-value" 
              style={{ width: `${currentMission.progress}%` }}
            ></div>
          </div>
          <div className="progress-text">{currentMission.progress}%</div>
        </div>
      </div>
      
      <div className="mission-steps">
        <h4>Next Steps</h4>
        <ul className="steps-list">
          {currentMission.steps.map((step, index) => (
            <li 
              key={index}
              className={index === 0 ? 'current' : ''}
            >
              {step}
            </li>
          ))}
        </ul>
      </div>
      
      {renderAgentBadges()}
      
      <div className="agent-actions">
        <button 
          className="action-button primary"
          onClick={() => handleMissionOperation('update')}
          disabled={isLoading}
        >
          Update Progress
          <FaArrowRight className="button-icon" />
        </button>
        
        {currentMission.progress >= 100 ? (
          <button 
            className="action-button complete"
            onClick={() => handleMissionOperation('complete')}
            disabled={isLoading}
          >
            Complete Mission
            <FaCheck className="button-icon" />
          </button>
        ) : (
          <button 
            className="action-button secondary"
            onClick={() => handleMissionOperation('start')}
            disabled={isLoading}
          >
            Continue Mission
          </button>
        )}
      </div>
      
      <style jsx>{`
        .enhanced-agent-cockpit {
          background-color: #fff;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .agent-cockpit-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }
        
        .agent-info {
          display: flex;
          align-items: center;
        }
        
        .agent-avatar {
          width: 48px;
          height: 48px;
          background-color: #3a6ea5;
          color: white;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-right: 1rem;
          padding: 0.5rem;
        }
        
        .agent-name {
          font-weight: 600;
          color: #333;
          margin-bottom: 0.25rem;
        }
        
        .agent-level {
          font-size: 0.875rem;
          color: #666;
        }
        
        .agent-xp {
          text-align: right;
        }
        
        .xp-label {
          font-size: 0.875rem;
          color: #666;
          margin-right: 0.25rem;
        }
        
        .xp-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: #333;
        }
        
        .xp-bar {
          width: 100px;
          height: 6px;
          background-color: #e9ecef;
          border-radius: 3px;
          margin-top: 0.5rem;
          overflow: hidden;
        }
        
        .xp-progress {
          height: 100%;
          background-color: #3a6ea5;
        }
        
        .auth-status-indicator {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        
        .auth-status-indicator.authorized {
          background-color: rgba(40, 167, 69, 0.1);
          border: 1px solid rgba(40, 167, 69, 0.2);
        }
        
        .auth-status-indicator.denied {
          background-color: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.2);
        }
        
        .auth-status-indicator.error {
          background-color: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.2);
        }
        
        .auth-status-indicator.pending {
          background-color: rgba(255, 193, 7, 0.1);
          border: 1px solid rgba(255, 193, 7, 0.2);
        }
        
        .status-icon {
          margin-right: 0.5rem;
          font-size: 1rem;
        }
        
        .status-icon.authorized {
          color: #28a745;
        }
        
        .status-icon.denied,
        .status-icon.error {
          color: #dc3545;
        }
        
        .status-icon.pending {
          color: #ffc107;
        }
        
        .auth-status-text {
          flex: 1;
          font-size: 0.875rem;
        }
        
        .toggle-details-button {
          background: none;
          border: none;
          color: #3a6ea5;
          cursor: pointer;
          font-size: 0.75rem;
        }
        
        .toggle-details-button:hover {
          text-decoration: underline;
        }
        
        .auth-details {
          background-color: #f8f9fa;
          border-radius: 4px;
          padding: 1rem;
          margin-bottom: 1.25rem;
        }
        
        .auth-details h4 {
          margin-top: 0;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #333;
        }
        
        .auth-permissions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .permission-item {
          padding: 0.5rem;
          background-color: white;
          border-radius: 4px;
          border: 1px solid #eee;
        }
        
        .permission-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
          font-size: 0.875rem;
        }
        
        .permission-status {
          display: flex;
          align-items: center;
          font-size: 0.75rem;
        }
        
        .permission-status svg {
          margin-right: 0.25rem;
        }
        
        .permission-status.authorized {
          color: #28a745;
        }
        
        .permission-status.denied {
          color: #dc3545;
        }
        
        .permission-level {
          font-size: 0.75rem;
          color: #777;
        }
        
        .agent-credentials {
          padding: 0.75rem;
          background-color: white;
          border-radius: 4px;
          border: 1px solid #eee;
        }
        
        .credential-header {
          display: flex;
          align-items: center;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        
        .credential-icon {
          color: #3a6ea5;
          margin-right: 0.5rem;
        }
        
        .credential-level {
          display: flex;
          align-items: center;
          background-color: rgba(58, 110, 165, 0.1);
          padding: 0.5rem;
          border-radius: 4px;
        }
        
        .agent-icon {
          color: #3a6ea5;
          margin-right: 0.5rem;
        }
        
        .level-info {
          display: flex;
          flex-direction: column;
        }
        
        .level-name {
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .level-details {
          font-size: 0.75rem;
          color: #666;
        }
        
        .current-mission {
          margin-bottom: 1.25rem;
        }
        
        .current-mission h4 {
          margin-top: 0;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #333;
        }
        
        .mission-name {
          font-weight: 500;
          margin-bottom: 0.75rem;
        }
        
        .mission-progress {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .progress-bar {
          flex: 1;
          height: 8px;
          background-color: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-value {
          height: 100%;
          background-color: #28a745;
        }
        
        .progress-text {
          font-weight: 500;
          font-size: 0.875rem;
          color: #28a745;
        }
        
        .mission-steps {
          margin-bottom: 1.25rem;
        }
        
        .mission-steps h4 {
          margin-top: 0;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #333;
        }
        
        .steps-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        
        .steps-list li {
          padding: 0.5rem 0.75rem;
          margin-bottom: 0.5rem;
          background-color: #f8f9fa;
          border-radius: 4px;
          font-size: 0.875rem;
        }
        
        .steps-list li.current {
          background-color: rgba(58, 110, 165, 0.1);
          border-left: 3px solid #3a6ea5;
          font-weight: 500;
        }
        
        .agent-badges {
          margin-bottom: 1.25rem;
        }
        
        .agent-badges h4 {
          margin-top: 0;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #333;
        }
        
        .badges-container {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .badge-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 70px;
        }
        
        .badge-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
          font-size: 1.5rem;
        }
        
        .medal.bronze {
          color: #cd7f32;
        }
        
        .medal.silver {
          color: #C0C0C0;
        }
        
        .medal.gold {
          color: #FFD700;
        }
        
        .trophy {
          color: #3a6ea5;
        }
        
        .badge-name {
          font-size: 0.75rem;
          text-align: center;
          line-height: 1.2;
        }
        
        .agent-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .action-button {
          padding: 0.75rem;
          border-radius: 4px;
          border: none;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .action-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .action-button.primary {
          background-color: #3a6ea5;
          color: white;
        }
        
        .action-button.secondary {
          background-color: transparent;
          border: 1px solid #3a6ea5;
          color: #3a6ea5;
        }
        
        .action-button.complete {
          background-color: #28a745;
          color: white;
        }
        
        .button-icon {
          margin-left: 0.5rem;
        }
        
        @media (max-width: 576px) {
          .agent-cockpit-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .agent-xp {
            text-align: left;
            margin-top: 1rem;
          }
          
          .badges-container {
            justify-content: space-between;
          }
          
          .badge-item {
            width: calc(50% - 0.5rem);
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedAgentCockpit;