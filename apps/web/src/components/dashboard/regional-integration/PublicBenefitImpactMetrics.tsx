import React, { useState, useEffect } from 'react';
import { FaChartLine, FaArrowUp, FaArrowDown, FaMinus, FaUsers, FaBriefcase, FaUniversalAccess, FaSpinner, FaHeartbeat } from 'react-icons/fa';

// Interface aligned with the API response from /api/regional/impact-metrics
interface ImpactMetric {
  id: string;
  name: string;
  value: string | number;
  unit?: string;
  trend: 'positive' | 'negative' | 'neutral' | 'stable';
  description: string;
  lastUpdated: string;
  target?: string | number;
}

interface PublicBenefitImpactSummary {
  reportDate: string;
  overallSentiment: 'positive' | 'neutral' | 'mixed' | 'concerning';
  metrics: ImpactMetric[];
}

const PublicBenefitImpactMetrics: React.FC = () => {
  const [summary, setSummary] = useState<PublicBenefitImpactSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImpactMetrics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/regional/impact-metrics');
        if (!response.ok) {
          throw new Error(`Failed to fetch impact metrics: ${response.statusText}`);
        }
        const data: PublicBenefitImpactSummary | { error: string } = await response.json();
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

    fetchImpactMetrics();
  }, []);

  const getTrendIcon = (trend: ImpactMetric['trend']) => {
    switch (trend) {
      case 'positive': return <FaArrowUp className="text-green-500" />;
      case 'negative': return <FaArrowDown className="text-red-500" />;
      case 'neutral': return <FaMinus className="text-gray-500" />;
      case 'stable': return <FaMinus className="text-gray-500" />; // Could use a different icon for stable if desired
      default: return null;
    }
  };

  const getMetricIcon = (metricName: string) => {
    const lowerName = metricName.toLowerCase();
    if (lowerName.includes('arbeitsplätze') || lowerName.includes('job')) return <FaBriefcase className="text-blue-500 dark:text-blue-400" />;
    if (lowerName.includes('dialekt') || lowerName.includes('sprache') || lowerName.includes('nutzung')) return <FaUsers className="text-purple-500 dark:text-purple-400" />;
    if (lowerName.includes('barrierefreiheit') || lowerName.includes('accessibility')) return <FaUniversalAccess className="text-teal-500 dark:text-teal-400" />;
    if (lowerName.includes('effizienz') || lowerName.includes('efficiency')) return <FaChartLine className="text-orange-500 dark:text-orange-400" />;
    return <FaHeartbeat className="text-gray-500 dark:text-gray-400" />; // Default icon
  };
  
  const getOverallSentimentColor = (sentiment: PublicBenefitImpactSummary['overallSentiment']) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 dark:text-green-400';
      case 'neutral': return 'text-gray-600 dark:text-gray-400';
      case 'mixed': return 'text-yellow-600 dark:text-yellow-400';
      case 'concerning': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
        <FaSpinner className="animate-spin text-blue-500 text-2xl mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-300">Lade Public Benefit Metriken...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-500 dark:text-red-400 mb-2">
          Fehler beim Laden der Impact Metriken
        </h2>
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Public Benefit Impact Metriken</h2>
        <p className="text-gray-500 dark:text-gray-400">Daten nicht verfügbar.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
        Public Benefit Impact Metriken (Saarland)
      </h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Gesamtstimmung: <span className={`font-semibold ${getOverallSentimentColor(summary.overallSentiment)} capitalize`}>
          {summary.overallSentiment}
        </span> (Stand: {new Date(summary.reportDate).toLocaleDateString()})
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {summary.metrics.map(metric => (
          <div key={metric.id} className="bg-gray-50 dark:bg-gray-700/60 p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center text-gray-700 dark:text-gray-200 mb-2">
              <span className="text-xl">{getMetricIcon(metric.name)}</span>
              <h3 className="ml-2 text-md font-semibold ">{metric.name}</h3>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {metric.value}
              {metric.unit && <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">{metric.unit}</span>}
              <span className="ml-2 text-sm">{getTrendIcon(metric.trend)}</span>
            </p>
            {metric.target && (
              <p className="text-xs text-gray-500 dark:text-gray-400">Ziel: {metric.target} {metric.unit || ''}</p>
            )}
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{metric.description}</p>
            <p className="text-xxs text-gray-400 dark:text-gray-500 mt-2">Zuletzt aktualisiert: {new Date(metric.lastUpdated).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicBenefitImpactMetrics;
