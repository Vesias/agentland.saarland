import React from 'react';
import { ThemeProvider } from './components/dashboard';
import { I18nProvider } from './components/i18n';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/Dashboard';

/**
 * Main App Component
 * 
 * Root component that provides theme and i18n context providers
 * and renders the main application layout with dashboard
 */
function App() {
  return (
    <ThemeProvider>
      <I18nProvider defaultLanguage="de">
        <DashboardLayout>
          <DashboardPage />
        </DashboardLayout>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;