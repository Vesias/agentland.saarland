import React, { useState, useEffect } from 'react';
import { FaChartLine, FaUsers, FaHandsHelping, FaSpinner } from 'react-icons/fa';

interface ImpactMetric {
  id: string;
  name: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  description: string;
  icon: React.ReactNode;
}

const PublicBenefitImpactMetrics: React.FC = () => {
  // Placeholder data - in a real implementation, this would be fetched
  // from backend services that track the impact of agentland.saarland initiatives.
  const [metrics, setMetrics] = useState<ImpactMetric[]>([
    { id: 'metric1', name: 'Saarland Citizens Assisted', value: 1250, unit: 'citizens', trend: 'up', description: 'Number of citizens directly benefiting from AI tools.', icon: <FaUsers className="text-blue-500" /> },
    { id: 'metric2', name: 'Open Datasets Published', value: 25, trend: 'stable', description: 'Number of datasets made available for public use.', icon: <FaChartLine className="text-green-500" /> },
    { id: 'metric3', name: 'Community Projects Supported', value: 8, trend: 'up', description: 'AI projects within Saarland leveraging this platform.', icon: <FaHandsHelping className="text-purple-500" /> },
    { id: 'metric4', name: 'Dialect Model Accuracy Improvement', value: '15%', trend: 'up', description: 'Improvement in local dialect processing accuracy.', icon: <FaChartLine className="text-orange-500" /> },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   setIsLoading(true);
  //   fetch('/api/impact/metrics') // Example API
  //     .then(res => res.json())
  //     .then(data => {
  //       setMetrics(data);
  //       setIsLoading(false);
  //     })
  //     .catch(error => {
  //       console.error("Failed to fetch impact metrics:", error);
  //       setIsLoading(false);
  //     });
  // }, []);
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
        <FaSpinner className="animate-spin text-blue-500 text-2xl mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-300">Lade Public Benefit Metriken...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaHandsHelping className="mr-2 text-teal-500" /> Public Benefit Impact Metriken (Saarland)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map(metric => (
          <div key={metric.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-start space-x-3">
            <div className="text-2xl mt-1">{metric.icon}</div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{metric.name}</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {metric.value}
                {metric.unit && <span className="text-sm font-normal"> {metric.unit}</span>}
                {metric.trend === 'up' && <span className="ml-1 text-xs text-green-500">▲</span>}
                {metric.trend === 'down' && <span className="ml-1 text-xs text-red-500">▼</span>}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300">{metric.description}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Diese Metriken sind aspirativ und illustrieren mögliche Auswirkungen.
      </p>
    </div>
  );
};

export default PublicBenefitImpactMetrics;
