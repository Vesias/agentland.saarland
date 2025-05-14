import React from 'react';
import { FaRobot, FaFlask, FaDatabase } from 'react-icons/fa';
import { useI18n } from '../i18n';

/**
 * WorkspaceWidget Component
 * 
 * Displays the KI workspace status and provides access
 * to the KI-Schmiede Saar tools and resources
 */
const WorkspaceWidget = () => {
  const { t } = useI18n();
  
  return (
    <div className="workspace-widget">
      <div className="workspace-status">
        <div className="status-indicator active">
          <span className="status-dot"></span>
          <span className="status-text">Lokaler Llama 3.2 Agent: Aktiv</span>
        </div>
        <div className="status-indicator active">
          <span className="status-dot"></span>
          <span className="status-text">Workspace bereit</span>
        </div>
      </div>
      
      <div className="workspace-actions">
        <button className="workspace-button primary">
          <span className="button-icon">
            <FaRobot />
          </span>
          <span className="button-text">Workspace öffnen</span>
        </button>
        
        <button className="workspace-button secondary">
          <span className="button-icon">
            <FaFlask />
          </span>
          <span className="button-text">Einfache Setup-Skripte</span>
        </button>
        
        <button className="workspace-button secondary">
          <span className="button-icon">
            <FaDatabase />
          </span>
          <span className="button-text">KI-Tools & Modelle entdecken</span>
        </button>
      </div>
      
      <style jsx>{`
        .workspace-widget {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 1.25rem;
          background-color: var(--surface-color);
          border-radius: 8px;
          box-shadow: 0 2px 10px var(--shadow-color);
        }
        
        .workspace-status {
          margin-bottom: 1.5rem;
        }
        
        .status-indicator {
          display: flex;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        
        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 0.75rem;
        }
        
        .status-indicator.active .status-dot {
          background-color: var(--success-color);
        }
        
        .status-indicator.inactive .status-dot {
          background-color: var(--danger-color);
        }
        
        .status-text {
          font-weight: 500;
          color: var(--text-color);
        }
        
        .workspace-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .workspace-button {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          border: none;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s, transform 0.1s;
        }
        
        .workspace-button:active {
          transform: translateY(1px);
        }
        
        .workspace-button.primary {
          background-color: var(--primary-color);
          color: white;
        }
        
        .workspace-button.primary:hover {
          background-color: var(--primary-color);
          filter: brightness(1.1);
        }
        
        .workspace-button.secondary {
          background-color: var(--background-color);
          color: var(--text-color);
        }
        
        .workspace-button.secondary:hover {
          background-color: var(--background-color);
          filter: brightness(0.95);
        }
        
        .button-icon {
          margin-right: 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default WorkspaceWidget;