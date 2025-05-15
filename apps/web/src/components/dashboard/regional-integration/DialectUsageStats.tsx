import React, { useEffect, useState } from 'react';

// Placeholder for Dialect Usage Stats data type
interface DialectStats {
  totalInteractionsWithDialect: number;
  dialectRecognitionAccuracy?: number; // Percentage
  mostCommonDialectPhrases?: Array<{ phrase: string; count: number }>;
  userFeedbackScore?: number; // e.g., average score from 1-5 on dialect feature
}

// Placeholder for API response type
interface DialectStatsApiResponse {
  stats: DialectStats;
}

const DialectUsageStats: React.FC = () => {
  const [stats, setStats] = useState<DialectStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Fetch dialect usage stats from the backend API
    // Example:
    // const fetchDialectStats = async () => {
    //   try {
    //     const response = await fetch('/api/regional/dialect/stats'); // Replace with actual API endpoint
    //     if (!response.ok) {
    //       throw new Error(`HTTP error! status: ${response.status}`);
    //     }
    //     const data: DialectStatsApiResponse = await response.json();
    //     setStats(data.stats);
    //   } catch (e) {
    //     setError(e instanceof Error ? e.message : String(e));
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchDialectStats();

    // Mock data for now
    setTimeout(() => {
      setStats({
        totalInteractionsWithDialect: 780,
        dialectRecognitionAccuracy: 85.2,
        mostCommonDialectPhrases: [
          { phrase: "Ei joo!", count: 150 },
          { phrase: "Hauptsach gudd gess", count: 95 },
          { phrase: "Kannsche mache nix", count: 70 },
        ],
        userFeedbackScore: 4.2,
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading dialect usage statistics...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error fetching dialect stats: {error}</div>;
  }

  if (!stats) {
    return <div className="p-4 text-center text-gray-600">Dialect usage statistics are not available. This feature might not be active.</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Saarland Dialect Usage Stats</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm font-medium text-gray-500">Total Dialect Interactions</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.totalInteractionsWithDialect.toLocaleString()}</p>
        </div>
        {stats.dialectRecognitionAccuracy !== undefined && (
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm font-medium text-gray-500">Recognition Accuracy</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.dialectRecognitionAccuracy.toFixed(1)}%</p>
          </div>
        )}
        {stats.userFeedbackScore !== undefined && (
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm font-medium text-gray-500">User Feedback Score</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.userFeedbackScore.toFixed(1)} / 5</p>
          </div>
        )}
      </div>

      {stats.mostCommonDialectPhrases && stats.mostCommonDialectPhrases.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Most Common Dialect Phrases</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            {stats.mostCommonDialectPhrases.map((item, index) => (
              <li key={index} className="flex justify-between p-1 bg-gray-50 rounded">
                <span>"{item.phrase}"</span>
                <span>{item.count} times</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* TODO: Add options to test dialect input or provide feedback directly */}
    </div>
  );
};

export default DialectUsageStats;
