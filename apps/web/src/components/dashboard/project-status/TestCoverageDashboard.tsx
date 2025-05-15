import React from 'react';

interface CoverageMetric {
  area: string;
  coverage: number;
  lastRun: string;
}

const TestCoverageDashboard: React.FC = () => {
  // Placeholder data - in a real implementation, this would be fetched
  // from CI/CD pipeline (e.g., Jest/Vitest coverage reports)
  const coverageData: CoverageMetric[] = [
    { area: 'libs/core', coverage: 85, lastRun: '2025-05-15 10:00 UTC' },
    { area: 'libs/agents', coverage: 72, lastRun: '2025-05-15 10:00 UTC' },
    { area: 'libs/mcp', coverage: 60, lastRun: '2025-05-15 09:30 UTC' },
    { area: 'apps/cli', coverage: 78, lastRun: '2025-05-15 10:00 UTC' },
  ];

  const getCoverageColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Testabdeckung
      </h2>
      <div className="space-y-4">
        {coverageData.map((metric) => (
          <div key={metric.area}>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{metric.area}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {metric.coverage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${getCoverageColor(metric.coverage)}`}
                style={{ width: `${metric.coverage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Letzter Lauf: {metric.lastRun}
            </p>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Daten von CI/CD Pipeline (Jest/Vitest Coverage Reports).
      </p>
    </div>
  );
};

export default TestCoverageDashboard;
