import React from 'react';
import { FaRobot, FaServer, FaQuestionCircle, FaUsers } from 'react-icons/fa';
import { useI18n } from '../i18n';

/**
 * SupportWidget Component
 * 
 * Provides help resources and quick links for new users
 */
const SupportWidget = () => {
  const { t } = useI18n();
  
  return (
    <div className="support-widget">
      <div className="quick-links">
        <a href="#" className="quick-link">
          <div className="link-icon">
            <FaRobot />
          </div>
          <div className="link-text">
            <div className="link-title">Was sind "Real-Life Agent"-Missionen?</div>
            <div className="link-description">Kurzanleitung zu Missionen</div>
          </div>
        </a>
        
        <a href="#" className="quick-link">
          <div className="link-icon">
            <FaServer />
          </div>
          <div className="link-text">
            <div className="link-title">Deinen KI-Workspace einrichten</div>
            <div className="link-description">Schritt-für-Schritt Tutorial</div>
          </div>
        </a>
        
        <a href="#" className="quick-link">
          <div className="link-icon">
            <FaQuestionCircle />
          </div>
          <div className="link-text">
            <div className="link-title">Häufig gestellte Fragen (FAQ)</div>
            <div className="link-description">Antworten auf typische Fragen</div>
          </div>
        </a>
        
        <a href="#" className="quick-link">
          <div className="link-icon">
            <FaUsers />
          </div>
          <div className="link-text">
            <div className="link-title">Support kontaktieren / Forum</div>
            <div className="link-description">Hilfe von der Community</div>
          </div>
        </a>
      </div>
      
      <style jsx>{`
        .support-widget {
          height: 100%;
          padding: 1.25rem;
          background-color: var(--surface-color);
          border-radius: 8px;
          box-shadow: 0 2px 10px var(--shadow-color);
        }
        
        .quick-links {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .quick-link {
          display: flex;
          padding: 1rem;
          background-color: var(--background-color);
          border-radius: 6px;
          text-decoration: none;
          color: inherit;
          transition: background-color 0.2s, transform 0.1s;
        }
        
        .quick-link:hover {
          background-color: var(--background-color);
          filter: brightness(0.95);
          transform: translateY(-2px);
        }
        
        .quick-link:active {
          transform: translateY(0);
        }
        
        .link-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background-color: rgba(58, 110, 165, 0.1);
          color: var(--primary-color);
          border-radius: 8px;
          margin-right: 1rem;
          font-size: 1.25rem;
        }
        
        .link-title {
          font-weight: 500;
          color: var(--text-color);
          margin-bottom: 0.25rem;
        }
        
        .link-description {
          font-size: 0.75rem;
          color: var(--text-secondary-color);
        }
      `}</style>
    </div>
  );
};

export default SupportWidget;