import type { NextApiRequest, NextApiResponse } from 'next';

interface AuditFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  description: string;
  status: 'open' | 'resolved' | 'mitigated' | 'pending_review';
  lastChecked: string;
}

interface SecurityAuditSummary {
  summaryDate: string;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  recentFindings: AuditFinding[];
}

// Simulate fetching or generating security audit summary data
const getSecurityAuditSummaryData = (): SecurityAuditSummary => {
  const now = new Date();
  const severities: Array<'critical' | 'high' | 'medium' | 'low' | 'info'> = ['critical', 'high', 'medium', 'low', 'info'];
  const statuses: Array<'open' | 'resolved' | 'mitigated' | 'pending_review'> = ['open', 'resolved', 'mitigated', 'pending_review'];

  const recentFindings: AuditFinding[] = Array.from({ length: Math.floor(Math.random() * 3) + 2 }, (_, i) => ({ // 2-4 findings
    id: `finding-${Math.random().toString(36).substring(2, 9)}`,
    severity: severities[Math.floor(Math.random() * severities.length)],
    description: [
      'Potential XSS vulnerability in user profile page.',
      'Outdated dependency (libXYZ v1.2.3) with known CVE.',
      'Weak password policy for admin accounts.',
      'Sensitive data logged in debug output.',
      'Missing CSRF token in form submission.',
      'Insecure direct object reference (IDOR) in API endpoint /api/resource/{id}.'
    ][Math.floor(Math.random() * 6)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    lastChecked: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60000).toISOString(), // Within last week
  }));

  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  recentFindings.forEach(f => {
    if (f.status === 'open' || f.status === 'pending_review') {
      if (f.severity === 'critical') criticalCount++;
      else if (f.severity === 'high') highCount++;
      else if (f.severity === 'medium') mediumCount++;
      else if (f.severity === 'low') lowCount++;
    }
  });
  
  // Add some more random counts for overall summary
  criticalCount += Math.floor(Math.random() * 2); // 0-1 more
  highCount += Math.floor(Math.random() * 3);    // 0-2 more
  mediumCount += Math.floor(Math.random() * 5);  // 0-4 more


  return {
    summaryDate: now.toISOString(),
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    recentFindings,
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SecurityAuditSummary | { error: string }>
) {
  if (req.method === 'GET') {
    try {
      const summaryData = getSecurityAuditSummaryData();
      res.status(200).json(summaryData);
    } catch (error) {
      console.error('Error generating security audit summary:', error);
      res.status(500).json({ error: 'Failed to retrieve security audit summary.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
