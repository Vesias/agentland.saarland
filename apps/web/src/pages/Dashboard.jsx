import React, { useState, useEffect } from 'react';
import { 
  Dashboard, 
  EnhancedAgentCockpit, 
  RegionalIdentityWidget,
  NotificationSystem 
} from '../components/dashboard';
import { FaRobot, FaFlask, FaNewspaper, FaQuestionCircle, FaShieldAlt } from 'react-icons/fa';
import { A2AMissionAuthWidget } from '../components/security';
import { WorkspaceWidget } from '../components/workspace';
import { SupportWidget } from '../components/support';
import { NewsFeedWidget } from '../components/news';

/**
 * DashboardPage Component
 * 
 * Main dashboard page that uses the modular Dashboard component
 * to render the AGENT_LAND.SAARLAND dashboard
 */
const DashboardPage = () => {
  const [dashboardWidgets, setDashboardWidgets] = useState([]);
  const [availableWidgets, setAvailableWidgets] = useState([]);
  
  // Initialize available widgets
  useEffect(() => {
    // In a real app, this might be fetched from an API
    setAvailableWidgets([
      {
        type: 'enhanced-agent-cockpit',
        title: 'Mein "Real-Life Agent" Cockpit',
        description: 'Übersicht über deine aktuelle Mission mit sicherer Missionsautorisierung',
        icon: <FaRobot />,
        component: <EnhancedAgentCockpit />
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
        title: 'Neues aus dem AGENT_LAND',
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
        type: 'mission-auth',
        title: 'Missionsautorisierung',
        description: 'Verwaltung der Zugriffsberechtigungen für Missionen',
        icon: <FaShieldAlt />,
        component: <A2AMissionAuthWidget />
      },
      {
        type: 'regional-identity',
        title: 'Saarland Entdecken',
        description: 'Entdecke die KI-Schmiede Saar und regionale Highlights',
        icon: <FaNewspaper />,
        component: <RegionalIdentityWidget />
      }
    ]);
  }, []);
  
  // Initialize dashboard with default widgets
  useEffect(() => {
    // Load saved dashboard layout from localStorage or use defaults
    const savedLayout = localStorage.getItem('dashboard-layout');
    
    if (savedLayout && availableWidgets.length > 0) {
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
    } else if (availableWidgets.length > 0) {
      setDefaultWidgets();
    }
  }, [availableWidgets]);
  
  // Set default widgets for new users
  const setDefaultWidgets = () => {
    const defaultWidgetTypes = [
      'enhanced-agent-cockpit', 
      'workspace', 
      'news-feed', 
      'regional-identity',
      'mission-auth'
    ];
    
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
  
  // Create placeholder components for missing widgets
  const WorkspaceWidget = () => (
    <div className="placeholder-widget">
      <h3>KI-Workspace</h3>
      <p>Workspace-Komponente wird geladen...</p>
      <style jsx>{`
        .placeholder-widget {
          padding: 2rem;
          text-align: center;
          background-color: var(--surface-color);
          border-radius: 8px;
          box-shadow: 0 2px 10px var(--shadow-color);
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        
        h3 {
          margin-bottom: 1rem;
          color: var(--primary-color);
        }
        
        p {
          color: var(--text-secondary-color);
        }
      `}</style>
    </div>
  );
  
  const SupportWidget = () => (
    <div className="placeholder-widget">
      <h3>Starthilfe & Support</h3>
      <p>Support-Komponente wird geladen...</p>
      <style jsx>{`
        .placeholder-widget {
          padding: 2rem;
          text-align: center;
          background-color: var(--surface-color);
          border-radius: 8px;
          box-shadow: 0 2px 10px var(--shadow-color);
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        
        h3 {
          margin-bottom: 1rem;
          color: var(--primary-color);
        }
        
        p {
          color: var(--text-secondary-color);
        }
      `}</style>
    </div>
  );
  
  const NewsFeedWidget = () => (
    <div className="placeholder-widget">
      <h3>Neues aus dem AGENT_LAND</h3>
      <p>News-Feed-Komponente wird geladen...</p>
      <style jsx>{`
        .placeholder-widget {
          padding: 2rem;
          text-align: center;
          background-color: var(--surface-color);
          border-radius: 8px;
          box-shadow: 0 2px 10px var(--shadow-color);
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        
        h3 {
          margin-bottom: 1rem;
          color: var(--primary-color);
        }
        
        p {
          color: var(--text-secondary-color);
        }
      `}</style>
    </div>
  );
  
  return (
    <div className="dashboard-page">
      <Dashboard 
        widgets={dashboardWidgets}
        availableWidgets={availableWidgets}
        title="AGENT_LAND.SAARLAND"
        subtitle="Dein persönliches Dashboard"
        onLayoutChange={handleLayoutChange}
      />
    </div>
  );
};

export default DashboardPage;