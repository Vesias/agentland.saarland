import React from 'react';
import { DashboardLayout, WorkflowDesignCanvas } from '../components/dashboard';

const WorkflowDesignerPage: React.FC = () => {
  return (
    <DashboardLayout>
      {/* WorkflowDesignCanvas is designed to take up significant space */}
      <WorkflowDesignCanvas />
    </DashboardLayout>
  );
};

export default WorkflowDesignerPage;
