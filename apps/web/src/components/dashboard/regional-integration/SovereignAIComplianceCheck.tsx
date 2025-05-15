import React, { useState, useEffect } from 'react';
import { FaBalanceScale, FaCheckCircle, FaExclamationTriangle, FaQuestionCircle, FaSpinner, FaShieldAlt, FaGlobeEurope, FaInfoCircle, FaExchangeAlt } from 'react-icons/fa';

// Interface aligned with the API response from /api/regional/sovereignty-status
interface ComplianceCheck {
  id: string;
  area: string;
  status: 'compliant' | 'partially_compliant' | 'non_compliant' | 'pending_assessment';
  details: string;
  lastAssessed: string;
  relevantRegulation?: string;
}

interface SovereigntyStatusSummary {
  overallStatus: 'compliant' | 'partially_compliant' | 'non_compliant';
  lastFullAssessment: string;
  checks: ComplianceCheck[];
}

const SovereignAIComplianceCheck: React.FC = () => {
  const [summary, setSummary] = useState<SovereigntyStatusSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSovereigntyStatus = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/regional/sovereignty-status');
        if (!response.ok) {
          throw new Error(`Failed to fetch sovereignty status: ${response.statusText}`);
        }
        const data: SovereigntyStatusSummary | { error: string } = await response.json();
        if ('error' in data) {
          throw new Error(data.error);
        }
        setSummary(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        setSummary(null); // Clear or set fallback data
      } finally {
        setIsLoading(false);
      }
    };

    fetchSovereigntyStatus();
  }, []);

  const getStatusColor = (status: ComplianceCheck['status'] | SovereigntyStatusSummary['overallStatus']) => {
    switch (status) {
      case 'compliant': return 'text-green-600 dark:text-green-400';
      case 'partially_compliant': return 'text-yellow-600 dark:text-yellow-400';
      case 'non_compliant': return 'text-red-600 dark:text-red-400';
      case 'pending_assessment': return 'text-blue-500 dark:text-blue-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: ComplianceCheck['status'] | SovereigntyStatusSummary['overallStatus']) => {
    switch (status) {
      case 'compliant': return <FaCheckCircle className="inline mr-1" />;
      case 'partially_compliant': return <FaExclamationTriangle className="inline mr-1" />; // Could use a specific icon for partial
      case 'non_compliant': return <FaExclamationTriangle className="inline mr-1 text-red-600 dark:text-red-400" />;
      case 'pending_assessment': return <FaSpinner className="inline mr-1 animate-spin" />;
      default: return <FaQuestionCircle className="inline mr-1" />;
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
        <FaSpinner className="animate-spin text-blue-500 text-2xl mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-300">Lade Compliance Status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-500 dark:text-red-400 mb-2 flex items-center">
          <FaExclamationTriangle className="mr-2" /> Fehler beim Laden des Compliance-Status
        </h2>
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <FaBalanceScale className="mr-2 text-indigo-500" /> Sovereign AI Compliance
        </h2>
        <p className="text-gray-500 dark:text-gray-400">Compliance-Daten nicht verfügbar.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaBalanceScale className="mr-2 text-indigo-500" /> Sovereign AI Compliance
      </h2>
      
      <div className="mb-6 p-3 rounded-md bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Gesamtstatus: 
          <span className={`ml-2 font-semibold ${getStatusColor(summary.overallStatus)}`}>
            {getStatusIcon(summary.overallStatus)}
            {summary.overallStatus.replace('_', ' ')}
          </span>
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Letzte Gesamtbewertung: {new Date(summary.lastFullAssessment).toLocaleDateString()}</p>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {summary.checks.map((check) => (
          <div key={check.id} className="border border-gray-200 dark:border-gray-700 rounded-md p-3 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200">{check.area}</h4>
              <span className={`text-sm font-medium ${getStatusColor(check.status)} capitalize`}>
                {getStatusIcon(check.status)}
                {check.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">
              Zuletzt geprüft: {new Date(check.lastAssessed).toLocaleDateString()}
              {check.relevantRegulation && <span className="ml-2 italic">| Regulierung: {check.relevantRegulation}</span>}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{check.details}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SovereignAIComplianceCheck;
