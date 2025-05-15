import type { NextApiRequest, NextApiResponse } from 'next';

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  startTime?: string;
  endTime?: string;
  details?: string;
}

interface Workflow {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  currentStepId?: string;
  steps: WorkflowStep[];
  progressPercentage: number;
}

// Simulate fetching or generating live workflow data
const getActiveWorkflowsData = (): Workflow[] => {
  const now = new Date();
  const randomPastTime = (minutesAgo: number) => new Date(now.getTime() - minutesAgo * 60000).toLocaleTimeString();

  const workflows: Workflow[] = [
    {
      id: 'wf-doc-analysis-001',
      name: 'Document Analysis Pipeline',
      status: 'running',
      currentStepId: 'step2-text-extract',
      progressPercentage: Math.floor(Math.random() * 50) + 25, // 25-75%
      steps: [
        { id: 'step1-fetch-doc', name: 'Fetch Document', status: 'completed', startTime: randomPastTime(10), endTime: randomPastTime(9), details: 'Source: /uploads/report_final.pdf' },
        { id: 'step2-text-extract', name: 'Extract Text', status: 'in-progress', startTime: randomPastTime(9), details: 'Using Advanced OCR Module' },
        { id: 'step3-summarize', name: 'Summarize Content', status: 'pending' },
        { id: 'step4-keyword-extract', name: 'Keyword Extraction', status: 'pending' },
        { id: 'step5-store-results', name: 'Store Results in DB', status: 'pending' },
      ],
    },
    {
      id: 'wf-code-review-007',
      name: 'Automated Code Review',
      status: 'failed',
      currentStepId: 'cr-step3-security-scan',
      progressPercentage: 40,
      steps: [
        { id: 'cr-step1-checkout', name: 'Checkout PR Branch', status: 'completed', startTime: randomPastTime(30), endTime: randomPastTime(28) },
        { id: 'cr-step2-linting', name: 'Run Linter', status: 'completed', startTime: randomPastTime(28), endTime: randomPastTime(25) },
        { id: 'cr-step3-security-scan', name: 'Security Vulnerability Scan', status: 'error', startTime: randomPastTime(25), details: 'High severity vulnerability found in dependency XYZ.' },
        { id: 'cr-step4-generate-report', name: 'Generate Review Report', status: 'pending' },
      ],
    },
     {
      id: 'wf-daily-briefing-003',
      name: 'Daily News Briefing Generation',
      status: 'completed',
      progressPercentage: 100,
      steps: [
        { id: 'db-step1', name: 'Fetch News Feeds', status: 'completed', startTime: randomPastTime(120), endTime: randomPastTime(115)},
        { id: 'db-step2', name: 'Filter & Rank Articles', status: 'completed', startTime: randomPastTime(115), endTime: randomPastTime(110)},
        { id: 'db-step3', name: 'Generate Summaries', status: 'completed', startTime: randomPastTime(110), endTime: randomPastTime(100)},
        { id: 'db-step4', name: 'Compile Briefing Document', status: 'completed', startTime: randomPastTime(100), endTime: randomPastTime(98)},
      ],
    }
  ];
  
  // Randomize some statuses for dynamic feel
   workflows.forEach(wf => {
    if (wf.status === 'running' && Math.random() < 0.1) {
      wf.status = 'paused';
    }
    wf.steps.forEach(step => {
      if (step.status === 'pending' && wf.status === 'running' && Math.random() < 0.05) {
        step.status = 'in-progress';
        wf.currentStepId = step.id;
      }
    });
  });

  return workflows;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Workflow[] | { error: string }>
) {
  if (req.method === 'GET') {
    try {
      const workflowData = getActiveWorkflowsData();
      res.status(200).json(workflowData);
    } catch (error) {
      console.error('Error generating workflow data:', error);
      res.status(500).json({ error: 'Failed to retrieve workflow data.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
