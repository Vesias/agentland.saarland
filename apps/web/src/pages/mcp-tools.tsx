import React from 'react';
import { DashboardLayout, MCPToolManager } from '../components/dashboard';

const MCPToolsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        {/* The MCPToolManager component includes its own max-width and centering */}
        <MCPToolManager />
      </div>
    </DashboardLayout>
  );
};

export default MCPToolsPage;