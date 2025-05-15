import React from 'react';
import DashboardHeader from './DashboardHeader'; // Assuming DashboardHeader.tsx will be created in the same directory
import SidebarNavigation from './SidebarNavigation'; // Assuming SidebarNavigation.tsx will be created in the same directory

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarNavigation />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 p-4 overflow-x-hidden overflow-y-auto bg-gray-200">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
