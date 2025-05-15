import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import { 
  FaRobot, 
  FaFlask, 
  FaNewspaper, 
  FaQuestionCircle, 
  FaShieldAlt, 
  FaServer, 
  FaDatabase,
  FaChartBar,
  FaUsers,
  FaCog,
  FaKey,
  FaUserShield
} from 'react-icons/fa';
import { SecurityWidget, DNSSecurityStatus, A2AMissionAuthWidget } from '../security'; // Consolidate imports from security barrel file
import EnhancedAgentCockpit from './EnhancedAgentCockpit';
import { useGameState } from '../../hooks/mcp'; // Import from the barrel file

// Mock components for widgets - would be replaced with real components
const AgentCockpitWidget = () => {
  const { gameState, updateGameState } = useGameState();
  
  const currentMission = gameState?.currentMission || {
    name: "Mission: Saarland-Wanderweg digitalisieren",
    progress: 45,
    steps: [
      "Daten sammeln",
      "GPS-Koordinaten extrahieren",
      "Karte erstellen"
    ]
  };
  
  return (
    <div className="agent-cockpit">
      <div className="agent-status">
        <div className="agent-level">
          <span className="label">Agenten-Level:</span>
          <span className="value">{gameState?.level || 3}</span>
        </div>
        <div className="agent-xp">
          <span className="label">XP:</span>
          <span className="value">{gameState?.xp || 450}/{gameState?.nextLevelXp || 1000}</span>
          <div className="xp-bar">
            <div 
              className="xp-progress" 
              style={{ width: `${((gameState?.xp || 450) / (gameState?.nextLevelXp || 1000)) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="current-mission">
        <h4>Aktuelle Mission</h4>
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
        <h4>Nächste Schritte</h4>
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
      
      <div className="agent-actions">
        <button className="primary-action">Details anzeigen / Nächster Schritt</button>
        <button className="secondary-action">Alle Missionen verwalten</button>
      </div>
      
      <style jsx>{`
        .agent-cockpit {
          display: flex;
          flex-direction: column;
          height: 100%;
          gap: 1rem;
        }
        
        .agent-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #f8f9fa;
          padding: 0.75rem;
          border-radius: 4px;
        }
        
        .agent-level {
          font-weight: 500;
        }
        
        .agent-level .value {
          margin-left: 0.5rem;
          font-weight: 600;
          color: #3a6ea5;
        }
        
        .agent-xp {
          text-align: right;
        }
        
        .agent-xp .value {
          margin-left: 0.5rem;
          font-weight: 500;
        }
        
        .xp-bar {
          width: 100px;
          height: 6px;
          background-color: #e9ecef;
          border-radius: 3px;
          margin-top: 0.25rem;
          overflow: hidden;
        }
        
        .xp-progress {
          height: 100%;
          background-color: #3a6ea5;
        }
        
        .current-mission {
          margin-bottom: 0.5rem;
        }
        
        .current-mission h4 {
          margin: 0 0 0.5rem;
          font-size: 1rem;
        }
        
        .mission-name {
          font-weight: 500;
          margin-bottom: 0.5rem;
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
        
        .mission-steps h4 {
          margin: 0 0 0.5rem;
          font-size: 1rem;
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
        
        .agent-actions {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .agent-actions button {
          padding: 0.75rem;
          border-radius: 4px;
          border: none;
          font-weight: 500;
          cursor: pointer;
        }
        
        .primary-action {
          background-color: #3a6ea5;
          color: white;
        }
        
        .secondary-action {
          background-color: transparent;
          border: 1px solid #3a6ea5 !important;
          color: #3a6ea5;
        }
      `}</style>
    </div>
  );
};

const WorkspaceWidget = () => (
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
        background-color: #28a745;
      }
      
      .status-indicator.inactive .status-dot {
        background-color: #dc3545;
      }
      
      .status-text {
        font-weight: 500;
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
      }
      
      .workspace-button.primary {
        background-color: #3a6ea5;
        color: white;
      }
      
      .workspace-button.secondary {
        background-color: #f8f9fa;
        color: #333;
      }
      
      .button-icon {
        margin-right: 0.75rem;
      }
    `}</style>
  </div>
);

const NewsFeedWidget = () => (
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
      }
      
      .news-items {
        flex: 1;
      }
      
      .news-item {
        padding: 1rem 0;
        border-bottom: 1px solid #eee;
      }
      
      .news-item:last-child {
        border-bottom: none;
      }
      
      .news-date {
        font-size: 0.75rem;
        color: #777;
        margin-bottom: 0.25rem;
      }
      
      .news-title {
        font-weight: 600;
        margin-bottom: 0.5rem;
      }
      
      .news-summary {
        font-size: 0.875rem;
        color: #555;
        margin-bottom: 0.5rem;
      }
      
      .news-link {
        font-size: 0.875rem;
        color: #3a6ea5;
        text-decoration: none;
      }
      
      .news-footer {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #eee;
        text-align: center;
      }
      
      .view-all {
        color: #3a6ea5;
        text-decoration: none;
        font-size: 0.875rem;
        font-weight: 500;
      }
    `}</style>
  </div>
);

const SupportWidget = () => (
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
      }
      
      .quick-links {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      
      .quick-link {
        display: flex;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
        text-decoration: none;
        color: inherit;
        transition: background-color 0.2s ease;
      }
      
      .quick-link:hover {
        background-color: #e9ecef;
      }
      
      .link-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background-color: rgba(58, 110, 165, 0.1);
        color: #3a6ea5;
        border-radius: 4px;
        margin-right: 1rem;
      }
      
      .link-title {
        font-weight: 500;
        margin-bottom: 0.25rem;
      }
      
      .link-description {
        font-size: 0.75rem;
        color: #777;
      }
    `}</style>
  </div>
);

/**
 * DashboardPage Component
 * 
 * Main dashboard page for agentland.saarland that uses the modular Dashboard component
 */
const DashboardPage = () => {
  const [dashboardWidgets, setDashboardWidgets] = useState([]);
  const [availableWidgets, setAvailableWidgets] = useState([]);
  
  // Initialize available widgets
  useEffect(() => {
    setAvailableWidgets([
      {
        type: 'enhanced-agent-cockpit',
        title: 'Mein "Real-Life Agent" Cockpit',
        description: 'Übersicht über deine aktuelle Mission mit sicherer Missionsautorisierung',
        icon: <FaRobot />,
        component: <EnhancedAgentCockpit />
      },
      {
        type: 'agent-cockpit',
        title: 'Einfaches Agent Cockpit',
        description: 'Übersicht über deine aktuelle Mission, Fortschritt und Agenten-Level',
        icon: <FaRobot />,
        component: <AgentCockpitWidget />
      },
      {
        type: 'workspace',
        title: 'Mein KI-Workspace',
        description: 'Zugang zur "KI-Schmiede Saar" und deinem lokalen KI-Setup',
        icon: <FaFlask />,
        component: <WorkspaceWidget />
      },
      {
        type: 'news-feed',
        title: 'Neues aus dem agentland',
        description: 'Aktuelle Nachrichten, Tutorials und Community-Events',
        icon: <FaNewspaper />,
        component: <NewsFeedWidget />
      },
      {
        type: 'support',
        title: 'Starthilfe & Support',
        description: 'Hilfe und Ressourcen für einen erfolgreichen Start',
        icon: <FaQuestionCircle />,
        component: <SupportWidget />
      },
      {
        type: 'security',
        title: 'Sicherheitsstatus',
        description: 'Übersicht über die Sicherheitseinstellungen und Authentifizierung',
        icon: <FaShieldAlt />,
        component: <SecurityWidget />
      },
      {
        type: 'dns-security',
        title: 'DNS Sicherheit',
        description: 'Status der DNS-Sicherheitskonfiguration',
        icon: <FaServer />,
        component: <DNSSecurityStatus />
      },
      {
        type: 'mission-auth',
        title: 'Missionsautorisierung',
        description: 'Verwaltung der Zugriffsberechtigungen für Missionen',
        icon: <FaUserShield />,
        component: <A2AMissionAuthWidget />
      },
      {
        type: 'analytics',
        title: 'Nutzungsstatistiken',
        description: 'Kennzahlen zur Nutzung der Plattform',
        icon: <FaChartBar />,
        component: (
          <div className="analytics-placeholder">
            <p>Statistiken werden geladen...</p>
          </div>
        )
      },
      {
        type: 'system-status',
        title: 'Systemstatus',
        description: 'Status der Systemkomponenten und Dienste',
        icon: <FaCog />,
        component: (
          <div className="system-status-placeholder">
            <p>Systemstatus wird geladen...</p>
          </div>
        )
      }
    ]);
  }, []);
  
  // Initialize dashboard with default widgets
  useEffect(() => {
    // Load saved dashboard layout from localStorage or use defaults
    const savedLayout = localStorage.getItem('dashboard-layout');
    
    if (savedLayout) {
      try {
        const parsedLayout = JSON.parse(savedLayout);
        
        // Ensure we have the correct components
        const widgetsWithComponents = parsedLayout.map(widget => {
          const foundWidget = availableWidgets.find(w => w.type === widget.type);
          
          if (foundWidget) {
            return {
              ...widget,
              title: foundWidget.title,
              component: foundWidget.component
            };
          }
          
          return null;
        }).filter(Boolean);
        
        setDashboardWidgets(widgetsWithComponents);
      } catch (error) {
        console.error('Error loading dashboard layout', error);
        setDefaultWidgets();
      }
    } else {
      setDefaultWidgets();
    }
  }, [availableWidgets]);
  
  // Set default widgets for new users
  const setDefaultWidgets = () => {
    const defaultWidgetTypes = ['enhanced-agent-cockpit', 'workspace', 'news-feed', 'support', 'mission-auth'];
    
    const defaultWidgets = availableWidgets
      .filter(widget => defaultWidgetTypes.includes(widget.type))
      .map((widget, index) => ({
        ...widget,
        id: `widget-${widget.type}`,
        position: index
      }));
    
    setDashboardWidgets(defaultWidgets);
  };
  
  // Handle layout changes
  const handleLayoutChange = (newLayout) => {
    // Save to localStorage
    localStorage.setItem('dashboard-layout', JSON.stringify(newLayout));
  };
  
  return (
    <Dashboard 
      widgets={dashboardWidgets}
      availableWidgets={availableWidgets}
      title="agentland.saarland"
      subtitle="Dein persönliches Dashboard"
      onLayoutChange={handleLayoutChange}
    />
  );
};

export default DashboardPage;
