import type { NextApiRequest, NextApiResponse } from 'next';

interface ComplianceCheck {
  id: string;
  area: string; // e.g., 'Data Residency', 'Model Transparency', 'GDPR Adherence'
  status: 'compliant' | 'partially_compliant' | 'non_compliant' | 'pending_assessment';
  details: string;
  lastAssessed: string;
  relevantRegulation?: string; // e.g., 'EU AI Act Art. 13', 'GDPR Art. 30'
}

interface SovereigntyStatusSummary {
  overallStatus: 'compliant' | 'partially_compliant' | 'non_compliant';
  lastFullAssessment: string;
  checks: ComplianceCheck[];
}

// Simulate fetching or generating sovereignty compliance data
const getSovereigntyStatusData = (): SovereigntyStatusSummary => {
  const now = new Date();
  const statuses: Array<'compliant' | 'partially_compliant' | 'non_compliant' | 'pending_assessment'> = 
    ['compliant', 'partially_compliant', 'non_compliant', 'pending_assessment'];

  const checks: ComplianceCheck[] = [
    {
      id: 'data-residency',
      area: 'Data Residency & Processing',
      status: statuses[Math.floor(Math.random() * statuses.length)],
      details: 'All user data and derived analytics are processed and stored within EU data centers (Frankfurt, DE). Backups are geo-redundant within EU.',
      lastAssessed: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60000).toISOString(), // Within last 30 days
      relevantRegulation: 'GDPR Art. 44-50, EU AI Act (Data Governance)',
    },
    {
      id: 'model-transparency',
      area: 'Model Transparency & Explainability',
      status: statuses[Math.floor(Math.random() * statuses.length)],
      details: 'Core models provide SHAP values for local explainability. Public-facing model cards are maintained for major AI systems.',
      lastAssessed: new Date(now.getTime() - Math.random() * 45 * 24 * 60 * 60000).toISOString(),
      relevantRegulation: 'EU AI Act Art. 13',
    },
    {
      id: 'gdpr-adherence',
      area: 'GDPR Adherence & User Rights',
      status: 'compliant',
      details: 'Data Subject Access Request (DSAR) portal active. RoPA maintained and reviewed quarterly. DPIAs conducted for new high-risk processing.',
      lastAssessed: new Date(now.getTime() - Math.random() * 10 * 24 * 60 * 60000).toISOString(),
      relevantRegulation: 'GDPR (Full)',
    },
    {
      id: 'saarland-dialect-support',
      area: 'Saarland Dialect & Cultural Nuance',
      status: 'partially_compliant',
      details: 'Basic support for Saarlandic dialects in NLU models. Ongoing fine-tuning with regional datasets.',
      lastAssessed: new Date(now.getTime() - Math.random() * 15 * 24 * 60 * 60000).toISOString(),
      relevantRegulation: 'Regional Mandate SR-AI-001',
    }
  ];

  let overallStatus: 'compliant' | 'partially_compliant' | 'non_compliant' = 'compliant';
  if (checks.some(c => c.status === 'non_compliant')) {
    overallStatus = 'non_compliant';
  } else if (checks.some(c => c.status === 'partially_compliant' || c.status === 'pending_assessment')) {
    overallStatus = 'partially_compliant';
  }

  return {
    overallStatus,
    lastFullAssessment: new Date(now.getTime() - Math.random() * 5 * 24 * 60 * 60000).toISOString(), // Within last 5 days
    checks,
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SovereigntyStatusSummary | { error: string }>
) {
  if (req.method === 'GET') {
    try {
      const statusData = getSovereigntyStatusData();
      res.status(200).json(statusData);
    } catch (error) {
      console.error('Error generating sovereignty status data:', error);
      res.status(500).json({ error: 'Failed to retrieve sovereignty status data.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
