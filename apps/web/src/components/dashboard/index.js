/**
 * Dashboard Components
 * 
 * This module exports all dashboard-related components, including
 * the main Dashboard wrapper, widgets, and theme providers
 */

// Export core dashboard components
export { default as Dashboard } from './Dashboard';
export { default as DashboardPage } from './DashboardPage';
export { default as RegionalIdentityWidget } from './RegionalIdentityWidget'; 
export { default as EnhancedAgentCockpit } from './EnhancedAgentCockpit';
export { default as NotificationSystem } from './NotificationSystem';
export { default as ThemeProvider, useTheme } from './ThemeProvider';