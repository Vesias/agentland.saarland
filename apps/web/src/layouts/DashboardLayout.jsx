import React from 'react';
import { DashboardNavbar } from '../components/layout';
import { useTheme } from '../components/dashboard/ThemeProvider';
import { useI18n } from '../components/i18n';

/**
 * DashboardLayout Component
 * 
 * Main layout for the dashboard pages with navbar
 * and consistent styling
 */
const DashboardLayout = ({ children }) => {
  const { theme } = useTheme();
  const { t } = useI18n();
  
  const handleSearch = (query) => {
    console.log('Search query:', query);
    // In a real app, implement search functionality
  };
  
  return (
    <div className="dashboard-layout">
      <DashboardNavbar onSearch={handleSearch} />
      
      <main className="dashboard-main">
        <div className="container">
          {children}
        </div>
      </main>
      
      <footer className="dashboard-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-copyright">
              &copy; {new Date().getFullYear()} AGENT_LAND.SAARLAND
            </div>
            <div className="footer-links">
              <a href="#about">{t('common.about')}</a>
              <a href="#privacy">{t('common.privacy')}</a>
              <a href="#terms">{t('common.terms')}</a>
              <a href="#contact">{t('common.contact')}</a>
            </div>
          </div>
        </div>
      </footer>
      
      <style jsx>{`
        .dashboard-layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        
        .dashboard-main {
          flex: 1;
          padding: 1.5rem 0;
          background-color: var(--background-color);
        }
        
        .dashboard-footer {
          background-color: var(--surface-color);
          border-top: 1px solid var(--border-color);
          padding: 1.5rem 0;
          margin-top: auto;
        }
        
        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
          color: var(--text-secondary-color);
        }
        
        .footer-links {
          display: flex;
          gap: 1.5rem;
        }
        
        .footer-links a {
          color: var(--text-secondary-color);
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .footer-links a:hover {
          color: var(--primary-color);
        }
        
        @media (max-width: 768px) {
          .footer-content {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
          
          .footer-links {
            flex-wrap: wrap;
            justify-content: center;
            gap: 1rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;