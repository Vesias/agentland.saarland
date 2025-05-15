import React from 'react';
import {
  DashboardLayout,
  ActiveAgentsOverview,
  MCPToolUsageMonitor,
  SystemStatusIndicator,
  KnowledgeBaseExplorer,
  LighthouseAppSpotlight,
  AuditV4ProgressOverview,
  TestCoverageDashboard,
  OpenTODOCounter,
  MCPServiceStatusPanel,
  LiveAgentGraph,
  VectorStoreHealth,
  KnowledgeSourceMonitor,
  WorkflowProgressTracker,
  SovereignAIComplianceCheck,
  PublicBenefitImpactMetrics
  // Import other widgets as needed from '../components/dashboard'
} from '../components/dashboard';

const DashboardPage: React.FC = () => {
  return (
    <DashboardLayout>
      {/* Page title or global actions can go here if not handled by DashboardHeader */}
      <div className="px-0 py-0"> {/* Adjusted padding, DashboardLayout main has p-4 */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard Overview</h2>
        
        {/* Grid for Dashboard Widgets */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Main Column (lg:col-span-2) */}
          <section className="lg:col-span-2 space-y-6">
            <LiveAgentGraph />
            <WorkflowProgressTracker />
            <AuditV4ProgressOverview />
            <TestCoverageDashboard />
            <ActiveAgentsOverview />
            <MCPToolUsageMonitor />
            <KnowledgeBaseExplorer />
            <VectorStoreHealth />
            <KnowledgeSourceMonitor />
            <SovereignAIComplianceCheck />
            <PublicBenefitImpactMetrics />
            {/* Add more primary widgets here */}
          </section>

          {/* Sidebar Column (lg:col-span-1) */}
          <section className="space-y-6">
            <SystemStatusIndicator />
            <MCPServiceStatusPanel />
            <OpenTODOCounter />
            <LighthouseAppSpotlight />
            {/* Add more secondary/sidebar widgets here, e.g., RecentEmbeddingsFeed, TaskQueueManager */}
            {/* Example:
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-md font-medium text-gray-700 mb-2">Quick Links</h3>
              <ul className="text-sm text-indigo-600 space-y-1">
                <li><a href="#" className="hover:underline">Agent Documentation</a></li>
                <li><a href="#" className="hover:underline">System Logs</a></li>
                <li><a href="#" className="hover:underline">User Management</a></li>
              </ul>
            </div>
            */}
          </section>
        </div>

        {/* Additional sections for other widgets if needed */}
        {/* <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Regional Integration Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SaarlandDataStatus />
            <CommunityContributionTracker />
          </div>
        </div> */}

      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
