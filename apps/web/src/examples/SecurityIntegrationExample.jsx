import React from 'react';
import { SecurityWidget, AuthStatusIndicator } from '../components/security';
import { SecurityProvider } from '../contexts/SecurityContext';

/**
 * Example component demonstrating how to integrate the security
 * components into the agentland.saarland dashboard
 */
const SecurityIntegrationExample = () => {
  return (
    <SecurityProvider>
      <div className="example-container">
        <header className="example-header">
          <div className="header-left">
            <div className="header-logo">agentland.saarland</div>
            <nav className="header-nav">
              <a href="#dashboard" className="nav-item active">Dashboard</a>
              <a href="#agent" className="nav-item">Mein Agent</a>
              <a href="#workspace" className="nav-item">KI-Workspace</a>
              <a href="#resources" className="nav-item">Ressourcen</a>
            </nav>
          </div>
          
          <div className="header-right">
            <div className="header-search">
              <input type="text" placeholder="Suche..." />
            </div>
            <div className="header-icons">
              {/* Security Status Indicator in the header */}
              <AuthStatusIndicator agentId="user-agent" />
              
              <div className="header-icon notifications">
                <span className="notification-badge">3</span>
              </div>
              <div className="header-icon profile">
                <span className="profile-initial">J</span>
              </div>
            </div>
          </div>
        </header>
        
        <main className="dashboard-container">
          <h1 className="dashboard-title">Willkommen zurück, Jan!</h1>
          
          <div className="dashboard-grid">
            {/* Real-Life Agent Widget */}
            <div className="dashboard-widget real-life-agent">
              <div className="widget-header">
                <h2>Deine Missionen</h2>
              </div>
              <div className="widget-content">
                <div className="current-mission">
                  <h3>Mission: Saarland-Wanderweg digitalisieren</h3>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: '25%' }}></div>
                  </div>
                  <span className="progress-text">25% abgeschlossen</span>
                  
                  <button className="mission-action-button">
                    Nächster Schritt
                  </button>
                </div>
                
                <div className="agent-stats">
                  <div className="stat-item">
                    <span className="stat-label">Agenten-Level</span>
                    <span className="stat-value">3</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">EP</span>
                    <span className="stat-value">150/300</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* KI-Workspace Widget */}
            <div className="dashboard-widget workspace">
              <div className="widget-header">
                <h2>Dein KI-Workspace</h2>
              </div>
              <div className="widget-content">
                <div className="status-item">
                  <span className="status-label">Lokaler Llama 3.2 Agent:</span>
                  <span className="status-value active">Aktiv</span>
                </div>
                
                <div className="workspace-actions">
                  <button className="workspace-button primary">
                    Workspace öffnen
                  </button>
                  <button className="workspace-button secondary">
                    Setup-Skripte
                  </button>
                </div>
              </div>
            </div>
            
            {/* Security Widget - Integrated from security components */}
            <SecurityWidget title="A2A Security Status" />
            
            {/* News Feed Widget */}
            <div className="dashboard-widget news-feed">
              <div className="widget-header">
                <h2>agentland.saarland Aktuell</h2>
              </div>
              <div className="widget-content">
                <div className="news-item">
                  <h3>Neue KI-Tools verfügbar</h3>
                  <p>Entdecke die neuesten Modellupdates in der KI-Schmiede Saar.</p>
                  <a href="#" className="news-link">Mehr erfahren</a>
                </div>
                <div className="news-item">
                  <h3>Workshop: KI im Saarland</h3>
                  <p>Am 20. Mai findet der nächste Workshop statt.</p>
                  <a href="#" className="news-link">Anmelden</a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <style jsx>{`
        .example-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          color: #333;
          background-color: #f5f7f9;
          min-height: 100vh;
        }
        
        .example-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background-color: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .header-left, .header-right {
          display: flex;
          align-items: center;
        }
        
        .header-logo {
          font-weight: 700;
          font-size: 1.25rem;
          color: #3a6ea5;
          margin-right: 2rem;
        }
        
        .header-nav {
          display: flex;
          gap: 1.5rem;
        }
        
        .nav-item {
          text-decoration: none;
          color: #555;
          font-weight: 500;
          font-size: 0.875rem;
          padding: 0.5rem 0;
          border-bottom: 2px solid transparent;
        }
        
        .nav-item.active {
          color: #3a6ea5;
          border-bottom-color: #3a6ea5;
        }
        
        .header-search {
          margin-right: 1.5rem;
        }
        
        .header-search input {
          padding: 0.5rem 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          min-width: 200px;
        }
        
        .header-icons {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .header-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f0f0f0;
          position: relative;
        }
        
        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: #d9534f;
          color: white;
          font-size: 0.75rem;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .profile-initial {
          font-weight: 600;
        }
        
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .dashboard-title {
          margin-top: 0;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
          color: #333;
        }
        
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        
        .dashboard-widget {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        
        .widget-header {
          padding: 1rem;
          border-bottom: 1px solid #eee;
        }
        
        .widget-header h2 {
          margin: 0;
          font-size: 1.1rem;
          color: #333;
        }
        
        .widget-content {
          padding: 1.25rem;
        }
        
        .current-mission h3 {
          margin-top: 0;
          margin-bottom: 0.75rem;
          font-size: 1rem;
        }
        
        .progress-bar {
          height: 8px;
          background-color: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }
        
        .progress {
          height: 100%;
          background-color: #28a745;
        }
        
        .progress-text {
          display: block;
          font-size: 0.875rem;
          color: #555;
          margin-bottom: 1rem;
        }
        
        .mission-action-button {
          display: block;
          width: 100%;
          padding: 0.75rem;
          background-color: #3a6ea5;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          margin-bottom: 1rem;
        }
        
        .agent-stats {
          display: flex;
          justify-content: space-between;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }
        
        .stat-item {
          text-align: center;
        }
        
        .stat-label {
          display: block;
          font-size: 0.75rem;
          color: #777;
          margin-bottom: 0.25rem;
        }
        
        .stat-value {
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .status-label {
          font-weight: 500;
        }
        
        .status-value {
          font-weight: 600;
        }
        
        .status-value.active {
          color: #28a745;
        }
        
        .workspace-actions {
          display: flex;
          gap: 0.75rem;
        }
        
        .workspace-button {
          flex: 1;
          padding: 0.75rem;
          border-radius: 4px;
          border: none;
          font-weight: 500;
          cursor: pointer;
        }
        
        .workspace-button.primary {
          background-color: #3a6ea5;
          color: white;
        }
        
        .workspace-button.secondary {
          background-color: #f8f9fa;
          border: 1px solid #ddd;
        }
        
        .news-item {
          margin-bottom: 1.25rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid #eee;
        }
        
        .news-item:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }
        
        .news-item h3 {
          margin-top: 0;
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }
        
        .news-item p {
          margin-top: 0;
          margin-bottom: 0.5rem;
          color: #555;
          font-size: 0.875rem;
        }
        
        .news-link {
          color: #3a6ea5;
          font-size: 0.875rem;
          text-decoration: none;
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .example-header {
            flex-direction: column;
            align-items: flex-start;
            padding: 1rem;
          }
          
          .header-left, .header-right {
            width: 100%;
            margin-bottom: 1rem;
          }
          
          .header-logo {
            margin-bottom: 1rem;
          }
          
          .header-nav {
            overflow-x: auto;
            width: 100%;
            padding-bottom: 0.5rem;
          }
          
          .dashboard-container {
            padding: 1rem;
          }
          
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </SecurityProvider>
  );
};

export default SecurityIntegrationExample;