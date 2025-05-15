import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaSpinner } from 'react-icons/fa';

// Interface aligned with the API response from /api/security/audit-summary
interface AuditFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'; // Lowercase to match API
  description: string;
  status: 'open' | 'resolved' | 'mitigated' | 'pending_review'; // Lowercase to match API
  lastChecked: string; // Added from API
  recommendation?: string; // Kept from original, though not in API
  ticketLink?: string;     // Kept from original, though not in API
}

interface SecurityAuditSummary {
  summaryDate: string;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  recentFindings: AuditFinding[];
}

const SecurityAuditHighlights: React.FC = () => {
  const [auditSummary, setAuditSummary] = useState<SecurityAuditSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuditSummary = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/security/audit-summary');
        if (!response.ok) {
          throw new Error(`Failed to fetch security audit summary: ${response.statusText}`);
        }
        const data: SecurityAuditSummary | { error: string } = await response.json();
        if ('error' in data) {
          throw new Error(data.error);
        }
        setAuditSummary(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        setAuditSummary(null); // Clear or set fallback data
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuditSummary();
  }, []);

  const getSeverityColor = (severity: AuditFinding['severity']) => {
    if (severity === 'critical') return 'bg-red-600 text-white';
    if (severity === 'high') return 'bg-red-400 text-red-900 dark:text-red-100 dark:bg-red-500';
    if (severity === 'medium') return 'bg-yellow-400 text-yellow-900 dark:text-yellow-100 dark:bg-yellow-500';
    if (severity === 'low') return 'bg-blue-400 text-blue-900 dark:text-blue-100 dark:bg-blue-500';
    return 'bg-gray-400 text-gray-900 dark:text-gray-100 dark:bg-gray-500';
  };

  const getStatusColor = (status: AuditFinding['status']) => {
    if (status === 'open') return 'text-red-500 dark:text-red-400';
    if (status === 'pending_review') return 'text-yellow-600 dark:text-yellow-400';
    if (status === 'mitigated') return 'text-blue-500 dark:text-blue-400';
    if (status === 'resolved') return 'text-green-500 dark:text-green-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  const getStatusIcon = (status: AuditFinding['status']) => {
    if (status === 'open') return <FaExclamationTriangle className="inline mr-1 text-red-500" />;
    if (status === 'pending_review') return <FaInfoCircle className="inline mr-1 text-yellow-600" />;
    if (status === 'resolved') return <FaCheckCircle className="inline mr-1 text-green-500" />;
    return null;
  };
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
        <FaSpinner className="animate-spin text-blue-500 text-2xl mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-300">Lade Sicherheits-Audit Highlights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-500 dark:text-red-400 mb-2">
          <FaExclamationTriangle className="inline mr-2" /> Fehler beim Laden der Audit Highlights
        </h2>
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }
  
  if (!auditSummary) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
         <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Sicherheits-Audit Highlights
        </h2>
        <p className="text-gray-500 dark:text-gray-400">Keine Audit-Daten verfügbar.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaShieldAlt className="mr-2 text-indigo-500" /> Sicherheits-Audit Highlights
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
        <div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{auditSummary.criticalCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Kritisch</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-red-500 dark:text-red-300">{auditSummary.highCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Hoch</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-yellow-500 dark:text-yellow-400">{auditSummary.mediumCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Mittel</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-500 dark:text-blue-400">{auditSummary.lowCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Niedrig</p>
        </div>
      </div>
      <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">Aktuelle & offene Befunde:</h3>
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {auditSummary.recentFindings.filter(f => f.status === 'open' || f.status === 'pending_review').length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Keine aktuellen offenen Befunde.</p>
        )}
        {auditSummary.recentFindings.filter(f => f.status === 'open' || f.status === 'pending_review').map(finding => (
          <div key={finding.id} className="border border-gray-200 dark:border-gray-700 rounded-md p-3 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-1">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex-1 mr-2">{finding.description}</h4>
              <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getSeverityColor(finding.severity)} capitalize`}>
                {finding.severity}
              </span>
            </div>
            <p className={`text-xs font-medium ${getStatusColor(finding.status)} mb-1 capitalize`}>
              {getStatusIcon(finding.status)}
              Status: {finding.status.replace('_', ' ')} (Geprüft: {new Date(finding.lastChecked).toLocaleDateString()})
            </p>
            {/* Recommendation and ticketLink could be added if present in API response */}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Audit-Zusammenfassung vom: {new Date(auditSummary.summaryDate).toLocaleString()}.
      </p>
    </div>
  );
};

export default SecurityAuditHighlights;
