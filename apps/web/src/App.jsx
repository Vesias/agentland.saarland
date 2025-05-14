import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './components/dashboard';
import { I18nProvider } from './components/i18n';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/Dashboard';
import ProfilePage from './components/profile/ProfilePage';
import { ProfileProvider } from './components/profile/ProfileContext';

/**
 * Main App Component
 * 
 * Root component that provides theme and i18n context providers
 * and renders the main application layout with dashboard or profile page
 */
function App() {
  const [showProfilePage, setShowProfilePage] = useState(false);
  
  // Listen for class changes on the body tag to show/hide the profile page
  useEffect(() => {
    const handleBodyClassChange = () => {
      if (document.body.classList.contains('show-profile-page')) {
        setShowProfilePage(true);
      } else if (document.body.classList.contains('show-dashboard-page')) {
        setShowProfilePage(false);
      }
    };
    
    // Set up a MutationObserver to watch for class changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          handleBodyClassChange();
        }
      });
    });
    
    observer.observe(document.body, { attributes: true });
    
    // Clean up
    return () => {
      observer.disconnect();
    };
  }, []);
  
  return (
    <ThemeProvider>
      <I18nProvider defaultLanguage="de">
        <ProfileProvider>
          <DashboardLayout>
            {showProfilePage ? (
              <ProfilePage />
            ) : (
              <DashboardPage />
            )}
          </DashboardLayout>
        </ProfileProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;