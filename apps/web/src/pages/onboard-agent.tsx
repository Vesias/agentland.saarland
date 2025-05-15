import React from 'react';
import { DashboardLayout, AgentOnboardingFlow } from '../components/dashboard';

const OnboardAgentPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        {/* The AgentOnboardingFlow component includes its own max-width and centering */}
        <AgentOnboardingFlow />
      </div>
    </DashboardLayout>
  );
};

export default OnboardAgentPage;
