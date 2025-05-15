import React from 'react';

interface AuditSectionProgress {
  name: string;
  completed: number;
  inProgress: number;
  pending: number;
  total: number;
}

const AuditV4ProgressOverview: React.FC = () => {
  // Placeholder data - in a real implementation, this would be fetched and parsed
  // from ai_docs/memory-bank/progress.md
  const auditProgress: AuditSectionProgress[] = [
    { name: 'Sicherheit & Tests der Kernkomponenten', completed: 2, inProgress: 2, pending: 2, total: 6 },
    { name: 'Sicherheitsempfehlungen aus dem Sicherheits-Audit', completed: 0, inProgress: 0, pending: 10, total: 10 },
    { name: 'Code-Qualität, Fehlerbehebung & Refactoring', completed: 0, inProgress: 0, pending: 13, total: 13 },
    // Further sections would be added here based on the full progress.md
  ];

  const calculatePercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Audit v4 Finalisierung - Fortschritt
      </h2>
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
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Daten basierend auf <code>ai_docs/memory-bank/progress.md</code>.
      </p>
    </div>
  );
};

export default AuditV4ProgressOverview;
