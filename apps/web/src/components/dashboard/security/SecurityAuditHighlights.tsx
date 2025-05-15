import React, { useState, useEffect } from 'react';

interface AuditFinding {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
  description: string;
  status: 'Open' | 'In Progress' | 'Remediated' | 'Risk Accepted';
  recommendation?: string;
  ticketLink?: string;
}

const SecurityAuditHighlights: React.FC = () => {
  // Placeholder data - in a real implementation, this would be fetched
  // from a backend service or by parsing ai_docs/security/security_audit_agentland_saarland.md
  const [auditFindings, setAuditFindings] = useState<AuditFinding[]>([
    { id: 'SA-001', severity: 'Critical', description: 'Hardcoded JWT secret key in a2a-security-middleware.ts', status: 'In Progress', recommendation: 'Use environment variables for secrets.', ticketLink: '#issue-123' },
    { id: 'SA-002', severity: 'Critical', description: 'API keys stored in plaintext JSON files', status: 'Open', recommendation: 'Implement secure secret storage solution (e.g., Vault, or encrypted env vars).', ticketLink: '#issue-124' },
    { id: 'SA-003', severity: 'High', description: 'Incomplete session timeout handling', status: 'Open', recommendation: 'Implement proper session expiration and cleanup.', ticketLink: '#issue-125' },
    { id: 'SA-004', severity: 'Medium', description: 'Lack of automated dependency vulnerability scanning', status: 'Remediated', recommendation: 'Integrate Dependabot/Snyk into CI/CD.', ticketLink: '#issue-101' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   setIsLoading(true);
  //   fetch('/api/security/audit-highlights') // Example API
  //     .then(res => res.json())
  //     .then(data => {
  //       setAuditFindings(data);
  //       setIsLoading(false);
  //     })
  //     .catch(error => {
  //       console.error("Failed to fetch security audit highlights:", error);
  //       setIsLoading(false);
  //     });
  // }, []);

  const getSeverityColor = (severity: AuditFinding['severity']) => {
    if (severity === 'Critical') return 'bg-red-600 text-white';
    if (severity === 'High') return 'bg-red-400 text-red-900';
    if (severity === 'Medium') return 'bg-yellow-400 text-yellow-900';
    if (severity === 'Low') return 'bg-blue-400 text-blue-900';
    return 'bg-gray-400 text-gray-900';
  };

  const getStatusColor = (status: AuditFinding['status']) => {
    if (status === 'Open') return 'text-red-500 dark:text-red-400';
    if (status === 'In Progress') return 'text-blue-500 dark:text-blue-400';
    if (status === 'Remediated') return 'text-green-500 dark:text-green-400';
    return 'text-gray-500 dark:text-gray-400';
  };
  
  if (isLoading) {
    return <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">Lade Sicherheits-Audit Highlights...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Sicherheits-Audit Highlights
      </h2>
      <div className="space-y-4">
        {auditFindings.map(finding => (
          <div key={finding.id} className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200">{finding.id}: {finding.description}</h3>
              <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getSeverityColor(finding.severity)}`}>
                {finding.severity}
              </span>
            </div>
            <p className={`text-sm font-medium ${getStatusColor(finding.status)} mb-1`}>Status: {finding.status}</p>
            {finding.recommendation && 
              <p className="text-xs text-gray-600 dark:text-gray-400"><strong>Empfehlung:</strong> {finding.recommendation}</p>
            }
            {finding.ticketLink && 
              <a href={finding.ticketLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline dark:text-blue-400">
                Tracking Ticket
              </a>
            }
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Daten basierend auf <code>ai_docs/security/security_audit_agentland_saarland.md</code>.
      </p>
    </div>
  );
};

export default SecurityAuditHighlights;
