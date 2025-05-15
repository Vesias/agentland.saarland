import React, { useState, useEffect } from 'react';

interface AuditSectionProgress {
  name: string;
  completed: number;
  inProgress: number;
  pending: number;
  total: number;
}

const AuditV4ProgressOverview: React.FC = () => {
  const [auditProgress, setAuditProgress] = useState<AuditSectionProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuditProgress = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/project/audit-progress');
        if (!response.ok) {
          throw new Error(`Failed to fetch audit progress: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.error) { // Handle cases where the API returns a JSON error object
          throw new Error(data.error);
        }
        setAuditProgress(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        // Fallback to placeholder data on error to still render something
        setAuditProgress([
          { name: 'Sicherheit & Tests der Kernkomponenten (Fallback)', completed: 1, inProgress: 1, pending: 1, total: 3 },
          { name: 'Code-Qualität (Fallback)', completed: 0, inProgress: 0, pending: 1, total: 1 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuditProgress();
  }, []);

  const calculatePercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Audit v4 Finalisierung - Fortschritt
      </h2>
      {isLoading && <p className="text-gray-500 dark:text-gray-400">Lade Fortschrittsdaten...</p>}
      {error && <p className="text-red-500 dark:text-red-400">Fehler beim Laden: {error}</p>}
      {!isLoading && !error && auditProgress.length === 0 && <p className="text-gray-500 dark:text-gray-400">Keine Fortschrittsdaten verfügbar.</p>}
      
      {!isLoading && auditProgress.length > 0 && (
        <div className="space-y-4">
          {auditProgress.map((section) => (
            <div key={section.name}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{section.name}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {calculatePercentage(section.completed, section.total)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${calculatePercentage(section.completed, section.total)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>{section.completed} Abgeschlossen</span>
                <span>{section.inProgress} In Arbeit</span>
                <span>{section.pending} Offen</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Daten basierend auf <code>ai_docs/memory-bank/progress.md</code>.
        {error && " (Fallback-Daten werden angezeigt)"}
      </p>
    </div>
  );
};

export default AuditV4ProgressOverview;
