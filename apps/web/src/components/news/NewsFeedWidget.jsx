import React from 'react';
import { useI18n } from '../i18n';

/**
 * NewsFeedWidget Component
 * 
 * Displays the latest news and updates from agentland.saarland
 */
const NewsFeedWidget = () => {
  const { t } = useI18n();
  
  return (
    <div className="news-feed">
      <div className="news-items">
        <div className="news-item">
          <div className="news-date">14.05.2025</div>
          <div className="news-title">Neues Lernmodul: KI-Agenten im Alltag</div>
          <div className="news-summary">Entdecke, wie KI-Agenten den Alltag erleichtern können.</div>
          <a href="#" className="news-link">Mehr erfahren</a>
        </div>
        
        <div className="news-item">
          <div className="news-date">12.05.2025</div>
          <div className="news-title">Llama 3.2 ist jetzt verfügbar</div>
          <div className="news-summary">Llama 3.2 ist jetzt mit verbesserten Tool-Calling Funktionen verfügbar.</div>
          <a href="#" className="news-link">Installation starten</a>
        </div>
        
        <div className="news-item">
          <div className="news-date">10.05.2025</div>
          <div className="news-title">Workshop: Agent-to-Agent Kommunikation</div>
          <div className="news-summary">Lerne, wie Agenten miteinander kommunizieren können.</div>
          <a href="#" className="news-link">Anmelden</a>
        </div>
      </div>
      
      <div className="news-footer">
        <a href="#" className="view-all">Alle Neuigkeiten anzeigen</a>
      </div>
      
      <style jsx>{`
        .news-feed {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 1.25rem;
          background-color: var(--surface-color);
          border-radius: 8px;
          box-shadow: 0 2px 10px var(--shadow-color);
        }
        
        .news-items {
          flex: 1;
        }
        
        .news-item {
          padding: 1rem 0;
          border-bottom: 1px solid var(--border-color);
        }
        
        .news-item:last-child {
          border-bottom: none;
        }
        
        .news-date {
          font-size: 0.75rem;
          color: var(--text-secondary-color);
          margin-bottom: 0.25rem;
        }
        
        .news-title {
          font-weight: 600;
          color: var(--text-color);
          margin-bottom: 0.5rem;
        }
        
        .news-summary {
          font-size: 0.875rem;
          color: var(--text-secondary-color);
          margin-bottom: 0.5rem;
        }
        
        .news-link {
          font-size: 0.875rem;
          color: var(--primary-color);
          text-decoration: none;
        }
        
        .news-link:hover {
          text-decoration: underline;
        }
        
        .news-footer {
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
          text-align: center;
        }
        
        .view-all {
          color: var(--primary-color);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .view-all:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default NewsFeedWidget;