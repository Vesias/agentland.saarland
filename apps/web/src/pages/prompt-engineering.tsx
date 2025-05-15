import React from 'react';
import { DashboardLayout, PromptEngineeringSuite } from '../components/dashboard';

const PromptEngineeringPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        {/* The PromptEngineeringSuite component includes its own max-width and centering */}
        <PromptEngineeringSuite />
      </div>
    </DashboardLayout>
  );
};

export default PromptEngineeringPage;
